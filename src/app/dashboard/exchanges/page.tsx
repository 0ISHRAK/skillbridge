"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

  async function reloadData() {
    try {
      const [incomingRes, sentRes] = await Promise.all([
        fetch("/api/skill-exchange/incoming"),
        fetch("/api/skill-exchange/requests"),
      ]);

      if (incomingRes.ok) {
        const data = await incomingRes.json();
        setMyPosts(data.posts || []);
        setIncomingRequests(data.requests || []);
      }

      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentRequests(data.requests || []);
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const [incomingRes, sentRes] = await Promise.all([
          fetch("/api/skill-exchange/incoming"),
          fetch("/api/skill-exchange/requests"),
        ]);

        if (incomingRes.ok && isMounted) {
          const data = await incomingRes.json();
          setMyPosts(data.posts || []);
          setIncomingRequests(data.requests || []);
        } else if (incomingRes.status === 401 && isMounted) {
          setError("Please log in to view your exchanges.");
          return;
        }

        if (sentRes.ok && isMounted) {
          const data = await sentRes.json();
          setSentRequests(data.requests || []);
        }
      } catch {
        if (isMounted) setError("Failed to load data. Please refresh.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadInitialData();
    return () => {
      isMounted = false;
    };
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
      reloadData();
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
      reloadData();
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
      reloadData();
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
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
        <div className="h-8 bg-muted rounded-lg w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-scale-up max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Skill Exchange</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Teach what you know. Learn what you need. Exchange knowledge with zero cash or earn Skill Tokens.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Link
            href="/explore?tab=exchange"
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-border bg-card hover:border-primary/40 hover:text-primary transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>Browse Community Swaps</span>
            <span className="text-[10px]">↗</span>
          </Link>
          <button
            onClick={() => { setShowPostModal(true); setPostError(""); }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
          >
            + Post a Skill
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* How Skill Exchange Works Banner */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          ⚡ How Peer Skill Swapping Works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-accent/20 border border-border/60 space-y-1">
            <span className="text-base">🤝</span>
            <p className="font-bold text-foreground">1. Post What You Know</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Offer a skill (e.g. Next.js, Figma, IELTS) and specify what topic you want to learn in return.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-accent/20 border border-border/60 space-y-1">
            <span className="text-base">🪙</span>
            <p className="font-bold text-foreground">2. Barter or Earn Tokens</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Swap 1-on-1 for free with matching learners, or receive Skill Tokens (1 🪙 = ৳10) from others.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-accent/20 border border-border/60 space-y-1">
            <span className="text-base">💬</span>
            <p className="font-bold text-foreground">3. Chat & Meet 1-on-1</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Accept exchange requests to immediately unlock direct messaging and coordinate meeting schedules.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("posts")}
          className={`pb-3 text-xs font-extrabold border-b-2 px-4 transition-all cursor-pointer ${
            activeTab === "posts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Teaching Posts ({myPosts.length})
          {incomingRequests.filter((r) => r.status === "pending").length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-primary text-primary-foreground">
              {incomingRequests.filter((r) => r.status === "pending").length} new
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 text-xs font-extrabold border-b-2 px-4 transition-all cursor-pointer ${
            activeTab === "requests"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Sent Requests ({sentRequests.length})
        </button>
      </div>

      {/* My Posts Tab */}
      {activeTab === "posts" && (
        <div className="space-y-6">
          {myPosts.length === 0 ? (
            <div className="text-center py-12 bg-card border border-dashed border-border rounded-2xl space-y-4 p-8">
              <span className="text-4xl block animate-bounce">📢</span>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">You Haven&apos;t Created Any Skill Posts Yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Post a skill you can teach (e.g. Web Development, UI/UX, IELTS) to connect with learners and start exchanging knowledge.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => { setShowPostModal(true); setPostError(""); }}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
                >
                  + Post a Skill to Teach
                </button>
                <Link
                  href="/explore?tab=exchange"
                  className="px-4 py-2.5 text-xs font-bold rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-all"
                >
                  Explore Community Swaps →
                </Link>
              </div>
            </div>
          ) : (
            myPosts.map((post) => {
              const postRequests = incomingRequests.filter((r) => r.postId === post.id);
              const pendingCount = postRequests.filter((r) => r.status === "pending").length;
              return (
                <div key={post.id} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/20 font-bold">
                          Offering: {post.offeredSkill}
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold">⇄ Looking for:</span>
                        <span className="px-2.5 py-1 rounded-lg text-xs bg-accent text-accent-foreground border border-border font-bold">
                          {post.recommendedSkill}
                        </span>
                      </div>
                      {post.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{post.description}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        Token cost for non-match learners:{" "}
                        <span className="font-extrabold text-foreground">{post.tokenCost} tokens</span>{" "}
                        <span className="text-muted-foreground font-normal">(≈ ৳{post.tokenCost * 10} BDT)</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-xs text-destructive hover:underline font-bold shrink-0 p-1 cursor-pointer"
                    >
                      Delete Post
                    </button>
                  </div>

                  {postRequests.length > 0 && (
                    <div className="border-t border-border/60 pt-4 space-y-3">
                      <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                        Incoming Swap Requests {pendingCount > 0 && <span className="text-primary font-bold">({pendingCount} pending)</span>}
                      </p>
                      {postRequests.map((req) => (
                        <div
                          key={req.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-foreground">{req.requesterName}</span>
                              {statusBadge(req.status)}
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                req.type === "barter"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : "bg-primary/10 text-primary border-primary/20"
                              }`}>
                                {req.type === "barter" ? `Barter — Offers ${req.offeredSkill}` : `${req.tokensSpent} Tokens (৳${req.tokensSpent * 10})`}
                              </span>
                            </div>
                            {req.message && (
                              <p className="text-xs text-muted-foreground italic">&ldquo;{req.message}&rdquo;</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {req.status === "pending" ? (
                              <>
                                <button
                                  onClick={() => handleRespond(req.id, "accept")}
                                  disabled={respondingId === req.id}
                                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all disabled:opacity-60 cursor-pointer shadow-xs"
                                >
                                  Accept Swap
                                </button>
                                <button
                                  onClick={() => handleRespond(req.id, "reject")}
                                  disabled={respondingId === req.id}
                                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-all disabled:opacity-60 cursor-pointer"
                                >
                                  Decline
                                </button>
                              </>
                            ) : req.status === "accepted" ? (
                              <Link
                                href={`/dashboard/messages?userId=${req.requesterId}`}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-xs flex items-center gap-1"
                              >
                                <span>💬 Message Student</span>
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {postRequests.length === 0 && post.isOpen && (
                    <p className="text-xs text-muted-foreground italic pt-2 border-t border-border/40">
                      ✓ Your skill post is active and discoverable on the Explore Community page.
                    </p>
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
            <div className="text-center py-12 bg-card border border-dashed border-border rounded-2xl space-y-3 p-8">
              <span className="text-4xl block">🔍</span>
              <h3 className="text-sm font-bold text-foreground">No Swap Requests Sent Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Browse hundreds of skill exchange offers from peers across Bangladesh and request your first 1-on-1 swap.
              </p>
              <Link
                href="/explore?tab=exchange"
                className="inline-block mt-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
              >
                Browse Skill Offers on Explore →
              </Link>
            </div>
          ) : (
            sentRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground">
                      Target Skill: {req.post ? req.post.offeredSkill : "Deleted Post"}
                    </span>
                    {statusBadge(req.status)}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                      req.type === "barter"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-primary/10 text-primary border-primary/20"
                    }`}>
                      {req.type === "barter" ? `Barter — Offered ${req.offeredSkill}` : `${req.tokensSpent} Tokens (৳${req.tokensSpent * 10})`}
                    </span>
                  </div>
                  {req.post && (
                    <p className="text-xs text-muted-foreground">
                      Author: <span className="font-bold text-foreground">{req.post.authorName}</span>
                    </p>
                  )}
                  {req.message && (
                    <p className="text-xs text-muted-foreground italic bg-background/50 p-2 rounded-lg border border-border/40">
                      &ldquo;{req.message}&rdquo;
                    </p>
                  )}
                  {req.status === "accepted" && (
                    <p className="text-xs font-bold text-emerald-500">
                      ✓ Swap Accepted! You can now message the author directly to coordinate.
                    </p>
                  )}
                  {req.status === "rejected" && req.type === "token" && req.tokensSpent > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {req.tokensSpent} token{req.tokensSpent !== 1 && "s"} (৳{req.tokensSpent * 10}) automatically refunded to your wallet.
                    </p>
                  )}
                </div>

                {req.status === "accepted" && req.post?.authorId && (
                  <Link
                    href={`/dashboard/messages?userId=${req.post.authorId}`}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-xs shrink-0 self-start sm:self-auto"
                  >
                    💬 Message {req.post.authorName}
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-extrabold text-base text-foreground">Post a Skill to Exchange</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Offer your knowledge and specify what you want in return.</p>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-muted-foreground hover:text-foreground text-lg leading-none p-1"
              >
                ×
              </button>
            </div>

            {postError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
                {postError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Skill I Can Teach <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Next.js, Node.js, Bangla Writing, Figma"
                value={offeredSkill}
                onChange={(e) => setOfferedSkill(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Skill I Want in Return (for free barter) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. IELTS Prep, Python, Docker, Video Editing"
                value={recommendedSkill}
                onChange={(e) => setRecommendedSkill(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />
              <p className="text-[10px] text-muted-foreground">
                Learners who can teach this skill swap for free. Others pay the token price below.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Description / Availability (optional)</label>
              <textarea
                rows={3}
                placeholder="Describe what topics you cover, your background, and preferred meeting hours..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Token Cost for Non-Match Learners
                </label>
                <span className="font-extrabold text-primary">
                  {tokenCost} tokens <span className="text-muted-foreground font-normal">(≈ ৳{tokenCost * 10} BDT)</span>
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={tokenCost}
                onChange={(e) => setTokenCost(Number(e.target.value))}
                className="w-full accent-primary h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1 Token (৳10)</span>
                <span>25 Tokens (৳250)</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="flex-1 h-10 text-xs font-bold rounded-xl border border-border text-muted-foreground hover:bg-accent transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePost}
                disabled={postLoading || !offeredSkill.trim() || !recommendedSkill.trim()}
                className="flex-1 h-10 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-primary/20"
              >
                {postLoading ? "Publishing..." : "Publish Skill Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
