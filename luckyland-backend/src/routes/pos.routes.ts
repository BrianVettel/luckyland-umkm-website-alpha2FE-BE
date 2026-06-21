import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { createRoleGuard } from "../plugins/rbac.plugin";
import { OrderOrigin, OrderStatus, PaymentStatus } from "../../generated/prisma";

/**
 * POS & Order Management Routes (SL_01)
 * Accessible by: OWNER, ADMIN, KASIR
 */
export const posRoutes = new Elysia({ prefix: "/api/pos" })
  .use(createRoleGuard(["OWNER", "ADMIN", "KASIR"]))
  
  // ──────────────────────────────────────────────
  // GET /api/pos/products — List all active products
  // ──────────────────────────────────────────────
  .get("/products", async () => {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { category: "asc" }
    });
    return { success: true, data: products };
  })

  // ──────────────────────────────────────────────
  // POST /api/pos/orders — Create a new order
  // ──────────────────────────────────────────────
  .post(
    "/orders",
    async ({ user, body, set }) => {
      if (user!.role === "ADMIN") {
        set.status = 403;
        return { success: false, message: "Forbidden: ADMIN is read-only" };
      }
      const { customerName, origin, orderDate, notes, items, isDirectPurchase, customPrice } = body;

      // Ensure the transaction handles price fetching and order creation atomically
      const result = await prisma.$transaction(async (tx) => {
        let totalAmount = 0;
        
        // Prepare items with accurate pricing from database
        const processedItems = [];
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });
          
          if (!product || !product.isActive) {
            throw new Error(`Product with ID ${item.productId} is invalid or inactive`);
          }
          
          const subtotal = product.price * item.quantity;
          totalAmount += subtotal;
          
          processedItems.push({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            theme: item.theme,
            notes: item.notes,
            unitPrice: product.price,
            subtotal: subtotal
          });
        }

        if (customPrice !== undefined && customPrice !== null) {
          totalAmount = customPrice;
        }

        const orderData: any = {
          customerName,
          origin: origin as OrderOrigin,
          orderDate: new Date(orderDate),
          notes,
          totalAmount,
          isDirectPurchase: isDirectPurchase || false,
          customPrice: customPrice || null,
          createdById: user!.id,
          items: {
            create: processedItems
          }
        };

        if (isDirectPurchase) {
          orderData.status = "SELESAI";
          orderData.paymentStatus = "LUNAS";
        }

        // Create the order
        const order = await tx.order.create({
          data: orderData,
          include: { items: true }
        });

        if (isDirectPurchase) {
          await tx.productionTask.create({
            data: {
              orderId: order.id,
              status: "FINISHED",
              deadline: new Date(orderDate),
              startedAt: new Date(),
              completedAt: new Date()
            }
          });
        }

        return order;
      });

      return {
        success: true,
        data: result,
        message: "Order created successfully"
      };
    },
    {
      body: t.Object({
        customerName: t.String({ minLength: 1 }),
        origin: t.Enum(OrderOrigin),
        orderDate: t.String({ format: "date-time" }), // Represents the requested delivery/pickup date
        notes: t.Optional(t.String()),
        isDirectPurchase: t.Optional(t.Boolean()),
        customPrice: t.Optional(t.Number()),
        items: t.Array(t.Object({
          productId: t.String(),
          quantity: t.Number({ minimum: 1 }),
          size: t.Optional(t.String()),
          theme: t.Optional(t.String()),
          notes: t.Optional(t.String())
        }), { minItems: 1 })
      }),
      detail: { tags: ["POS"] }
    }
  )

  // ──────────────────────────────────────────────
  // GET /api/pos/orders — List incoming orders
  // ──────────────────────────────────────────────
  .get(
    "/orders",
    async ({ query }) => {
      const { status, origin } = query;

      const filter: any = { deletedAt: null };
      if (status) filter.status = status;
      if (origin) filter.origin = origin;

      const orders = await prisma.order.findMany({
        where: filter,
        orderBy: { orderDate: "desc" },
        include: {
          items: {
            include: { product: { select: { name: true } } }
          },
          productionTask: { select: { status: true } }
        }
      });

      return { success: true, data: orders };
    },
    {
      query: t.Object({
        status: t.Optional(t.Enum(OrderStatus)),
        origin: t.Optional(t.Enum(OrderOrigin))
      }),
      detail: { tags: ["POS"] }
    }
  )

  // ──────────────────────────────────────────────
  // GET /api/pos/orders/:id — Order details
  // ──────────────────────────────────────────────
  .get(
    "/orders/:id",
    async ({ params: { id }, set }) => {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: { product: { select: { name: true, category: true } } }
          },
          createdBy: { select: { name: true, role: true } },
          productionTask: true
        }
      });

      if (!order || order.deletedAt) {
        set.status = 404;
        return { success: false, message: "Order not found" };
      }

      return { success: true, data: order };
    },
    {
      detail: { tags: ["POS"] }
    }
  )

  // ──────────────────────────────────────────────
  // PUT /api/pos/orders/:id/status — Update & Verify Order (INT-01)
  // ──────────────────────────────────────────────
  .put(
    "/orders/:id/status",
    async ({ params: { id }, body, user, set }) => {
      if (user!.role === "ADMIN") {
        set.status = 403;
        return { success: false, message: "Forbidden: ADMIN is read-only" };
      }
      const { status, paymentStatus } = body;

      const order = await prisma.order.findUnique({
        where: { id },
        include: { productionTask: true }
      });

      if (!order || order.deletedAt) {
        set.status = 404;
        return { success: false, message: "Order not found" };
      }

      const result = await prisma.$transaction(async (tx) => {
        // 1. Update order statuses
        const updateData: any = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const updatedOrder = await tx.order.update({
          where: { id },
          data: updateData
        });

        // 2. INT-01: Auto-create ProductionTask if VERIFIED
        // We use the customer's requested date (`orderDate`) as the deadline
        if (status === "VERIFIED" && !order.productionTask) {
          await tx.productionTask.create({
            data: {
              orderId: order.id,
              status: "PENDING",
              deadline: order.orderDate,
            }
          });
        }

        return updatedOrder;
      });

      return {
        success: true,
        data: result,
        message: "Order status updated successfully"
      };
    },
    {
      body: t.Object({
        status: t.Optional(t.Enum(OrderStatus)),
        paymentStatus: t.Optional(t.Enum(PaymentStatus))
      }),
      detail: { tags: ["POS"] }
    }
  )

  // ──────────────────────────────────────────────
  // DELETE /api/pos/orders/:id — Cancel and delete order
  // ──────────────────────────────────────────────
  .delete(
    "/orders/:id",
    async ({ params: { id }, user, set }) => {
      if (user!.role === "ADMIN") {
        set.status = 403;
        return { success: false, message: "Forbidden: ADMIN is read-only" };
      }
      const order = await prisma.order.findUnique({
        where: { id }
      });

      if (!order || order.deletedAt) {
        set.status = 404;
        return { success: false, message: "Order not found" };
      }

      await prisma.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          deletedAt: new Date()
        }
      });

      return {
        success: true,
        message: "Order cancelled and deleted successfully"
      };
    },
    {
      detail: { tags: ["POS"] }
    }
  );
