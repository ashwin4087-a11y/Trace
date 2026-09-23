import dotenv from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const prisma = new PrismaClient({ log: ["error"] });

const expectedTables = [
  "User",
  "Organization",
  "Department",
  "Workshop",
  "WorkshopSkill",
  "WorkshopSession",
  "Registration",
  "LearningMaterial",
  "Activity",
  "Assessment",
  "Attendance",
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  await prisma.$queryRaw`SELECT 1`;
  console.info("PostgreSQL connection successful");
  console.info("Prisma connection successful");

  const rows = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  const present = new Set(rows.map((row) => row.tablename));
  const missing = expectedTables.filter((name) => !present.has(name));
  if (missing.length > 0) {
    throw new Error(`Database schema incomplete. Missing tables: ${missing.join(", ")}`);
  }

  console.info("Database schema accessible");
  console.info(`Public tables: ${rows.length}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Database verification failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
