import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./routes/auth.routes";
import { posRoutes } from "./routes/pos.routes";
import { productionRoutes } from "./routes/production.routes";
import { procurementRoutes } from "./routes/procurement.routes";
import { leaveRoutes } from "./routes/leave.routes";
import { payrollRoutes } from "./routes/payroll.routes";
import { rbacPlugin } from "./plugins";

const app = new Elysia()
  .use(cors())
  // ──────────────────────────────────────────────
  // Public endpoints
  // ──────────────────────────────────────────────
  .get("/", () => ({
    name: "Lucky Land API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  }))
  .get("/health", () => ({
    status: "ok",
    uptime: process.uptime(),
  }))
  // ──────────────────────────────────────────────
  // Global error handler
  // ──────────────────────────────────────────────
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        success: false,
        message: `Validation error: ${JSON.stringify(error.all)}`,
        errors: error.all,
      };
    }

    // Log unexpected errors in development
    if (process.env.NODE_ENV !== "production") {
      console.error(`[ERROR] ${code}:`, (error as Error).message || String(error));
    }

    return {
      success: false,
      message: (error as Error).message || "Internal server error",
    };
  })
  // ──────────────────────────────────────────────
  // Route modules
  // ──────────────────────────────────────────────
  .use(authRoutes)
  .use(posRoutes)
  .use(productionRoutes)
  .use(procurementRoutes)
  .use(leaveRoutes)
  .use(payrollRoutes)
  // ──────────────────────────────────────────────
  // RBAC Test Routes (remove in production)
  // These demonstrate the requireRole macro
  // ──────────────────────────────────────────────
  .use(rbacPlugin)
  .get(
    "/api/test/owner-only",
    ({ user }) => ({
      success: true,
      message: `Welcome Owner! You are ${user!.role} with ID ${user!.id}`,
    }),
    { requireRole: ["OWNER"] }
  )
  .get(
    "/api/test/admin-access",
    ({ user }) => ({
      success: true,
      message: `Welcome! You are ${user!.role} with ID ${user!.id}`,
    }),
    { requireRole: ["OWNER", "ADMIN"] }
  )
  .get(
    "/api/test/pos-access",
    ({ user }) => ({
      success: true,
      message: `POS access granted for ${user!.role}`,
    }),
    { requireRole: ["OWNER", "ADMIN", "KASIR"] }
  )
  .listen(3001);

console.log(
  `🍰 Lucky Land API is running at http://${app.server?.hostname}:${app.server?.port}`
);
console.log(app.routes.map(r => `${r.method} ${r.path}`));
