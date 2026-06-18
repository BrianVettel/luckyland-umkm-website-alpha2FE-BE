import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { jwtPlugin } from "../plugins/jwt.plugin";
import { authPlugin } from "../plugins/auth.plugin";

/**
 * Auth Routes — handles user authentication.
 *
 * Routes:
 * - POST /api/auth/login    — Authenticate user, return JWT
 * - GET  /api/auth/me       — Get current user profile (requires auth)
 */
export const authRoutes = new Elysia({ prefix: "/api/auth" })
  // ──────────────────────────────────────────────
  // POST /api/auth/login
  // ──────────────────────────────────────────────
  .use(jwtPlugin)
  .post(
    "/login",
    async ({ jwt, body, set }) => {
      const { username, password } = body;

      // 1. Find user by username
      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          password: true,
          isActive: true,
        },
      });

      if (!user) {
        set.status = 401;
        return {
          success: false,
          message: "Invalid username or password.",
        };
      }

      // 2. Check if user account is active
      if (!user.isActive) {
        set.status = 403;
        return {
          success: false,
          message: "Your account has been deactivated. Contact the Owner.",
        };
      }

      // 3. Verify password using Bun's built-in bcrypt
      const isValidPassword = await Bun.password.verify(password, user.password);

      if (!isValidPassword) {
        set.status = 401;
        return {
          success: false,
          message: "Invalid username or password.",
        };
      }

      // 4. Sign JWT with user ID and role
      const token = await jwt.sign({
        sub: user.id,
        role: user.role,
      });

      // 5. Return token + user info (excluding password)
      return {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
          },
        },
        message: "Login successful.",
      };
    },
    {
      // Request body validation
      body: t.Object({
        username: t.String({ minLength: 1, error: "Username is required" }),
        password: t.String({ minLength: 1, error: "Password is required" }),
      }),
      detail: {
        summary: "User Login",
        description:
          "Authenticate with username and password. Returns a JWT token on success.",
        tags: ["Authentication"],
      },
    }
  )

  // ──────────────────────────────────────────────
  // GET /api/auth/me — Get current user profile
  // ──────────────────────────────────────────────
  .use(authPlugin)
  .get(
    "/me",
    async ({ user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, message: "Authentication required" };
      }

      // Fetch full user profile from DB (exclude password)
      const profile = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          email: true,
          phone: true,
          leaveQuota: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!profile) {
        set.status = 404;
        return {
          success: false,
          message: "User not found.",
        };
      }

      return {
        success: true,
        data: profile,
      };
    },
    {
      detail: {
        summary: "Get Current User",
        description:
          "Returns the authenticated user's profile. Requires a valid Bearer token.",
        tags: ["Authentication"],
      },
    }
  );
