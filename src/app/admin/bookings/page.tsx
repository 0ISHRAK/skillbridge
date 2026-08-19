"use client";

import { useState, useEffect } from "react";

interface Booking {
  id: string;
  studentId: string;
  mentorId: string;
  mentorName: string;
  topic: string;
  date: string;
  time: string;
  price: number;
  status: string;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/bookings");
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

  const handleRefund = async (bookingId: string) => {
    if (!confirm("Are you sure you want to refund this booking? Tokens will be returned to the student.")) return;

    setActionLoading(bookingId);
    try {
      const res = await fetch("/api/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "refunded" } : b))
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to process refund");
      }
    } catch (err) {
      console.error("Failed to refund:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = bookings.filter((b) => statusFilter === "all" || b.status === statusFilter);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500",
    confirmed: "bg-emerald-500/10 text-emerald-500",
    rejected: "bg-red-500/10 text-red-500",
    disputed: "bg-violet-500/10 text-violet-500",
    refunded: "bg-zinc-500/10 text-zinc-400",
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Booking Management</h1>
        <p className="text-xs text-muted-foreground mt-1">{bookings.length} total bookings</p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "confirmed", "rejected", "disputed", "refunded"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all capitalize ${
              statusFilter === status
                ? "bg-red-500 text-white"
                : "border border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            {status === "all" ? "All" : status}
            {status !== "all" && (
              <span className="ml-1 opacity-70">
                ({bookings.filter((b) => b.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-3 font-semibold">Topic</th>
                <th className="text-left px-4 py-3 font-semibold">Mentor</th>
                <th className="text-left px-4 py-3 font-semibold">Date & Time</th>
                <th className="text-left px-4 py-3 font-semibold">Price</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr key={booking.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold">{booking.topic}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">ID: {booking.id.slice(0, 8)}...</p>
                  </td>
                  <td className="px-4 py-3 font-medium">{booking.mentorName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {booking.date} at {booking.time}
                  </td>
                  <td className="px-4 py-3 font-bold text-primary">৳{booking.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusColors[booking.status] || ""}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {booking.status !== "refunded" && (
                      <button
                        onClick={() => handleRefund(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="px-2.5 py-1 rounded-md border border-red-500/30 text-red-500 text-[9px] font-bold hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === booking.id ? "..." : "Refund"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
