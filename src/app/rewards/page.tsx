"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
}

interface UserRedemption {
  id: string;
  rewardId: string;
  tokensSpent: number;
  redemptionCode: string;
  status: string;
  createdAt: string;
  reward: {
    title: string;
    type: string;
    icon: string | null;
  };
}

interface TransactionItem {
  id: string;
  amount: number;
  type: string;
  title: string;
  description: string | null;
  balanceAfter: number;
  createdAt: string;
}

export default function RewardsPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [userRedemptions, setUserRedemptions] = useState<UserRedemption[]>([]);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"catalog" | "history" | "claimed">("catalog");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // History state
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "earned" | "spent">("all");

  // Modal states
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [redeeming, setRedeeming] = useState<boolean>(false);
  const [redeemError, setRedeemError] = useState<string>("");
  const [successVoucher, setSuccessVoucher] = useState<{
    code: string;
    title: string;
    cost: number;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const loadRewards = async () => {
    try {
      const res = await fetch("/api/rewards");
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards || []);
        setTokenBalance(data.tokenBalance ?? 0);
        setUserRedemptions(data.userRedemptions || []);
        setIsLoggedIn(data.isLoggedIn);
      }
    } catch (err) {
      console.error("Failed to load rewards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/rewards")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        setRewards(data.rewards || []);
        setTokenBalance(data.tokenBalance ?? 0);
        setUserRedemptions(data.userRedemptions || []);
        setIsLoggedIn(data.isLoggedIn);
      })
      .catch((err) => console.error("Failed to load rewards:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "history" || !isLoggedIn) return;
    let isMounted = true;
    async function loadHistory() {
      setHistoryLoading(true);
      try {
        const res = await fetch(`/api/rewards/history?type=${historyFilter}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setTransactions(data.transactions || []);
          if (data.tokenBalance !== undefined) {
            setTokenBalance(data.tokenBalance);
          }
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        if (isMounted) setHistoryLoading(false);
      }
    }
    void loadHistory();
    return () => {
      isMounted = false;
    };
  }, [activeTab, historyFilter, isLoggedIn]);

  const handleOpenRedeem = (reward: RewardItem) => {
    if (!isLoggedIn) {
      router.push("/auth?mode=login");
      return;
    }
    setSelectedReward(reward);
    setRedeemError("");
    setIsConfirmOpen(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;
    setRedeeming(true);
    setRedeemError("");

    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: selectedReward.id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTokenBalance(data.newBalance);
        localStorage.setItem("tokenBalance", String(data.newBalance));
        setIsConfirmOpen(false);
        setSuccessVoucher({
          code: data.redemptionCode,
          title: selectedReward.title,
          cost: selectedReward.tokenCost,
        });
        loadRewards();
      } else {
        setRedeemError(data.error || "Redemption failed. Please try again.");
      }
    } catch {
      setRedeemError("Network error. Please try again.");
    } finally {
      setRedeeming(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const categories = [
    { id: "all", label: "All Rewards" },
    { id: "discount", label: "Course Discounts" },
    { id: "certificate", label: "Certificates" },
    { id: "learning_pack", label: "Learning Packs" },
    { id: "challenge", label: "Challenges" },
    { id: "mentorship", label: "Mentorship" },
    { id: "badge", label: "Badges" },
  ];

  const filteredRewards = rewards.filter((r) => {
    const matchesCategory = categoryFilter === "all" || r.type === categoryFilter;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const claimedRewardIds = new Set(userRedemptions.map((ur) => ur.rewardId));

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ─── HERO & TOKEN BANNER ─── */}
        <div className="relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10 shadow-xl shadow-primary/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <span>🪙</span>
                <span>Skillbridge Learning Rewards Economy</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Rewards & Perks <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Store</span>
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Turn your hard-earned learning achievements into tangible career perks. Earn tokens by finishing lessons, acing quizzes, and mastering courses — then redeem them for vouchers, verified certifications, and mentorship passes.
              </p>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
                <span className="text-base">💡</span>
                <span>
                  <strong>Academic Reward Currency:</strong> Tokens are rewarded strictly for educational effort and cannot be converted into cash or real money.
                </span>
              </div>
            </div>

            {/* Token Balance Card */}
            <div className="w-full lg:w-auto shrink-0 p-6 rounded-2xl bg-background/80 backdrop-blur-md border border-border shadow-lg space-y-4">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Your Balance</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-amber-500 flex items-center gap-1.5">
                      <span>🪙</span> {tokenBalance}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">Tokens</span>
                  </div>
                </div>
                {isLoggedIn ? (
                  <Link
                    href="/dashboard/courses"
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
                  >
                    + Earn More
                  </Link>
                ) : (
                  <Link
                    href="/auth?mode=login"
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md"
                  >
                    Log In
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-[10px] text-center text-muted-foreground">
                <div className="p-1.5 rounded-lg bg-card border border-border/60">
                  <p className="font-bold text-foreground">+10</p>
                  <p>Per Lesson</p>
                </div>
                <div className="p-1.5 rounded-lg bg-card border border-border/60">
                  <p className="font-bold text-foreground">+20 to +30</p>
                  <p>Per Quiz</p>
                </div>
                <div className="p-1.5 rounded-lg bg-card border border-border/60">
                  <p className="font-bold text-foreground">+100</p>
                  <p>Course Done</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── TABS & CONTROLS ─── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "catalog"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              🎁 Reward Catalog ({rewards.length})
            </button>
            {isLoggedIn && (
              <>
                <button
                  onClick={() => setActiveTab("claimed")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === "claimed"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>🎟️ My Vouchers</span>
                  {userRedemptions.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-background text-foreground font-extrabold">
                      {userRedemptions.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "history"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  📜 Token History
                </button>
              </>
            )}
          </div>

          {activeTab === "catalog" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search rewards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-1.5 text-xs rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
        </div>

        {/* ─── TAB 1: REWARD CATALOG ─── */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat.id
                      ? "bg-secondary text-secondary-foreground font-bold shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-6 rounded-2xl bg-card border border-border space-y-4 animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-muted" />
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-12 bg-muted rounded w-full" />
                    <div className="h-10 bg-muted rounded-xl w-full mt-4" />
                  </div>
                ))}
              </div>
            ) : filteredRewards.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
                <span className="text-4xl block">🔍</span>
                <h3 className="font-bold text-base">No rewards found</h3>
                <p className="text-xs text-muted-foreground">Try clearing your search query or selecting another category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRewards.map((reward) => {
                  const hasEnough = tokenBalance >= reward.tokenCost;
                  const isOneTimeClaimed = reward.isOneTime && claimedRewardIds.has(reward.id);

                  return (
                    <div
                      key={reward.id}
                      className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                    >
                      {reward.badge && (
                        <div className="absolute top-4 right-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            {reward.badge}
                          </span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 flex items-center justify-center text-3xl shadow-sm">
                          {reward.icon || "🎁"}
                        </div>

                        <div>
                          <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
                            {reward.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            {reward.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border/60 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Cost</span>
                          <span className="text-lg font-black text-amber-500 flex items-center gap-1">
                            <span>🪙</span> {reward.tokenCost} <span className="text-xs font-semibold text-muted-foreground">Tokens</span>
                          </span>
                        </div>

                        {isOneTimeClaimed ? (
                          <button
                            disabled
                            className="w-full h-11 rounded-xl bg-muted text-muted-foreground text-xs font-bold border border-border cursor-not-allowed flex items-center justify-center gap-1.5"
                          >
                            ✓ Already Claimed
                          </button>
                        ) : hasEnough ? (
                          <button
                            onClick={() => handleOpenRedeem(reward)}
                            className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
                          >
                            <span>Redeem Reward</span>
                            <span>→</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenRedeem(reward)}
                            className="w-full h-11 rounded-xl bg-muted/60 text-muted-foreground text-xs font-semibold border border-border/60 hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>Need {reward.tokenCost - tokenBalance} More Tokens</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: MY CLAIMED VOUCHERS ─── */}
        {activeTab === "claimed" && (
          <div className="space-y-6">
            {userRedemptions.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
                <span className="text-4xl block">🎟️</span>
                <h3 className="font-bold text-base">No claimed rewards yet</h3>
                <p className="text-xs text-muted-foreground">Browse the catalog above and spend your tokens on perks!</p>
                <button
                  onClick={() => setActiveTab("catalog")}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userRedemptions.map((redemption) => (
                  <div
                    key={redemption.id}
                    className="p-6 rounded-2xl bg-card border border-border space-y-4 hover:border-primary/30 transition-all shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
                          {redemption.reward.icon || "🎁"}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{redemption.reward.title}</h4>
                          <p className="text-[11px] text-muted-foreground">
                            Claimed on {new Date(redemption.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {redemption.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Voucher / Access Code</p>
                        <p className="text-sm font-mono font-extrabold text-primary tracking-wider mt-0.5">
                          {redemption.redemptionCode}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyCode(redemption.redemptionCode)}
                        className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-bold hover:bg-accent text-foreground transition-all"
                      >
                        Copy
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>Tokens Spent: <strong className="text-foreground">{redemption.tokensSpent}</strong></span>
                      <span>Verified Digital Record ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: TOKEN HISTORY & LEDGER ─── */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              {(["all", "earned", "spent"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    historyFilter === filter
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter === "all" ? "All Activity" : filter === "earned" ? "Tokens Earned (+)" : "Tokens Spent (-)"}
                </button>
              ))}
            </div>

            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-2">
                <span className="text-3xl block">📜</span>
                <p className="font-bold text-sm">No transaction records found</p>
                <p className="text-xs text-muted-foreground">Start completing course activities to see your reward history!</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="divide-y divide-border">
                  {transactions.map((tx) => {
                    const isEarned = tx.amount > 0;
                    return (
                      <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                            isEarned ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          }`}>
                            {isEarned ? "🪙" : "🎁"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-foreground truncate">{tx.title}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{tx.description}</p>
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                              {new Date(tx.createdAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className={`text-base font-black ${isEarned ? "text-emerald-500" : "text-rose-500"}`}>
                            {isEarned ? `+${tx.amount}` : tx.amount}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-semibold">
                            Balance: {tx.balanceAfter}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── CONFIRMATION MODAL ─── */}
        {isConfirmOpen && selectedReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
                  {selectedReward.icon || "🎁"}
                </div>
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-foreground">Confirm Reward Redemption</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You are about to redeem <strong>{selectedReward.title}</strong> using your learning tokens.
                </p>
              </div>

              {redeemError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                  {redeemError}
                </div>
              )}

              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Current Balance:</span>
                  <span className="font-bold text-foreground">{tokenBalance} Tokens</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Reward Cost:</span>
                  <span className="font-extrabold text-amber-500">- {selectedReward.tokenCost} Tokens</span>
                </div>
                <div className="border-t border-border/60 pt-2 flex justify-between font-bold">
                  <span>Remaining Balance:</span>
                  <span className={tokenBalance >= selectedReward.tokenCost ? "text-emerald-500" : "text-rose-500"}>
                    {tokenBalance - selectedReward.tokenCost} Tokens
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-border hover:bg-accent text-foreground text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRedeem}
                  disabled={redeeming || tokenBalance < selectedReward.tokenCost}
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {redeeming ? (
                    <span>Redeeming...</span>
                  ) : tokenBalance < selectedReward.tokenCost ? (
                    <span>Insufficient Tokens</span>
                  ) : (
                    <span>Confirm & Deduct</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── REDEMPTION SUCCESS MODAL ─── */}
        {successVoucher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-card border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-3xl flex items-center justify-center mx-auto">
                ✓
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">Reward Redeemed!</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You successfully claimed <strong>{successVoucher.title}</strong> for {successVoucher.cost} tokens.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2 text-left">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Your Voucher / Access Code</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-mono font-black text-primary tracking-wider">
                    {successVoucher.code}
                  </span>
                  <button
                    onClick={() => handleCopyCode(successVoucher.code)}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all"
                  >
                    {copiedCode ? "Copied! ✓" : "Copy Code"}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setSuccessVoucher(null);
                  setActiveTab("claimed");
                }}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md"
              >
                View My Vouchers
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
