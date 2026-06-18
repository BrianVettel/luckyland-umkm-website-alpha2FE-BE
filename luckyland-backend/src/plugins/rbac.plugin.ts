import { Elysia } from "elysia";
import type { Role } from "../../generated/prisma";
import { authPlugin } from "./auth.plugin";

/**
 * RBAC Plugin — provides the `requireRole` macro for declarative role-based
 * access control on individual routes.
 *
 * This plugin depends on `authPlugin` (which provides `user` in context via derive).
 *
 * ## Usage
 *
 * ```ts
 * app
 *   .use(rbacPlugin)
 *   .get("/admin-only", ({ user }) => ({ msg: `Hello ${user.role}` }), {
 *     requireRole: ["OWNER", "ADMIN"],
 *   })
 *   .get("/owner-only", ({ user }) => ({ msg: "Owner area" }), {
 *     requireRole: ["OWNER"],
 *   });
 * ```
 *
 * Routes decorated with `requireRole` will:
 * 1. Automatically require a valid JWT (via authPlugin derive)
 * 2. Check if the user's role is in the allowed list
 * 3. Return 401 if not authenticated, 403 if role is not permitted
 */
export const rbacPlugin = new Elysia({ name: "rbac-plugin" })
  .use(authPlugin)
  .macro({
    requireRole: (allowedRoles: Role[]) => ({
      beforeHandle({ user, set }: { user: { id: string; role: Role } | null; set: any }) {
        // Check authentication first
        if (!user) {
          set.status = 401;
          return {
            success: false,
            message: "Authentication required. Please provide a valid Bearer token.",
          };
        }

        // Check authorization
        if (!allowedRoles.includes(user.role)) {
          set.status = 403;
          return {
            success: false,
            message: `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${user.role}.`,
          };
        }
      },
    }),
  });

/**
 * Helper: Creates a guard group for routes that require specific roles.
 * Useful for grouping multiple routes under the same role requirement.
 *
 * ## Usage
 *
 * ```ts
 * const ownerRoutes = new Elysia({ prefix: "/owner" })
 *   .use(createRoleGuard(["OWNER"]))
 *   .get("/dashboard", ({ user }) => ({ msg: "Owner dashboard" }))
 *   .get("/settings", ({ user }) => ({ msg: "Owner settings" }));
 * ```
 */
export function createRoleGuard(allowedRoles: Role[]) {
  return new Elysia({ name: `role-guard-${allowedRoles.join("-")}` })
    .use(authPlugin)
    .onBeforeHandle(({ user, set }) => {
      if (!user) {
        set.status = 401;
        return {
          success: false,
          message: "Authentication required. Please provide a valid Bearer token.",
        };
      }

      if (!allowedRoles.includes(user.role)) {
        set.status = 403;
        return {
          success: false,
          message: `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${user.role}.`,
        };
      }
    });
}
