"use client";

import { useState, useEffect } from "react";

type SkillPost = {
  id: string;
  authorId: string;
  authorName: string;
  offeredSkill: string;
  recommendedSkill: string;
  description: string | null;
  tokenCost: number;
  isOpen: boolean;
  createdAt: string;
};

type ExchangeRequest = {
  id: string;
  postId: string;
  requesterId: string;
  requesterName: string;
  type: "barter" | "token";
  offeredSkill: string | null;
  message: string | null;
  status: "pending" | "accepted" | "rejected";
  tokensSpent: number;
  createdAt: string;
  post: SkillPost | null;
};

export default function ExchangesPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "requests">("posts");

  // My posts + incoming requests
  const [myPosts, setMyPosts] = useState<SkillPost[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ExchangeRequest[]>([]);

  // My sent requests
  const [sentRequests, setSentRequests] = useState<ExchangeRequest[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Post modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [offeredSkill, setOfferedSkill] = useState("");
  const [recommendedSkill, setRecommendedSkill] = useState("");
  const [description, setDescription] = useState("");
  const [tokenCost, setTokenCost] = useState(5);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState("");

  // Respond state
  const [respondingId, setRespondingId] = useState<string | null>(null);

  async function fetchData() {
    setIsLoading(true);
    setError("");
    try {
      const [incomingRes, sentRes] = await Promise.all([
        fetch("/api/skill-exchange/incoming"),
        fetch("/api/skill-exchange/requests"),
      ]);

      if (incomingRes.ok) {
        const data = await incomingRes.json();
        setMyPosts(data.posts || []);
        setIncomingRequests(data.requests || []);
      } else if (incomingRes.status === 401) {
        setError("Please log in to view your exchanges.");
        return;
      }

      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentRequests(data.requests || []);
      }
    } catch {
      setError("Failed to load data. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePost = async () => {
    if (!offeredSkill.trim() || !recommendedSkill.trim()) {
      setPostError("Offered skill and recommended skill are required.");
      return;
    }
    setPostLoading(true);
    setPostError("");
    try {
      const res = await fetch("/api/skill-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offeredSkill, recommendedSkill, description, tokenCost }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPostError(data.error || "Failed to create post.");
        return;
      }
      setShowPostModal(false);
      setOfferedSkill("");
      setRecommendedSkill("");
      setDescription("");
      setTokenCost(5);
      fetchData();
    } catch {
      setPostError("Network error. Please try again.");
    } finally {
      setPostLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post? All incoming requests will also be removed.")) return;
    try {
      await fetch(`/api/skill-posts/${postId}`, { method: "DELETE" });
      fetchData();
    } catch { /* silent */ }
  };

  const handleRespond = async (requestId: string, action: "accept" | "reject") => {
    setRespondingId(requestId);
    try {
      await fetch("/api/skill-exchange/respond", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      fetchData();
    } catch { /* silent */ } finally {
      setRespondingId(null);
    }
  };

  const statusBadge = (status: string) => {
    if (status === "accepted")
      return (
        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          Accepted
        </span>
      );
    if (status === "rejected")
      return (
        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
          Declined
        </span>
      );
    return (
      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
        Pending
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded-lg animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Skill Exchange</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Teach what you know. Learn what you need.
          </p>
        </div>
        <button
          onClick={() => { setShowPostModal(true); setPostError(""); }}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
        >
          + Post a Skill
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("posts")}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all ${
            activeTab === "posts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Posts
          {incomingRequests.filter((r) => r.status === "pending").length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded-full bg-primary text-primary-foreground">
              {incomingRequests.filter((r) => r.status === "pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all ${
            activeTab === "requests"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Requests
        </button>
      </div>

      {/* My Posts Tab */}
      {activeTab === "posts" && (
        <div className="space-y-6">
          {myPosts.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <span className="text-3xl">📢</span>
              <p className="mt-2 text-sm font-semibold">No posts yet</p>
              <p className="text-xs text-muted-foreground mt-1">Post a skill you can teach and start exchanging.</p>
              <button
                onClick={() => setShowPostModal(true)}
                className="mt-4 px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                Post a Skill
              </button>
            </div>
          ) : (
            myPosts.map((post) => {
              const postRequests = incomingRequests.filter((r) => r.postId === post.id);
              const pendingCount = postRequests.filter((r) => r.status === "pending").length;
              return (
                <div key={post.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-medium">
                          Offers: {post.offeredSkill}
                        </span>
                        <span className="text-xs text-muted-foreground">wants</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-accent text-accent-foreground border border-border font-medium">
                          {post.recommendedSkill}
                        </span>
                        </div>
                      {post.description && (
                        <p className="text-xs text-muted-foreground">{post.description}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        Token cost for non-match learners: <span className="font-semibold text-foreground">{post.tokenCost} tokens</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-[10px] text-destructive hover:underline font-semibold shrink-0"
                    >
                      Delete Post
                    </button>
                  </div>

                  {postRequests.length > 0 && (
                    <div className="border-t border-border/60 pt-4 space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Incoming Requests {pendingCount > 0 && <span className="text-primary">({pendingCount} pending)</span>}
                      </p>
                      {postRequests.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border/40"
                        >
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-foreground">{req.requesterName}</span>
                              {statusBadge(req.status)}
                              <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${
                                req.type === "barter"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-primary/10 text-primary border-primary/20"
                              }`}>
                                {req.type === "barter" ? `Barter — ${req.offeredSkill}` : `${req.tokensSpent} tokens`}
                              </span>
                            </div>
                            {req.message && (
                              <p className="text-[10px] text-muted-foreground line-clamp-1">&ldquo;{req.message}&rdquo;</p>
                            )}
                          </div>
                          {req.status === "pending" && (
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleRespond(req.id, "accept")}
                                disabled={respondingId === req.id}
                                className="px-3 py-1 text-[10px] font-bold rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-all disabled:opacity-60"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRespond(req.id, "reject")}
                                disabled={respondingId === req.id}
                                className="px-3 py-1 text-[10px] font-bold rounded-md border border-destructive text-destructive hover:bg-destructive/5 transition-all disabled:opacity-60"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {postRequests.length === 0 && post.isOpen && (
                    <p className="text-xs text-muted-foreground italic">No requests yet — your post is live on the Explore page.</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {sentRequests.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <span className="text-3xl">🔍</span>
              <p className="mt-2 text-sm font-semibold">No requests sent yet</p>
              <p className="text-xs text-muted-foreground mt-1">Browse the Skill Exchange tab on the Explore page.</p>
            </div>
          ) : (
            sentRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-card border border-border flex items-start gap-4"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">
                      {req.post ? req.post.offeredSkill : "Deleted Post"}
                    </span>
                    {statusBadge(req.status)}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${
                      req.type === "barter"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-primary/10 text-primary border-primary/20"
                    }`}>
                      {req.type === "barter" ? `Barter — offering ${req.offeredSkill}` : `${req.tokensSpent} tokens paid`}
                    </span>
                  </div>
                  {req.post && (
                    <p className="text-[10px] text-muted-foreground">
                      Posted by <span className="font-semibold text-foreground">{req.post.authorName}</span>
                    </p>
                  )}
                  {req.message && (
                    <p className="text-[10px] text-muted-foreground italic">&ldquo;{req.message}&rdquo;</p>
                  )}
                  {req.status === "accepted" && (
                    <p className="text-xs font-semibold text-emerald-500">
                      Accepted! Message {req.post?.authorName ?? "the author"} to schedule your session.
                    </p>
                  )}
                  {req.status === "rejected" && req.type === "token" && req.tokensSpent > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {req.tokensSpent} token{req.tokensSpent !== 1 && "s"} refunded.
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Post a Skill to Exchange</h3>
              <button onClick={() => setShowPostModal(false)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
            </div>

            {postError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
                {postError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Skill I Can Teach <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. React, Bangla Grammar, Guitar"
                value={offeredSkill}
                onChange={(e) => setOfferedSkill(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Skill I Want in Return (for free barter) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Python, IELTS, Video Editing"
                value={recommendedSkill}
                onChange={(e) => setRecommendedSkill(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-[9px] text-muted-foreground">
                Users who know this skill can exchange for free. Others pay tokens.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Description (optional)</label>
              <textarea
                rows={3}
                placeholder="Share your experience level, what you can cover, preferred schedule..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Token Cost for Non-Match Learners</label>
                <span className="text-xs font-bold text-primary">{tokenCost} tokens</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={tokenCost}
                onChange={(e) => setTokenCost(Number(e.target.value))}
                className="w-full accent-primary h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1</span>
                <span>20</span>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowPostModal(false)}
                className="flex-1 h-10 text-xs font-bold rounded-lg border border-border text-muted-foreground hover:bg-accent transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={postLoading || !offeredSkill.trim() || !recommendedSkill.trim()}
                className="flex-1 h-10 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {postLoading ? "Posting..." : "Post Skill"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
