"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error("Dashboard router error logged:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="space-y-6 max-w-md animate-scale-up">
        {/* Symbol */}
        <div className="text-7xl">⚠️</div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-red-500">System Error</h1>
          <h2 className="text-base font-bold text-foreground">Something went wrong / একটি সমস্যা হয়েছে</h2>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            An unexpected error occurred while executing rendering parameters. Please click try again or return to dashboard.
          </p>
        </div>

        <div className="pt-6 flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-5 h-10 flex items-center justify-center font-bold text-xs rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/15 transition-all cursor-pointer"
          >
            Try Again
          </button>
          
          <Link
            href="/dashboard"
            className="px-5 h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
          >
            My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
