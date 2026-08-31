"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MentorPendingPage() {
  const router = useRouter();
  const [name] = useState(() =>
    typeof window === "undefined" ? "Mentor" : localStorage.getItem("userName") || "Mentor"
  );
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const user = data?.user;
        if (!user) {
          router.push("/auth?mode=login");
          return;
        }
        if (user.role !== "mentor") {
          router.push("/dashboard");
          return;
        }
        if (user.isMentorApproved) {
          setStatus("approved");
          router.push("/dashboard");
        } else if (user.mentorApplicationStatus === "rejected") {
          setStatus("rejected");
        }
      })
      .catch(() => {});
  }, [router]);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.clear();
    router.push("/auth?mode=login");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-background">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${status === "rejected" ? "bg-red-500/10" : "bg-amber-500/10"}`}>
          {status === "rejected" ? "!" : "⏳"}
        </div>
        <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">Mentor application</p>
        <h1 className="mt-2 text-2xl font-extrabold">
          {status === "rejected" ? "Your application was not approved" : "Your application is under review"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {status === "rejected"
            ? `Thanks, ${name}. An administrator has rejected this application. You can update your profile and submit it again.`
            : `Thanks, ${name}. An administrator will review your mentor profile and notify you when your application is approved.`}
        </p>
        <div className="mt-8 grid grid-cols-3 gap-2 text-[10px] font-bold">
          <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-600">Submitted</div>
          <div className={`rounded-lg p-3 ${status === "rejected" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}>
            {status === "rejected" ? "Rejected" : "Pending review"}
          </div>
          <div className="rounded-lg bg-muted p-3 text-muted-foreground">Approval</div>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={() => window.location.reload()} className="rounded-lg border border-border px-4 py-2 text-xs font-bold hover:bg-accent">
            Check status
          </button>
          <button onClick={signOut} className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90">
            Sign out
          </button>
        </div>
        {status === "approved" && <p className="mt-4 text-xs text-emerald-600">Application approved. Redirecting...</p>}
      </section>
    </main>
  );
}