import { api, unwrap } from "./api";
import type { Community, CommunityPost } from "../types/community";

export async function myCommunities() {
  return unwrap<Community[]>(await api.get("/communities"));
}
export async function posts(communityId: string) {
  return unwrap<CommunityPost[]>(await api.get(`/communities/${communityId}/posts`));
}
export async function createPost(body: { communityId: string; type: string; title: string; body: string }) {
  return unwrap<CommunityPost>(await api.post("/communities/posts", body));
}
export async function comment(postId: string, body: string) {
  return unwrap<unknown>(await api.post(`/communities/posts/${postId}/comments`, { body }));
}
