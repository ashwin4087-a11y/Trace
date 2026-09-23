import dotenv from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
  `);
  console.info("Database schema dropped. Run migrations, then seed again.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
