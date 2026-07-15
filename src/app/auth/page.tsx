"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function AuthFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract search parameter values as primitive strings for reliable useEffect tracking
  const modeParam = searchParams?.get("mode");
  const roleParam = searchParams?.get("role");

  // Tab State
  const [mode, setMode] = useState<"login" | "signup">("login");
  
  // Sign Up / Login Fields
  const [role, setRole] = useState<"learner" | "mentor">("learner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form errors
  const [error, setError] = useState("");

  // Sync tab mode with query params change using primitive string dependencies
  useEffect(() => {
    const targetMode = modeParam === "signup" ? "signup" : "login";
    if (targetMode !== mode) {
      setTimeout(() => setMode(targetMode), 0);
    }
  }, [modeParam, mode]);

  // Sync role with query params change
  useEffect(() => {
    const targetRole = roleParam === "mentor" ? "mentor" : "learner";
    if (targetRole !== role) {
      setTimeout(() => setRole(targetRole), 0);
    }
  }, [roleParam, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "signup") {
      if (!name) {
        setError("Name is required for sign up.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (!agreeTerms) {
        setError("You must agree to the Terms of Service.");
        return;
      }

      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, name, role }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Sign up failed. Please try again.");
          return;
        }

        // Store email locally for verify-email screen reference
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", name);
        localStorage.setItem("userRole", role);

        // Redirect to verification
        router.push("/auth/verify-email");
      } catch {
        setError("Network error. Please try again later.");
      }
    } else {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Invalid credentials / ভুল তথ্য");
          return;
        }

        // Store user state locally
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userName", data.user.name);

        // Redirect to dashboard
        router.push("/dashboard");
      } catch {
        setError("Network error. Please try again later.");
      }
    }
  };

  return (
    <div className="max-w-md w-full bg-card/65 backdrop-blur-md border border-border/80 rounded-2xl shadow-2xl p-8 relative overflow-hidden transition-all duration-300">
      {/* Subtle top brand color accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />

      {/* Brand logo & name inside card */}
      <div className="flex flex-col items-center justify-center space-y-2 mb-6">
        <Link href="/" className="flex items-center gap-1.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md shadow-primary/10 transform group-hover:scale-105 transition-transform">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight">
            Skill<span className="text-primary">bridge</span>
          </span>
        </Link>
      </div>

      {/* Sliding Pill Tab Toggle */}
      <div className="flex bg-muted/60 p-1.5 rounded-xl mb-6 relative border border-border/40 select-none">
        <div
          className={`absolute top-1.5 bottom-1.5 rounded-lg bg-card shadow-md border border-border/30 transition-all duration-300 ${
            mode === "login" ? "left-1.5 w-[calc(50%-6px)]" : "left-[calc(50%+3px)] w-[calc(50%-6px)]"
          }`}
        />
        <button
          onClick={() => {
            router.replace("/auth?mode=login");
            setError("");
          }}
          className={`flex-1 py-2 text-xs font-bold text-center z-10 transition-colors duration-200 ${
            mode === "login" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Log In
        </button>
        <button
          onClick={() => {
            router.replace("/auth?mode=signup");
            setError("");
          }}
          className={`flex-1 py-2 text-xs font-bold text-center z-10 transition-colors duration-200 ${
            mode === "signup" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign Up
        </button>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black tracking-tight text-foreground">
            {mode === "login" ? "Welcome Back" : "Create Your Account"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {mode === "login"
              ? "Sign in to connect with your mentor"
              : "Register as a learner or mentor in Bangladesh"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center animate-pulse-subtle flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign Up: Choose Role */}
          {mode === "signup" && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">I want to join as a:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("learner")}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    role === "learner"
                      ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <span className="text-lg">🎓</span>
                  <span className="text-xs">Learner</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("mentor")}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    role === "mentor"
                      ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <span className="text-lg">💼</span>
                  <span className="text-xs">Mentor</span>
                </button>
              </div>
            </div>
          )}

          {/* Full Name */}
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Full Name</label>
              <div className="relative flex items-center border border-input rounded-xl px-3 bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  placeholder="e.g. Fahim Hossain"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-3 bg-transparent text-foreground focus:outline-none ml-2.5 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Email Address</label>
            <div className="relative flex items-center border border-input rounded-xl px-3 bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                placeholder="e.g. user@domain.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3 bg-transparent text-foreground focus:outline-none ml-2.5 placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Password</label>
              {mode === "login" && (
                <Link
                  href="/auth/forgot-password"
                  className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot Password?
                </Link>
              )}
            </div>
            <div className="relative flex items-center border border-input rounded-xl px-3 bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3 bg-transparent text-foreground focus:outline-none ml-2.5 placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* Confirm Password */}
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Confirm Password</label>
              <div className="relative flex items-center border border-input rounded-xl px-3 bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <input
                  type="password"
                  placeholder="Re-type password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs p-3 bg-transparent text-foreground focus:outline-none ml-2.5 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          )}

          {/* Terms Agreement */}
          {mode === "signup" && (
            <label className="flex items-start gap-2.5 py-1 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <span className="text-[10px] text-muted-foreground leading-normal">
                I agree to the Skillbridge Bangladesh{" "}
                <Link href="#" className="text-primary font-semibold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary font-semibold hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-11 flex items-center justify-center font-bold text-xs rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 hover:shadow-primary/30 mt-4 active:scale-95 cursor-pointer"
          >
            {mode === "login" ? "Sign In" : "Register"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <span className="relative bg-card px-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            Or continue with
          </span>
        </div>

        {/* Social Authentication buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => alert("Connecting to Google authentication...")}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.398 0-6.16-2.762-6.16-6.16 0-3.397 2.762-6.16 6.16-6.16 1.77 0 3.37.75 4.5 1.968l3.158-3.158C19.167 2.146 15.938 1 12.24 1c-6.077 0-11 4.923-11 11s4.923 11 11 11c6.08 0 11-4.923 11-11 0-.742-.093-1.464-.26-2.155H12.24z" />
            </svg>
            Google
          </button>
          
          <button
            onClick={() => alert("Connecting to GitHub authentication...")}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
            </svg>
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex items-center justify-center relative">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-subtle" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading form settings...</div>}>
        <AuthFormContent />
      </Suspense>
    </div>
  );
}
