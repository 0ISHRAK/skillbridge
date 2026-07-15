"use client";

import { useState, useEffect } from "react";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("Fahim Hossain");
  const [email, setEmail] = useState("user@domain.com");
  const [role, setRole] = useState("learner");
  const [targetHours, setTargetHours] = useState("3 - 5 hours per week (Recommended)");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Mentor settings
  const [hourlyRate, setHourlyRate] = useState(1000);
  const [bio, setBio] = useState("Experienced developer dedicated to mentoring BUET / DU students.");
  const [skills, setSkills] = useState<string[]>(["React", "Next.js", "Tailwind CSS"]);
  const [skillInput, setSkillInput] = useState("");


  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    const storedRole = localStorage.getItem("userRole");
    
    setTimeout(() => {
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedRole) setRole(storedRole);

      const storedRate = localStorage.getItem("mentorRate");
      const storedBio = localStorage.getItem("mentorBio");
      const storedSkills = localStorage.getItem("mentorSkills");

      if (storedRate) setHourlyRate(Number(storedRate));
      if (storedBio) setBio(storedBio);
      if (storedSkills) setSkills(JSON.parse(storedSkills));
    }, 0);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", role);

    if (role === "mentor") {
      localStorage.setItem("mentorRate", String(hourlyRate));
      localStorage.setItem("mentorBio", bio);
      localStorage.setItem("mentorSkills", JSON.stringify(skills));
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      window.location.reload(); // Reload page to sync sidebar details instantly
    }, 1500);
  };



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

      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Main Info */}
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Account Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Current Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="learner">Learner</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>

            {role === "learner" && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Target Study Commits</label>
                <select
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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

          {/* Dedicated Mentor Fields */}
          {role === "mentor" && (
            <div className="space-y-4 border-t border-border/60 pt-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Mentor Details</h3>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Bio Description</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Custom tags input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Expertise Skills Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add skill tag..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
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

              {/* Mock Scan Identity verification */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">NID / Passport Status</label>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-xs font-bold">
                  <span>🛡️</span>
                  <span>National ID Document verified (Checkmark displays on profile)</span>
                </div>
              </div>
            </div>
          )}

          <hr className="border-border/60" />

          {/* Notifications Toggles */}
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

          {/* Actions */}
          <div className="text-right pt-4">
            <button
              type="submit"
              className="px-6 h-10 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
