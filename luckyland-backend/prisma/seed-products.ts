import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding products...\n");

  const products = [
    {
      name: "Chocolate Fudge Cake",
      price: 150000,
      category: "CAKE",
      description: "Rich chocolate cake with fudge icing",
    },
    {
      name: "Strawberry Shortcake",
      price: 120000,
      category: "CAKE",
      description: "Fresh strawberries and cream",
    },
    {
      name: "Assorted Cupcakes (Box of 6)",
      price: 60000,
      category: "CUPCAKE",
      description: "Vanilla, chocolate, and red velvet",
    }
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: p
    });
    console.log(`  ✅ Product created: ${product.name} (Rp ${product.price}) - ID: ${product.id}`);
  }

  console.log("\n🎉 Products seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
