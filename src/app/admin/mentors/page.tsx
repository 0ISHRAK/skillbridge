"use client";

import { useState, useEffect } from "react";

interface Mentor {
  id: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  tokenBalance: number;
  isMentorApproved: boolean;
  createdAt: string;
}

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setMentors((data.users || []).filter((u: Mentor) => u.role === "mentor"));
      }
    } catch (err) {
      console.error("Failed to fetch mentors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (mentorId: string, approve: boolean) => {
    setActionLoading(mentorId);
    try {
      const res = await fetch("/api/admin/verify-mentor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, approved: approve }),
      });
      if (res.ok) {
        setMentors((prev) =>
          prev.map((m) => (m.id === mentorId ? { ...m, isMentorApproved: approve } : m))
        );
      }
    } catch (err) {
      console.error("Failed to verify mentor:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = mentors.filter((m) => {
    if (filter === "pending") return !m.isMentorApproved;
    if (filter === "approved") return m.isMentorApproved;
    return true;
  });

  const pendingCount = mentors.filter((m) => !m.isMentorApproved).length;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Mentor Verification</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {mentors.length} mentors total &bull; {pendingCount} pending approval
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold">
            {pendingCount} Awaiting Review
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === f
                ? "bg-red-500 text-white"
                : "border border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            {f === "all" ? "All Mentors" : f === "pending" ? "Pending" : "Approved"}
          </button>
        ))}
      </div>

      {/* Mentor Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-xs">
          No mentors in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((mentor) => (
            <div
              key={mentor.id}
              className={`p-5 rounded-2xl border bg-card transition-all ${
                mentor.isMentorApproved ? "border-emerald-500/20" : "border-amber-500/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-amber-500/10 flex items-center justify-center text-lg font-bold border border-amber-500/20">
                    {mentor.name.substring(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{mentor.name}</p>
                    <p className="text-[10px] text-muted-foreground">{mentor.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                  mentor.isMentorApproved
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}>
                  {mentor.isMentorApproved ? "Approved" : "Pending"}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-[10px] text-muted-foreground">
                <div className="flex justify-between">
                  <span>Email Verified:</span>
                  <span className={mentor.isEmailVerified ? "text-emerald-500 font-bold" : "text-red-400 font-bold"}>
                    {mentor.isEmailVerified ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Token Balance:</span>
                  <span className="font-bold text-foreground">{mentor.tokenBalance}</span>
                </div>
                <div className="flex justify-between">
                  <span>Joined:</span>
                  <span>{new Date(mentor.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {!mentor.isMentorApproved ? (
                  <button
                    onClick={() => handleVerify(mentor.id, true)}
                    disabled={actionLoading === mentor.id}
                    className="flex-1 h-9 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === mentor.id ? "Processing..." : "Approve"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleVerify(mentor.id, false)}
                    disabled={actionLoading === mentor.id}
                    className="flex-1 h-9 rounded-lg border border-red-500/30 text-red-500 text-[10px] font-bold hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === mentor.id ? "Processing..." : "Revoke Approval"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
