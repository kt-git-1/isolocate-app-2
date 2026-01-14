import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.referenceDataset.upsert({
    where: {
      name_version: {
        name: "modern_png",
        version: "2026-01",
      },
    },
    update: {
      isActive: true,
      storageUri: "/reference_datasets/modern_png/2026-01/dataset.csv",
      description: "現代同位体データセット",
    },
    create: {
      name: "modern_png",
      version: "2026-01",
      description: "現代同位体データセット",
      storageUri: "/reference_datasets/modern_png/2026-01/dataset.csv",
      isActive: true,
    },
  });

  console.log("Seeded: reference_datasets");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
