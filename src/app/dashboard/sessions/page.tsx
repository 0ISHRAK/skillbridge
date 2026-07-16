"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Booking {
  id: string;
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
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "past">("confirmed");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    const today = new Date().toISOString().split("T")[0];
    if (activeTab === "pending") return bookings.filter((b) => b.status === "pending");
    if (activeTab === "confirmed") return bookings.filter((b) => b.status === "confirmed" && b.date >= today);
    return bookings.filter((b) => b.status === "rejected" || b.status === "refunded" || (b.status === "confirmed" && b.date < today));
  };

  const filtered = getFilteredBookings();

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
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
          <p className="text-xs text-muted-foreground">Manage your scheduled sessions and track booking status.</p>
        </div>
        <Link
          href="/dashboard/book"
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-lg shadow-md shadow-primary/10 transition-all text-center"
        >
          + Book New Session
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
              className={`flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-colors duration-200 capitalize ${
                isActive
                  ? "bg-card shadow-sm border border-border/30 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "confirmed" ? "Upcoming" : tab === "past" ? "Past" : "Pending"}
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
              className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between hover:shadow-sm transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-extrabold text-primary tracking-wider">
                      1-on-1 Mentorship
                    </span>
                    <h3 className="text-sm font-bold text-foreground">
                      {booking.topic}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${statusColors[booking.status] || ""}`}>
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
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Price</p>
                    <p className="font-semibold mt-0.5 text-foreground">৳{booking.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Mentor */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold border border-primary/20">
                    {booking.mentorName.substring(0, 1)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{booking.mentorName}</p>
                    <p className="text-[10px] text-muted-foreground">Mentor</p>
                  </div>
                </div>
              </div>

              {/* Action */}
              {booking.status === "confirmed" && (
                <div className="flex gap-3 mt-5 pt-4 border-t border-border/60">
                  <Link
                    href={`/dashboard/sessions/${booking.id}`}
                    className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold flex items-center justify-center shadow-md shadow-primary/10 cursor-pointer"
                  >
                    Join Session
                  </Link>
                </div>
              )}
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
              Book a session now to get started
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
