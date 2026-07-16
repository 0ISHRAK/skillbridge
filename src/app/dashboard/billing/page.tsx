"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Invoice {
  id: string;
  date: string;
  item: string;
  method: string;
  amount: number;
  status: "paid" | "failed";
}

interface SubscriptionInfo {
  plan: string | null;
  status: string | null;
  expiry: string | null;
  isActive: boolean;
}

export default function BillingPage() {
  const [tokenBalance, setTokenBalance] = useState(30);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Local state for payment modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPack, setSelectedPack] = useState<{ tokens: number; price: number } | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<"bKash" | "Nagad" | "Rocket">("bKash");
  const [step, setStep] = useState(1);
  const [accountNumber, setAccountNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  const packages = [
    { tokens: 5, price: 500, label: "Starter Pack" },
    { tokens: 10, price: 950, label: "Standard Pack (5% Off)" },
    { tokens: 20, price: 1800, label: "Pro Learner Pack (10% Off)" }
  ];

  useEffect(() => {
    const balance = localStorage.getItem("tokenBalance");
    if (balance) {
      setTimeout(() => setTokenBalance(Number(balance)), 0);
    } else {
      localStorage.setItem("tokenBalance", "30");
    }

    const savedInvoices = localStorage.getItem("billingInvoices");
    if (savedInvoices) {
      setTimeout(() => setInvoices(JSON.parse(savedInvoices)), 0);
    } else {
      const defaultInvoices: Invoice[] = [
        { id: "INV-1024", date: "2026-07-01", item: "10 Skill Tokens Package", method: "bKash Sandbox", amount: 950, status: "paid" },
        { id: "INV-1002", date: "2026-06-15", item: "MERN Course Sandbox Enrollment", method: "Nagad Sandbox", amount: 2500, status: "paid" }
      ];
      localStorage.setItem("billingInvoices", JSON.stringify(defaultInvoices));
      setTimeout(() => setInvoices(defaultInvoices), 0);
    }
  }, []);

  useEffect(() => {
    fetch("/api/subscription/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.subscription) setSubscription(data.subscription);
      })
      .catch(() => {});
  }, []);

  const handleCancelSubscription = async () => {
    if (!confirm("Cancel your All-Access subscription? You keep access until the expiry date.")) return;
    setIsCancelling(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      const data = await res.json();
      if (res.ok) setSubscription(data.subscription);
      else alert(data.error || "Failed to cancel.");
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenCheckout = (pack: { tokens: number; price: number }) => {
    setSelectedPack(pack);
    setStep(1);
    setAccountNumber("");
    setOtp("");
    setPin("");
    setCheckoutError("");
    setShowCheckout(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (step === 1) {
      if (accountNumber.length !== 11 || !accountNumber.startsWith("01")) {
        setCheckoutError("Please enter a valid 11-digit mobile wallet number.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (otp !== "123456") {
        setCheckoutError("Invalid OTP. Use mock code: 123456");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (pin !== "12345") {
        setCheckoutError("Invalid PIN. Use mock pin: 12345");
        return;
      }

      // Success! Update wallet balance
      if (selectedPack) {
        const nextBalance = tokenBalance + selectedPack.tokens;
        setTokenBalance(nextBalance);
        localStorage.setItem("tokenBalance", String(nextBalance));

        // Append to invoice logs
        const newInvoice: Invoice = {
          id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          item: `${selectedPack.tokens} Skill Tokens Package`,
          method: `${paymentGateway} Sandbox`,
          amount: selectedPack.price,
          status: "paid"
        };

        const updatedInvoices = [newInvoice, ...invoices];
        setInvoices(updatedInvoices);
        localStorage.setItem("billingInvoices", JSON.stringify(updatedInvoices));
      }

      alert("Tokens added to wallet successfully!");
      setShowCheckout(false);
    }
  };

  return (
    <div className="space-y-8 animate-scale-up">
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Wallet & Billing Transactions</h1>
        <p className="text-xs text-muted-foreground">Recharge your token balance, view payment logs, and check invoices.</p>
      </div>

      {/* Subscription Status Widget */}
      {subscription !== null && (
        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          subscription.isActive
            ? "bg-emerald-500/5 border-emerald-500/20"
            : "bg-card border-border"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
              subscription.isActive ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-muted border border-border"
            }`}>
              {subscription.isActive ? "✓" : "📋"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-foreground">Course All-Access Pass</p>
                {subscription.isActive && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Active
                  </span>
                )}
                {subscription.status === "cancelled" && subscription.isActive && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Cancels at expiry
                  </span>
                )}
              </div>
              {subscription.isActive && subscription.expiry ? (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Access expires: <span className="font-semibold text-foreground">{new Date(subscription.expiry).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground mt-0.5">Subscribe to unlock all courses for ৳799/month</p>
              )}
            </div>
          </div>

          {subscription.isActive && subscription.status === "active" ? (
            <button
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              className="px-4 py-2 text-xs font-bold rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              {isCancelling ? "Cancelling..." : "Cancel Subscription"}
            </button>
          ) : !subscription.isActive ? (
            <Link
              href="/pricing#subscription"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm shrink-0"
            >
              Subscribe · ৳799/mo
            </Link>
          ) : null}
        </div>
      )}

      {/* Wallet Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Wallet Balance widget */}
        <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between md:col-span-1 shadow-sm">
          <div className="space-y-3">
            <span className="text-3xl">💳</span>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Available Balance</p>
            <p className="text-3xl font-black text-foreground">{tokenBalance} Tokens</p>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Used to schedule 1-on-1 mentor sessions. Average cost is 1-2 tokens per session.
            </p>
          </div>
        </div>

        {/* Buy Tokens Quick list */}
        <div className="p-6 rounded-2xl bg-card border border-border md:col-span-2 shadow-sm space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Purchase Token Packs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {packages.map((pack, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-border bg-background hover:border-primary/50 transition-all flex flex-col justify-between text-center relative overflow-hidden"
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{pack.label}</p>
                  <p className="text-lg font-black text-primary">{pack.tokens} Tokens</p>
                  <p className="text-xs font-bold text-foreground">৳{pack.price.toLocaleString()} BDT</p>
                </div>
                <button
                  onClick={() => handleOpenCheckout(pack)}
                  className="w-full h-8 mt-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold shadow-sm cursor-pointer"
                >
                  Buy Pack
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Logs */}
      <div className="space-y-4">
        <h2 className="text-sm font-black tracking-wider text-muted-foreground uppercase">Transaction History</h2>
        
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border/80 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Item Details</th>
                  <th className="p-4">Payment Channel</th>
                  <th className="p-4 text-right">Amount (BDT)</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-bold text-foreground">{inv.id}</td>
                    <td className="p-4 text-muted-foreground">{inv.date}</td>
                    <td className="p-4 text-foreground font-semibold">{inv.item}</td>
                    <td className="p-4 text-muted-foreground">{inv.method}</td>
                    <td className="p-4 text-right font-bold text-foreground">৳{inv.amount.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Local Payment gateway sandbox simulation */}
      {showCheckout && selectedPack && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-scale-up">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-red-500 to-amber-500" />
            
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">MFS Payment Sandbox</h3>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 mt-4">
              {/* Payment Methods select */}
              {step === 1 && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">Select Payment Gateway</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["bKash", "Nagad", "Rocket"].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setPaymentGateway(m as "bKash" | "Nagad" | "Rocket")}
                        className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                          paymentGateway === m
                            ? "bg-primary border-primary text-primary-foreground shadow-sm"
                            : "bg-background border-border text-muted-foreground hover:border-primary"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step Title description */}
              <div className="p-3 bg-muted/40 border border-border rounded-xl text-center text-xs">
                <p className="font-bold text-foreground">Recharging {selectedPack.tokens} Skill Tokens</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Amount: <span className="font-semibold text-primary">৳{selectedPack.price.toLocaleString()} BDT</span></p>
              </div>

              {checkoutError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-semibold text-center leading-normal animate-pulse-subtle">
                  ⚠️ {checkoutError}
                </div>
              )}

              {/* INPUT FIELDS DEP ON STEP */}
              {step === 1 && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Your {paymentGateway} Account Number
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    required
                    placeholder="e.g. 01712345678"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-sm font-bold p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block text-center">
                    Enter Verification OTP (Use Code: <span className="font-bold text-primary">123456</span>)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center tracking-widest text-sm font-bold p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block text-center">
                    Enter Account PIN (Use Code: <span className="font-bold text-primary">12345</span>)
                  </label>
                  <input
                    type="password"
                    maxLength={5}
                    required
                    placeholder="•••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center tracking-widest text-sm font-bold p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md cursor-pointer"
              >
                {step === 1 ? "Get OTP code" : step === 2 ? "Verify OTP" : "Confirm payment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
