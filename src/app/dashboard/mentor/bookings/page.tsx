"use client";

import { useState, useEffect } from "react";

interface BookingRequest {
  id: string;
  studentName: string;
  studentLevel: string;
  topic: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "rejected";
}

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "rejected">("pending");

  // State for rescheduling
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("mentorBookingsList");
    if (saved) {
      setTimeout(() => setBookings(JSON.parse(saved)), 0);
    } else {
      const defaultBookings: BookingRequest[] = [
        {
          id: "req-1",
          studentName: "Fahim Hossain",
          studentLevel: "Intermediate",
          topic: "Code review & Next.js debugging",
          date: "2026-07-14",
          time: "08:30 PM BDT",
          status: "pending",
        },
        {
          id: "req-2",
          studentName: "Adnan Chowdhury",
          studentLevel: "Beginner",
          topic: "CSS Grid & Flexbox alignment issues",
          date: "2026-07-16",
          time: "02:30 PM BDT",
          status: "pending",
        }
      ];
      localStorage.setItem("mentorBookingsList", JSON.stringify(defaultBookings));
      setTimeout(() => setBookings(defaultBookings), 0);
    }
  }, []);

  const handleAction = (id: string, action: "confirmed" | "rejected") => {
    const updated = bookings.map((b) => {
      if (b.id === id) {
        return { ...b, status: action };
      }
      return b;
    });
    setBookings(updated);
    localStorage.setItem("mentorBookingsList", JSON.stringify(updated));

    // If accepted, add to scheduledSessions list in localStorage so student sees it
    if (action === "confirmed") {
      const acceptedReq = bookings.find((b) => b.id === id);
      if (acceptedReq) {
        const savedSessions = localStorage.getItem("scheduledSessions");
        const sessionsList = savedSessions ? JSON.parse(savedSessions) : [];
        
        // Avoid duplicate additions
        if (!sessionsList.some((s: { id: string }) => s.id === id)) {
          sessionsList.push({
            id: acceptedReq.id,
            mentorName: "Tanzim Hasan", // assume logged in mentor name
            mentorRole: "Senior Developer",
            mentorCompany: "TigerIT",
            mentorAvatar: "👨‍💻",
            date: acceptedReq.date,
            time: acceptedReq.time,
            status: "upcoming"
          });
          localStorage.setItem("scheduledSessions", JSON.stringify(sessionsList));
        }
      }
    }
    alert(`Booking query successfully ${action}!`);
  };

  const handleRescheduleSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!newTime) return;

    const updated = bookings.map((b) => {
      if (b.id === id) {
        return { ...b, time: newTime };
      }
      return b;
    });

    setBookings(updated);
    localStorage.setItem("mentorBookingsList", JSON.stringify(updated));
    setReschedulingId(null);
    setNewTime("");
    alert("Tutoring session slot rescheduled successfully!");
  };

  const filtered = bookings.filter((b) => b.status === activeTab);

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

      {/* Requests Grid */}
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
                      Student: {req.studentName} ({req.studentLevel})
                    </span>
                    <h3 className="text-xs font-bold text-foreground">
                      Topic: {req.topic}
                    </h3>
                  </div>
                </div>

                {/* Date & Time slots */}
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

                {/* Reschedule selector sub-form */}
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
                        <option value="02:30 PM BDT">02:30 PM BDT</option>
                        <option value="06:00 PM BDT">06:00 PM BDT</option>
                        <option value="08:30 PM BDT">08:30 PM BDT</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all"
                      >
                        Save
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
                    className="flex-1 h-9 rounded-lg border border-border text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
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
                    className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold flex items-center justify-center shadow-md shadow-primary/10 cursor-pointer"
                  >
                    Accept
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
