export type Community = {
  id: string;
  name: string;
  description?: string | null;
  workshop?: { id: string; title: string };
  _count?: { members: number; posts: number };
};

export type CommunityPost = {
  id: string;
  title: string;
  body: string;
  type: string;
  author?: { firstName: string; lastName: string };
  comments?: { id: string; body: string; author?: { firstName: string; lastName: string } }[];
};
