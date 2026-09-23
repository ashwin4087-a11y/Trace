import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import { recordAudit } from "../audit/audit.service";

export async function listOrganizations() {
  return prisma.organization.findMany({
    include: { departments: true, _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createOrganization(
  actorId: string,
  input: { name: string; code: string; description?: string },
) {
  const organization = await prisma.organization.create({ data: input });
  await recordAudit(actorId, "CREATE_ORGANIZATION", "Organization", organization.id);
  return organization;
}

export async function updateOrganization(
  id: string,
  input: { name?: string; code?: string; description?: string },
) {
  return prisma.organization.update({ where: { id }, data: input });
}

export async function removeOrganization(id: string) {
  await prisma.organization.delete({ where: { id } });
}
