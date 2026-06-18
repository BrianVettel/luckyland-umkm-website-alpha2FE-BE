import { fetch } from "bun";

async function run() {
  const loginRes = await fetch("http://localhost:3001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "baker", password: "baker123" }) 
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;

  // Let's see what happens if type is string, qty is string
  const res = await fetch("http://localhost:3001/api/procurement/", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      type: "RAW_MATERIAL",
      itemName: "Gula",
      qty: "5", // string
      unit: "kg"
    })
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

run();
