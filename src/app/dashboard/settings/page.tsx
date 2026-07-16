"use client";

import { useState, useEffect } from "react";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("learner");
  const [targetHours, setTargetHours] = useState("Moderate: 3 - 5 hours per week (Recommended)");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Mentor settings
  const [hourlyRate, setHourlyRate] = useState(1000);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          const profile = data.profile;
          setName(profile.name || "");
          setEmail(profile.email || "");
          setRole(profile.role || "learner");
          setHourlyRate(profile.hourlyRate || 1000);
          setBio(profile.bio || "");
          setSkills(profile.skills || []);
          setTargetHours(profile.targetHours || "Moderate: 3 - 5 hours per week (Recommended)");
          // Update localStorage to keep UI in sync
          localStorage.setItem("userName", profile.name || "");
          localStorage.setItem("userEmail", profile.email || "");
          localStorage.setItem("userRole", profile.role || "learner");
        } else {
          // Fallback to localStorage
          setName(localStorage.getItem("userName") || "");
          setEmail(localStorage.getItem("userEmail") || "");
          setRole(localStorage.getItem("userRole") || "learner");
        }
      } catch {
        setName(localStorage.getItem("userName") || "");
        setEmail(localStorage.getItem("userEmail") || "");
        setRole(localStorage.getItem("userRole") || "learner");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const payload: Record<string, string | number | string[]> = { name, targetHours };
      if (role === "mentor") {
        payload.hourlyRate = hourlyRate;
        payload.bio = bio;
        payload.skills = skills;
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save settings.");
        return;
      }

      // Sync localStorage
      localStorage.setItem("userName", data.profile.name);
      localStorage.setItem("userRole", data.profile.role);

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        window.location.reload();
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-scale-up">
        <div className="space-y-1 border-b border-border pb-5">
          <h1 className="text-2xl font-extrabold tracking-tight">Account Profile Settings</h1>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-8 bg-accent rounded" />
            <div className="h-8 bg-accent rounded" />
          </div>
          <div className="h-8 bg-accent rounded w-1/2" />
          <div className="h-20 bg-accent rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-scale-up">
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Account Profile Settings</h1>
        <p className="text-xs text-muted-foreground">Manage your personal information, notification targets, and login settings.</p>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center">
          ✓ Profile settings saved successfully! Reloading to sync sidebar details...
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
          {error}
        </div>
      )}

      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-muted-foreground opacity-60 cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Current Role</label>
              <input
                type="text"
                value={role.charAt(0).toUpperCase() + role.slice(1)}
                disabled
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-muted-foreground opacity-60 cursor-not-allowed"
              />
            </div>

            {role === "learner" && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Target Study Commitment</label>
                <select
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Light: 1 - 2 hours per week</option>
                  <option>Moderate: 3 - 5 hours per week (Recommended)</option>
                  <option>Intense: 6+ hours per week</option>
                </select>
              </div>
            )}

            {role === "mentor" && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Hourly Consultation Rate (৳ BDT)</label>
                <input
                  type="number"
                  min={500}
                  max={10000}
                  step={100}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </div>

          {role === "mentor" && (
            <div className="space-y-4 border-t border-border/60 pt-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Mentor Details</h3>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Bio Description</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell learners about your background and expertise..."
                  className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Expertise Skills Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add skill tag..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (skillInput && !skills.includes(skillInput)) {
                          setSkills([...skills, skillInput]);
                          setSkillInput("");
                        }
                      }
                    }}
                    className="flex-1 text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (skillInput && !skills.includes(skillInput)) {
                        setSkills([...skills, skillInput]);
                        setSkillInput("");
                      }
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-semibold flex items-center gap-1.5"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => setSkills(skills.filter((tag) => tag !== s))}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <hr className="border-border/60" />

          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Notification Preferences</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 py-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary accent-primary h-4 w-4"
                />
                <div className="text-xs">
                  <p className="font-bold text-foreground">Email Notifications</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Receive digests, assignments, and token transaction receipts.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 py-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sessionReminders}
                  onChange={(e) => setSessionReminders(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary accent-primary h-4 w-4"
                />
                <div className="text-xs">
                  <p className="font-bold text-foreground">SMS & Session Alerts</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Get code links and booking updates on your browser.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="text-right pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 h-10 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
