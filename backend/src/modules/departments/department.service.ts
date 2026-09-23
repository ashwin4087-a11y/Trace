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
      organization: { select: { id: true, name: true, code: true, status: true } },
      members: { include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true, role: true, status: true } } } },
    },
  });
  if (!department) throw new ApiError(404, "NOT_FOUND", "Department not found");
  return department;
}

export async function createDepartment(actorId: string, input: { organizationId: string; name: string; code: string; description?: string }) {
  const org = await prisma.organization.findUnique({ where: { id: input.organizationId } });
  if (!org) throw new ApiError(404, "NOT_FOUND", "Organization not found");
  if (org.status !== "ACTIVE") throw new ApiError(409, "ORGANIZATION_INACTIVE", "Departments can only be added to active organizations");
  const department = await prisma.department.create({ data: input });
  await recordAudit(actorId, "CREATE_DEPARTMENT", "Department", department.id, { organizationId: input.organizationId });
  return department;
}

export async function updateDepartment(actorId: string, id: string, input: { name?: string; code?: string; description?: string }) {
  const department = await prisma.department.update({ where: { id }, data: input });
  await recordAudit(actorId, "UPDATE_DEPARTMENT", "Department", id, { fields: Object.keys(input) });
  return department;
}

export async function setDepartmentStatus(actorId: string, id: string, status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED") {
  const department = await prisma.department.update({ where: { id }, data: { status } });
  await recordAudit(actorId, "DEPARTMENT_STATUS", "Department", id, { status });
  return department;
}

export async function removeDepartment(id: string) {
  await prisma.department.delete({ where: { id } });
}
