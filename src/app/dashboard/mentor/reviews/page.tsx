"use client";

import { useState, useEffect } from "react";

interface ReceivedReview {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewsReceivedPage() {
  const [reviews, setReviews] = useState<ReceivedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/mentor/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-scale-up">
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Reviews Received</h1>
        <p className="text-xs text-muted-foreground">Read ratings and text reviews sent by students after completing 1-on-1 tutor sessions.</p>
      </div>

      {/* Stats */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-6 p-4 rounded-xl bg-card border border-border">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-amber-500">{avgRating}</p>
            <p className="text-[9px] text-muted-foreground font-bold uppercase mt-0.5">Avg Rating</p>
          </div>
          <div className="border-l border-border h-12" />
          <div className="text-center">
            <p className="text-3xl font-extrabold">{reviews.length}</p>
            <p className="text-[9px] text-muted-foreground font-bold uppercase mt-0.5">Total Reviews</p>
          </div>
          <div className="border-l border-border h-12" />
          <div className="text-center">
            <p className="text-3xl font-extrabold text-emerald-500">
              {reviews.filter((r) => r.rating >= 4).length}
            </p>
            <p className="text-[9px] text-muted-foreground font-bold uppercase mt-0.5">4+ Stars</p>
          </div>
        </div>
      )}

      {/* Reviews feed */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold border border-primary/20">
                    {rev.studentName.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">{rev.studentName}</h3>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`text-sm ${idx < rev.rating ? "text-amber-500" : "text-muted-foreground/35"}`}
                  >
                    ★
                  </span>
                ))}
                <span className="text-[10px] font-bold text-muted-foreground ml-1.5">{rev.rating}.0</span>
              </div>

              {/* Comment */}
              <p className="text-xs text-foreground leading-relaxed italic bg-background/40 border border-border/40 p-3 rounded-xl">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
          <span className="text-3xl block">★</span>
          <p className="text-xs text-muted-foreground font-medium">You haven&apos;t received any reviews yet.</p>
          <p className="text-[10px] text-muted-foreground">Reviews will appear here after students complete sessions with you.</p>
        </div>
      )}
    </div>
  );
}
