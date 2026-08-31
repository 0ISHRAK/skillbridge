"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setIsSubmitted(true);
    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex items-center justify-center">
      <div className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-xl p-8 relative overflow-hidden transition-all duration-300">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight">Reset Password</h2>
            <p className="text-xs text-muted-foreground">
              Enter your email and we&apos;ll send you a 6-digit reset code
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold space-y-2">
                <span className="text-lg block">✉️</span>
                <p className="font-bold">Reset Code Sent!</p>
                <p className="opacity-90 font-normal">
                  If an account exists for <span className="font-semibold">{email}</span>, you will receive a 6-digit reset code shortly.
                </p>
              </div>
              <Link
                href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
                className="inline-block px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
              >
                Enter Reset Code
              </Link>
              <div className="pt-2">
                <Link
                  href="/auth?mode=login"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to <span className="text-primary font-semibold hover:underline">Log In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. user@domain.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Password Reset Code"}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/auth?mode=login"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Never mind, take me back to <span className="text-primary font-semibold hover:underline">Log In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
