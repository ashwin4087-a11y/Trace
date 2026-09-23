import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import { recordAudit } from "../audit/audit.service";

export async function listOrganizations() {
  return prisma.organization.findMany({
    include: { departments: true, _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getOrganization(id: string) {
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      departments: { orderBy: { name: "asc" } },
      users: {
        select: { id: true, firstName: true, lastName: true, email: true, role: true, status: true, department: { select: { id: true, name: true, code: true } } },
      },
      _count: { select: { users: true } },
    },
  });
  if (!organization) throw new ApiError(404, "NOT_FOUND", "Organization not found");
  return organization;
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
  actorId: string,
  id: string,
  input: { name?: string; code?: string; description?: string },
) {
  const organization = await prisma.organization.update({ where: { id }, data: input });
  await recordAudit(actorId, "CREATE_ORGANIZATION", "Organization", id, { fields: Object.keys(input) });
  return organization;
}

export async function removeOrganization(id: string) {
  await prisma.organization.delete({ where: { id } });
}

