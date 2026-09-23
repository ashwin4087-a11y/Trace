import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import { recordAudit } from "../audit/audit.service";

export async function listDepartments(organizationId?: string) {
  return prisma.department.findMany({
    where: organizationId ? { organizationId } : undefined,
    include: { organization: { select: { id: true, name: true, code: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getDepartment(id: string) {
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      organization: { select: { id: true, name: true, code: true } },
      users: { select: { id: true, firstName: true, lastName: true, email: true, role: true, status: true } },
    },
  });
  if (!department) throw new ApiError(404, "NOT_FOUND", "Department not found");
  return department;
}

export async function createDepartment(actorId: string, input: { organizationId: string; name: string; code: string }) {
  const org = await prisma.organization.findUnique({ where: { id: input.organizationId } });
  if (!org) throw new ApiError(404, "NOT_FOUND", "Organization not found");
  const department = await prisma.department.create({ data: input });
  await recordAudit(actorId, "CREATE_ORGANIZATION", "Department", department.id, { organizationId: input.organizationId });
  return department;
}

export async function updateDepartment(actorId: string, id: string, input: { name?: string; code?: string }) {
  const department = await prisma.department.update({ where: { id }, data: input });
  await recordAudit(actorId, "CREATE_ORGANIZATION", "Department", id, { fields: Object.keys(input) });
  return department;
}

export async function removeDepartment(id: string) {
  await prisma.department.delete({ where: { id } });
}

