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
        name: "png-modern",
        version: "2026-01",
      },
    },
    update: {
      isActive: true,
      storageUri: "/data/reference/png-modern/2026-01/dataset.csv",
      description: "現代同位体データセット",
    },
    create: {
      name: "png-modern",
      version: "2026-01",
      description: "現代同位体データセット",
      storageUri: "/data/reference/png-modern/2026-01/dataset.csv",
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
