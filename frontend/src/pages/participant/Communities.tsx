import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "../../context/AppContext";
import { TracePageLayout } from "../../components/trace/TracePageLayout";
import { TraceButton } from "../../components/trace/TraceButton";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceEmptyState } from "../../components/trace/TraceEmptyState";
import { TraceLoadingState } from "../../components/trace/TraceLoadingState";
import { TraceErrorState } from "../../components/trace/TraceErrorState";
import { comment, createPost, myCommunities, posts } from "../../services/community.service";
import type { Community, CommunityPost } from "../../types/community";

export function CommunitiesPage() {
  const { language } = useApp();
  const client = useQueryClient();

  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postType, setPostType] = useState<"DISCUSSION" | "QUESTION">("DISCUSSION");
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  // Fetch all user communities
  const communitiesQuery = useQuery({
    queryKey: ["communities"],
    queryFn: myCommunities,
  });

  const communitiesList = communitiesQuery.data ?? [];
  // Set default selected community
  const activeCommunity =
    communitiesList.find((c) => c.id === selectedCommunityId) ?? communitiesList[0];

  // Fetch posts for selected community
  const postsQuery = useQuery({
    queryKey: ["posts", activeCommunity?.id],
    queryFn: () => posts(activeCommunity!.id),
    enabled: Boolean(activeCommunity?.id),
  });

  // Create Post Mutation
  const createPostMutation = useMutation({
    mutationFn: () =>
      createPost({
        communityId: activeCommunity!.id,
        type: postType,
        title: postTitle,
        body: postBody,
      }),
    onSuccess: () => {
      setPostTitle("");
      setPostBody("");
      client.invalidateQueries({ queryKey: ["posts", activeCommunity?.id] });
    },
  });

  // Create Comment Mutation
  const createCommentMutation = useMutation({
    mutationFn: ({ postId, body }: { postId: string; body: string }) =>
      comment(postId, body),
    onSuccess: (_, variables) => {
      setCommentInputMap((prev) => ({ ...prev, [variables.postId]: "" }));
      setActiveCommentPostId(null);
      client.invalidateQueries({ queryKey: ["posts", activeCommunity?.id] });
    },
  });

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const bodyText = commentInputMap[postId]?.trim();
    if (bodyText) {
      createCommentMutation.mutate({ postId, body: bodyText });
    }
  };

  return (
    <TracePageLayout>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
        {/* Masthead Header */}
        <header className="flex flex-col gap-4 border-b border-[#DFC1B0]/70 pb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#EDCDBB] text-[#1A1412] font-sans text-xs uppercase tracking-widest font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BF9270]" />
              TRACE Academia · Guilds & Roundtables
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-baseline">
            <div className="lg:col-span-7 flex flex-col gap-2">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1412] font-normal tracking-tight">
                {language === "TA" ? "ஒன்றிணைந்து கற்போம்." : "Learn together."}
              </h1>
              <p className="font-serif italic text-lg text-[#261D1A]">
                “Your workshop doesn't have to end when the session does.”
              </p>
              <p className="font-sans text-xs sm:text-sm text-[#5F524B]">
                பயிலரங்கு முடிந்த பிறகும் ஒன்றிணைந்து கற்றலைத் தொடருங்கள்.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-end gap-2 text-xs text-[#5F524B]">
              <p className="leading-relaxed">
                Persistent peer guilds, faculty roundtables, and collaborative problem-solving bound to your academic journey.
              </p>
            </div>
          </div>
        </header>

        {communitiesQuery.isLoading && <TraceLoadingState count={2} />}
        {communitiesQuery.isError && (
          <TraceErrorState message="Unable to load communities." onRetry={() => communitiesQuery.refetch()} />
        )}

        {!communitiesQuery.isLoading && !communitiesQuery.isError && communitiesList.length === 0 && (
          <TraceEmptyState
            icon="groups"
            title={language === "TA" ? "சமூகங்கள் எதுவும் இல்லை." : "No communities yet."}
            description={
              language === "TA"
                ? "நீங்கள் ஒரு பட்டறையில் உறுதி செய்யப்பட்ட பிறகு கல்விச் சமூகம் தோன்றும்."
                : "A community appears automatically after you are confirmed for a published workshop."
            }
            actionLabel="Explore Workshops"
            onAction={() => window.location.href = "/workshops"}
          />
        )}

        {/* Communities Selector Tabs */}
        {communitiesList.length > 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DFC1B0]">
              <span className="font-sans text-xs font-bold text-[#5F524B] uppercase tracking-wider shrink-0 mr-2">
                My Guilds:
              </span>
              {communitiesList.map((c: Community) => {
                const isActive = activeCommunity?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCommunityId(c.id)}
                    className={`px-4 py-2 rounded-lg font-sans text-xs transition-all shrink-0 flex items-center gap-2 ${
                      isActive
                        ? "bg-[#BF9270] text-[#FFEDDB] font-semibold shadow-xs"
                        : "bg-[#FFFFFF] border border-[#DFC1B0] text-[#1A1412] hover:bg-[#EDCDBB]/50"
                    }`}
                  >
                    <span>{c.name}</span>
                    {c._count?.posts != null && (
                      <span className="text-[10px] opacity-80">({c._count.posts})</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Community Metadata Banner */}
            {activeCommunity && (
              <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <TraceBadge variant="terracotta">Active Guild</TraceBadge>
                    {activeCommunity.workshop?.title && (
                      <span className="font-sans text-xs text-[#5F524B]">
                        Linked: {activeCommunity.workshop.title}
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-2xl text-[#1A1412] font-semibold mt-1">
                    {activeCommunity.name}
                  </h2>
                  {activeCommunity.description && (
                    <p className="font-sans text-xs text-[#5F524B] mt-1">{activeCommunity.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-sans text-[#5F524B] border-t md:border-t-0 md:border-l border-[#DFC1B0] pt-3 md:pt-0 md:pl-6">
                  <div>
                    <span className="block font-serif text-lg font-semibold text-[#1A1412]">
                      {activeCommunity._count?.members ?? 1}
                    </span>
                    <span>Members</span>
                  </div>
                  <div>
                    <span className="block font-serif text-lg font-semibold text-[#1A1412]">
                      {postsQuery.data?.length ?? 0}
                    </span>
                    <span>Posts</span>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Stream + New Post Form */}
            {activeCommunity && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Feed */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {postsQuery.isLoading && <TraceLoadingState count={3} />}
                  {postsQuery.isError && (
                    <TraceErrorState message="Unable to load guild posts." onRetry={() => postsQuery.refetch()} />
                  )}

                  {!postsQuery.isLoading && postsQuery.data?.length === 0 && (
                    <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-8 text-center text-xs text-[#5F524B]">
                      No discussions in this guild yet. Be the first scholar to post a question or topic below.
                    </div>
                  )}

                  {postsQuery.data?.map((post: CommunityPost) => {
                    const commentsList = post.comments ?? [];
                    const isCommenting = activeCommentPostId === post.id;

                    return (
                      <article
                        key={post.id}
                        className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-[#DFC1B0]/40 pb-3">
                          <div className="flex items-center gap-2">
                            <TraceBadge variant={post.type === "QUESTION" ? "terracotta" : "default"}>
                              {post.type}
                            </TraceBadge>
                            <span className="font-sans text-xs font-semibold text-[#1A1412]">
                              {post.author ? `${post.author.firstName} ${post.author.lastName}` : "Scholar"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-serif text-xl text-[#1A1412] font-semibold mb-2">
                            {post.title}
                          </h3>
                          <p className="font-sans text-xs sm:text-sm text-[#5F524B] leading-relaxed whitespace-pre-line">
                            {post.body}
                          </p>
                        </div>

                        {/* Comments Section */}
                        <div className="pt-3 border-t border-[#DFC1B0]/40 flex flex-col gap-3">
                          <div className="flex items-center justify-between text-xs text-[#5F524B]">
                            <span className="font-semibold">
                              {commentsList.length}{" "}
                              {commentsList.length === 1 ? "Comment" : "Comments"}
                            </span>
                            <button
                              onClick={() =>
                                setActiveCommentPostId(isCommenting ? null : post.id)
                              }
                              className="text-[#BF9270] font-semibold hover:underline flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>
                              {isCommenting ? "Cancel" : "Add Comment"}
                            </button>
                          </div>

                          {/* Existing Comments */}
                          {commentsList.length > 0 && (
                            <div className="space-y-2 pt-1">
                              {commentsList.map((c) => (
                                <div
                                  key={c.id}
                                  className="p-3 rounded-lg bg-[#FFEDDB]/40 border border-[#DFC1B0]/60 text-xs flex flex-col gap-1"
                                >
                                  <span className="font-semibold text-[#1A1412]">
                                    {c.author ? `${c.author.firstName} ${c.author.lastName}` : "Peer Scholar"}
                                  </span>
                                  <p className="text-[#5F524B]">{c.body}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Comment Form */}
                          {isCommenting && (
                            <form
                              onSubmit={(e) => handleCommentSubmit(post.id, e)}
                              className="flex gap-2 pt-2"
                            >
                              <input
                                type="text"
                                placeholder="Write a thoughtful comment..."
                                value={commentInputMap[post.id] || ""}
                                onChange={(e) =>
                                  setCommentInputMap((prev) => ({
                                    ...prev,
                                    [post.id]: e.target.value,
                                  }))
                                }
                                className="flex-1 bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg px-3 py-1.5 text-xs text-[#1A1412] focus:outline-none focus:ring-1 focus:ring-[#BF9270]"
                                required
                              />
                              <TraceButton
                                type="submit"
                                size="sm"
                                disabled={createCommentMutation.isPending}
                              >
                                Post
                              </TraceButton>
                            </form>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Right Column: Create New Discussion Form */}
                <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4">
                  <h3 className="font-serif text-lg font-semibold text-[#1A1412] border-b border-[#DFC1B0]/60 pb-3">
                    Start a Guild Dispatch
                  </h3>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      createPostMutation.mutate();
                    }}
                    className="flex flex-col gap-4 text-xs"
                  >
                    <div>
                      <label className="block text-[#5F524B] font-semibold mb-1">
                        Dispatch Type
                      </label>
                      <select
                        value={postType}
                        onChange={(e) => setPostType(e.target.value as "DISCUSSION" | "QUESTION")}
                        className="w-full bg-[#FFEDDB]/40 border border-[#DFC1B0] rounded-lg p-2 text-[#1A1412] focus:outline-none focus:ring-1 focus:ring-[#BF9270]"
                      >
                        <option value="DISCUSSION">Discussion</option>
                        <option value="QUESTION">Question</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#5F524B] font-semibold mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        placeholder="Key research query or topic..."
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg p-2 text-[#1A1412] focus:outline-none focus:ring-1 focus:ring-[#BF9270]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[#5F524B] font-semibold mb-1">
                        Message Body
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Provide background context and detailed inquiry..."
                        value={postBody}
                        onChange={(e) => setPostBody(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg p-2 text-[#1A1412] focus:outline-none focus:ring-1 focus:ring-[#BF9270]"
                        required
                      />
                    </div>

                    <TraceButton
                      type="submit"
                      disabled={createPostMutation.isPending}
                      icon="send"
                    >
                      {createPostMutation.isPending ? "Publishing..." : "Publish to Guild"}
                    </TraceButton>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TracePageLayout>
  );
}
