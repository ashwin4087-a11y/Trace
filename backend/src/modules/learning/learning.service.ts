import type { MaterialType } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";
import { assertCanManageWorkshop } from "../workshops/workshop.service";

export async function listMaterials(workshopId: string) {
  return prisma.learningMaterial.findMany({
    where: { workshopId },
    orderBy: { createdAt: "asc" },
  });
}

export async function addMaterial(
  user: AuthUser,
  input: { workshopId: string; sessionId?: string; title: string; type: MaterialType; url: string },
) {
  await assertCanManageWorkshop(user, input.workshopId);
  return prisma.learningMaterial.create({ data: input });
}

export async function removeMaterial(user: AuthUser, id: string) {
  const material = await prisma.learningMaterial.findUnique({ where: { id } });
  if (!material) throw new ApiError(404, "NOT_FOUND", "Material not found");
  await assertCanManageWorkshop(user, material.workshopId);
  await prisma.learningMaterial.delete({ where: { id } });
}
