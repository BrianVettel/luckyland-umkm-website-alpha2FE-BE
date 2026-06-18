import { Elysia } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";

const app = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: "test-secret",
    })
  )
  .use(bearer())
  .get("/test", async ({ jwt, bearer, headers }) => {
    return {
      bearerValue: bearer,
      authHeader: headers.authorization,
    };
  })
  .listen(3002);

console.log("Test server on 3002");
