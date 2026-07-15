"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ScheduledSession {
  id: string;
  mentorName: string;
  mentorRole: string;
  mentorCompany: string;
  mentorAvatar: string;
  date: string;
  time: string;
  status: "upcoming" | "past" | "cancelled";
}

export default function MySessionsPage() {
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");

  // Load from localStorage or initialize with mock defaults
  useEffect(() => {
    const saved = localStorage.getItem("scheduledSessions");
    if (saved) {
      setTimeout(() => setSessions(JSON.parse(saved)), 0);
    } else {
      const defaultSessions: ScheduledSession[] = [
        {
          id: "nextjs-live-call",
          mentorName: "Tanzim Hasan",
          mentorRole: "Senior Developer",
          mentorCompany: "TigerIT",
          mentorAvatar: "👨‍💻",
          date: "2026-07-14",
          time: "08:30 PM BDT",
          status: "upcoming",
        },
        {
          id: "past-session-1",
          mentorName: "Sabrina Rahman",
          mentorRole: "Product Designer",
          mentorCompany: "Pathao",
          mentorAvatar: "👩‍🎨",
          date: "2026-07-10",
          time: "04:00 PM BDT",
          status: "past",
        },
      ];
      localStorage.setItem("scheduledSessions", JSON.stringify(defaultSessions));
      setTimeout(() => setSessions(defaultSessions), 0);
    }
  }, []);

  const handleCancelSession = (id: string) => {
    if (!confirm("Are you sure you want to cancel this session? Your 1 token will be refunded to your wallet.")) {
      return;
    }

    const updated = sessions.map((s) => {
      if (s.id === id) {
        return { ...s, status: "cancelled" as const };
      }
      return s;
    });

    setSessions(updated);
    localStorage.setItem("scheduledSessions", JSON.stringify(updated));

    // Refund token
    const storedBalance = localStorage.getItem("tokenBalance");
    const balance = storedBalance ? Number(storedBalance) : 30;
    const nextBalance = balance + 1;
    localStorage.setItem("tokenBalance", String(nextBalance));
    alert("Session cancelled successfully. 1 Token refunded to your wallet!");
  };

  const filteredSessions = sessions.filter((s) => s.status === activeTab);

  return (
    <div className="space-y-6 animate-scale-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">My Mentorship Sessions</h1>
          <p className="text-xs text-muted-foreground">Manage your scheduled video calls, join active rooms, or schedule new sessions.</p>
        </div>
        <Link
          href="/dashboard/book"
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-lg shadow-md shadow-primary/10 transition-all text-center"
        >
          + Book New Session
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted/60 p-1.5 rounded-xl border border-border/40 select-none max-w-sm">
        {(["upcoming", "past", "cancelled"] as const).map((tab) => {
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
              {tab}
            </button>
          );
        })}
      </div>

      {/* Session Cards List */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between hover:shadow-sm transition-shadow"
            >
              <div className="space-y-4">
                {/* Header Info */}
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-extrabold text-primary tracking-wider">
                      1-on-1 Mentorship
                    </span>
                    <h3 className="text-sm font-bold text-foreground">
                      Session with {session.mentorName}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                      session.status === "upcoming"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : session.status === "past"
                        ? "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>

                {/* Date / Time */}
                <div className="flex gap-4 text-xs bg-background/50 border border-border/40 p-3 rounded-xl">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Date</p>
                    <p className="font-semibold mt-0.5 text-foreground">{session.date}</p>
                  </div>
                  <div className="border-l border-border/60" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Time</p>
                    <p className="font-semibold mt-0.5 text-foreground">{session.time}</p>
                  </div>
                </div>

                {/* Mentor Bio info */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{session.mentorAvatar}</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{session.mentorName}</p>
                    <p className="text-[10px] text-muted-foreground">{session.mentorRole} @ {session.mentorCompany}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {session.status === "upcoming" && (
                <div className="flex gap-3 mt-5 pt-4 border-t border-border/60">
                  <button
                    onClick={() => handleCancelSession(session.id)}
                    className="flex-1 h-9 rounded-lg border border-border text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Link
                    href={`/dashboard/sessions/${session.id}`}
                    className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold flex items-center justify-center shadow-md shadow-primary/10 cursor-pointer"
                  >
                    Join Call
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
          <span className="text-3xl block">📭</span>
          <p className="text-xs text-muted-foreground font-medium">No {activeTab} sessions found.</p>
          {activeTab === "upcoming" && (
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
