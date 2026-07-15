"use client";

import { useState, useEffect } from "react";

interface ReceivedReview {
  id: string;
  studentName: string;
  studentAvatar: string;
  sessionTopic: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ReviewsReceivedPage() {
  const [reviews, setReviews] = useState<ReceivedReview[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("mentorReceivedReviews");
    if (saved) {
      setTimeout(() => setReviews(JSON.parse(saved)), 0);
    } else {
      const defaultReviews: ReceivedReview[] = [
        {
          id: "rev-1",
          studentName: "Fahim Hossain",
          studentAvatar: "🎓",
          sessionTopic: "Next.js Server Actions & API Review",
          rating: 5,
          comment: "Tanzim is an amazing mentor! He explained React 19 compiler issues and Next.js static bailout details extremely clearly. Highly recommended!",
          date: "2026-07-14",
        },
        {
          id: "rev-2",
          studentName: "Adnan Chowdhury",
          studentAvatar: "🎓",
          sessionTopic: "MERN Stack Course Syllabus check",
          rating: 4,
          comment: "Great curriculum review. Got clear guidance on how to secure client sessions using auth routes.",
          date: "2026-07-08",
        }
      ];
      localStorage.setItem("mentorReceivedReviews", JSON.stringify(defaultReviews));
      setTimeout(() => setReviews(defaultReviews), 0);
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-scale-up">
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Reviews Received</h1>
        <p className="text-xs text-muted-foreground">Read ratings and text reviews sent by students after completing 1-on-1 tutor sessions.</p>
      </div>

      {/* Reviews feed */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rev.studentAvatar}</span>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">{rev.studentName}</h3>
                    <p className="text-[10px] text-muted-foreground">{rev.sessionTopic}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">{rev.date}</span>
              </div>

              {/* Stars rendering */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`text-sm ${idx < rev.rating ? "text-amber-500" : "text-muted-foreground/35"}`}
                  >
                    ★
                  </span>
                ))}
                <span className="text-[10px] font-bold text-muted-foreground ml-1.5">{rev.rating}.0 Rating</span>
              </div>

              {/* Comment text */}
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
        </div>
      )}
    </div>
  );
}
