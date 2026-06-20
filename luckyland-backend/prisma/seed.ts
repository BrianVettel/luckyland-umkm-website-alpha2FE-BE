import { PrismaClient } from "../generated/prisma";

/**
 * Database seed script — creates initial users for all 5 RBAC roles.
 * Run with: bun prisma db seed
 */

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  const users = [
    {
      username: "owner",
      password: "owner123",
      name: "Pemilik Lucky Land",
      role: "OWNER" as const,
      email: "owner@luckyland.com",
      phone: "08123456001",
      basicSalary: 0,
      leaveQuota: 12,
    },
    {
      username: "admin",
      password: "admin123",
      name: "Komang",
      role: "ADMIN" as const,
      email: "komang@luckyland.com",
      phone: "08123456002",
      basicSalary: 4500000,
      leaveQuota: 12,
    },
    {
      username: "kasir",
      password: "kasir123",
      name: "Putu Sari",
      role: "KASIR" as const,
      email: "putu.sari@luckyland.com",
      phone: "08123456003",
      basicSalary: 3800000,
      leaveQuota: 12,
    },
    {
      username: "baker",
      password: "baker123",
      name: "Made Adi",
      role: "BAKER" as const,
      email: "made.adi@luckyland.com",
      phone: "08123456004",
      basicSalary: 4200000,
      leaveQuota: 12,
    },
    {
      username: "decorator",
      password: "decorator123",
      name: "Sinta",
      role: "DECORATOR" as const,
      email: "sinta@luckyland.com",
      phone: "08123456005",
      basicSalary: 4000000,
      leaveQuota: 12,
    },
  ];

  for (const userData of users) {
    // Hash password using Bun's built-in bcrypt
    const hashedPassword = await Bun.password.hash(userData.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const user = await prisma.user.upsert({
      where: { username: userData.username },
      update: {
        name: userData.name,
        role: userData.role,
        password: hashedPassword,
        basicSalary: userData.basicSalary,
        leaveQuota: userData.leaveQuota,
      },
      create: {
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        email: userData.email,
        phone: userData.phone,
        basicSalary: userData.basicSalary,
        leaveQuota: userData.leaveQuota,
      },
    });

    console.log(`  ✅ ${user.role.padEnd(10)} → ${user.username} (${user.name})`);
  }

  console.log("\n🍞 Seeding products...");
  const products = [
    { name: "Classic Tiramisu Cake", category: "Cake", price: 320000 },
    { name: "Rainbow Birthday Cake", category: "Cake", price: 450000 },
    { name: "Chocolate Fudge Cake", category: "Cake", price: 380000 },
    { name: "Red Velvet Cake", category: "Cake", price: 410000 },
    { name: "Butter Croissant", category: "Pastry", price: 28000 },
    { name: "Cheese Danish", category: "Pastry", price: 32000 },
    { name: "Sourdough Loaf", category: "Bread", price: 65000 },
    { name: "Cinnamon Roll Box", category: "Pastry", price: 95000 },
  ];

  for (const p of products) {
    // Find existing by name, or create
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          name: p.name,
          category: p.category,
          price: p.price,
        }
      });
      console.log(`  🍰 ${created.name} (Rp ${created.price})`);
    } else {
      console.log(`  🍰 ${existing.name} (already exists)`);
    }
  }

  console.log("\n🎉 Seed completed! Users and Products created.");
  console.log("   You can now login with: POST /api/auth/login");
  console.log('   Example: { "username": "admin", "password": "admin123" }');
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
