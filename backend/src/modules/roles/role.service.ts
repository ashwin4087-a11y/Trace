import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import { recordAudit } from "../audit/audit.service";

export async function listRoles() {
  return prisma.role.findMany({
    include: { permissions: { include: { permission: true } } },
    orderBy: { name: "asc" },
  });
}

export async function setRolePermissions(actorId: string, roleId: string, permissionIds: string[]) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new ApiError(404, "NOT_FOUND", "Role not found");
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId } }),
    prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
    }),
  ]);
  await recordAudit(actorId, "CHANGE_PERMISSION", "Role", roleId, { permissionIds });
  return listRoles();
}
