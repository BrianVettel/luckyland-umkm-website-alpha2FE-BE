import { Elysia } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { jwtPlugin } from "./jwt.plugin";
import type { UserSession } from "../types";
import type { Role } from "../../generated/prisma";

/**
 * Auth plugin — extracts and validates JWT from the Authorization header.
 *
 * After applying this plugin, every route in its scope gains:
 * - `user: UserSession` — the authenticated user's ID and role
 *
 * If the token is missing or invalid, the request is rejected with 401.
 *
 * Usage: `.use(authPlugin)` on any group or route that requires authentication.
 */
export const authPlugin = new Elysia({ name: "auth-plugin" })
  .use(jwtPlugin)
  .use(bearer())
  .derive({ as: "global" }, async ({ jwt, headers }) => {
    // Manually extract token from Authorization header
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null as UserSession | null };
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return { user: null as UserSession | null };
    }

    const payload = await jwt.verify(token);

    if (!payload) {
      return { user: null as UserSession | null };
    }



    const user: UserSession = {
      id: payload.sub as string,
      role: payload.role as Role,
    };

    return { user: user as UserSession | null };
  });
