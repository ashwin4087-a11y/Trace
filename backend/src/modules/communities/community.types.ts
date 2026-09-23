export type CommunityPostInput = {
  communityId: string;
  type: "DISCUSSION" | "QUESTION" | "POLL" | "RESOURCE";
  title: string;
  body: string;
  pollOptions?: string[];
};
