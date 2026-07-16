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
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail && storedEmail !== "your email") {
      setTimeout(() => setEmail(storedEmail), 0);
    }
  }, []);

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

    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed. Please check the code and try again.");
        return;
      }

      if (data.user) {
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userName", data.user.name);
      }
      localStorage.setItem("isEmailVerified", "true");
      router.push("/auth/onboarding");
    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;

    const targetEmail = email !== "your email" ? email : null;
    if (!targetEmail) {
      setError("Email not found. Please go back and sign up again.");
      return;
    }

    setIsResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (res.ok) {
        setResendMessage("Verification code resent successfully!");
        setTimer(30);
        setTimeout(() => setResendMessage(""), 4000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to resend code.");
      }
    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex items-center justify-center">
      <div className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-xl p-8 relative overflow-hidden transition-all duration-300">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight">Verify Your Email</h2>
            <p className="text-xs text-muted-foreground leading-normal">
              We have sent a 6-digit verification code to <span className="font-semibold text-foreground">{email}</span>. Please enter it below.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {resendMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center">
              {resendMessage}
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
              disabled={isVerifying}
              className="w-full h-11 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isVerifying ? "Verifying..." : "Verify Code & Continue"}
            </button>
          </form>

          <div className="text-center text-xs">
            <span className="text-muted-foreground">Didn&apos;t receive the code? </span>
            {timer > 0 ? (
              <span className="text-muted-foreground font-semibold">Resend in {timer}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-primary font-bold hover:underline disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend Code"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
