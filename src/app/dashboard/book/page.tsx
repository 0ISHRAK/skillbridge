"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  uni: string;
  rating: number;
  tokensCost: number;
  avatar: string;
}

export default function BookSessionDashboardPage() {
  const router = useRouter();
  
  // Wallet state
  const [tokenBalance, setTokenBalance] = useState(30);

  // Mentors list
  const mentors: Mentor[] = [
    { id: "tanzim", name: "Tanzim Hasan", role: "Senior Developer", company: "TigerIT", uni: "BUET Alumni", rating: 4.9, tokensCost: 1, avatar: "👨‍💻" },
    { id: "sabrina", name: "Sabrina Rahman", role: "Product Designer", company: "Pathao", uni: "Dhaka University", rating: 4.8, tokensCost: 1, avatar: "👩‍🎨" },
    { id: "fahim", name: "Fahim Rahman", role: "Tech Lead", company: "bKash", uni: "IBA Alumni", rating: 5.0, tokensCost: 2, avatar: "👨‍💼" }
  ];

  // Booking process states
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedBalance = localStorage.getItem("tokenBalance");
    if (storedBalance) {
      setTimeout(() => setTokenBalance(Number(storedBalance)), 0);
    }
  }, []);

  const dates = [
    { label: "Today", value: "2026-07-14" },
    { label: "Tomorrow", value: "2026-07-15" },
    { label: "Thu, Jul 16", value: "2026-07-16" },
    { label: "Fri, Jul 17", value: "2026-07-17" }
  ];

  const timeSlots = ["10:00 AM BDT", "02:30 PM BDT", "06:00 PM BDT", "08:30 PM BDT"];

  const handleBook = () => {
    setError("");
    if (!selectedMentor || !selectedDate || !selectedSlot) {
      setError("Please select a date and a time slot.");
      return;
    }

    if (tokenBalance < selectedMentor.tokensCost) {
      setError("Insufficient tokens in wallet. Please recharge to complete booking.");
      return;
    }

    // Deduct tokens
    const nextBalance = tokenBalance - selectedMentor.tokensCost;
    setTokenBalance(nextBalance);
    localStorage.setItem("tokenBalance", String(nextBalance));

    // Save scheduled session details into localStorage
    const savedSessions = localStorage.getItem("scheduledSessions");
    const sessionsList = savedSessions ? JSON.parse(savedSessions) : [];
    
    const newSession = {
      id: `session-${Date.now()}`,
      mentorName: selectedMentor.name,
      mentorRole: selectedMentor.role,
      mentorCompany: selectedMentor.company,
      mentorAvatar: selectedMentor.avatar,
      date: selectedDate,
      time: selectedSlot,
      status: "upcoming"
    };

    sessionsList.push(newSession);
    localStorage.setItem("scheduledSessions", JSON.stringify(sessionsList));

    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard/sessions");
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-scale-up">
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Book a Mentor Session</h1>
        <p className="text-xs text-muted-foreground">Select a mentor, check calendar slots, and confirm booking using your tokens.</p>
      </div>

      {success ? (
        <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-center space-y-4 max-w-md mx-auto">
          <span className="text-4xl block">🎉</span>
          <h2 className="text-lg font-bold">Booking Confirmed!</h2>
          <p className="text-xs leading-normal">
            Your 1-on-1 session has been scheduled. Deducted <span className="font-semibold">{selectedMentor?.tokensCost} Tokens</span> from your wallet. Redirecting to your sessions...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Mentors List */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-sm font-black tracking-wider text-muted-foreground uppercase">1. Choose a Mentor</h2>
            <div className="space-y-3">
              {mentors.map((mentor) => {
                const isSelected = selectedMentor?.id === mentor.id;
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
                    <span className="text-3xl">{mentor.avatar}</span>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-xs font-bold text-foreground">{mentor.name}</h3>
                        <span className="text-[10px] font-bold text-primary">{mentor.tokensCost} Token{mentor.tokensCost > 1 ? "s" : ""} / hr</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{mentor.role} @ <span className="font-semibold text-foreground">{mentor.company}</span></p>
                      <div className="flex items-center gap-3 pt-1 text-[10px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{mentor.uni}</span>
                        <span>•</span>
                        <span className="text-amber-500 font-bold">★ {mentor.rating}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Date, Slot & Billing */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-black tracking-wider text-muted-foreground uppercase">2. Select Slot & Confirm</h2>
            
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              {selectedMentor ? (
                <div className="space-y-6">
                  {/* Selected Mentor Details */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50">
                    <span className="text-2xl">{selectedMentor.avatar}</span>
                    <div>
                      <p className="text-xs font-bold">{selectedMentor.name}</p>
                      <p className="text-[10px] text-muted-foreground">{selectedMentor.role} @ {selectedMentor.company}</p>
                    </div>
                  </div>

                  {/* Pick Date */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Available Dates</label>
                    <div className="grid grid-cols-2 gap-2">
                      {dates.map((date) => {
                        const isSelected = selectedDate === date.value;
                        return (
                          <button
                            type="button"
                            key={date.value}
                            onClick={() => setSelectedDate(date.value)}
                            className={`py-2 rounded-lg border text-center text-xs font-semibold transition-all ${
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground font-bold"
                                : "bg-background border-border text-muted-foreground hover:border-primary"
                            }`}
                          >
                            {date.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pick Time Slot */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Available Times (BDT)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 rounded-lg border text-center text-[10px] font-semibold transition-all ${
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground font-bold"
                                : "bg-background border-border text-muted-foreground hover:border-primary"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pricing and Wallet calculations */}
                  <div className="border-t border-border/80 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Wallet Balance:</span>
                      <span className="font-semibold text-foreground">{tokenBalance} Token{tokenBalance !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Session Cost:</span>
                      <span className="font-bold text-primary">-{selectedMentor.tokensCost} Token{selectedMentor.tokensCost !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="border-t border-border/40 my-1" />
                    <div className="flex justify-between font-bold">
                      <span className="text-foreground">Remaining Balance:</span>
                      <span className={`${tokenBalance < selectedMentor.tokensCost ? "text-red-500" : "text-emerald-500"}`}>
                        {tokenBalance - selectedMentor.tokensCost} Token{tokenBalance - selectedMentor.tokensCost !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-semibold text-center leading-normal">
                      ⚠️ {error}
                      {tokenBalance < selectedMentor.tokensCost && (
                        <Link href="/pricing" className="text-primary font-bold hover:underline block mt-1">
                          Buy More Tokens →
                        </Link>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleBook}
                    className="w-full h-11 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
                  >
                    Confirm & Deduct Tokens
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
