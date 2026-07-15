"use client";

import { useState, useEffect } from "react";

interface PayoutLog {
  id: string;
  date: string;
  account: string;
  method: string;
  amount: number;
  status: "completed" | "pending";
}

export default function EarningsPayoutsPage() {
  const [earnings, setEarnings] = useState(12500);
  const [payouts, setPayouts] = useState<PayoutLog[]>([]);

  // Payout form states
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"bKash" | "Nagad">("bKash");
  const [accountNumber, setAccountNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedEarnings = localStorage.getItem("mentorEarnings");
    if (storedEarnings) {
      setTimeout(() => setEarnings(Number(storedEarnings)), 0);
    } else {
      localStorage.setItem("mentorEarnings", "12500");
    }

    const savedPayouts = localStorage.getItem("mentorPayouts");
    if (savedPayouts) {
      setTimeout(() => setPayouts(JSON.parse(savedPayouts)), 0);
    } else {
      const defaultPayouts: PayoutLog[] = [
        { id: "PAY-9811", date: "2026-07-02", account: "01788776655", method: "bKash Payout", amount: 4500, status: "completed" },
        { id: "PAY-9702", date: "2026-06-20", account: "01922334455", method: "Nagad Payout", amount: 3000, status: "completed" }
      ];
      localStorage.setItem("mentorPayouts", JSON.stringify(defaultPayouts));
      setTimeout(() => setPayouts(defaultPayouts), 0);
    }
  }, []);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid payout amount.");
      return;
    }

    if (amount > earnings) {
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

    // Deduct funds
    const nextEarnings = earnings - amount;
    setEarnings(nextEarnings);
    localStorage.setItem("mentorEarnings", String(nextEarnings));

    // Add Payout Log
    const newPayout: PayoutLog = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0],
      account: accountNumber,
      method: `${payoutMethod} Payout`,
      amount,
      status: "pending"
    };

    const updatedLogs = [newPayout, ...payouts];
    setPayouts(updatedLogs);
    localStorage.setItem("mentorPayouts", JSON.stringify(updatedLogs));

    setSuccess(true);
    setPayoutAmount("");
    setAccountNumber("");
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 animate-scale-up">
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Earnings & Payouts</h1>
        <p className="text-xs text-muted-foreground">Monitor your consultation tutoring earnings and request cash-outs to your bKash or Nagad wallet.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Earnings Status & Cashout Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Balance card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Withdrawable Balance</p>
              <p className="text-3xl font-black text-foreground">৳{earnings.toLocaleString()} BDT</p>
              <p className="text-[10px] text-muted-foreground">Accumulated from 1-on-1 calls and course package enrollments.</p>
            </div>
            <span className="text-4xl">💸</span>
          </div>

          {/* Cashout Request form */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Request Mobile Cash-Out</h2>
            
            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center">
                ✓ Payout request submitted! Admin will transfer funds within 24 hours.
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center leading-normal">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              {/* Method select */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">Select Payment Wallet</label>
                <div className="grid grid-cols-2 gap-3">
                  {["bKash", "Nagad"].map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPayoutMethod(m as "bKash" | "Nagad")}
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

              {/* Account Number */}
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

              {/* Amount BDT */}
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

        {/* Right Column: Payouts Logs spreadsheet */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold tracking-tight">Payout History logs</h2>
          
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border/80 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-3">Reference ID</th>
                    <th className="p-3">Wallet</th>
                    <th className="p-3 text-right">Amount (BDT)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {payouts.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-semibold text-foreground">
                        <div>
                          <p className="font-bold">{log.id}</p>
                          <p className="text-[8px] text-muted-foreground mt-0.5">{log.date}</p>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <div>
                          <p className="text-[10px] font-medium text-foreground">{log.method}</p>
                          <p className="text-[8px] mt-0.5">{log.account}</p>
                        </div>
                      </td>
                      <td className="p-3 text-right font-bold text-foreground">৳{log.amount.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                          log.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
