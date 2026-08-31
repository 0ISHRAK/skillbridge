"use client";

import { useState, useEffect } from "react";

interface RewardItem {
  id: string;
  title: string;
  description: string;
  tokenCost: number;
  type: string;
  icon: string | null;
  isActive: boolean;
  isOneTime: boolean;
  discountValue: number | null;
  badge: string | null;
  createdAt: string;
  _count?: {
    redemptions: number;
  };
}

interface RedemptionLogItem {
  id: string;
  tokensSpent: number;
  redemptionCode: string;
  status: string;
  createdAt: string;
  reward: {
    title: string;
    type: string;
    icon: string | null;
    tokenCost: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface EconomyStats {
  totalRewards: number;
  activeRewards: number;
  totalRedemptions: number;
  totalTokensRedeemed: number;
  totalTokensEarned: number;
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [stats, setStats] = useState<EconomyStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"catalog" | "redemptions">("catalog");

  // Redemptions log state
  const [redemptions, setRedemptions] = useState<RedemptionLogItem[]>([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState<boolean>(false);
  const [searchLog, setSearchLog] = useState<string>("");

  // Modal / Form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tokenCost: 100,
    type: "discount",
    icon: "🎁",
    isActive: true,
    isOneTime: false,
    discountValue: "",
    badge: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function loadRewards() {
      try {
        const res = await fetch("/api/admin/rewards");
        if (res.ok && isMounted) {
          const data = await res.json();
          setRewards(data.rewards || []);
          setStats(data.stats || null);
        }
      } catch (err) {
        console.error("Failed to load admin rewards:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void loadRewards();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "redemptions") return;
    let isMounted = true;
    async function loadRedemptions() {
      setRedemptionsLoading(true);
      try {
        const res = await fetch(`/api/admin/rewards/redemptions?search=${encodeURIComponent(searchLog)}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setRedemptions(data.redemptions || []);
        }
      } catch (err) {
        console.error("Failed to load redemptions log:", err);
      } finally {
        if (isMounted) setRedemptionsLoading(false);
      }
    }
    void loadRedemptions();
    return () => {
      isMounted = false;
    };
  }, [activeTab, searchLog]);

  const reloadRewards = async () => {
    try {
      const res = await fetch("/api/admin/rewards");
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error("Failed to reload rewards:", err);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      tokenCost: 100,
      type: "discount",
      icon: "🎁",
      isActive: true,
      isOneTime: false,
      discountValue: "",
      badge: "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (reward: RewardItem) => {
    setEditingId(reward.id);
    setFormData({
      title: reward.title,
      description: reward.description,
      tokenCost: reward.tokenCost,
      type: reward.type,
      icon: reward.icon || "🎁",
      isActive: reward.isActive,
      isOneTime: reward.isOneTime,
      discountValue: reward.discountValue ? String(reward.discountValue) : "",
      badge: reward.badge || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        tokenCost: Number(formData.tokenCost),
        type: formData.type,
        icon: formData.icon,
        isActive: formData.isActive,
        isOneTime: formData.isOneTime,
        discountValue: formData.discountValue ? Number(formData.discountValue) : null,
        badge: formData.badge || null,
      };

      const url = editingId ? `/api/admin/rewards/${editingId}` : "/api/admin/rewards";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        void reloadRewards();
      } else {
        setFormError(data.error || "Failed to save reward");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (reward: RewardItem) => {
    try {
      const res = await fetch(`/api/admin/rewards/${reward.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !reward.isActive }),
      });
      if (res.ok) {
        void reloadRewards();
      }
    } catch (err) {
      console.error("Failed to toggle reward status:", err);
    }
  };

  const handleDeleteReward = async (id: string, title?: string) => {
    if (!confirm(`Are you sure you want to delete ${title ? `"${title}"` : "this reward"}?`)) return;
    try {
      const res = await fetch(`/api/admin/rewards/${id}`, { method: "DELETE" });
      if (res.ok) {
        void reloadRewards();
      }
    } catch (err) {
      console.error("Failed to delete reward:", err);
    }
  };

  return (
    <div className="space-y-8 animate-scale-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Reward & Token System Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure learning rewards, manage token costs, monitor redemption logs, and oversee the learning economy.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
        >
          <span>+</span> Create New Reward
        </button>
      </div>

      {/* ─── STATS OVERVIEW ─── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Rewards</p>
            <p className="text-2xl font-black text-foreground">
              {stats.activeRewards} <span className="text-xs font-normal text-muted-foreground">/ {stats.totalRewards} total</span>
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Redemptions</p>
            <p className="text-2xl font-black text-primary">{stats.totalRedemptions}</p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tokens Redeemed (Spent)</p>
            <p className="text-2xl font-black text-rose-500">🪙 {stats.totalTokensRedeemed.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Learning Tokens Issued</p>
            <p className="text-2xl font-black text-emerald-500">🪙 {stats.totalTokensEarned.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* ─── TABS ─── */}
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "catalog"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          🎁 Rewards Catalog ({rewards.length})
        </button>
        <button
          onClick={() => setActiveTab("redemptions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "redemptions"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          📜 Redemptions Log ({stats?.totalRedemptions ?? 0})
        </button>
      </div>

      {/* ─── TAB 1: CATALOG TABLE ─── */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">Loading catalog...</div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-4">Reward</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Token Cost</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Redemptions</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rewards.map((reward) => (
                      <tr key={reward.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl p-2 rounded-xl bg-muted/60 border border-border">
                              {reward.icon || "🎁"}
                            </span>
                            <div>
                              <p className="font-extrabold text-foreground flex items-center gap-1.5">
                                {reward.title}
                                {reward.badge && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                                    {reward.badge}
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{reward.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-secondary/10 text-secondary border border-secondary/20">
                            {reward.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-black text-amber-500 text-sm">🪙 {reward.tokenCost}</span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleActive(reward)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all border ${
                              reward.isActive
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                            }`}
                          >
                            {reward.isActive ? "● Active" : "○ Inactive"}
                          </button>
                        </td>
                        <td className="p-4 font-bold text-foreground">
                          {reward._count?.redemptions ?? 0} claims
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEdit(reward)}
                            className="px-3 py-1 rounded-lg border border-border hover:bg-accent text-foreground text-xs font-semibold transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReward(reward.id, reward.title)}
                            className="px-3 py-1 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition-all"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: REDEMPTIONS LOG TABLE ─── */}
      {activeTab === "redemptions" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by code, user name, or reward..."
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              className="w-full sm:w-80 px-3.5 py-2 text-xs rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {redemptionsLoading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">Loading redemptions log...</div>
          ) : redemptions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-2">
              <span className="text-3xl block">🎟️</span>
              <p className="font-bold text-sm">No redemptions match your query</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-4">Voucher Code</th>
                      <th className="p-4">Learner</th>
                      <th className="p-4">Reward</th>
                      <th className="p-4">Tokens Spent</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {redemptions.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-mono font-extrabold text-primary">{r.redemptionCode}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-foreground">{r.user.name}</p>
                            <p className="text-[10px] text-muted-foreground">{r.user.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span>{r.reward.icon || "🎁"}</span>
                            <span className="font-semibold text-foreground">{r.reward.title}</span>
                          </div>
                        </td>
                        <td className="p-4 font-black text-rose-500">- {r.tokensSpent}</td>
                        <td className="p-4 text-[11px] text-muted-foreground">
                          {new Date(r.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── CREATE / EDIT MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-foreground">
                {editingId ? "Edit Reward" : "Create New Reward"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveReward} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Reward Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Course Discount (20% OFF)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what the learner receives when redeeming this perk..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Token Cost</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.tokenCost}
                    onChange={(e) => setFormData({ ...formData, tokenCost: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Category / Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="discount">Course Discount</option>
                    <option value="certificate">Certificate Upgrade</option>
                    <option value="learning_pack">Learning Pack</option>
                    <option value="challenge">Challenge Pass</option>
                    <option value="mentorship">Mentorship Pass</option>
                    <option value="badge">Profile Badge</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground text-center text-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="Popular / Hot"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Discount % (Optional)</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-primary accent-primary"
                  />
                  <span className="font-bold text-foreground">Active in Store</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOneTime}
                    onChange={(e) => setFormData({ ...formData, isOneTime: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-primary accent-primary"
                  />
                  <span className="font-bold text-foreground">One-time per user</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-border hover:bg-accent text-foreground font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update Reward" : "Create Reward"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
