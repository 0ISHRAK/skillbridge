"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PricingPlan {
  name: string;
  price: number;
  tokens: string;
  description: string;
  features: string[];
  popular: boolean;
}

export default function PricingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Payment states
  const [paymentStep, setPaymentStep] = useState<"method" | "number" | "otp" | "pin" | "success">("method");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "rocket" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Subscription modal states
  const [isSubCheckoutOpen, setIsSubCheckoutOpen] = useState(false);
  const [subStep, setSubStep] = useState<"method" | "number" | "otp" | "pin" | "success">("method");
  const [subMethod, setSubMethod] = useState<"bkash" | "nagad" | "rocket" | null>(null);
  const [subPhone, setSubPhone] = useState("");
  const [subOtp, setSubOtp] = useState("");
  const [subPin, setSubPin] = useState("");
  const [subTxnId, setSubTxnId] = useState("");
  const [subError, setSubError] = useState("");
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => { if (data.user?.id) setIsLoggedIn(true); })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  const plans = [
    {
      name: "Starter Pack",
      price: 1000,
      tokens: "10 Skill Tokens",
      description: "Ideal for short-term projects, quick CV reviews, or booking 1-2 coding sessions.",
      features: [
        "10 Tokens added to wallet",
        "Book sessions with any mentor",
        "Direct chat support",
        "bKash & Nagad support",
        "Lifetime token validity",
      ],
      popular: false,
    },
    {
      name: "Accelerator Pack",
      price: 2700,
      tokens: "30 Skill Tokens",
      description: "Our most popular pack for university graduates preparing for software and PM job searches.",
      features: [
        "30 Tokens added to wallet",
        "10% discount included (৳300 savings)",
        "Priority queue scheduling",
        "Access to curriculum resources",
        "Direct chat support",
        "Lifetime token validity",
      ],
      popular: true,
    },
    {
      name: "Professional Pack",
      price: 8500,
      tokens: "100 Skill Tokens",
      description: "Best for ongoing long-term mentorship, career track transitions, or learning 3+ new skills.",
      features: [
        "100 Tokens added to wallet",
        "15% discount included (৳1,500 savings)",
        "Direct Slack channels access",
        "Weekly project reviews",
        "Dedicated account manager",
        "Lifetime token validity",
      ],
      popular: false,
    },
  ];

  const handleBuyClick = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
    setPaymentStep("method");
    setPaymentMethod(null);
    setPhoneNumber("");
    setOtp("");
    setPin("");
    setTransactionId("");
  };

  const handleSelectMethod = (method: "bkash" | "nagad" | "rocket") => {
    setPaymentMethod(method);
    setPaymentStep("number");
  };

  const handleNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length === 11) {
      setPaymentStep("otp");
    } else {
      alert("Please enter a valid 11-digit mobile number.");
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setPaymentStep("pin");
    } else {
      alert("Please enter the 6-digit OTP code.");
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length >= 4) {
      setTransactionId(`PR-${Math.floor(Math.random() * 899999 + 100000)}`);
      setPaymentStep("success");
    } else {
      alert("Please enter your transaction PIN.");
    }
  };

  const openSubCheckout = () => {
    if (!authChecked) return; // still verifying session, ignore click
    if (!isLoggedIn) {
      router.push("/auth?mode=login&redirect=/pricing%23subscription");
      return;
    }
    setSubStep("method");
    setSubMethod(null);
    setSubPhone("");
    setSubOtp("");
    setSubPin("");
    setSubTxnId("");
    setSubError("");
    setIsSubCheckoutOpen(true);
  };

  const handleSubPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subPin.length < 4) {
      setSubError("Please enter your transaction PIN.");
      return;
    }
    setSubLoading(true);
    setSubError("");
    const txnId = `SUB-${Math.floor(100000 + Math.random() * 899999)}`;
    try {
      const res = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gatewayTxnId: txnId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setSubError("Your session has expired. Please log in again.");
          setIsLoggedIn(false);
        } else {
          setSubError(data.error || "Subscription failed. Please try again.");
        }
        return;
      }
      setSubTxnId(txnId);
      setSubStep("success");
    } catch {
      setSubError("Network error. Please try again.");
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16">
      {/* Header */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">Flexible Pricing Options</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Choose how you learn. Subscribe monthly to access all courses, or buy <span className="font-bold text-foreground">Skill Tokens</span> to book 1-on-1 mentor sessions and pay per course.
        </p>
      </section>

      {/* All-Access Subscription Banner */}
      <section id="subscription" className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card shadow-xl shadow-primary/10 p-8 md:p-10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
          <span className="absolute -top-3 left-8 bg-primary text-primary-foreground font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
            New — Course All-Access Pass
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight">Unlimited Courses<br/>One Monthly Price</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get full access to every published course on SkillBridge for a flat monthly fee. Learn at your own pace with no per-course charges.
              </p>
              <ul className="space-y-2">
                {[
                  "Unlimited access to all published courses",
                  "All future courses included automatically",
                  "Full lesson progress tracking",
                  "Pay via bKash, Nagad, or Rocket",
                  "Cancel anytime — access until expiry",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-primary font-bold">✓</span>
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-destructive font-bold">✗</span>
                  <span className="text-muted-foreground">1-on-1 mentor sessions (use tokens for those)</span>
                </li>
              </ul>
            </div>

            <div className="text-center space-y-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Plan</p>
                <p className="text-5xl font-black text-primary mt-1">৳799</p>
                <p className="text-xs text-muted-foreground mt-1">per month · cancel anytime</p>
              </div>
              <button
                onClick={openSubCheckout}
                className="w-full h-12 flex items-center justify-center font-bold text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
              >
                {!authChecked ? "Loading..." : isLoggedIn ? "Subscribe Now →" : "Log in to Subscribe →"}
              </button>
              <p className="text-[10px] text-muted-foreground">Secure simulated payment · No real charges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <hr className="flex-1 border-border" />
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Or buy token packs for sessions</span>
        <hr className="flex-1 border-border" />
      </div>

      {/* Pricing Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-8 rounded-2xl bg-card border flex flex-col justify-between relative transition-all duration-300 ${
              plan.popular
                ? "border-primary shadow-xl scale-[1.03] md:-translate-y-2"
                : "border-border shadow-sm hover:border-primary/50"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                Best Value Plan
              </span>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-xl">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <div className="border-t border-border/60 pt-4">
                <p className="text-xs text-muted-foreground font-medium">Token Amount</p>
                <p className="text-2xl font-extrabold text-foreground">{plan.tokens}</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold text-primary">৳{plan.price.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">one-time</span>
                </div>
              </div>

              <ul className="space-y-3 pt-4 border-t border-border/60">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <span className="text-primary font-bold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handleBuyClick(plan)}
                className={`w-full h-11 flex items-center justify-center font-bold text-sm rounded-lg transition-all ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/20"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                Buy with bKash / Nagad
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Subscription Checkout Modal */}
      {isSubCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-[10px] font-bold">S</div>
                <h3 className="font-bold text-sm text-zinc-100">All-Access Pass · ৳799/month</h3>
              </div>
              <button onClick={() => setIsSubCheckoutOpen(false)} className="text-zinc-400 hover:text-zinc-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-6">
              {subStep === "method" && (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-400 text-center font-medium">
                    Subscribe for <span className="font-bold text-zinc-200">All-Access Courses</span> at <span className="text-primary font-bold">৳799/month</span>
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {(["bkash", "nagad", "rocket"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => { setSubMethod(m); setSubStep("number"); }}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left text-zinc-200 group ${
                          m === "bkash" ? "border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10" :
                          m === "nagad" ? "border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10" :
                          "border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10"
                        }`}
                      >
                        <span className="font-bold text-sm flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full inline-block ${m === "bkash" ? "bg-rose-500" : m === "nagad" ? "bg-orange-500" : "bg-violet-600"}`} />
                          {m.charAt(0).toUpperCase() + m.slice(1)} Gateway
                        </span>
                        <span className={`text-xs font-semibold group-hover:translate-x-1 transition-transform ${m === "bkash" ? "text-rose-400" : m === "nagad" ? "text-orange-400" : "text-violet-400"}`}>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {subStep === "number" && (
                <form onSubmit={(e) => { e.preventDefault(); if (subPhone.length === 11) setSubStep("otp"); else setSubError("Enter a valid 11-digit number."); }} className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase text-white ${subMethod === "bkash" ? "bg-rose-500" : subMethod === "nagad" ? "bg-orange-500" : "bg-violet-600"}`}>
                      {subMethod}
                    </span>
                    <p className="text-xs text-zinc-300">Enter your {subMethod} account number</p>
                  </div>
                  {subError && <p className="text-[10px] text-destructive text-center font-semibold">{subError}</p>}
                  <input type="text" maxLength={11} placeholder="e.g. 017XXXXXXXX" required value={subPhone}
                    onChange={(e) => { setSubError(""); setSubPhone(e.target.value.replace(/\D/g, "")); }}
                    className="w-full text-center text-sm font-semibold p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                  />
                  <button type="submit" className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all">
                    Send Verification Code
                  </button>
                </form>
              )}

              {subStep === "otp" && (
                <form onSubmit={(e) => { e.preventDefault(); if (subOtp.length === 6) setSubStep("pin"); else setSubError("Enter the 6-digit OTP."); }} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-zinc-300">OTP Sent</p>
                    <p className="text-[10px] text-zinc-500">Code sent to {subPhone} (use any 6 digits for sandbox)</p>
                  </div>
                  {subError && <p className="text-[10px] text-destructive text-center font-semibold">{subError}</p>}
                  <input type="text" maxLength={6} placeholder="Enter 6-digit OTP" required value={subOtp}
                    onChange={(e) => { setSubError(""); setSubOtp(e.target.value.replace(/\D/g, "")); }}
                    className="w-full text-center tracking-widest text-sm font-bold p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                  />
                  <button type="submit" className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all">
                    Verify & Continue
                  </button>
                </form>
              )}

              {subStep === "pin" && (
                <form onSubmit={handleSubPinSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-zinc-300">Enter Account PIN</p>
                    <p className="text-[10px] text-zinc-500">Confirm ৳799/month All-Access subscription</p>
                  </div>
                  {subError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center space-y-1">
                      <p className="text-[10px] text-destructive font-semibold">{subError}</p>
                      {subError.includes("session") && (
                        <Link href="/auth?mode=login&redirect=/pricing%23subscription" className="text-[10px] text-primary underline font-bold">
                          Log in again →
                        </Link>
                      )}
                    </div>
                  )}
                  <input type="password" maxLength={5} placeholder="••••" required value={subPin}
                    onChange={(e) => { setSubError(""); setSubPin(e.target.value.replace(/\D/g, "")); }}
                    className="w-full text-center tracking-widest text-sm font-bold p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                  />
                  <button type="submit" disabled={subLoading}
                    className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {subLoading ? "Activating..." : "Activate Subscription (৳799)"}
                  </button>
                </form>
              )}

              {subStep === "success" && (
                <div className="text-center space-y-4 py-4">
                  <span className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-2xl flex items-center justify-center mx-auto">✓</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-zinc-100">All-Access Activated!</h4>
                    <p className="text-xs text-zinc-400">You now have unlimited access to all courses for 30 days.</p>
                    <p className="text-[10px] text-zinc-500 font-medium">Transaction Ref: {subTxnId}</p>
                  </div>
                  <div className="pt-2 space-y-2">
                    <Link href="/explore"
                      onClick={() => setIsSubCheckoutOpen(false)}
                      className="w-full h-9 flex items-center justify-center font-semibold text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/95 transition-all"
                    >
                      Browse All Courses →
                    </Link>
                    <Link href="/dashboard/billing"
                      onClick={() => setIsSubCheckoutOpen(false)}
                      className="w-full h-9 flex items-center justify-center font-semibold text-xs rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all"
                    >
                      View Subscription in Wallet
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Local Payment checkout Modal */}
      {isCheckoutOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl transition-all">
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-[10px] font-bold">
                  S
                </div>
                <h3 className="font-bold text-sm text-zinc-100">Checkout: {selectedPlan.name}</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6">
              {paymentStep === "method" && (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-400 text-center font-medium">
                    Purchase <span className="font-bold text-zinc-200">{selectedPlan.tokens}</span> for <span className="text-primary font-bold">৳{selectedPlan.price.toLocaleString()}</span>
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => handleSelectMethod("bkash")}
                      className="flex items-center justify-between p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all text-left text-zinc-200 group"
                    >
                      <span className="font-bold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                        bKash Gateway
                      </span>
                      <span className="text-xs text-rose-400 font-semibold group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <button
                      onClick={() => handleSelectMethod("nagad")}
                      className="flex items-center justify-between p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-all text-left text-zinc-200 group"
                    >
                      <span className="font-bold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
                        Nagad Gateway
                      </span>
                      <span className="text-xs text-orange-400 font-semibold group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <button
                      onClick={() => handleSelectMethod("rocket")}
                      className="flex items-center justify-between p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 transition-all text-left text-zinc-200 group"
                    >
                      <span className="font-bold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block"></span>
                        Rocket Gateway
                      </span>
                      <span className="text-xs text-violet-400 font-semibold group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === "number" && (
                <form onSubmit={handleNumberSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase text-white ${
                      paymentMethod === "bkash" ? "bg-rose-500" : paymentMethod === "nagad" ? "bg-orange-500" : "bg-violet-600"
                    }`}>
                      {paymentMethod}
                    </span>
                    <p className="text-xs text-zinc-300">Enter your {paymentMethod} Account Number</p>
                  </div>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="e.g. 017XXXXXXXX"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-sm font-semibold p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all"
                  >
                    Send Verification Code
                  </button>
                </form>
              )}

              {paymentStep === "otp" && (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-zinc-300">OTP Sent</p>
                    <p className="text-[10px] text-zinc-500">We have sent a verification code to {phoneNumber}</p>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center tracking-widest text-sm font-bold p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all"
                  >
                    Verify & Continue
                  </button>
                </form>
              )}

              {paymentStep === "pin" && (
                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-zinc-300">Enter Account PIN</p>
                  </div>
                  <input
                    type="password"
                    maxLength={5}
                    placeholder="••••"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center tracking-widest text-sm font-bold p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md"
                  >
                    Confirm Purchase (৳{selectedPlan.price.toLocaleString()})
                  </button>
                </form>
              )}

              {paymentStep === "success" && (
                <div className="text-center space-y-4 py-4">
                  <span className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-2xl flex items-center justify-center mx-auto">
                    ✓
                  </span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-zinc-100">Tokens Added Successfully!</h4>
                    <p className="text-xs text-zinc-400">{selectedPlan.tokens} have been added to your wallet balance.</p>
                    <p className="text-[10px] text-zinc-500 font-medium">Transaction Ref: {transactionId}</p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="w-full h-9 flex items-center justify-center font-semibold text-xs rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all text-center"
                    >
                      Go to My Wallet Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
