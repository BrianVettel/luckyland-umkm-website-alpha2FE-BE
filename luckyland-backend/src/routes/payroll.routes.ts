import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { createRoleGuard } from "../plugins/rbac.plugin";

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
        return { success: false, message: "Payroll for this month/year already exists" };
      }

      // 2. Determine date range for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // 3. Fetch all active employees (exclude OWNER)
      const employees = await prisma.user.findMany({
        where: { isActive: true, role: { not: "OWNER" } }
      });

      // 4. Validate complete data before processing
      for (const emp of employees) {
        if (!emp.basicSalary || emp.basicSalary <= 0) {
          set.status = 400;
          return {
            success: false,
            message: `Data belum lengkap: Gaji pokok untuk karyawan ${emp.name} belum diatur. Silakan perbarui di Data Master Karyawan.`
          };
        }
      }

      // 4. Calculate using Prisma Transaction
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
          // 0. Ensure base salary is valid
          const baseSalary = typeof emp.basicSalary === "number" && !isNaN(emp.basicSalary) ? emp.basicSalary : 0;
          
          // Dynamic Deduction Rate (Basic Salary / 25 days)
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

          // B. Calculate excessive leave
          // If leaveQuota is negative, they took excessive leave.
          let excessiveLeaveDays = 0;
          let leaveDeduction = 0;

          if (emp.leaveQuota < 0) {
            excessiveLeaveDays = Math.abs(emp.leaveQuota);
            leaveDeduction = excessiveLeaveDays * dailyRate;

            // Reset leave quota to 0 so we don't deduct again next month
            await tx.user.update({
              where: { id: emp.id },
              data: { leaveQuota: 0 }
            });
          }

          // C. Calculate Net Salary
          const netSalary = baseSalary - absenceDeduction - leaveDeduction;

          // Ensure netSalary doesn't go below 0 and is a valid number (business failsafe)
          const finalNetSalary = isNaN(netSalary) ? 0 : Math.max(0, netSalary);

          // D. Create detail record
          const detail = await tx.payrollDetail.create({
            data: {
              payrollPeriodId: payrollPeriod.id,
              employeeId: emp.id,
              basicSalary: baseSalary,
              totalAbsences: absencesCount,
              totalExcessiveLeave: excessiveLeaveDays,
              absenceDeduction: isNaN(absenceDeduction) ? 0 : absenceDeduction,
              leaveDeduction: isNaN(leaveDeduction) ? 0 : leaveDeduction,
              netSalary: finalNetSalary
            }
          });

          details.push(detail);
        }

        return { payrollPeriod, details };
      });

      return {
        success: true,
        data: result,
        message: "Payroll calculated successfully"
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
  // GET /api/payroll — View Payroll History (FR-PAY-15)
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
          _count: { select: { details: true } }
        }
      });

      return { success: true, data: payrolls };
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
  // POST /api/payroll/:id/send-payslip — Mock WhatsApp Integration (FR-PAY-12)
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

      // Mock integration logic
      console.log(`[WHATSAPP MOCK] 📱 Sending PDF Payslip to ${detail.employee.name} (${detail.employee.phone})`);
      console.log(`[WHATSAPP MOCK] Period: ${detail.payrollPeriod.month}/${detail.payrollPeriod.year}`);
      console.log(`[WHATSAPP MOCK] Net Salary: Rp ${detail.netSalary}`);
      
      // Update transfer status
      await prisma.payrollDetail.update({
        where: { id },
        data: { transferStatus: "TRANSFERRED", payslipUrl: `/mock/pdf/payslip-${id}.pdf` }
      });

      return {
        success: true,
        message: `Payslip successfully sent via WhatsApp to ${detail.employee.name}`
      };
    },
    {
      detail: { tags: ["Payroll"] }
    }
  );
