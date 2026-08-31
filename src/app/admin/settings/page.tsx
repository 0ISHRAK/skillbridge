"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState("Skillbridge");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [defaultTokens, setDefaultTokens] = useState(30);
  const [mentorCommission, setMentorCommission] = useState(15);
  const [saved, setSaved] = useState(false);

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    setAdminActionLoading(true);
    setAdminMessage("");

    try {
      const res = await fetch("/api/admin/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail.toLowerCase().trim(), updates: { role: "admin" } }),
      });

      if (res.ok) {
        setAdminMessage(`Successfully promoted ${newAdminEmail} to admin.`);
        setNewAdminEmail("");
      } else {
        const data = await res.json();
        setAdminMessage(data.error || "Failed to promote user.");
      }
    } catch {
      setAdminMessage("Network error. Please try again.");
    } finally {
      setAdminActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Platform Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">Configure platform-wide settings and controls</p>
      </div>

      {/* General Settings */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
        <h2 className="text-sm font-bold border-b border-border pb-3">General Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Platform Name</label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Default Token Balance (New Users)</label>
            <input
              type="number"
              value={defaultTokens}
              onChange={(e) => setDefaultTokens(Number(e.target.value))}
              className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mentor Commission (%)</label>
            <input
              type="number"
              value={mentorCommission}
              onChange={(e) => setMentorCommission(Number(e.target.value))}
              min={0}
              max={50}
              className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:border-primary"
            />
            <p className="text-[9px] text-muted-foreground mt-1">Platform takes {mentorCommission}% from each booking. Mentor receives {100 - mentorCommission}%.</p>
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
        <h2 className="text-sm font-bold border-b border-border pb-3">Platform Controls</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold">Maintenance Mode</p>
              <p className="text-[10px] text-muted-foreground">Disable public access temporarily</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-12 h-6 rounded-full transition-all relative ${
                maintenanceMode ? "bg-red-500" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  maintenanceMode ? "left-6" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold">Open Registration</p>
              <p className="text-[10px] text-muted-foreground">Allow new users to sign up</p>
            </div>
            <button
              onClick={() => setRegistrationOpen(!registrationOpen)}
              className={`w-12 h-6 rounded-full transition-all relative ${
                registrationOpen ? "bg-emerald-500" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  registrationOpen ? "left-6" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Management */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
        <h2 className="text-sm font-bold border-b border-border pb-3">Admin Access Management</h2>

        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Promote User to Admin</label>
          <div className="flex gap-2 mt-1.5">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="Enter user email address..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-medium placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleCreateAdmin}
              disabled={adminActionLoading || !newAdminEmail.trim()}
              className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {adminActionLoading ? "..." : "Promote"}
            </button>
          </div>
          {adminMessage && (
            <p className={`text-[10px] mt-2 font-medium ${adminMessage.includes("Successfully") ? "text-emerald-500" : "text-red-500"}`}>
              {adminMessage}
            </p>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-4">
        <h2 className="text-sm font-bold text-red-500">Danger Zone</h2>
        <p className="text-[10px] text-muted-foreground">Irreversible actions. Proceed with caution.</p>
        <div className="flex gap-3">
          <button
            onClick={() => alert("This would clear all platform data. Feature disabled in development.")}
            className="px-4 py-2 rounded-lg border border-red-500/30 text-red-500 text-[10px] font-bold hover:bg-red-500/10 transition-colors"
          >
            Reset All Data
          </button>
          <button
            onClick={() => alert("This would export all platform data as CSV. Coming soon.")}
            className="px-4 py-2 rounded-lg border border-border text-muted-foreground text-[10px] font-bold hover:bg-accent transition-colors"
          >
            Export All Data
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          {saved ? "✓ Settings Saved" : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}
