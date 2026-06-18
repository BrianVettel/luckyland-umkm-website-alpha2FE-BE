import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { createRoleGuard } from "../plugins/rbac.plugin";
import { ProcurementType, ProcurementStatus, EquipmentCondition } from "../../generated/prisma";

/**
 * Raw Material & Equipment Procurement Routes (SL_05 & SL_06)
 * 
 * Flow:
 *  1. Employee submits request with manual item name + qty + unit
 *  2. Owner approves or rejects
 *  3. On receive: system auto-creates/updates RawMaterial or Equipment
 */
export const procurementRoutes = new Elysia({ prefix: "/api/procurement" })

  // ──────────────────────────────────────────────
  // GET /api/procurement/materials — List all raw materials
  // ──────────────────────────────────────────────
  .use(createRoleGuard(["OWNER", "ADMIN", "BAKER", "DECORATOR"]))
  .get(
    "/materials",
    async () => {
      const materials = await prisma.rawMaterial.findMany({
        where: { isActive: true, deletedAt: null }
      });
      return { success: true, data: materials };
    }
  )

  // ──────────────────────────────────────────────
  // GET /api/procurement/equipment — List all equipment
  // ──────────────────────────────────────────────
  .get(
    "/equipment",
    async () => {
      const equipment = await prisma.equipment.findMany({
        where: { isActive: true, deletedAt: null }
      });
      return { success: true, data: equipment };
    }
  )

  // ──────────────────────────────────────────────
  // POST /api/procurement — Submit request with manual item name
  // Accessible by: OWNER, ADMIN, BAKER, DECORATOR
  // ──────────────────────────────────────────────
  .post(
    "/",
    async ({ user, body }) => {
      const { type, itemName, qty, unit, reason } = body;

      const request = await prisma.procurementRequest.create({
        data: {
          type: type as ProcurementType,
          reason: reason || `Pengajuan: ${itemName}`,
          requesterId: user!.id,
          items: {
            create: [{
              quantity: qty,
              notes: JSON.stringify({ itemName, unit: unit || "unit" }),
            }]
          }
        },
        include: { items: true }
      });

      return {
        success: true,
        data: request,
        message: "Procurement request submitted successfully"
      };
    },
    {
      body: t.Object({
        type: t.Enum(ProcurementType),
        itemName: t.String({ minLength: 1 }),
        qty: t.Number({ minimum: 0.1 }),
        unit: t.Optional(t.String()),
        reason: t.Optional(t.String()),
      }),
      detail: { tags: ["Procurement"] }
    }
  )

  // ──────────────────────────────────────────────
  // GET /api/procurement — List requests
  // ──────────────────────────────────────────────
  .get(
    "/",
    async ({ query }) => {
      const { status, type } = query;

      const filter: any = { deletedAt: null };
      if (status) filter.status = status;
      if (type) filter.type = type;

      const requests = await prisma.procurementRequest.findMany({
        where: filter,
        orderBy: { createdAt: "desc" },
        include: {
          requester: { select: { name: true, role: true } },
          approver: { select: { name: true } },
          items: true
        }
      });

      return { success: true, data: requests };
    }
  )

  // ──────────────────────────────────────────────
  // POST /api/procurement/:id/receive — Confirm Receipt
  // Creates or updates inventory items automatically
  // ──────────────────────────────────────────────
  .post(
    "/:id/receive",
    async ({ params: { id }, user, set }) => {
      const procurement = await prisma.procurementRequest.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!procurement || procurement.deletedAt) {
        set.status = 404;
        return { success: false, message: "Procurement request not found" };
      }

      if (procurement.status !== "APPROVED") {
        set.status = 400;
        return { success: false, message: "Only APPROVED requests can be received" };
      }

      const result = await prisma.$transaction(async (tx) => {
        // 1. Mark request as RECEIVED
        const updatedRequest = await tx.procurementRequest.update({
          where: { id },
          data: { status: "RECEIVED" }
        });

        // 2. Process each item — auto-create inventory entries
        for (const item of procurement.items) {
          const meta = JSON.parse(item.notes || "{}");
          const itemName: string = meta.itemName || "Unknown Item";
          const itemUnit: string = meta.unit || "unit";
          const qty = item.quantity;

          if (procurement.type === "RAW_MATERIAL") {
            // Find existing material or create new one
            let material = await tx.rawMaterial.findFirst({
              where: { name: { equals: itemName, mode: "insensitive" }, deletedAt: null }
            });

            if (material) {
              // Update existing stock
              await tx.rawMaterial.update({
                where: { id: material.id },
                data: { currentStock: { increment: qty } }
              });
            } else {
              // Create new material entry
              material = await tx.rawMaterial.create({
                data: {
                  name: itemName,
                  unit: itemUnit,
                  category: "Umum",
                  currentStock: qty,
                  minimumStock: Math.ceil(qty * 0.2), // 20% as default minimum
                }
              });
            }

            // Create receipt record
            await tx.materialReceipt.create({
              data: {
                procurementId: procurement.id,
                rawMaterialId: material.id,
                receivedById: user!.id,
                receivedQuantity: qty,
              }
            });
          } else {
            // EQUIPMENT
            let equip = await tx.equipment.findFirst({
              where: { name: { equals: itemName, mode: "insensitive" }, deletedAt: null }
            });

            if (equip) {
              await tx.equipment.update({
                where: { id: equip.id },
                data: { quantity: { increment: Math.round(qty) } }
              });
            } else {
              equip = await tx.equipment.create({
                data: {
                  name: itemName,
                  category: "Umum",
                  quantity: Math.round(qty),
                  condition: "GOOD",
                }
              });
            }

            // Create receipt record
            await tx.equipmentReceipt.create({
              data: {
                procurementId: procurement.id,
                equipmentId: equip.id,
                receivedById: user!.id,
                receivedQuantity: Math.round(qty),
                condition: "GOOD",
              }
            });
          }
        }

        return updatedRequest;
      });

      return {
        success: true,
        data: result,
        message: "Receipt confirmed and inventory updated successfully."
      };
    },
    {
      detail: { tags: ["Procurement"] }
    }
  )

  // ──────────────────────────────────────────────
  // PUT /api/procurement/:id/approve — Owner Approval
  // ──────────────────────────────────────────────
  .use(createRoleGuard(["OWNER"]))
  .put(
    "/:id/approve",
    async ({ params: { id }, body, user, set }) => {
      const { status, rejectionNotes } = body;

      const procurement = await prisma.procurementRequest.findUnique({
        where: { id }
      });

      if (!procurement || procurement.deletedAt) {
        set.status = 404;
        return { success: false, message: "Procurement request not found" };
      }

      const updated = await prisma.procurementRequest.update({
        where: { id },
        data: {
          status,
          rejectionNotes,
          approverId: user!.id,
          approvedAt: status === "APPROVED" ? new Date() : null
        }
      });

      return {
        success: true,
        data: updated,
        message: `Request ${status} successfully`
      };
    },
    {
      body: t.Object({
        status: t.Union([t.Literal("APPROVED"), t.Literal("REJECTED")]),
        rejectionNotes: t.Optional(t.String())
      }),
      detail: { tags: ["Procurement"] }
    }
  );
