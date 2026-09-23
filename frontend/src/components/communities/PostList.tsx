import type { CommunityPost } from "../../types/community";

export function PostList({ posts }: { posts: CommunityPost[] }) {
  if (!posts.length) return <p className="text-sm">No posts yet.</p>;
  return (
    <ul className="space-y-3">
      {posts.map((post) => (
        <li key={post.id} className="rounded border border-line p-3">
          <p className="text-xs">{post.type}</p>
          <h3 className="font-semibold">{post.title}</h3>
          <p className="text-sm">{post.body}</p>
        </li>
      ))}
    </ul>
  );
}
