"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BookingRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  topic: string;
  date: string;
  time: string;
  price: number;
  status: string;
  createdAt: string;
}

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "completed" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetch("/api/mentor/bookings")
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

  const handleAction = async (id: string, action: "confirmed" | "rejected" | "completed") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/mentor/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, action }),
      });
      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: action } : b)));
      }
    } catch (err) {
      console.error("Failed to update booking:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!newTime) return;

    setActionLoading(id);
    try {
      const res = await fetch("/api/mentor/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, action: "reschedule", newTime }),
      });
      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, time: newTime } : b)));
        setReschedulingId(null);
        setNewTime("");
      }
    } catch (err) {
      console.error("Failed to reschedule:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = bookings.filter((b) => b.status === activeTab);

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
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Manage Learner Bookings</h1>
        <p className="text-xs text-muted-foreground">Accept, reject, reschedule session requests, and jump into live mentorship video rooms.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted/60 p-1.5 rounded-xl border border-border/40 select-none max-w-md">
        {(["pending", "confirmed", "completed", "rejected"] as const).map((tab) => {
          const count = bookings.filter((b) => b.status === tab).length;
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
              {tab} {count > 0 && <span className="text-[10px] opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Bookings Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between hover:shadow-sm transition-all"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-extrabold text-primary tracking-wider">
                        Student: {req.studentName}
                      </span>
                      {req.studentEmail && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                          ({req.studentEmail})
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      Topic: {req.topic}
                    </h3>
                  </div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    ৳{req.price.toLocaleString()} BDT
                  </span>
                </div>

                {/* Date & Time */}
                <div className="flex gap-4 text-xs bg-background/50 border border-border/40 p-3 rounded-xl">
                  <div>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Date</p>
                    <p className="font-semibold mt-0.5 text-foreground">{req.date}</p>
                  </div>
                  <div className="border-l border-border/60" />
                  <div>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Time</p>
                    <p className="font-semibold mt-0.5 text-foreground">{req.time}</p>
                  </div>
                  <div className="border-l border-border/60" />
                  <div className="flex items-center justify-end flex-1">
                    <Link
                      href={`/dashboard/messages?recipientId=${req.studentId}`}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>💬</span> Chat Student
                    </Link>
                  </div>
                </div>

                {/* Reschedule form */}
                {reschedulingId === req.id && (
                  <form onSubmit={(e) => handleRescheduleSubmit(e, req.id)} className="space-y-2 border-t border-border/60 pt-4">
                    <label className="text-[9px] uppercase font-bold text-muted-foreground block">Select New Time Slot</label>
                    <div className="flex gap-2">
                      <select
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        required
                        className="flex-1 text-xs p-2 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Choose timeslot...</option>
                        <option value="09:00 AM BDT">09:00 AM BDT</option>
                        <option value="10:00 AM BDT">10:00 AM BDT</option>
                        <option value="01:00 PM BDT">01:00 PM BDT</option>
                        <option value="02:30 PM BDT">02:30 PM BDT</option>
                        <option value="04:00 PM BDT">04:00 PM BDT</option>
                        <option value="06:00 PM BDT">06:00 PM BDT</option>
                        <option value="08:30 PM BDT">08:30 PM BDT</option>
                        <option value="10:00 PM BDT">10:00 PM BDT</option>
                      </select>
                      <button
                        type="submit"
                        disabled={actionLoading === req.id}
                        className="px-3 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setReschedulingId(null)}
                        className="px-3 border border-border text-xs font-bold rounded-xl hover:bg-accent transition-all text-muted-foreground cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Action buttons */}
              {req.status === "pending" && reschedulingId !== req.id && (
                <div className="flex gap-3 mt-5 pt-4 border-t border-border/60">
                  <button
                    onClick={() => handleAction(req.id, "rejected")}
                    disabled={actionLoading === req.id}
                    className="flex-1 h-9 rounded-xl border border-border text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setReschedulingId(req.id)}
                    className="flex-1 h-9 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleAction(req.id, "confirmed")}
                    disabled={actionLoading === req.id}
                    className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-black flex items-center justify-center shadow-md shadow-primary/10 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading === req.id ? "..." : "Accept"}
                  </button>
                </div>
              )}

              {req.status === "confirmed" && (
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border/60">
                  <Link
                    href={`/dashboard/sessions/${req.id}`}
                    className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-black flex items-center justify-center shadow-md shadow-primary/15 transition-all"
                  >
                    🎥 Join Call Room
                  </Link>
                  <button
                    onClick={() => handleAction(req.id, "completed")}
                    disabled={actionLoading === req.id}
                    className="px-3 h-9 rounded-xl bg-muted hover:bg-emerald-500/10 hover:text-emerald-400 text-xs font-bold border border-border transition-all cursor-pointer"
                  >
                    ✓ Mark Done
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
          <span className="text-3xl block">📥</span>
          <p className="text-xs text-muted-foreground font-medium">No {activeTab} bookings found.</p>
        </div>
      )}
    </div>
  );
}
