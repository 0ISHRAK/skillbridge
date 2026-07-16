"use client";

import { useState, useEffect } from "react";

interface BookingRequest {
  id: string;
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
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/mentor/bookings");
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

  const handleAction = async (id: string, action: "confirmed" | "rejected") => {
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
        <p className="text-xs text-muted-foreground">Accept, reject, or reschedule session requests sent by your students.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted/60 p-1.5 rounded-xl border border-border/40 select-none max-w-sm">
        {(["pending", "confirmed", "rejected"] as const).map((tab) => {
          const count = bookings.filter((b) => b.status === tab).length;
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
              {tab} {count > 0 && <span className="text-[9px] opacity-70">({count})</span>}
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
              className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between hover:shadow-sm transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-extrabold text-primary tracking-wider">
                      Student: {req.studentName}
                    </span>
                    <h3 className="text-xs font-bold text-foreground">
                      Topic: {req.topic}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-primary">৳{req.price.toLocaleString()}</span>
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
                        className="flex-1 text-xs p-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Choose timeslot...</option>
                        <option value="10:00 AM BDT">10:00 AM BDT</option>
                        <option value="01:00 PM BDT">01:00 PM BDT</option>
                        <option value="02:30 PM BDT">02:30 PM BDT</option>
                        <option value="06:00 PM BDT">06:00 PM BDT</option>
                        <option value="08:30 PM BDT">08:30 PM BDT</option>
                      </select>
                      <button
                        type="submit"
                        disabled={actionLoading === req.id}
                        className="px-3 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setReschedulingId(null)}
                        className="px-3 border border-border text-xs font-bold rounded-lg hover:bg-accent transition-all text-muted-foreground"
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
                    className="flex-1 h-9 rounded-lg border border-border text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setReschedulingId(req.id)}
                    className="flex-1 h-9 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleAction(req.id, "confirmed")}
                    disabled={actionLoading === req.id}
                    className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold flex items-center justify-center shadow-md shadow-primary/10 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading === req.id ? "..." : "Accept"}
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
