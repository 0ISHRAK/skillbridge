"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const AVATAR_OPTIONS = ["👨‍💻", "👩‍💻", "🚀", "⚡", "💡", "🎓", "💼", "🎨", "🛠️", "🧠", "🔥", "🌟"];

export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("learner");
  const [avatar, setAvatar] = useState("👨‍💻");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [targetHours, setTargetHours] = useState("Moderate: 3 - 5 hours per week (Recommended)");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);

  // Mentor settings
  const [hourlyRate, setHourlyRate] = useState(1000);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok && isMounted) {
          const data = await res.json();
          const profile = data.profile;
          setName(profile.name || "");
          setEmail(profile.email || "");
          setRole(profile.role || "learner");
          setAvatar(profile.avatar || "👨‍💻");
          setHeadline(profile.headline || "");
          setBio(profile.bio || "");
          setExperienceYears(profile.experienceYears || 0);
          setLinkedinUrl(profile.linkedinUrl || "");
          setHourlyRate(profile.hourlyRate || 1000);
          setSkills(profile.skills || []);
          setTargetHours(profile.targetHours || "Moderate: 3 - 5 hours per week (Recommended)");

          localStorage.setItem("userName", profile.name || "");
          localStorage.setItem("userEmail", profile.email || "");
          localStorage.setItem("userRole", profile.role || "learner");
        } else if (isMounted) {
          setName(localStorage.getItem("userName") || "");
          setEmail(localStorage.getItem("userEmail") || "");
          setRole(localStorage.getItem("userRole") || "learner");
        }
      } catch {
        if (isMounted) {
          setName(localStorage.getItem("userName") || "");
          setEmail(localStorage.getItem("userEmail") || "");
          setRole(localStorage.getItem("userRole") || "learner");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaved(false);
    setIsSaving(true);

    try {
      const payload: Record<string, string | number | string[]> = {
        name,
        avatar,
        headline,
        linkedinUrl,
        experienceYears,
        targetHours,
      };

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

      localStorage.setItem("userName", data.profile.name);
      localStorage.setItem("userRole", data.profile.role);
      if (data.profile.avatar) localStorage.setItem("userAvatar", data.profile.avatar);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to change password.");
        return;
      }

      setPasswordSuccess("✓ Password successfully updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch {
      setPasswordError("Network error. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="h-64 bg-muted rounded-2xl" />
        <div className="h-48 bg-muted rounded-2xl" />
      </div>
    );
  }

  const tokenCost = Math.max(1, Math.ceil(hourlyRate / 10));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-scale-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Account & Profile Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your personal profile, mentor rates, credentials, and notification settings.
          </p>
        </div>
        {role === "mentor" && (
          <Link
            href={`/explore?tab=mentors&q=${encodeURIComponent(name)}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:border-primary/50 hover:text-primary transition-all shadow-xs shrink-0 self-start sm:self-auto"
          >
            <span>View Public Profile</span>
            <span className="text-[10px]">↗</span>
          </Link>
        )}
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center">
          ✓ Profile settings successfully updated!
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Information Card */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-5 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Personal Details</h2>

          {/* Avatar Selector */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
              Profile Avatar Emoji
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {AVATAR_OPTIONS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setAvatar(em)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                    avatar === em
                      ? "bg-primary/15 border-2 border-primary shadow-xs scale-105"
                      : "bg-muted/50 border border-border hover:bg-accent"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full text-xs p-3 rounded-xl border border-input bg-muted/40 text-muted-foreground cursor-not-allowed font-mono"
              />
              <p className="text-[9px] text-muted-foreground">Email is tied to your verified account credentials.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block">Account Role</label>
              <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
                <span className="text-xs font-bold capitalize text-foreground">{role}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  role === "mentor" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                }`}>
                  {role === "mentor" ? "🎓 Approved Mentor" : "📚 Learner"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block">LinkedIn / Portfolio URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />
            </div>
          </div>

          {/* Professional Headline */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block">
              Professional Headline / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Backend Engineer at ShopUp | BUBT '19"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
            <p className="text-[10px] text-muted-foreground">Appears below your name on mentor cards and explore search results.</p>
          </div>
        </div>

        {/* Mentor Specific Profile Details */}
        {role === "mentor" && (
          <div className="p-6 rounded-2xl bg-card border border-border space-y-5 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Mentor & Tutoring Configuration</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Hourly Consultation Rate (৳ BDT)
                </label>
                <input
                  type="number"
                  min={100}
                  step={50}
                  required
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full text-xs p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-extrabold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">Years of Industry Experience</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full text-xs p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>
            </div>

            {/* Token Economy Rate Preview Callout */}
            <div className="p-3.5 rounded-xl bg-accent/30 border border-border/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Session Token Cost for Students:</span>
                <span className="font-extrabold text-primary">{tokenCost} Tokens (৳{hourlyRate.toLocaleString()} BDT)</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Calibrated baseline: 1 Skill Token = ৳10 BDT.</p>
            </div>

            {/* Bio Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block">Bio & Mentoring Description</label>
              <textarea
                rows={4}
                placeholder="Tell learners about your background, projects you have built, and what they will get out of a 1-on-1 session with you..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none font-medium leading-relaxed"
              />
            </div>

            {/* Expertise Skills Tags */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block">Expertise Skills Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Next.js, Node.js, Microservices, Figma..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Add Tag
                </button>
              </div>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="text-primary hover:text-destructive font-extrabold text-sm leading-none ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications Card */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Notification Preferences</h2>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="mt-0.5 rounded border-input text-primary focus:ring-primary"
              />
              <div>
                <p className="text-xs font-bold text-foreground">Email Notifications & Digest</p>
                <p className="text-[11px] text-muted-foreground">Receive weekly summaries, assignment milestones, and token receipts.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sessionReminders}
                onChange={(e) => setSessionReminders(e.target.checked)}
                className="mt-0.5 rounded border-input text-primary focus:ring-primary"
              />
              <div>
                <p className="text-xs font-bold text-foreground">Direct Message & Session Booking Alerts</p>
                <p className="text-[11px] text-muted-foreground">Get live browser updates when a student books or sends you a direct message.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Settings Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto px-8 h-11 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? "Saving Settings..." : "Save Profile Settings"}
        </button>
      </form>

      {/* Security & Password Card */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-5 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Security & Password</h2>

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
            {passwordSuccess}
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block">Current Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block">New Password (Min 8 Characters)</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-6 h-10 bg-foreground text-background font-bold text-xs rounded-xl hover:bg-foreground/90 transition-all cursor-pointer disabled:opacity-50"
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
