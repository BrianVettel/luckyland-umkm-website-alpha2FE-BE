import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating Owner and Admin basic salary...");
  
  await prisma.user.updateMany({
    where: {
      role: {
        in: ["OWNER", "ADMIN"]
      }
    },
    data: {
      basicSalary: 5000000
    }
  });

  console.log("Salaries updated successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
