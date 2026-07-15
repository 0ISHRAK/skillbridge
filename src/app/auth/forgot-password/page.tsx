"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    // Simulate sending password reset link
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex items-center justify-center">
      <div className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-xl p-8 relative overflow-hidden transition-all duration-300">
        {/* Decorative background blur */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight">Reset Password</h2>
            <p className="text-xs text-muted-foreground">
              Enter your email and we&apos;ll send you a password reset link
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
              ⚠️ {error}
            </div>
          )}

          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold space-y-2">
                <span className="text-lg">✉️</span>
                <p>Reset Link Sent!</p>
                <p className="opacity-90 font-normal">
                  If an account exists for <span className="font-semibold">{email}</span>, you will receive a reset password link shortly.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/auth?mode=login"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Return to Log In
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
                className="w-full h-11 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
              >
                Send Password Reset Link
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
