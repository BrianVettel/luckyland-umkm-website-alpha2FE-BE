import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { createRoleGuard } from "../plugins/rbac.plugin";
import { ProductionStatus } from "../../generated/prisma";

/**
 * Production Management Routes (SL_02)
 * Accessible by: OWNER, BAKER, DECORATOR
 */
export const productionRoutes = new Elysia({ prefix: "/api/production" })
  .use(createRoleGuard(["OWNER", "BAKER", "DECORATOR"]))

  // ──────────────────────────────────────────────
  // GET /api/production/tasks/summary — Summary by status (FR-PROD-02)
  // ──────────────────────────────────────────────
  .get(
    "/tasks/summary",
    async () => {
      const summary = await prisma.productionTask.groupBy({
        by: ["status"],
        _count: {
          _all: true
        }
      });

      // Format response as a simple key-value object { [status]: count }
      const formattedSummary = summary.reduce((acc, curr) => {
        acc[curr.status] = curr._count._all;
        return acc;
      }, {} as Record<string, number>);

      return { success: true, data: formattedSummary };
    },
    {
      detail: { tags: ["Production"] }
    }
  )

  // ──────────────────────────────────────────────
  // GET /api/production/tasks — Task list (FR-PROD-01, FR-PROD-03)
  // ──────────────────────────────────────────────
  .get(
    "/tasks",
    async ({ query }) => {
      const { status } = query;
      
      const filter: any = {};
      if (status) filter.status = status;

      const tasks = await prisma.productionTask.findMany({
        where: filter,
        orderBy: { deadline: "asc" }, // Sort by nearest deadline
        include: {
          order: {
            select: {
              orderNumber: true,
              customerName: true,
              origin: true,
              notes: true,
              items: {
                include: {
                  product: { select: { name: true, category: true } }
                }
              }
            }
          },
          assignedTo: {
            select: { name: true, role: true }
          }
        }
      });

      return { success: true, data: tasks };
    },
    {
      query: t.Object({
        status: t.Optional(t.Enum(ProductionStatus))
      }),
      detail: { tags: ["Production"] }
    }
  )

  // ──────────────────────────────────────────────
  // PUT /api/production/tasks/:id/status — Update task progress
  // ──────────────────────────────────────────────
  .put(
    "/tasks/:id/status",
    async ({ params: { id }, body, user, set }) => {
      const { status, notes } = body;

      const task = await prisma.productionTask.findUnique({
        where: { id }
      });

      if (!task) {
        set.status = 404;
        return { success: false, message: "Production task not found" };
      }

      // Automatically set startedAt/completedAt based on the status change
      const updateData: any = {
        status,
        assignedToId: user!.id // Assign the current user to the task
      };
      
      if (notes) updateData.notes = notes;

      if (status === "IN_PROGRESS" && !task.startedAt) {
        updateData.startedAt = new Date();
      } else if (status === "FINISHED" && !task.completedAt) {
        updateData.completedAt = new Date();
        
        // Also update the linked order status to SELESAI if production is FINISHED
        await prisma.order.update({
          where: { id: task.orderId },
          data: { status: "SELESAI" }
        });
      }

      const updatedTask = await prisma.productionTask.update({
        where: { id },
        data: updateData
      });

      return {
        success: true,
        data: updatedTask,
        message: `Task updated to ${status}`
      };
    },
    {
      body: t.Object({
        status: t.Enum(ProductionStatus),
        notes: t.Optional(t.String())
      }),
      detail: { tags: ["Production"] }
    }
  );
