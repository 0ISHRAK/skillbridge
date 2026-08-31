"use client";

import { useState, useEffect } from "react";

interface EarningsData {
  bookingRevenue: number;
  courseRevenue: number;
  totalRevenue: number;
  pendingPayouts: number;
  completedPayouts: number;
  availableBalance: number;
  walletBalance: number;
  totalBookings: number;
  totalStudents: number;
}

interface PayoutItem {
  id: string;
  amount: number;
  method: string;
  accountNumber: string;
  accountName?: string | null;
  bankName?: string | null;
  branchName?: string | null;
  routingNumber?: string | null;
  status: "pending" | "processing" | "completed" | "rejected";
  trxId?: string | null;
  notes?: string | null;
  createdAt: string;
}

export default function EarningsPayoutsPage() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Cashout form states
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"bkash" | "nagad" | "rocket" | "bank">("bkash");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch("/api/mentor/earnings");
        if (res.ok && isMounted) {
          const data = await res.json();
          setEarnings(data.earnings);
          setPayoutHistory(data.payoutHistory || []);
        }
      } catch (err) {
        console.error("Failed to fetch earnings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid payout amount.");
      return;
    }

    if (amount < 500) {
      setError("Minimum cash-out threshold is ৳500 BDT.");
      return;
    }

    if (amount > (earnings?.availableBalance || 0)) {
      setError(`Requested amount exceeds your available balance (৳${(earnings?.availableBalance || 0).toLocaleString()}).`);
      return;
    }

    if (payoutMethod !== "bank") {
      if (accountNumber.length !== 11 || !accountNumber.startsWith("01")) {
        setError("Please enter a valid 11-digit Bangladeshi mobile wallet number.");
        return;
      }
    } else {
      if (!bankName.trim() || !accountName.trim() || !accountNumber.trim()) {
        setError("Please provide Bank Name, Account Holder Name, and Account Number.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/mentor/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method: payoutMethod,
          accountNumber: accountNumber.trim(),
          accountName: payoutMethod === "bank" ? accountName.trim() : undefined,
          bankName: payoutMethod === "bank" ? bankName.trim() : undefined,
          branchName: payoutMethod === "bank" ? branchName.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit payout request.");
        return;
      }

      setSuccessMsg(`✓ Payout request of ৳${amount.toLocaleString()} submitted! Funds will be transferred within 24 hours.`);
      setPayoutAmount("");
      setAccountNumber("");
      setAccountName("");
      setBankName("");
      setBranchName("");

      // Update local state immediately
      if (data.payout) {
        setPayoutHistory((prev) => [data.payout, ...prev]);
      }
      if (earnings && data.newAvailableBalance !== undefined) {
        setEarnings({
          ...earnings,
          availableBalance: data.newAvailableBalance,
          pendingPayouts: earnings.pendingPayouts + amount,
        });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const setPresetAmount = (val: number) => {
    const maxVal = earnings?.availableBalance || 0;
    const target = Math.min(val, maxVal);
    if (target > 0) {
      setPayoutAmount(String(target));
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  const available = earnings?.availableBalance || 0;

  return (
    <div className="space-y-8 animate-scale-up max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Earnings & Payouts</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Monitor your session revenue, course earnings, and request cash-outs via bKash, Nagad, Rocket, or Bangladeshi Bank accounts.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold shrink-0 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>0% Platform Commission Promo</span>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available for Payout (Featured Card) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card to-card border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-wider">Available for Payout</p>
            <span className="text-xs">⚡</span>
          </div>
          <p className="text-3xl font-black text-emerald-500">৳{available.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Ready for instant cash-out</p>
        </div>

        {/* Total Lifetime Revenue */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2">
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Lifetime Revenue</p>
          <p className="text-2xl font-extrabold text-foreground">৳{(earnings?.totalRevenue || 0).toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground">
            {earnings?.totalBookings || 0} sessions · {earnings?.totalStudents || 0} enrollments
          </p>
        </div>

        {/* Pending Clearance */}
        <div className="p-5 rounded-2xl bg-card border border-amber-500/20 space-y-2">
          <p className="text-[10px] text-amber-500 font-bold uppercase">Pending Processing</p>
          <p className="text-2xl font-extrabold text-amber-500">৳{(earnings?.pendingPayouts || 0).toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground">Under review by finance team</p>
        </div>

        {/* Lifetime Paid Out */}
        <div className="p-5 rounded-2xl bg-card border border-blue-500/20 space-y-2">
          <p className="text-[10px] text-blue-500 font-bold uppercase">Lifetime Paid Out</p>
          <p className="text-2xl font-extrabold text-blue-500">৳{(earnings?.completedPayouts || 0).toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground">Successfully transferred</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cashout Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Request Payout</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Withdraw your consultation and course earnings directly to your personal account.
              </p>
            </div>

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold leading-relaxed">
                {successMsg}
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold leading-normal">
                {error}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-5">
              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                  Select Payout Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "bkash", label: "bKash", color: "border-pink-500/30 bg-pink-500/5 text-pink-500" },
                    { id: "nagad", label: "Nagad", color: "border-orange-500/30 bg-orange-500/5 text-orange-500" },
                    { id: "rocket", label: "Rocket", color: "border-violet-500/30 bg-violet-500/5 text-violet-500" },
                    { id: "bank", label: "Bank Transfer", color: "border-blue-500/30 bg-blue-500/5 text-blue-500" },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => {
                        setPayoutMethod(m.id as "bkash" | "nagad" | "rocket" | "bank");
                        setError("");
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold transition-all text-center ${
                        payoutMethod === m.id
                          ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20"
                          : "bg-background border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Wallet Details */}
              {payoutMethod !== "bank" ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                    {payoutMethod === "bkash" ? "bKash" : payoutMethod === "nagad" ? "Nagad" : "Rocket"} Account Number
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    required
                    placeholder="e.g. 01712345678 (11-digit personal number)"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-xs p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  />
                  <p className="text-[10px] text-muted-foreground">Make sure the number is registered with an active personal or merchant wallet.</p>
                </div>
              ) : (
                /* Bank Account Details */
                <div className="space-y-3 p-4 rounded-xl bg-accent/20 border border-border/60">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block">Bank Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dutch-Bangla Bank, BRAC Bank, City Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block">Account Holder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Name as printed on cheque"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block">Account Number</label>
                      <input
                        type="text"
                        required
                        placeholder="Bank Account Number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block">Branch Name / Routing (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Gulshan Branch / 090271234"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Amount Input with Quick Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Withdrawal Amount (৳ BDT)
                  </label>
                  <span className="text-[10px] text-emerald-500 font-semibold">
                    Available: ৳{available.toLocaleString()}
                  </span>
                </div>

                <input
                  type="number"
                  min={500}
                  max={available || 500}
                  required
                  placeholder="Minimum ৳500 BDT"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-extrabold"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-muted-foreground mr-1">Quick:</span>
                  {[500, 1000, 2500].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      disabled={preset > available}
                      onClick={() => setPresetAmount(preset)}
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold border border-border bg-muted/40 hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      ৳{preset}
                    </button>
                  ))}
                  {available >= 500 && (
                    <button
                      type="button"
                      onClick={() => setPresetAmount(available)}
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all"
                    >
                      Max (৳{available.toLocaleString()})
                    </button>
                  )}
                </div>
              </div>

              {/* Fee & Payout Note */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Commission Fee:</span>
                  <span className="font-bold text-emerald-500">0% (৳0.00)</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Processing Time:</span>
                  <span className="font-semibold text-foreground">Under 24 Hours</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || available < 500}
                className="w-full h-11 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Processing Request..." : available < 500 ? "Minimum ৳500 Balance Required" : "Submit Payout Request"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Revenue Breakdown & Token Valuation */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Revenue Breakdown</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Distribution between 1-on-1 tutoring and course enrollments.</p>
            </div>

            <div className="space-y-4">
              {/* Consultation Bookings */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">1-on-1 Consultation Bookings</span>
                  <span className="font-bold text-foreground">৳{(earnings?.bookingRevenue || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: earnings?.totalRevenue
                        ? `${Math.round(((earnings.bookingRevenue || 0) / earnings.totalRevenue) * 100)}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Course Enrollments */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Cohort & Course Enrollments</span>
                  <span className="font-bold text-foreground">৳{(earnings?.courseRevenue || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{
                      width: earnings?.totalRevenue
                        ? `${Math.round(((earnings.courseRevenue || 0) / earnings.totalRevenue) * 100)}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Token Balance & Valuation */}
            <div className="border-t border-border pt-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Skill Token Wallet</span>
                <span className="font-extrabold text-foreground">
                  🪙 {earnings?.walletBalance || 0} Tokens{" "}
                  <span className="text-muted-foreground font-normal">
                    (≈ ৳{((earnings?.walletBalance || 0) * 10).toLocaleString()})
                  </span>
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Completed Sessions</span>
                <span className="font-bold text-foreground">{earnings?.totalBookings || 0} sessions</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Active Enrolled Students</span>
                <span className="font-bold text-foreground">{earnings?.totalStudents || 0} learners</span>
              </div>
            </div>

            {/* Payout Policy Reminder */}
            <div className="p-3 rounded-xl bg-accent/30 border border-border/80 text-[11px] text-muted-foreground leading-relaxed">
              💡 <strong>Instant Mobile Cash-Outs:</strong> Payouts to bKash, Nagad, and Rocket are processed within 24 hours with SMS confirmation. Bank transfers take 1–2 business days via BEFTN/NPSB.
            </div>
          </div>
        </div>
      </div>

      {/* Payout History Table */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">Recent Payout Requests</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Audit log of all withdrawal requests, transfer channels, and status tracking.</p>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            {payoutHistory.length} total request{payoutHistory.length !== 1 ? "s" : ""}
          </span>
        </div>

        {payoutHistory.length === 0 ? (
          <div className="p-10 rounded-2xl bg-card border border-dashed border-border text-center space-y-2">
            <span className="text-3xl">💳</span>
            <p className="text-sm font-bold text-foreground">No Payout Requests Yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Once you complete your first paid consultation session or student enrollment, your earnings will appear here and you can cash out anytime.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Method & Account</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Transaction ID / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {payoutHistory.map((item) => {
                  const dateFormatted = new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={item.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                        {dateFormatted}
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground uppercase">
                            {item.method}
                          </span>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {item.accountNumber}
                            {item.bankName ? ` (${item.bankName})` : ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-extrabold text-foreground">
                        ৳{item.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            item.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : item.status === "processing"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : item.status === "rejected"
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "completed"
                                ? "bg-emerald-500"
                                : item.status === "processing"
                                ? "bg-blue-500 animate-pulse"
                                : item.status === "rejected"
                                ? "bg-destructive"
                                : "bg-amber-500 animate-pulse"
                            }`}
                          />
                          {item.status === "completed"
                            ? "Completed"
                            : item.status === "processing"
                            ? "Processing"
                            : item.status === "rejected"
                            ? "Rejected"
                            : "Pending Review"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground font-mono text-[11px]">
                        {item.trxId ? (
                          <span className="px-2 py-0.5 rounded bg-muted font-bold text-foreground">
                            {item.trxId}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60 italic">Pending Transfer</span>
                        )}
                        {item.notes && <p className="text-[10px] text-muted-foreground mt-1 not-italic font-sans">{item.notes}</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
