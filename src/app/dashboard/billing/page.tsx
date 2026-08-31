"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface Invoice {
  id: string;
  shortId: string;
  date: string;
  fullDate?: string;
  rawType: string;
  category: string;
  item: string;
  method: string;
  trxId: string;
  amount: number;
  status: "paid" | "failed" | "pending" | "refunded";
  customerName?: string;
  customerEmail?: string;
}

interface SubscriptionInfo {
  plan: string | null;
  status: string | null;
  expiry: string | null;
  isActive: boolean;
}

interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  label: string;
  badge?: string;
  bonus?: string;
  perToken: string;
  popular?: boolean;
}

export default function BillingPage() {
  const [tokenBalance, setTokenBalance] = useState(28);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Search and Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "tokens" | "subscription" | "course" | "mentorship">("all");

  // Promo code redemption
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // MFS Payment Modal state
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<"token_pack" | "subscription">("token_pack");
  const [selectedPack, setSelectedPack] = useState<TokenPackage | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<"bKash" | "Nagad" | "Rocket">("bKash");
  const [step, setStep] = useState(1);
  const [accountNumber, setAccountNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{ title: string; desc: string } | null>(null);

  const packages: TokenPackage[] = [
    {
      id: "pack-50",
      tokens: 50,
      price: 500,
      label: "Starter Pack",
      perToken: "৳10.00 / token",
      bonus: "Standard Rate",
    },
    {
      id: "pack-120",
      tokens: 120,
      price: 1000,
      label: "Accelerator Pack",
      badge: "⚡ MOST POPULAR",
      bonus: "+20% Bonus Tokens",
      perToken: "৳8.33 / token",
      popular: true,
    },
    {
      id: "pack-320",
      tokens: 320,
      price: 2500,
      label: "Professional Pack",
      badge: "👑 BEST VALUE",
      bonus: "+28% Bonus Tokens",
      perToken: "৳7.81 / token",
    },
  ];

  const refetchBillingData = async () => {
    try {
      const [walletRes, subRes] = await Promise.all([
        fetch("/api/wallet"),
        fetch("/api/subscription/status"),
      ]);

      if (walletRes.ok) {
        const data = await walletRes.json();
        setTokenBalance(data.tokenBalance ?? 0);
        setInvoices(data.invoices || []);
        localStorage.setItem("tokenBalance", String(data.tokenBalance ?? 0));
      }

      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.subscription) setSubscription(subData.subscription);
      }
    } catch (err) {
      console.error("Failed to refetch billing data:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch("/api/wallet").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/subscription/status").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([walletData, subData]) => {
        if (!isMounted) return;
        if (walletData) {
          setTokenBalance(walletData.tokenBalance ?? 0);
          setInvoices(walletData.invoices || []);
          localStorage.setItem("tokenBalance", String(walletData.tokenBalance ?? 0));
        }
        if (subData?.subscription) {
          setSubscription(subData.subscription);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyId = (id: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Cancel your All-Access subscription? You keep access until the expiry date.")) return;
    setIsCancelling(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSubscription(data.subscription);
        alert("Subscription cancelled successfully. You keep all benefits until expiry.");
      } else {
        alert(data.error || "Failed to cancel.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenPackCheckout = (pack: TokenPackage) => {
    setCheckoutMode("token_pack");
    setSelectedPack(pack);
    setStep(1);
    setAccountNumber("");
    setOtp("");
    setPin("");
    setCheckoutError("");
    setPaymentSuccessData(null);
    setShowCheckout(true);
  };

  const handleOpenSubscriptionCheckout = () => {
    setCheckoutMode("subscription");
    setSelectedPack(null);
    setStep(1);
    setAccountNumber("");
    setOtp("");
    setPin("");
    setCheckoutError("");
    setPaymentSuccessData(null);
    setShowCheckout(true);
  };

  const handleRedeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoMessage(null);

    try {
      const res = await fetch("/api/wallet/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setPromoMessage({ type: "success", text: data.message });
        if (data.tokenBalance !== undefined) {
          setTokenBalance(data.tokenBalance);
        }
        setPromoCode("");
        void refetchBillingData();
      } else {
        setPromoMessage({ type: "error", text: data.error || "Failed to redeem code." });
      }
    } catch {
      setPromoMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setPromoLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (step === 1) {
      if (accountNumber.length !== 11 || !accountNumber.startsWith("01")) {
        setCheckoutError("Please enter a valid 11-digit Bangladeshi mobile wallet number (e.g. 01712345678).");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (otp !== "123456") {
        setCheckoutError("Invalid verification code. For sandbox testing, use OTP: 123456");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (pin !== "12345") {
        setCheckoutError("Invalid account PIN. For sandbox testing, use PIN: 12345");
        return;
      }

      setIsProcessing(true);

      try {
        const txnId = `SB-${paymentGateway.toUpperCase()}-${Date.now().toString().slice(-6)}`;

        if (checkoutMode === "token_pack" && selectedPack) {
          const res = await fetch("/api/wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tokens: selectedPack.tokens,
              amount: selectedPack.price,
              gateway: paymentGateway,
              gatewayTxnId: txnId,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setCheckoutError(data.error || "Unable to complete token recharge.");
            setIsProcessing(false);
            return;
          }
          setTokenBalance(data.tokenBalance);
          setPaymentSuccessData({
            title: `🪙 +${selectedPack.tokens} Tokens Added!`,
            desc: `৳${selectedPack.price.toLocaleString()} BDT charged via ${paymentGateway} (TrxID: ${txnId}).`,
          });
        } else if (checkoutMode === "subscription") {
          const res = await fetch("/api/subscription/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gatewayTxnId: `${paymentGateway}:${txnId}`,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setCheckoutError(data.error || "Unable to activate subscription.");
            setIsProcessing(false);
            return;
          }
          setSubscription(data.subscription);
          setPaymentSuccessData({
            title: "👑 Course All-Access Pass Activated!",
            desc: `৳799 BDT charged via ${paymentGateway}. Unlimited access unlocked for 30 days.`,
          });
        }

        void refetchBillingData();
      } catch {
        setCheckoutError("Network error while processing payment. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesCategory =
        activeTab === "all" ||
        (activeTab === "tokens" && (inv.category === "tokens" || inv.rawType === "wallet_topup")) ||
        (activeTab === "subscription" && (inv.category === "subscription" || inv.rawType === "subscription")) ||
        (activeTab === "course" && (inv.category === "course" || inv.rawType === "course_enrollment")) ||
        (activeTab === "mentorship" && (inv.category === "mentorship" || inv.rawType === "mentor_booking"));

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        inv.id.toLowerCase().includes(query) ||
        inv.shortId.toLowerCase().includes(query) ||
        inv.item.toLowerCase().includes(query) ||
        inv.method.toLowerCase().includes(query) ||
        inv.trxId.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [invoices, activeTab, searchQuery]);

  return (
    <div className="space-y-8 animate-scale-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              💳 Finance & Token Hub
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">1 Token = ৳10 BDT</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Wallet & Billing Transactions</h1>
          <p className="text-xs text-muted-foreground">
            Manage your Skill Tokens balance, view itemized payment receipts, and configure subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/rewards"
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-muted/60 hover:bg-muted text-foreground border border-border transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>🎁</span> Rewards Store
          </Link>
          <Link
            href="/explore?tab=mentors"
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
          >
            <span>👨‍🏫</span> Book Mentor
          </Link>
        </div>
      </div>

      {/* Course All-Access Pass Banner */}
      <div
        className={`p-6 rounded-2xl border relative overflow-hidden transition-all shadow-sm ${
          subscription?.isActive
            ? "bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30"
            : "bg-linear-to-r from-indigo-500/10 via-purple-500/5 to-card border-indigo-500/20"
        }`}
      >
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm ${
                subscription?.isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
              }`}
            >
              {subscription?.isActive ? "👑" : "💎"}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-extrabold text-foreground tracking-tight">Course All-Access Pass</h3>
                {subscription?.isActive ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active Member
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    ৳799 / month
                  </span>
                )}
                {subscription?.status === "cancelled" && subscription?.isActive && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Cancels at expiry
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                {subscription?.isActive && subscription.expiry ? (
                  <>
                    Your subscription is active until{" "}
                    <span className="font-bold text-foreground">
                      {new Date(subscription.expiry).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    . Enjoy unrestricted access to all 30+ project courses and verified certificates.
                  </>
                ) : (
                  "Unlock unlimited learning across 30+ full-stack, design, AI, and freelancing masterclasses with zero individual course fees."
                )}
              </p>

              {/* Perks pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  "✨ All 30+ Courses",
                  "📜 Verified Certificates with QR",
                  "🤝 0% Skill Swap Fees",
                  "⚡ Priority Mentor Q&A",
                ].map((perk, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-background/80 text-foreground/80 border border-border/80"
                  >
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 w-full lg:w-auto justify-end">
            {subscription?.isActive && subscription.status === "active" ? (
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="px-4 py-2.5 text-xs font-bold rounded-xl border border-destructive/40 text-destructive hover:bg-destructive/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {isCancelling ? "Cancelling..." : "Cancel Auto-Renew"}
              </button>
            ) : !subscription?.isActive ? (
              <button
                onClick={handleOpenSubscriptionCheckout}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-extrabold rounded-xl bg-linear-to-r from-primary via-indigo-600 to-primary hover:opacity-95 text-primary-foreground transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>👑</span> Unlock Pass · ৳799/mo
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Wallet Balance & Packs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Balance & Voucher Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Balance Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-3xl">🪙</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Live Balance
                </span>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Available Tokens</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <p className="text-3xl font-black text-foreground tracking-tight">{tokenBalance} Tokens</p>
                </div>
                <p className="text-xs font-bold text-primary mt-1">
                  ≈ ৳{(tokenBalance * 10).toLocaleString()} BDT Equivalent
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p className="font-semibold text-foreground">💡 How Tokens Work:</p>
                <p>
                  Tokens are calibrated at <span className="font-bold text-foreground">1 Token = ৳10 BDT</span>. Used for
                  booking 1-on-1 mentor sessions (typically 50–120 tokens) or redeeming career vouchers.
                </p>
              </div>
            </div>
          </div>

          {/* Promo / Voucher Code Box */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Redeem Voucher Code</h3>
              <span className="text-xs">🎟️</span>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Enter promotional or event codes to claim bonus tokens or verify reward vouchers.
            </p>

            <form onSubmit={handleRedeemPromo} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME25"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 text-xs font-bold px-3 py-2.5 rounded-xl border border-input bg-background text-foreground uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={promoLoading || !promoCode.trim()}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  {promoLoading ? "Checking..." : "Redeem"}
                </button>
              </div>

              {promoMessage && (
                <div
                  className={`p-2.5 rounded-lg text-[10px] font-semibold border ${
                    promoMessage.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-destructive/10 border-destructive/20 text-destructive"
                  }`}
                >
                  {promoMessage.type === "success" ? "✓ " : "⚠️ "}
                  {promoMessage.text}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[9px] text-muted-foreground font-semibold">Try codes:</span>
                {["WELCOME25", "SKILL50", "BANGLADESH2026"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setPromoCode(code)}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-primary border border-border/60 transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Purchase Token Packs */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-card border border-border shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Purchase Token Packs</h2>
              <p className="text-xs text-muted-foreground">Instant recharge via bKash, Nagad, or Rocket mobile wallets.</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
              ✓ Instant 0-Fee Recharge
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pack) => (
              <div
                key={pack.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between text-center relative overflow-hidden group ${
                  pack.popular
                    ? "bg-linear-to-b from-primary/10 via-card to-card border-primary/40 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                    : "bg-background/60 hover:bg-background border-border hover:border-primary/40"
                }`}
              >
                {pack.badge && (
                  <div className="absolute top-0 inset-x-0 bg-linear-to-r from-primary to-indigo-600 text-primary-foreground text-[9px] font-black tracking-widest uppercase py-0.5 shadow-sm">
                    {pack.badge}
                  </div>
                )}

                <div className={`space-y-3 ${pack.badge ? "pt-3" : ""}`}>
                  <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">{pack.label}</p>
                  
                  <div>
                    <p className="text-3xl font-black text-foreground tracking-tight">{pack.tokens}</p>
                    <p className="text-[11px] font-extrabold text-primary">Skill Tokens</p>
                  </div>

                  <div className="pt-1 border-t border-border/60">
                    <p className="text-lg font-black text-foreground">৳{pack.price.toLocaleString()} BDT</p>
                    <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">{pack.perToken}</p>
                  </div>

                  <div className="px-2 py-1 rounded-lg bg-muted/60 text-[10px] font-bold text-foreground/90 border border-border/60">
                    {pack.bonus}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenPackCheckout(pack)}
                  className={`w-full h-9 mt-5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm ${
                    pack.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/20"
                      : "bg-muted hover:bg-primary hover:text-primary-foreground text-foreground border border-border hover:border-primary"
                  }`}
                >
                  Buy Pack
                </button>
              </div>
            ))}
          </div>

          {/* Payment gateway support badges */}
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground">Supported Local Payment Gateways:</span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#E2136E]/10 text-[#E2136E] border border-[#E2136E]/20">
                bKash
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#F7941D]/10 text-[#F7941D] border border-[#F7941D]/20">
                Nagad
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#8C3494]/10 text-[#8C3494] border border-[#8C3494]/20">
                Rocket
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Visa / Mastercard
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Transaction & Invoice History</h2>
            <p className="text-xs text-muted-foreground">
              Official audit log of your purchases, subscriptions, and course enrollments.
            </p>
          </div>

          {/* Filter tabs and search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "tokens", label: "Tokens" },
                  { key: "subscription", label: "Pass" },
                  { key: "course", label: "Courses" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    activeTab === tab.key
                      ? "bg-background text-foreground shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search invoice / TrxID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-52 px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Item Details</th>
                  <th className="p-4">Channel / TrxID</th>
                  <th className="p-4 text-right">Amount (BDT)</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <span className="text-2xl block mb-2">📄</span>
                      No transactions found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isBkash = inv.method.toLowerCase().includes("bkash");
                    const isNagad = inv.method.toLowerCase().includes("nagad");
                    const isRocket = inv.method.toLowerCase().includes("rocket");

                    return (
                      <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                        {/* Short Invoice ID with copy */}
                        <td className="p-4 font-mono font-bold text-foreground">
                          <button
                            onClick={() => handleCopyId(inv.id, inv.shortId || inv.id)}
                            className="group flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition-colors text-left"
                            title="Click to copy Invoice ID"
                          >
                            <span>{inv.shortId || `#INV-${inv.id.slice(0, 8)}`}</span>
                            <span className="text-[10px] text-muted-foreground opacity-60 group-hover:opacity-100">
                              {copiedId === inv.id ? "✓ Copied" : "📋"}
                            </span>
                          </button>
                        </td>

                        {/* Date */}
                        <td className="p-4 text-muted-foreground font-medium">
                          {inv.date}
                        </td>

                        {/* Item Details */}
                        <td className="p-4 text-foreground font-bold">
                          <div className="flex items-center gap-2">
                            <span>{inv.item}</span>
                          </div>
                        </td>

                        {/* Payment Channel */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                                isBkash
                                  ? "bg-[#E2136E]/10 text-[#E2136E] border border-[#E2136E]/20"
                                  : isNagad
                                  ? "bg-[#F7941D]/10 text-[#F7941D] border border-[#F7941D]/20"
                                  : isRocket
                                  ? "bg-[#8C3494]/10 text-[#8C3494] border border-[#8C3494]/20"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}
                            >
                              {inv.method}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[90px]" title={inv.trxId}>
                              {inv.trxId}
                            </span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="p-4 text-right font-black text-foreground">
                          ৳{inv.amount.toLocaleString()} BDT
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              inv.status === "paid"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : inv.status === "pending"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-destructive/10 text-destructive border border-destructive/20"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>

                        {/* Receipt Action */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground text-foreground border border-border hover:border-primary transition-all cursor-pointer"
                          >
                            🧾 Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Digital Receipt / Tax Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-scale-up space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-black text-xs">
                    SB
                  </div>
                  <h3 className="text-base font-black text-foreground tracking-tight">Official Payment Receipt</h3>
                </div>
                <p className="text-[10px] text-muted-foreground">SkillBridge Bangladesh Ltd. · TIN: 8472-9104-BD</p>
              </div>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Invoice Number:</span>
                <span className="font-mono font-bold text-foreground">{selectedInvoice.shortId || selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Billing Date:</span>
                <span className="font-semibold text-foreground">{selectedInvoice.fullDate || selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Payment Channel:</span>
                <span className="font-bold text-primary">{selectedInvoice.method} ({selectedInvoice.trxId})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Customer:</span>
                <span className="font-semibold text-foreground">{selectedInvoice.customerName || "SkillBridge Student"}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-border/80 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/60 text-[10px] uppercase font-bold text-muted-foreground">
                  <tr>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-3 font-semibold text-foreground">{selectedInvoice.item}</td>
                    <td className="p-3 text-right font-bold text-foreground">৳{selectedInvoice.amount.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-muted/20">
                    <td className="p-3 text-muted-foreground">Digital Education VAT (0%)</td>
                    <td className="p-3 text-right text-muted-foreground">৳0</td>
                  </tr>
                  <tr className="bg-primary/5 font-black text-sm">
                    <td className="p-3 text-foreground">Total Paid:</td>
                    <td className="p-3 text-right text-primary">৳{selectedInvoice.amount.toLocaleString()} BDT</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Status Stamp */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black">
                <span>✓</span> PAID IN FULL
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer"
                >
                  🖨️ Print Receipt
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Local MFS Payment gateway sandbox simulation */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-scale-up space-y-5">
            {/* Top Gateway Accent Line */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 transition-colors ${
                paymentGateway === "bKash"
                  ? "bg-[#E2136E]"
                  : paymentGateway === "Nagad"
                  ? "bg-[#F7941D]"
                  : "bg-[#8C3494]"
              }`}
            />

            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {paymentGateway === "bKash" ? "📱" : paymentGateway === "Nagad" ? "🔥" : "🚀"}
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                  {paymentGateway} Secure MFS Gateway
                </h3>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {paymentSuccessData ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl mx-auto">
                  ✓
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-foreground">{paymentSuccessData.title}</h4>
                  <p className="text-xs text-muted-foreground">{paymentSuccessData.desc}</p>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="w-full h-10 font-bold text-xs rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md cursor-pointer"
                >
                  Back to Wallet
                </button>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {/* Gateway Selector on Step 1 */}
                {step === 1 && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Select Payment Wallet
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["bKash", "Nagad", "Rocket"] as const).map((m) => {
                        const isSelected = paymentGateway === m;
                        return (
                          <button
                            type="button"
                            key={m}
                            onClick={() => setPaymentGateway(m)}
                            className={`py-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                              isSelected
                                ? m === "bKash"
                                  ? "bg-[#E2136E]/15 border-[#E2136E] text-[#E2136E]"
                                  : m === "Nagad"
                                  ? "bg-[#F7941D]/15 border-[#F7941D] text-[#F7941D]"
                                  : "bg-[#8C3494]/15 border-[#8C3494] text-[#8C3494]"
                                : "bg-background border-border text-muted-foreground hover:border-foreground/40"
                            }`}
                          >
                            <span>{m === "bKash" ? "🌸" : m === "Nagad" ? "🔥" : "🚀"}</span>
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price summary badge */}
                <div className="p-3.5 bg-muted/40 border border-border rounded-xl text-center text-xs space-y-0.5">
                  <p className="font-extrabold text-foreground">
                    {checkoutMode === "token_pack" && selectedPack
                      ? `Recharging ${selectedPack.tokens} Skill Tokens`
                      : "Course All-Access Pass (Monthly)"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Total Amount:{" "}
                    <span className="font-black text-primary">
                      ৳
                      {checkoutMode === "token_pack" && selectedPack
                        ? selectedPack.price.toLocaleString()
                        : "799"}{" "}
                      BDT
                    </span>
                  </p>
                </div>

                {checkoutError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-semibold text-center leading-normal">
                    ⚠️ {checkoutError}
                  </div>
                )}

                {/* Step 1: Phone */}
                {step === 1 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-muted-foreground block">
                      Your {paymentGateway} Mobile Number
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      required
                      placeholder="e.g. 01712345678"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-center text-sm font-bold p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-[10px] text-muted-foreground text-center">
                      Enter any 11-digit Bangladeshi number (starts with 01)
                    </p>
                  </div>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-muted-foreground block text-center">
                      Enter 6-Digit SMS Verification OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-center tracking-widest text-base font-black p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-[10px] text-primary font-bold text-center">
                      Sandbox Test Code: <span className="underline">123456</span>
                    </p>
                  </div>
                )}

                {/* Step 3: PIN */}
                {step === 3 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-muted-foreground block text-center">
                      Enter {paymentGateway} Account PIN
                    </label>
                    <input
                      type="password"
                      maxLength={5}
                      required
                      placeholder="•••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-center tracking-widest text-base font-black p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-[10px] text-primary font-bold text-center">
                      Sandbox Test PIN: <span className="underline">12345</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-11 flex items-center justify-center font-black text-xs rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isProcessing
                    ? "Processing Payment..."
                    : step === 1
                    ? "Proceed & Get OTP"
                    : step === 2
                    ? "Verify OTP Code"
                    : "Confirm & Complete Payment"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
