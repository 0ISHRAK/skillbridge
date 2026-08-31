"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Booking {
  id: string;
  mentorId: string;
  mentorName: string;
  topic: string;
  date: string;
  time: string;
  price: number;
  status: string;
  createdAt: string;
}

export default function MySessionsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"confirmed" | "pending" | "past">("confirmed");

  useEffect(() => {
    let isMounted = true;
    fetch("/api/bookings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        setBookings(data.bookings || []);
      })
      .catch((err) => console.error("Failed to fetch bookings:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getFilteredBookings = () => {
    const today = new Date().toISOString().split("T")[0];
    if (activeTab === "pending") return bookings.filter((b) => b.status === "pending");
    if (activeTab === "confirmed") return bookings.filter((b) => b.status === "confirmed" && b.date >= today);
    return bookings.filter((b) => b.status === "completed" || b.status === "rejected" || b.status === "refunded" || (b.status === "confirmed" && b.date < today));
  };

  const filtered = getFilteredBookings();

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    refunded: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-scale-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">My Mentorship Sessions</h1>
          <p className="text-xs text-muted-foreground">Manage your scheduled 1-on-1 sessions, join live video rooms, and leave reviews.</p>
        </div>
        <Link
          href="/dashboard/book"
          className="px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl shadow-md shadow-primary/10 transition-all text-center flex items-center justify-center gap-1.5"
        >
          <span>+</span> Book New Session
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted/60 p-1.5 rounded-xl border border-border/40 select-none max-w-md">
        {(["confirmed", "pending", "past"] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-colors duration-200 capitalize cursor-pointer ${
                isActive
                  ? "bg-card shadow-xs border border-border/60 text-foreground font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "confirmed" ? "Upcoming" : tab === "past" ? "Past & Completed" : "Pending"}
            </button>
          );
        })}
      </div>

      {/* Session Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between hover:shadow-sm transition-all relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-extrabold text-primary tracking-wider">
                      🎯 1-on-1 Mentorship
                    </span>
                    <h3 className="text-sm font-black text-foreground">
                      {booking.topic}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${statusColors[booking.status] || "bg-muted text-muted-foreground"}`}>
                    {booking.status}
                  </span>
                </div>

                {/* Date & Time */}
                <div className="flex gap-4 text-xs bg-background/50 border border-border/40 p-3 rounded-xl">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Date</p>
                    <p className="font-semibold mt-0.5 text-foreground">{booking.date}</p>
                  </div>
                  <div className="border-l border-border/60" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Time</p>
                    <p className="font-semibold mt-0.5 text-foreground">{booking.time}</p>
                  </div>
                  <div className="border-l border-border/60" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Rate</p>
                    <p className="font-semibold mt-0.5 text-foreground">৳{booking.price.toLocaleString()} BDT</p>
                  </div>
                </div>

                {/* Mentor */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold border border-primary/20 text-primary">
                      {booking.mentorName ? booking.mentorName.substring(0, 1) : "M"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{booking.mentorName}</p>
                      <p className="text-[10px] text-muted-foreground">Verified Mentor</p>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/messages?recipientId=${booking.mentorId}`}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>💬</span> Message
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-border/60">
                {booking.status === "confirmed" ? (
                  <Link
                    href={`/dashboard/sessions/${booking.id}`}
                    className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-black flex items-center justify-center shadow-md shadow-primary/15 transition-all"
                  >
                    🎥 Join Live Room
                  </Link>
                ) : (
                  <>
                    <Link
                      href={`/dashboard/book?mentor=${booking.mentorId}&mentorName=${encodeURIComponent(booking.mentorName)}`}
                      className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold flex items-center justify-center transition-all"
                    >
                      🔄 Book Again
                    </Link>
                    <Link
                      href={`/dashboard/sessions/${booking.id}`}
                      className="px-3 h-9 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold flex items-center justify-center border border-border transition-all"
                    >
                      ⭐ Rate
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
          <span className="text-3xl block">📭</span>
          <p className="text-xs text-muted-foreground font-medium">
            {activeTab === "confirmed" ? "No upcoming sessions." : activeTab === "pending" ? "No pending bookings." : "No past sessions."}
          </p>
          {activeTab !== "past" && (
            <Link
              href="/dashboard/book"
              className="inline-block text-xs font-bold text-primary hover:underline"
            >
              Browse mentors and book a 1-on-1 session
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
