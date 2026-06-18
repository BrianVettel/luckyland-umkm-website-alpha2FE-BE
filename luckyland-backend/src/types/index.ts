import type { Role } from "../../generated/prisma";

/**
 * JWT payload embedded in every signed token.
 * Contains the minimum data needed to identify and authorize a user.
 */
export interface JWTPayload {
  /** User's unique database ID */
  sub: string;
  /** User's RBAC role */
  role: Role;
  /** Issued-at timestamp (epoch seconds) */
  iat?: number;
  /** Expiration timestamp (epoch seconds) */
  exp?: number;
}

/**
 * User session object injected into Elysia context
 * after JWT validation via the auth middleware.
 */
export interface UserSession {
  id: string;
  role: Role;
}

/**
 * Standard API error response shape.
 */
export interface ApiError {
  success: false;
  message: string;
  code?: string;
}

/**
 * Standard API success response shape.
 */
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}
