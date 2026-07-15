"use client";

import { useState, useEffect } from "react";

export default function SetAvailabilityPage() {
  const [availableDays, setAvailableDays] = useState<string[]>(["Monday", "Wednesday", "Friday"]);
  const [availableSlots, setAvailableSlots] = useState<string[]>(["10:00 AM BDT", "08:30 PM BDT"]);
  const [isSaved, setIsSaved] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const slots = ["10:00 AM BDT", "01:00 PM BDT", "02:30 PM BDT", "06:00 PM BDT", "08:30 PM BDT"];

  useEffect(() => {
    const savedDays = localStorage.getItem("mentorAvailableDays");
    const savedSlots = localStorage.getItem("mentorAvailableSlots");
    if (savedDays) {
      setTimeout(() => setAvailableDays(JSON.parse(savedDays)), 0);
    }
    if (savedSlots) {
      setTimeout(() => setAvailableSlots(JSON.parse(savedSlots)), 0);
    }
  }, []);

  const handleToggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleToggleSlot = (slot: string) => {
    setAvailableSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSave = () => {
    localStorage.setItem("mentorAvailableDays", JSON.stringify(availableDays));
    localStorage.setItem("mentorAvailableSlots", JSON.stringify(availableSlots));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-scale-up">
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Set My Availability</h1>
        <p className="text-xs text-muted-foreground">Select available tutoring days and block time slots. These will sync with student booking calendars.</p>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center">
          ✓ Tutoring availability slots synced successfully!
        </div>
      )}

      {/* Days Selection */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">1. Available Days of the Week</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {days.map((day) => {
            const isSelected = availableDays.includes(day);
            return (
              <button
                key={day}
                onClick={() => handleToggleDay(day)}
                className={`py-3 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground font-bold shadow-sm shadow-primary/15"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots Selection */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">2. Tutoring Hours (BDT Timezone)</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slots.map((slot) => {
            const isSelected = availableSlots.includes(slot);
            return (
              <button
                key={slot}
                onClick={() => handleToggleSlot(slot)}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/5 text-emerald-500 font-bold"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50"
                }`}
              >
                <span className="text-xs">{slot}</span>
                <span className="text-[10px] uppercase font-bold">{isSelected ? "Available" : "Blocked"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="text-right">
        <button
          onClick={handleSave}
          className="px-6 h-10 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
        >
          Save Availability
        </button>
      </div>
    </div>
  );
}
