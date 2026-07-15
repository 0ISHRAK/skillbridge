"use client";

import { useState } from "react";
import Link from "next/link";

interface PricingPlan {
  name: string;
  price: number;
  tokens: string;
  description: string;
  features: string[];
  popular: boolean;
}

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Payment states
  const [paymentStep, setPaymentStep] = useState<"method" | "number" | "otp" | "pin" | "success">("method");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "rocket" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [transactionId, setTransactionId] = useState("");

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16">
      {/* Header */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">Flexible Token Pricing</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          At Skillbridge, you book sessions and purchase course materials using **Skill Tokens**. 
          Buy a pack to fund your wallet and spend tokens as you go. No recurring subscription required!
        </p>
      </section>

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
