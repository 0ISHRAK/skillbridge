"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getShownSnapshot(): boolean {
  try {
    return Boolean(sessionStorage.getItem("skillbridge_sdp_intro_seen"));
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return true; // Don't render on server to avoid hydration mismatch
}

export default function ProjectDisclaimerModal() {
  const isAlreadySeen = useSyncExternalStore(subscribe, getShownSnapshot, getServerSnapshot);
  const [userTriggeredState, setUserTriggeredState] = useState<"fading" | "hidden" | null>(null);
  const [progress, setProgress] = useState(0);

  const stage: "visible" | "fading" | "hidden" =
    isAlreadySeen
      ? "hidden"
      : userTriggeredState === "fading"
      ? "fading"
      : userTriggeredState === "hidden"
      ? "hidden"
      : "visible";

  const triggerExit = useCallback(() => {
    try {
      sessionStorage.setItem("skillbridge_sdp_intro_seen", "true");
    } catch {
      // Ignore
    }
    setUserTriggeredState("fading");
    setTimeout(() => {
      setUserTriggeredState("hidden");
    }, 700);
  }, []);

  // Auto-progress animation over 2.8 seconds, then automatically vanishes into the website
  useEffect(() => {
    if (stage !== "visible") return;

    const intervalTime = 25; // ms
    const totalDuration = 2800; // ms
    const increment = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          triggerExit();
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [stage, triggerExit]);

  if (stage === "hidden") return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090d16]/95 backdrop-blur-xl text-white transition-all duration-700 select-none ${
        stage === "fading" ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient Glowing Backdrop Lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-xl w-full text-center space-y-7 p-8 rounded-3xl bg-card/10 backdrop-blur-2xl border border-white/10 shadow-2xl animate-scale-up overflow-hidden">
        {/* Top glowing accent line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-amber-400 via-primary to-emerald-400" />

        {/* Glowing Icon Emblem */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-linear-to-tr from-amber-500 via-primary to-emerald-500 animate-spin blur-md opacity-70 [animation-duration:8s]" />
          <div className="relative w-20 h-20 rounded-2xl bg-card/90 border border-white/20 flex items-center justify-center text-4xl shadow-xl">
            🎓
          </div>
        </div>

        {/* Title & Badge */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>University SDP Project</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Skill<span className="text-primary font-black">bridge</span>
          </h1>

          <p className="text-sm font-semibold text-emerald-400">
            Academic Software Development Project Demonstration
          </p>

          <p className="text-xs text-slate-300/85 leading-relaxed max-w-md mx-auto pt-1">
            This is an educational prototype and demonstration platform. All payment methods, tokens, and bookings are <strong>100% simulated sandbox environments</strong>.
          </p>
        </div>

        {/* Progress Countdown Bar */}
        <div className="space-y-2 pt-2">
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-linear-to-r from-amber-400 via-primary to-emerald-400 h-full rounded-full transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-1">
            <span>Entering platform automatically...</span>
            <span className="font-mono text-emerald-400 font-bold">{Math.min(100, Math.round(progress))}%</span>
          </div>
        </div>

        {/* Direct Skip Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={triggerExit}
            className="w-full py-3 rounded-2xl bg-linear-to-r from-primary via-blue-600 to-emerald-600 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Enter Website Now</span>
            <span className="group-hover:translate-x-1 transition-transform">➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}
