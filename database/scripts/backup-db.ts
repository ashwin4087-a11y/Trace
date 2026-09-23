import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const backupDir = path.resolve(__dirname, "../backups");
fs.mkdirSync(backupDir, { recursive: true });
const file = path.join(backupDir, `aurex-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`);
execSync(`pg_dump --dbname="${databaseUrl}" --file="${file}"`, { stdio: "inherit" });
console.info(`Backup written to ${file}`);
