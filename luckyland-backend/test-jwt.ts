import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

const plugin = new Elysia().use(
  jwt({
    name: "jwt",
    secret: "test-secret",
  })
);

const app = new Elysia()
  .use(plugin)
  .get("/test", async ({ jwt }) => {
    const token = await jwt.sign({ sub: "123", role: "ADMIN" });
    const payload = await jwt.verify(token);
    return { token, payload };
  })
  .listen(3002);

console.log("Test server on 3002");
