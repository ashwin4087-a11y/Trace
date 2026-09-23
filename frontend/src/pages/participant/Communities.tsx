import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { PostList } from "../../components/communities/PostList";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Textarea } from "../../components/common/Textarea";
import { createPost, myCommunities, posts } from "../../services/community.service";

export function CommunitiesPage() {
  const communities = useQuery({ queryKey: ["communities"], queryFn: myCommunities });
  const first = communities.data?.[0];
  const feed = useQuery({ queryKey: ["posts", first?.id], queryFn: () => posts(first!.id), enabled: Boolean(first?.id) });
  const client = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const mutation = useMutation({
    mutationFn: () => createPost({ communityId: first!.id, type: "DISCUSSION", title, body }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["posts", first?.id] }),
  });
  return (
    <ParticipantLayout title="Communities">
      {!first ? <p className="text-sm">A community appears after you are confirmed for a published workshop.</p> : null}
      {first ? <h2 className="mb-3 font-semibold">{first.name}</h2> : null}
      <PostList posts={feed.data ?? []} />
      {first ? (
        <form className="mt-4 grid max-w-lg gap-3" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
          <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <Textarea label="Message" value={body} onChange={(event) => setBody(event.target.value)} required />
          <Button type="submit">Post</Button>
        </form>
      ) : null}
    </ParticipantLayout>
  );
}
