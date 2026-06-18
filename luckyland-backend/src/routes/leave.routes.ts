import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { createRoleGuard } from "../plugins/rbac.plugin";
import { LeaveType, LeaveStatus } from "../../generated/prisma";

import { authPlugin } from "../plugins/auth.plugin";

/**
 * Leave & Attendance Management Routes (SL_03)
 */
export const leaveRoutes = new Elysia({ prefix: "/api/leave" })
  .use(authPlugin)

  // ──────────────────────────────────────────────
  // POST /api/leave/requests — Submit leave request (FR-LV-01)
  // Accessible by: ALL AUTHENTICATED USERS
  // ──────────────────────────────────────────────
  .post(
    "/requests",
    async ({ user, body, set }) => {
      const { type, startDate, endDate, reason, documentUrl } = body;

      const start = new Date(startDate);
      const end = new Date(endDate);
      const durationMs = end.getTime() - start.getTime();
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1; // inclusive

      if (durationDays <= 0) {
        set.status = 400;
        return { success: false, message: "End date must be after or equal to start date" };
      }

      // Check current quota (FR-LV-02)
      const employee = await prisma.user.findUnique({
        where: { id: user!.id },
        select: { leaveQuota: true }
      });

      // Warn if quota exceeded, but still allow submission (business rule)
      const exceedsQuota = durationDays > employee!.leaveQuota;

      const request = await prisma.leaveRequest.create({
        data: {
          employeeId: user!.id,
          type: type as LeaveType,
          startDate: start,
          endDate: end,
          duration: durationDays,
          reason,
          documentUrl
        }
      });

      return {
        success: true,
        data: request,
        message: exceedsQuota 
          ? "Request submitted successfully. Warning: This exceeds your remaining leave quota." 
          : "Request submitted successfully."
      };
    },
    {
      body: t.Object({
        type: t.Enum(LeaveType),
        startDate: t.String({ format: "date-time" }),
        endDate: t.String({ format: "date-time" }),
        reason: t.String(),
        documentUrl: t.Optional(t.String())
      }),
      detail: { tags: ["Leave"] }
    }
  )

  // ──────────────────────────────────────────────
  // GET /api/leave/requests — List requests
  // Accessible by: ALL
  // ──────────────────────────────────────────────
  .get(
    "/requests",
    async ({ user, query }) => {
      const { status } = query;

      const filter: any = {};
      if (status) filter.status = status;

      // If not OWNER or ADMIN, only see own requests
      if (user!.role !== "OWNER" && user!.role !== "ADMIN") {
        filter.employeeId = user!.id;
      }

      const requests = await prisma.leaveRequest.findMany({
        where: filter,
        orderBy: { createdAt: "desc" },
        include: {
          employee: { select: { name: true, role: true, leaveQuota: true } },
          approver: { select: { name: true } }
        }
      });

      return { success: true, data: requests };
    },
    {
      query: t.Object({
        status: t.Optional(t.Enum(LeaveStatus))
      }),
      detail: { tags: ["Leave"] }
    }
  )

  // ──────────────────────────────────────────────
  // PUT /api/leave/requests/:id/approve — Owner Approval (FR-LV-07, FR-LV-10)
  // Accessible by: OWNER ONLY
  // ──────────────────────────────────────────────
  .use(createRoleGuard(["OWNER"]))
  .put(
    "/requests/:id/approve",
    async ({ params: { id }, body, user, set }) => {
      const { status, rejectionNotes } = body;

      const leaveRequest = await prisma.leaveRequest.findUnique({
        where: { id },
        include: { employee: true }
      });

      if (!leaveRequest) {
        set.status = 404;
        return { success: false, message: "Leave request not found" };
      }

      if (leaveRequest.status !== "PENDING") {
        set.status = 400;
        return { success: false, message: "Request has already been processed" };
      }

      // Prisma Transaction to safely deduct quota if approved
      const result = await prisma.$transaction(async (tx) => {
        const updatedRequest = await tx.leaveRequest.update({
          where: { id },
          data: {
            status,
            rejectionNotes,
            approverId: user!.id,
            resolvedAt: new Date()
          }
        });

        if (status === "APPROVED") {
          // FR-LV-10: Deduct remaining leave quota
          await tx.user.update({
            where: { id: leaveRequest.employeeId },
            data: {
              leaveQuota: { decrement: leaveRequest.duration }
            }
          });

          // Generate attendance records for the requested dates
          let currentDate = new Date(leaveRequest.startDate);
          const endDate = new Date(leaveRequest.endDate);
          
          while (currentDate <= endDate) {
            await tx.attendance.upsert({
              where: {
                employeeId_date: {
                  employeeId: leaveRequest.employeeId,
                  date: currentDate
                }
              },
              update: {
                status: "ON_LEAVE",
                notes: `Leave Request ID: ${leaveRequest.id}`
              },
              create: {
                employeeId: leaveRequest.employeeId,
                date: currentDate,
                status: "ON_LEAVE",
                notes: `Leave Request ID: ${leaveRequest.id}`
              }
            });
            // Increment date by 1 day
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }

        return updatedRequest;
      });

      return {
        success: true,
        data: result,
        message: `Leave request ${status} successfully`
      };
    },
    {
      body: t.Object({
        status: t.Union([t.Literal("APPROVED"), t.Literal("REJECTED")]),
        rejectionNotes: t.Optional(t.String())
      }),
      detail: { tags: ["Leave"] }
    }
  );
