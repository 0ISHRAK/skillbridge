"use client";

import { useState, useEffect } from "react";

interface EarningsData {
  bookingRevenue: number;
  courseRevenue: number;
  totalRevenue: number;
  walletBalance: number;
  totalBookings: number;
  totalStudents: number;
}

export default function EarningsPayoutsPage() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"bKash" | "Nagad">("bKash");
  const [accountNumber, setAccountNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const res = await fetch("/api/mentor/earnings");
      if (res.ok) {
        const data = await res.json();
        setEarnings(data.earnings);
      }
    } catch (err) {
      console.error("Failed to fetch earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid payout amount.");
      return;
    }

    if (amount > (earnings?.totalRevenue || 0)) {
      setError("Insufficient earnings balance for this request.");
      return;
    }

    if (amount < 500) {
      setError("Minimum cash-out threshold is ৳500 BDT.");
      return;
    }

    if (accountNumber.length !== 11 || !accountNumber.startsWith("01")) {
      setError("Please enter a valid 11-digit mobile wallet number.");
      return;
    }

    setSuccess(true);
    setPayoutAmount("");
    setAccountNumber("");
    setTimeout(() => setSuccess(false), 4000);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-scale-up">
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Earnings & Payouts</h1>
        <p className="text-xs text-muted-foreground">Monitor your consultation tutoring earnings and request cash-outs to your bKash or Nagad wallet.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-emerald-500/20 space-y-2">
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Revenue</p>
          <p className="text-2xl font-extrabold text-emerald-500">৳{(earnings?.totalRevenue || 0).toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground">From bookings + courses</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-blue-500/20 space-y-2">
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Booking Revenue</p>
          <p className="text-2xl font-extrabold text-blue-500">৳{(earnings?.bookingRevenue || 0).toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground">{earnings?.totalBookings || 0} confirmed sessions</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-amber-500/20 space-y-2">
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Course Revenue</p>
          <p className="text-2xl font-extrabold text-amber-500">৳{(earnings?.courseRevenue || 0).toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground">{earnings?.totalStudents || 0} enrollments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Cashout Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Request Mobile Cash-Out</h2>

            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center">
                ✓ Payout request submitted! Admin will transfer funds within 24 hours.
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center leading-normal">
                {error}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">Select Payment Wallet</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["bKash", "Nagad"] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPayoutMethod(m)}
                      className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                        payoutMethod === m
                          ? "bg-primary border-primary text-primary-foreground shadow-sm"
                          : "bg-background border-border text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">{payoutMethod} Wallet Number</label>
                <input
                  type="text"
                  maxLength={11}
                  required
                  placeholder="e.g. 01712345678"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">Withdrawal Amount (৳ BDT)</label>
                <input
                  type="number"
                  min={500}
                  required
                  placeholder="Minimum ৳500 BDT"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                Submit Withdrawal Payout
              </button>
            </form>
          </div>
        </div>

        {/* Right: Revenue breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold tracking-tight">Revenue Breakdown</h2>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Consultation Bookings</span>
                <span className="font-bold">৳{(earnings?.bookingRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: earnings?.totalRevenue
                      ? `${Math.round((earnings.bookingRevenue / earnings.totalRevenue) * 100)}%`
                      : "0%",
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Course Enrollments</span>
                <span className="font-bold">৳{(earnings?.courseRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{
                    width: earnings?.totalRevenue
                      ? `${Math.round((earnings.courseRevenue / earnings.totalRevenue) * 100)}%`
                      : "0%",
                  }}
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Wallet Token Balance</span>
                <span className="font-bold">{earnings?.walletBalance || 0} tokens</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Sessions</span>
                <span className="font-bold">{earnings?.totalBookings || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Students Enrolled</span>
                <span className="font-bold">{earnings?.totalStudents || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
