"use client";

import { useState, useEffect } from "react";

export default function SetAvailabilityPage() {
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const slots = [
    "09:00 AM BDT",
    "10:00 AM BDT",
    "11:30 AM BDT",
    "01:00 PM BDT",
    "02:30 PM BDT",
    "04:00 PM BDT",
    "06:00 PM BDT",
    "08:30 PM BDT",
    "10:00 PM BDT",
  ];

  useEffect(() => {
    let isMounted = true;
    fetch("/api/mentor/availability")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        setAvailableDays(data.days || []);
        setAvailableSlots(data.slots || []);
      })
      .catch((err) => console.error("Failed to fetch availability:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
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

  // Presets
  const handlePresetWeekdays = () => {
    setAvailableDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  };

  const handlePresetEvenings = () => {
    setAvailableSlots(["06:00 PM BDT", "08:30 PM BDT", "10:00 PM BDT"]);
  };

  const handlePresetAll = () => {
    setAvailableDays([...days]);
    setAvailableSlots([...slots]);
  };

  const handleClearAll = () => {
    setAvailableDays([]);
    setAvailableSlots([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/mentor/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: availableDays, slots: availableSlots }),
      });
      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save availability:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/2" />
        <div className="h-48 bg-muted rounded-2xl" />
        <div className="h-48 bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-scale-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Set My Availability Schedule</h1>
          <p className="text-xs text-muted-foreground">
            Configure your tutoring schedule. Students will see these slots in your 1-on-1 booking calendar.
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePresetWeekdays}
            className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors cursor-pointer"
          >
            ⚡ Weekdays
          </button>
          <button
            type="button"
            onClick={handlePresetEvenings}
            className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors cursor-pointer"
          >
            🌙 Evenings (6-10 PM)
          </button>
          <button
            type="button"
            onClick={handlePresetAll}
            className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors cursor-pointer"
          >
            🌟 Select All
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-2 py-1 text-[10px] font-bold rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 transition-colors cursor-pointer"
          >
            🧹 Clear
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black text-center flex items-center justify-center gap-2">
          <span>✓</span> Tutoring availability schedule synced successfully!
        </div>
      )}

      {/* Days Selection */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">1. Available Days of the Week</h2>
          <span className="text-xs font-bold text-primary">{availableDays.length} / 7 Days Selected</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {days.map((day) => {
            const isSelected = availableDays.includes(day);
            return (
              <button
                key={day}
                onClick={() => handleToggleDay(day)}
                className={`py-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground font-black shadow-sm shadow-primary/15"
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
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">2. Tutoring Hours (BDT Timezone)</h2>
          <span className="text-xs font-bold text-emerald-400">{availableSlots.length} / 9 Slots Selected</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {slots.map((slot) => {
            const isSelected = availableSlots.includes(slot);
            return (
              <button
                key={slot}
                onClick={() => handleToggleSlot(slot)}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-black shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50"
                }`}
              >
                <span className="text-xs font-semibold">{slot}</span>
                <span className="text-xs font-black">{isSelected ? "✓" : "+"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary & Save Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-muted/40 border border-border">
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{availableDays.length}</span> days and{" "}
          <span className="font-bold text-foreground">{availableSlots.length}</span> time slots configured.
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground font-black text-xs rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving Schedule..." : "Save Availability Schedule"}
        </button>
      </div>
    </div>
  );
}
