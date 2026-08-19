"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get("email") || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Please enter the 6-digit reset code.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Reset failed. Please check the code and try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-xl p-8 relative overflow-hidden transition-all duration-300">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight">Set New Password</h2>
          <p className="text-xs text-muted-foreground leading-normal">
            Enter the 6-digit code sent to{" "}
            {emailParam ? (
              <span className="font-semibold text-foreground">{emailParam}</span>
            ) : (
              "your email"
            )}{" "}
            and choose a new password.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold space-y-2">
              <span className="text-lg block">✓</span>
              <p className="font-bold">Password Reset Successful!</p>
              <p className="opacity-90 font-normal">
                Your password has been updated. You can now log in with your new password.
              </p>
            </div>
            <Link
              href="/auth?mode=login"
              className="inline-block px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
            >
              Go to Log In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block text-center">
                6-Digit Reset Code
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

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block">New Password</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block">Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-type new password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/auth?mode=login"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to <span className="text-primary font-semibold hover:underline">Log In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex items-center justify-center">
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
