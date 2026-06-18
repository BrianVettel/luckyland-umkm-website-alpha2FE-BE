import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

async function run() {
  const loginRes = await fetch("http://localhost:3001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "kasir", password: "kasir123" })
  });
  const loginData = await loginRes.json() as any;
  const token = loginData.data.token;

  const res = await fetch("http://localhost:3001/api/pos/products", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}

run();
