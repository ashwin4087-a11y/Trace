import type { MaterialType } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";
import { assertCanManageWorkshop } from "../workshops/workshop.service";

export async function listMaterialsForParticipant(user: AuthUser | undefined, workshopId: string) {
  // Public listing is allowed but we only return PUBLISHED materials and we do NOT return the url.
  const materials = await prisma.learningMaterial.findMany({
    where: { workshopId, status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
  });
  
  return materials.map((m) => ({
    ...m,
    url: "", // Mask the URL
  }));
}

export async function manageList(user: AuthUser, workshopId: string) {
  await assertCanManageWorkshop(user, workshopId);
  return prisma.learningMaterial.findMany({
    where: { workshopId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function addMaterial(
  user: AuthUser,
  workshopId: string,
  input: {
    sessionId?: string | null;
    title: string;
    description?: string | null;
    type: MaterialType;
    url: string;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
    durationSeconds?: number | null;
  }
) {
  await assertCanManageWorkshop(user, workshopId);
  
  if (input.sessionId) {
    const session = await prisma.workshopSession.findUnique({ where: { id: input.sessionId } });
    if (!session || session.workshopId !== workshopId) {
      throw new ApiError(400, "INVALID_SESSION", "Session does not exist or does not belong to this workshop");
    }
  }

  const lastMaterial = await prisma.learningMaterial.findFirst({
    where: { workshopId },
    orderBy: { sortOrder: "desc" },
  });
  const sortOrder = lastMaterial ? lastMaterial.sortOrder + 1 : 0;

  return prisma.learningMaterial.create({
    data: {
      workshopId,
      ...input,
      sortOrder,
      status: "DRAFT",
    },
  });
}

export async function updateMaterial(
  user: AuthUser,
  id: string,
  input: Partial<{
    sessionId?: string | null;
    title: string;
    description?: string | null;
    type: MaterialType;
    url: string;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
    durationSeconds?: number | null;
  }>
) {
  const material = await prisma.learningMaterial.findUnique({ where: { id } });
  if (!material) throw new ApiError(404, "NOT_FOUND", "Material not found");
  
  await assertCanManageWorkshop(user, material.workshopId);

  if (input.sessionId) {
    const session = await prisma.workshopSession.findUnique({ where: { id: input.sessionId } });
    if (!session || session.workshopId !== material.workshopId) {
      throw new ApiError(400, "INVALID_SESSION", "Session does not exist or does not belong to this workshop");
    }
  }

  return prisma.learningMaterial.update({
    where: { id },
    data: input,
  });
}

export async function removeMaterial(user: AuthUser, id: string) {
  const material = await prisma.learningMaterial.findUnique({ where: { id } });
  if (!material) throw new ApiError(404, "NOT_FOUND", "Material not found");
  await assertCanManageWorkshop(user, material.workshopId);
  await prisma.learningMaterial.delete({ where: { id } });
}

export async function publishMaterial(user: AuthUser, id: string) {
  const material = await prisma.learningMaterial.findUnique({ where: { id }, include: { workshop: true } });
  if (!material) throw new ApiError(404, "NOT_FOUND", "Material not found");
  await assertCanManageWorkshop(user, material.workshopId);
  
  if (material.workshop.status === "CANCELLED" || material.workshop.status === "ARCHIVED") {
    throw new ApiError(400, "WORKSHOP_ARCHIVED", "Cannot publish material for archived/cancelled workshop");
  }

  return prisma.learningMaterial.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });
}

export async function unpublishMaterial(user: AuthUser, id: string) {
  const material = await prisma.learningMaterial.findUnique({ where: { id } });
  if (!material) throw new ApiError(404, "NOT_FOUND", "Material not found");
  await assertCanManageWorkshop(user, material.workshopId);

  return prisma.learningMaterial.update({
    where: { id },
    data: { status: "DRAFT" },
  });
}

export async function reorderMaterials(user: AuthUser, workshopId: string, updates: { id: string; sortOrder: number }[]) {
  await assertCanManageWorkshop(user, workshopId);
  
  // Verify all materials belong to this workshop
  const ids = updates.map(u => u.id);
  const materials = await prisma.learningMaterial.findMany({ where: { id: { in: ids } } });
  if (materials.some(m => m.workshopId !== workshopId)) {
    throw new ApiError(400, "INVALID_MATERIAL", "One or more materials do not belong to this workshop");
  }

  return prisma.$transaction(
    updates.map(u => prisma.learningMaterial.update({
      where: { id: u.id },
      data: { sortOrder: u.sortOrder }
    }))
  );
}

export async function getMaterialAccess(user: AuthUser | undefined, id: string) {
  const material = await prisma.learningMaterial.findUnique({ where: { id } });
  if (!material) throw new ApiError(404, "NOT_FOUND", "Material not found");

  if (!user) {
    throw new ApiError(403, "UNAUTHORIZED", "Must be logged in to access materials");
  }

  let isAuthorized = false;

  // 1. Organizer / Admin checking
  if (user.role === "ADMIN" || user.role === "ORGANIZER") {
    try {
      await assertCanManageWorkshop(user, material.workshopId);
      isAuthorized = true;
    } catch {
      // Not the organizer of this workshop
    }
  }

  // 2. Participant checking
  if (!isAuthorized) {
    if (material.status !== "PUBLISHED") {
      throw new ApiError(403, "UNAUTHORIZED", "Material is not published");
    }

    const reg = await prisma.registration.findUnique({
      where: { workshopId_userId: { workshopId: material.workshopId, userId: user.id } },
    });
    
    if (!reg) {
      throw new ApiError(403, "UNAUTHORIZED", "Not registered for this workshop");
    }
    
    // COMPLETED registrations are implicitly allowed since they have finished the workshop
    if (reg.status !== "CONFIRMED") {
      throw new ApiError(403, "UNAUTHORIZED", `Registration status must be CONFIRMED. Current status: ${reg.status}`);
    }
    isAuthorized = true;
  }

  if (!isAuthorized) {
    throw new ApiError(403, "UNAUTHORIZED", "Not authorized to access this material");
  }

  return material;
}
