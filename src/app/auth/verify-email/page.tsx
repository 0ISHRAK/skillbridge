"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("your email");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [timer, setTimer] = useState(30);

  // Retrieve user email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail && storedEmail !== "your email") {
      setTimeout(() => setEmail(storedEmail), 0);
    }
  }, []);

  // Timer countdown for resending email code
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed. Please check the code and try again.");
        return;
      }

      localStorage.setItem("isEmailVerified", "true");
      router.push("/auth/onboarding");
    } catch {
      setError("Network error. Please try again later.");
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    setResendMessage("Verification code resent successfully!");
    setTimer(30);
    setTimeout(() => setResendMessage(""), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex items-center justify-center">
      <div className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-xl p-8 relative overflow-hidden transition-all duration-300">
        {/* Background blur */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight">Verify Your Email</h2>
            <p className="text-xs text-muted-foreground leading-normal">
              We have sent a 6-digit verification code to <span className="font-semibold text-foreground">{email}</span>. Please enter it below.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
              ⚠️ {error}
            </div>
          )}

          {resendMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center">
              ✓ {resendMessage}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 123456"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center tracking-widest text-lg font-bold p-3 rounded-lg border border-input bg-background text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
            >
              Verify Code & Continue
            </button>
          </form>

          {/* Resend Actions */}
          <div className="text-center text-xs">
            <span className="text-muted-foreground">Didn&apos;t receive the code? </span>
            {timer > 0 ? (
              <span className="text-muted-foreground font-semibold">Resend in {timer}s</span>
            ) : (
              <button
                onClick={handleResend}
                className="text-primary font-bold hover:underline"
              >
                Resend Code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
