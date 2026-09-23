import type { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

export async function recordAudit(
  actorId: string | null,
  action: AuditAction,
  entityType: string,
  entityId?: string,
  metadata?: Prisma.InputJsonValue,
) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      metadata,
    },
  });
}

export async function listAudit(page: number, pageSize: number, action?: string) {
  const where = action ? { action: action as AuditAction } : {};
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { items, total };
}
