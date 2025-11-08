import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // pnpm prisma db seed
  await prisma.game.createMany({
    data: [
      {
        internalName: "dancerush",
        formattedName: "DANCERUSH STARDOM",
        description: "A suffle dancing game from KONAMI",
      },
      {
        internalName: "dancearound",
        formattedName: "Dance aROUND",
        description: "A dance simulation game from KONAMI",
      },
      {
        internalName: "diva",
        formattedName: "Hatsune Miku: Project DIVA Arcade Future Tone",
        description: "A 4-button and touch slider game from SEGA",
      },
      {
        internalName: "musicdiver",
        formattedName: "MUSIC DIVER",
        description: "Taito's quadrant based drumming game",
      },
      {
        internalName: "nostalgia",
        formattedName: "NOSTALGIA",
        description: "A piano based touch music game from KONAMI",
      },
      {
        internalName: "reflecbeat",
        formattedName: "REFLEC BEAT",
        description: "A touchscreen rhythm game from KONAMI",
      },
      {
        internalName: "taiko",
        formattedName: "Taiko no Tatsujin Arcade",
        description: "A drum-based rhythm game"
      }
    ],
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
