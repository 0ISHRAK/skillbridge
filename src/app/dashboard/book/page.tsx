"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Mentor {
  id: string;
  name: string;
  bio: string;
  hourlyRate: number;
  skills: string[];
  availabilityDays: string[];
  availabilitySlots: string[];
}

export default function BookSessionDashboardPage() {
  const router = useRouter();

  const [tokenBalance, setTokenBalance] = useState(0);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [meRes, profileRes] = await Promise.all([
        fetch("/api/mentors"),
        fetch("/api/auth/me"),
      ]);

      if (meRes.ok) {
        const data = await meRes.json();
        setMentors(data.mentors || []);
      }

      if (profileRes.ok) {
        const data = await profileRes.json();
        setTokenBalance(data.user?.tokenBalance || 0);
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  const getNextDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      if (selectedMentor?.availabilityDays?.includes(dayName)) {
        dates.push({
          label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          value: d.toISOString().split("T")[0],
        });
      }
    }
    return dates;
  };

  const handleBook = async () => {
    setError("");
    if (!selectedMentor || !selectedDate || !selectedSlot) {
      setError("Please select a date and a time slot.");
      return;
    }

    if (!topic.trim()) {
      setError("Please describe the topic for the session.");
      return;
    }

    const tokenCost = Math.max(1, Math.ceil(selectedMentor.hourlyRate / 1000));
    if (tokenBalance < tokenCost) {
      setError("Insufficient tokens in wallet. Please recharge to complete booking.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: selectedMentor.id,
          topic: topic.trim(),
          date: selectedDate,
          time: selectedSlot,
          price: selectedMentor.hourlyRate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTokenBalance(data.newBalance);
        setSuccess(true);
        setTimeout(() => router.push("/dashboard/sessions"), 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create booking");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="lg:col-span-5">
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const tokenCost = selectedMentor ? Math.max(1, Math.ceil(selectedMentor.hourlyRate / 1000)) : 0;
  const availableDates = getNextDates();

  return (
    <div className="space-y-6 animate-scale-up">
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Book a Mentor Session</h1>
        <p className="text-xs text-muted-foreground">Select a mentor, check calendar slots, and confirm booking using your tokens.</p>
      </div>

      {success ? (
        <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-center space-y-4 max-w-md mx-auto">
          <span className="text-4xl block">🎉</span>
          <h2 className="text-lg font-bold">Booking Submitted!</h2>
          <p className="text-xs leading-normal">
            Your session request has been sent to <span className="font-semibold">{selectedMentor?.name}</span>.
            Deducted <span className="font-semibold">{tokenCost} Token{tokenCost !== 1 ? "s" : ""}</span> from your wallet. Redirecting...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Mentors List */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-sm font-black tracking-wider text-muted-foreground uppercase">1. Choose a Mentor</h2>

            {mentors.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground">
                No approved mentors available yet. Check back later!
              </div>
            ) : (
              <div className="space-y-3">
                {mentors.map((mentor) => {
                  const isSelected = selectedMentor?.id === mentor.id;
                  const cost = Math.max(1, Math.ceil(mentor.hourlyRate / 1000));
                  return (
                    <button
                      key={mentor.id}
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setSelectedSlot("");
                        setSelectedDate("");
                        setError("");
                      }}
                      className={`w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold border border-primary/20 shrink-0">
                        {mentor.name.substring(0, 1)}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="text-xs font-bold text-foreground">{mentor.name}</h3>
                          <span className="text-[10px] font-bold text-primary">{cost} Token{cost > 1 ? "s" : ""} / session</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {mentor.bio || "Experienced mentor ready to help"}
                        </p>
                        {mentor.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {mentor.skills.slice(0, 4).map((skill) => (
                              <span key={skill} className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-muted text-muted-foreground">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Date, Slot & Billing */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-black tracking-wider text-muted-foreground uppercase">2. Select Slot & Confirm</h2>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              {selectedMentor ? (
                <div className="space-y-5">
                  {/* Selected Mentor */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold border border-primary/20">
                      {selectedMentor.name.substring(0, 1)}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{selectedMentor.name}</p>
                      <p className="text-[10px] text-muted-foreground">৳{selectedMentor.hourlyRate.toLocaleString()} / session</p>
                    </div>
                  </div>

                  {/* Topic */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Session Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. Code review, career guidance, debugging help..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Pick Date */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Available Dates</label>
                    {availableDates.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableDates.map((date) => (
                          <button
                            type="button"
                            key={date.value}
                            onClick={() => setSelectedDate(date.value)}
                            className={`py-2 rounded-lg border text-center text-xs font-semibold transition-all ${
                              selectedDate === date.value
                                ? "bg-primary border-primary text-primary-foreground font-bold"
                                : "bg-background border-border text-muted-foreground hover:border-primary"
                            }`}
                          >
                            {date.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground p-3 rounded-lg border border-border text-center">
                        No available dates this week. Check the mentor&apos;s availability.
                      </p>
                    )}
                  </div>

                  {/* Pick Time */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Available Times</label>
                    {selectedMentor.availabilitySlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedMentor.availabilitySlots.map((slot) => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 rounded-lg border text-center text-[10px] font-semibold transition-all ${
                              selectedSlot === slot
                                ? "bg-primary border-primary text-primary-foreground font-bold"
                                : "bg-background border-border text-muted-foreground hover:border-primary"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground p-3 rounded-lg border border-border text-center">
                        Mentor hasn&apos;t set time slots yet.
                      </p>
                    )}
                  </div>

                  {/* Billing */}
                  <div className="border-t border-border/80 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Wallet Balance:</span>
                      <span className="font-semibold text-foreground">{tokenBalance} Token{tokenBalance !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Session Cost:</span>
                      <span className="font-bold text-primary">-{tokenCost} Token{tokenCost !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="border-t border-border/40 my-1" />
                    <div className="flex justify-between font-bold">
                      <span className="text-foreground">Remaining:</span>
                      <span className={`${tokenBalance < tokenCost ? "text-red-500" : "text-emerald-500"}`}>
                        {tokenBalance - tokenCost} Token{tokenBalance - tokenCost !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-semibold text-center leading-normal">
                      {error}
                      {tokenBalance < tokenCost && (
                        <Link href="/pricing" className="text-primary font-bold hover:underline block mt-1">
                          Buy More Tokens →
                        </Link>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleBook}
                    disabled={submitting}
                    className="w-full h-11 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Booking..." : "Confirm & Deduct Tokens"}
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Please select a mentor on the left to configure dates and times.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
