import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.game.createMany({
    data: [{ internalName: "dancerush", formattedName: "DANCERUSH STARDOM", description: "A suffle dancing game from KONAMI"}],
  });
  console.log("Initial seed data inserted");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
