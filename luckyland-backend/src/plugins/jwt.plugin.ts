import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

/**
 * JWT plugin — configures token signing and verification.
 * Makes `jwt.sign()` and `jwt.verify()` available in the Elysia context.
 *
 * Usage: `.use(jwtPlugin)`
 */
export const jwtPlugin = new Elysia({ name: "jwt-plugin" }).use(
  jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET || "fallback-secret-change-in-production",
    exp: "7d", // Token expires in 7 days
  })
);
