import { prisma } from "../../config/database";

export async function listPermissions() {
  return prisma.permission.findMany({ orderBy: { key: "asc" } });
}
