import type { CommunityPostType } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";

async function membership(communityId: string, userId: string) {
  return prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId } },
  });
}

export async function listCommunities(userId: string) {
  return prisma.community.findMany({
    where: { members: { some: { userId } } },
    include: { workshop: { select: { id: true, title: true } }, _count: { select: { members: true, posts: true } } },
  });
}

export async function join(userId: string, communityId: string) {
  const community = await prisma.community.findUnique({ where: { id: communityId }, include: { workshop: true } });
  if (!community) throw new ApiError(404, "NOT_FOUND", "Community not found");
  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId: community.workshopId, userId } },
  });
  if (!registration || registration.status !== "CONFIRMED") {
    throw new ApiError(403, "NOT_REGISTERED", "Join the workshop before joining its community");
  }
  return prisma.communityMember.upsert({
    where: { communityId_userId: { communityId, userId } },
    update: {},
    create: { communityId, userId },
  });
}

export async function createPost(
  user: AuthUser,
  input: { communityId: string; type: CommunityPostType; title: string; body: string; pollOptions?: string[] },
) {
  const member = await membership(input.communityId, user.id);
  if (!member && user.role === "PARTICIPANT") {
    throw new ApiError(403, "FORBIDDEN", "Join the community before posting");
  }
  return prisma.communityPost.create({
    data: {
      communityId: input.communityId,
      authorId: user.id,
      type: input.type,
      title: input.title,
      body: input.body,
      poll: input.type === "POLL" && input.pollOptions ? { create: { options: input.pollOptions } } : undefined,
    },
    include: { poll: true },
  });
}

export async function listPosts(communityId: string) {
  return prisma.communityPost.findMany({
    where: { communityId, hidden: false },
    include: {
      author: { select: { firstName: true, lastName: true } },
      comments: { where: { hidden: false }, include: { author: { select: { firstName: true, lastName: true } } } },
      poll: { include: { votes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function comment(userId: string, postId: string, body: string) {
  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post) throw new ApiError(404, "NOT_FOUND", "Post not found");
  return prisma.communityComment.create({ data: { postId, authorId: userId, body } });
}

export async function moderate(user: AuthUser, postId: string, hidden: boolean) {
  if (user.role === "PARTICIPANT") throw new ApiError(403, "FORBIDDEN", "Moderation is limited to organizers and admins");
  return prisma.communityPost.update({ where: { id: postId }, data: { hidden } });
}

export async function vote(userId: string, pollId: string, optionIndex: number) {
  return prisma.communityPollVote.upsert({
    where: { pollId_userId: { pollId, userId } },
    update: { optionIndex },
    create: { pollId, userId, optionIndex },
  });
}
