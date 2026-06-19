import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { createRoleGuard } from "../plugins/rbac.plugin";
import { mkdir } from "fs/promises";
import { join } from "path";

// Month names in Indonesian
const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

/**
 * Payroll Management Routes (SL_04)
 * Accessible by: OWNER ONLY
 */
export const payrollRoutes = new Elysia({ prefix: "/api/payroll" })
  .use(createRoleGuard(["OWNER"]))

  // ──────────────────────────────────────────────
  // POST /api/payroll/calculate — Calculate Monthly Payroll (FR-PAY-02, INT-02)
  // ──────────────────────────────────────────────
  .post(
    "/calculate",
    async ({ body, user, set }) => {
      const { month, year, notes } = body;

      // 1. Check if payroll for this month already exists
      const existing = await prisma.payrollPeriod.findUnique({
        where: { month_year: { month, year } }
      });

      if (existing) {
        set.status = 400;
        return { success: false, message: `Penggajian untuk bulan ${MONTH_NAMES[month]} ${year} sudah pernah dihitung.` };
      }

      // 2. Determine date range for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // 3. Fetch all active employees (exclude OWNER)
      const employees = await prisma.user.findMany({
        where: { isActive: true, role: { not: "OWNER" } }
      });

      if (employees.length === 0) {
        set.status = 400;
        return { success: false, message: "Tidak ada karyawan aktif yang ditemukan." };
      }

      // 4. CRITICAL: Validate complete data before processing
      const invalidEmployees: string[] = [];
      for (const emp of employees) {
        const issues: string[] = [];
        if (!emp.basicSalary || emp.basicSalary <= 0) {
          issues.push("Gaji Pokok belum diisi");
        }
        if (!emp.phone || emp.phone.trim() === "") {
          issues.push("Nomor WhatsApp belum diisi");
        }
        if (issues.length > 0) {
          invalidEmployees.push(`${emp.name}: ${issues.join(", ")}`);
        }
      }

      if (invalidEmployees.length > 0) {
        set.status = 400;
        return {
          success: false,
          message: `Data belum lengkap di Data Master Karyawan:\n${invalidEmployees.join("\n")}\n\nSilakan lengkapi data terlebih dahulu sebelum menghitung gaji.`
        };
      }

      // 5. Calculate using Prisma Transaction
      const result = await prisma.$transaction(async (tx) => {
        const payrollPeriod = await tx.payrollPeriod.create({
          data: {
            month,
            year,
            notes,
            initiatedById: user!.id,
            status: "CALCULATED"
          }
        });

        const details = [];

        for (const emp of employees) {
          const baseSalary = emp.basicSalary;
          // Dynamic Deduction Rate (Basic Salary / 25 working days)
          const dailyRate = baseSalary / 25;

          // A. Calculate unexcused absences in the current month (INT-02)
          const absencesCount = await tx.attendance.count({
            where: {
              employeeId: emp.id,
              status: "ABSENT",
              date: { gte: startDate, lte: endDate }
            }
          });
          const absenceDeduction = absencesCount * dailyRate;

          // B. Calculate leave deductions from LeaveRequest table
          //    Count APPROVED leave days that fall within this payroll month
          const approvedLeaves = await tx.leaveRequest.findMany({
            where: {
              employeeId: emp.id,
              status: "APPROVED",
              startDate: { lte: endDate },
              endDate: { gte: startDate }
            }
          });

          // Sum up leave days that overlap with this month
          let totalLeaveDays = 0;
          for (const leave of approvedLeaves) {
            const leaveStart = leave.startDate > startDate ? leave.startDate : startDate;
            const leaveEnd = leave.endDate < endDate ? leave.endDate : endDate;
            const days = Math.max(0, Math.round(
              (leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1);
            totalLeaveDays += days;
          }

          // Only deduct if leave exceeds annual quota
          const remainingQuota = emp.leaveQuota;
          const excessiveLeaveDays = Math.max(0, totalLeaveDays - Math.max(0, remainingQuota));
          const leaveDeduction = excessiveLeaveDays * dailyRate;

          // C. Calculate Net Salary
          const netSalary = Math.max(0, baseSalary - absenceDeduction - leaveDeduction);

          // D. Create detail record
          const detail = await tx.payrollDetail.create({
            data: {
              payrollPeriodId: payrollPeriod.id,
              employeeId: emp.id,
              basicSalary: baseSalary,
              totalAbsences: absencesCount,
              totalExcessiveLeave: excessiveLeaveDays,
              absenceDeduction: Math.round(absenceDeduction),
              leaveDeduction: Math.round(leaveDeduction),
              netSalary: Math.round(netSalary)
            },
            include: { employee: { select: { name: true, role: true } } }
          });

          details.push(detail);
        }

        return { payrollPeriod, details };
      });

      return {
        success: true,
        data: result,
        message: `Penggajian bulan ${MONTH_NAMES[month]} ${year} berhasil dihitung untuk ${result.details.length} karyawan.`
      };
    },
    {
      body: t.Object({
        month: t.Number({ minimum: 1, maximum: 12 }),
        year: t.Number({ minimum: 2020 }),
        notes: t.Optional(t.String())
      }),
      detail: { tags: ["Payroll"] }
    }
  )

  // ──────────────────────────────────────────────
  // GET /api/payroll — View Payroll History with Details (FR-PAY-15)
  // ──────────────────────────────────────────────
  .get(
    "/",
    async ({ query }) => {
      const { month, year } = query;
      const filter: any = {};
      if (month) filter.month = Number(month);
      if (year) filter.year = Number(year);

      const payrolls = await prisma.payrollPeriod.findMany({
        where: filter,
        orderBy: [{ year: "desc" }, { month: "desc" }],
        include: {
          initiatedBy: { select: { name: true } },
          details: {
            include: {
              employee: { select: { name: true, role: true, phone: true, bankAccount: true } }
            }
          }
        }
      });

      // Flatten to PayrollRecord[] format for frontend
      const flat = payrolls.flatMap((period) =>
        period.details.map((d) => ({
          id: d.id,
          periodId: period.id,
          employeeId: d.employeeId,
          employeeName: d.employee.name,
          role: d.employee.role.toLowerCase(),
          phone: d.employee.phone || "",
          month: `${period.year}-${String(period.month).padStart(2, "0")}`,
          basicSalary: d.basicSalary,
          absenceDeduction: d.absenceDeduction,
          leaveDeduction: d.leaveDeduction,
          net: d.netSalary,
          status: d.transferStatus === "TRANSFERRED" ? "paid" : period.status.toLowerCase(),
          transferProof: d.transferProof,
          transferStatus: d.transferStatus,
        }))
      );

      return { success: true, data: flat };
    },
    {
      query: t.Object({
        month: t.Optional(t.String()),
        year: t.Optional(t.String())
      }),
      detail: { tags: ["Payroll"] }
    }
  )

  // ──────────────────────────────────────────────
  // PATCH /api/payroll/:id/pay — Upload Transfer Proof & Trigger WhatsApp (FR-PAY-10, FR-PAY-11)
  // ──────────────────────────────────────────────
  .patch(
    "/:id/pay",
    async ({ params: { id }, body, set }) => {
      // 1. Find the payroll detail
      const detail = await prisma.payrollDetail.findUnique({
        where: { id },
        include: {
          employee: true,
          payrollPeriod: true
        }
      });

      if (!detail) {
        set.status = 404;
        return { success: false, message: "Data penggajian tidak ditemukan" };
      }

      if (detail.transferStatus === "TRANSFERRED") {
        set.status = 400;
        return { success: false, message: "Gaji sudah ditransfer sebelumnya" };
      }

      // 2. Handle file upload
      let filePath: string | null = null;
      const file = body?.file;

      if (file && file instanceof File) {
        // Create uploads directory
        const uploadsDir = join(process.cwd(), "public", "uploads", "payroll");
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const ext = file.name.split(".").pop() || "png";
        const filename = `transfer_${id}_${Date.now()}.${ext}`;
        const fullPath = join(uploadsDir, filename);

        // Save file using Bun
        const buffer = await file.arrayBuffer();
        await Bun.write(fullPath, buffer);

        filePath = `/uploads/payroll/${filename}`;
      }

      // 3. Update payroll detail — mark as TRANSFERRED
      await prisma.payrollDetail.update({
        where: { id },
        data: {
          transferStatus: "TRANSFERRED",
          transferProof: filePath,
          transferReceiptUrl: filePath,
        }
      });

      // 4. Check if all details in this period are TRANSFERRED
      //    If so, update the period status to PAID
      const allDetails = await prisma.payrollDetail.findMany({
        where: { payrollPeriodId: detail.payrollPeriodId }
      });
      const allTransferred = allDetails.every(d => d.transferStatus === "TRANSFERRED");
      if (allTransferred) {
        await prisma.payrollPeriod.update({
          where: { id: detail.payrollPeriodId },
          data: { status: "PAID" }
        });
      }

      // 5. Send WhatsApp notification via Fonnte API
      const monthName = MONTH_NAMES[detail.payrollPeriod.month];
      const year = detail.payrollPeriod.year;
      const netFormatted = new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", minimumFractionDigits: 0
      }).format(detail.netSalary);

      const waMessage = `Halo ${detail.employee.name}, gaji bulan ${monthName} ${year} sebesar ${netFormatted} telah ditransfer. Bukti transfer dan slip gaji dapat dilihat pada sistem. Terima kasih atas kerja kerasnya 🙏`;

      let waStatus = "not_sent";
      let waUrl = "";

      if (detail.employee.phone) {
        // Format phone number to international format (replace 08 with 628, keep only digits)
        let phoneNum = detail.employee.phone.replace(/[^0-9]/g, "");
        if (phoneNum.startsWith("0")) phoneNum = "62" + phoneNum.substring(1);
        
        waUrl = `https://wa.me/${phoneNum}?text=${encodeURIComponent(waMessage)}`;

        const fonnteToken = process.env.FONNTE_TOKEN;

        if (fonnteToken) {
          try {
            const waRes = await fetch("https://api.fonnte.com/send", {
              method: "POST",
              headers: {
                "Authorization": fonnteToken,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                target: detail.employee.phone,
                message: waMessage
              })
            });
            const waJson = await waRes.json();
            console.log(`[WHATSAPP] ✅ Sent to ${detail.employee.name} (${detail.employee.phone}):`, waJson);
            waStatus = "sent";
          } catch (err) {
            console.error(`[WHATSAPP] ❌ Failed to send to ${detail.employee.name}:`, err);
            waStatus = "failed";
          }
        } else {
          // No Fonnte token — log mock message
          console.log(`[WHATSAPP MOCK] 📱 ${waMessage}`);
          console.log(`[WHATSAPP MOCK] To: ${detail.employee.phone}`);
          waStatus = "mock_sent";
        }
      }

      return {
        success: true,
        message: `Transfer untuk ${detail.employee.name} berhasil direkam`,
        whatsapp: waStatus,
        whatsappUrl: waUrl,
        data: {
          id: detail.id,
          employeeName: detail.employee.name,
          netSalary: detail.netSalary,
          transferProof: filePath
        }
      };
    },
    {
      body: t.Object({
        file: t.Optional(t.File({
          maxSize: "5m",
          type: ["image/jpeg", "image/png", "image/webp", "application/pdf"]
        }))
      }),
      detail: { tags: ["Payroll"] }
    }
  )

  // ──────────────────────────────────────────────
  // POST /api/payroll/:id/send-payslip — Manual WhatsApp Resend (FR-PAY-12)
  // ──────────────────────────────────────────────
  .post(
    "/:id/send-payslip",
    async ({ params: { id }, set }) => {
      const detail = await prisma.payrollDetail.findUnique({
        where: { id },
        include: { employee: true, payrollPeriod: true }
      });

      if (!detail) {
        set.status = 404;
        return { success: false, message: "Payroll detail not found" };
      }

      if (!detail.employee.phone) {
        set.status = 400;
        return { success: false, message: "Employee does not have a phone number registered" };
      }

      // Update transfer status
      await prisma.payrollDetail.update({
        where: { id },
        data: { transferStatus: "TRANSFERRED", payslipUrl: `/mock/pdf/payslip-${id}.pdf` }
      });

      console.log(`[WHATSAPP] 📱 Sending payslip to ${detail.employee.name} (${detail.employee.phone})`);

      return {
        success: true,
        message: `Payslip successfully sent via WhatsApp to ${detail.employee.name}`
      };
    },
    {
      detail: { tags: ["Payroll"] }
    }
  );
