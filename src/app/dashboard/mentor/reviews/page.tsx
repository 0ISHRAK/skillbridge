"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface ReceivedReview {
  id: string;
  studentName: string;
  studentAvatar?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

interface MentorProfile {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  headline?: string;
}

export default function ReviewsReceivedPage() {
  const [reviews, setReviews] = useState<ReceivedReview[]>([]);
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [ratingFilter, setRatingFilter] = useState<"all" | "5" | "4" | "3_below">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchReviews() {
      try {
        const res = await fetch("/api/mentor/reviews");
        if (res.ok && isMounted) {
          const data = await res.json();
          setReviews(data.reviews || []);
          setMentor(data.mentor || null);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void fetchReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalReviews = reviews.length;
  const hasReviews = totalReviews > 0;
  const avgRating = hasReviews
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : null;

  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "5" && r.rating === 5) ||
        (ratingFilter === "4" && r.rating === 4) ||
        (ratingFilter === "3_below" && r.rating <= 3);

      return matchesSearch && matchesRating;
    });
  }, [reviews, ratingFilter, searchQuery]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-muted rounded-2xl md:col-span-1" />
          <div className="h-32 bg-muted rounded-2xl md:col-span-2" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-scale-up">
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Reviews Received</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Read ratings, feedback, and student testimonials sent after completing 1-on-1 sessions.
            </p>
          </div>
          {mentor && (
            <Link
              href={`/explore?tab=mentors&q=${encodeURIComponent(mentor.name)}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:border-primary/50 hover:text-primary transition-all shadow-xs shrink-0 self-start sm:self-auto"
            >
              <span>View Public Profile</span>
              <span className="text-[10px]">↗</span>
            </Link>
          )}
        </div>
      </div>

      {/* Stats & Rating Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Overall Score */}
        <div className="md:col-span-4 p-6 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Overall Rating</p>
            {hasReviews && avgRating ? (
              <>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-black text-foreground">{avgRating}</span>
                  <span className="text-sm font-bold text-muted-foreground">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-amber-500 text-lg">
                  {"★".repeat(Math.round(Number(avgRating)))}
                  {"☆".repeat(5 - Math.round(Number(avgRating)))}
                </div>
              </>
            ) : (
              <div className="mt-2 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-muted-foreground">—</span>
                  <span className="text-xs text-muted-foreground font-medium">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground/30 text-base">
                  ☆☆☆☆☆
                </div>
                <p className="text-[11px] text-muted-foreground italic pt-0.5">No reviews recorded yet</p>
              </div>
            )}
          </div>

          <div className="border-t border-border/60 pt-3 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Total Reviews:</span>
              <span className="font-bold text-foreground">{totalReviews}</span>
            </div>
            <div className="flex justify-between">
              <span>Student Satisfaction:</span>
              <span className="font-bold text-emerald-500">
                {hasReviews
                  ? `${Math.round((reviews.filter((r) => r.rating >= 4).length / totalReviews) * 100)}%`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Star Distribution Bars */}
        <div className="md:col-span-8 p-6 rounded-2xl bg-card border border-border space-y-2.5 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Rating Distribution</p>
          <div className="space-y-2 pt-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starCounts[star as 1 | 2 | 3 | 4 | 5] || 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-bold flex items-center gap-1 shrink-0 text-muted-foreground">
                    <span>{star}</span>
                    <span className="text-amber-500 text-[10px]">★</span>
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-[11px] font-semibold text-muted-foreground shrink-0">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews Filter & Feed */}
      {totalReviews > 0 ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: `All (${totalReviews})` },
                { id: "5", label: `5 Stars (${starCounts[5] || 0})` },
                { id: "4", label: `4 Stars (${starCounts[4] || 0})` },
                { id: "3_below", label: `3★ & below (${(starCounts[3] || 0) + (starCounts[2] || 0) + (starCounts[1] || 0)})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setRatingFilter(f.id as "all" | "5" | "4" | "3_below")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    ratingFilter === f.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Review Cards */}
          {filteredReviews.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-card/50 text-xs text-muted-foreground">
              No reviews match the selected filter or search term.
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold border border-primary/20 text-primary shrink-0">
                        {rev.studentName.substring(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-foreground">{rev.studentName}</h3>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            ✓ Verified Student
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(rev.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-amber-500 text-xs font-bold">
                      <span>{"★".repeat(rev.rating)}</span>
                      <span className="text-[10px] ml-1">{rev.rating}.0</span>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-foreground leading-relaxed italic bg-background/50 border border-border/50 p-3.5 rounded-xl">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Empty State with Pro-Tips */
        <div className="space-y-6">
          <div className="p-10 text-center border border-dashed border-border rounded-2xl bg-card/40 space-y-3">
            <span className="text-4xl block animate-bounce">⭐</span>
            <h3 className="text-sm font-bold text-foreground">No Student Reviews Received Yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              When learners book and complete 1-on-1 mentorship sessions or course enrollments with you, their ratings and feedback will appear here.
            </p>
          </div>

          {/* Actionable Pro-Tips Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              🚀 How to Earn Your First 5-Star Reviews
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-accent/20 border border-border/60 space-y-1.5">
                <p className="text-xs font-bold text-foreground">📅 Set Availability Slots</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Open flexible time slots in <Link href="/dashboard/mentor/availability" className="text-primary underline">Schedule & Slots</Link> so students can book you easily.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-accent/20 border border-border/60 space-y-1.5">
                <p className="text-xs font-bold text-foreground">📝 Share Actionable Notes</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Provide follow-up roadmap items or code repos after each session to deliver maximum value.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-accent/20 border border-border/60 space-y-1.5">
                <p className="text-xs font-bold text-foreground">🔗 Share Profile Link</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Share your public mentor profile on LinkedIn, Facebook dev groups, and your university networks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
