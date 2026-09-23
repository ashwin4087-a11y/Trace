import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";

export async function listDepartments(organizationId?: string) {
  return prisma.department.findMany({
    where: organizationId ? { organizationId } : undefined,
    include: { organization: { select: { id: true, name: true, code: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createDepartment(input: { organizationId: string; name: string; code: string }) {
  const org = await prisma.organization.findUnique({ where: { id: input.organizationId } });
  if (!org) throw new ApiError(404, "NOT_FOUND", "Organization not found");
  return prisma.department.create({ data: input });
}

export async function updateDepartment(id: string, input: { name?: string; code?: string }) {
  return prisma.department.update({ where: { id }, data: input });
}

export async function removeDepartment(id: string) {
  await prisma.department.delete({ where: { id } });
}
