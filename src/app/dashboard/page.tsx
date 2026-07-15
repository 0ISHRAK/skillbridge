"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function LearnerDashboardHome({ userName, tokenBalance }: { userName: string; tokenBalance: number }) {
  const stats = [
    { title: "Skill Token Balance", value: `৳${(tokenBalance * 100).toLocaleString()} (${tokenBalance} Tokens)`, icon: "💳", color: "text-primary bg-primary/10 border-primary/20", link: "/pricing", linkText: "Buy Tokens" },
    { title: "Completed Lectures", value: "14 Lectures", icon: "🎓", color: "text-teal-500 bg-teal-500/10 border-teal-500/20", link: "/dashboard/courses", linkText: "View Courses" },
    { title: "Scheduled Sessions", value: "1 Upcoming Call", icon: "📅", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", link: "/dashboard/sessions", linkText: "View Schedule" }
  ];

  return (
    <div className="space-y-8 animate-scale-up">
      {/* Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Assalamu Alaikum, <span className="text-primary">{userName}</span>!
          </h1>
          <p className="text-xs text-muted-foreground">
            Track your course progress, launch your live mentor calls, and book sessions.
          </p>
        </div>
        <div className="shrink-0 flex gap-2">
          <Link
            href="/explore"
            className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-accent text-foreground transition-all"
          >
            Explore Mentors
          </Link>
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all shadow-md shadow-primary/10"
          >
            Buy Tokens
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{s.title}</p>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center border text-base ${s.color}`}>
                  {s.icon}
                </span>
              </div>
              <p className="text-lg font-black text-foreground">{s.value}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/60">
              <Link href={s.link} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                {s.linkText} <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Enrolled Courses + Next Session Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Enrolled Courses */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-lg font-bold tracking-tight">Your Enrolled Programs</h2>
          
          <div className="space-y-4">
            {/* MERN Stack Card */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] bg-primary/10 text-primary border border-primary/20 font-medium">
                    Software & Coding
                  </span>
                  <span className="text-[10px] text-muted-foreground">8 of 20 Lessons Done</span>
                </div>
                <h3 className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                  <Link href="/dashboard/courses/mern-freelancing">MERN Stack Development for Freelancing</Link>
                </h3>
                
                {/* Progress bar */}
                <div className="space-y-1 max-w-xs">
                  <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: "40%" }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground font-semibold">40% Complete</p>
                </div>
              </div>
              <Link
                href="/dashboard/courses/mern-freelancing"
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-accent text-foreground transition-all sm:self-center"
              >
                Resume Learning
              </Link>
            </div>

            {/* Figma UI/UX Card */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] bg-accent text-accent-foreground border border-border font-medium">
                    UI/UX Design
                  </span>
                  <span className="text-[10px] text-muted-foreground">3 of 15 Lessons Done</span>
                </div>
                <h3 className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                  <Link href="/dashboard/courses/figma-uiux">Figma UI/UX Design Boot Camp</Link>
                </h3>
                
                {/* Progress bar */}
                <div className="space-y-1 max-w-xs">
                  <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: "20%" }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground font-semibold">20% Complete</p>
                </div>
              </div>
              <Link
                href="/dashboard/courses/figma-uiux"
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-accent text-foreground transition-all sm:self-center"
              >
                Resume Learning
              </Link>
            </div>
          </div>
        </div>

        {/* Live Call Widget Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-bold tracking-tight">Active Consultation</h2>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-border/80 shadow-md space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Starts in 30 minutes</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">1-on-1 Consultation</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Topic: Next.js Server Actions & API Review</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50">
              <span className="text-2xl">👨‍💻</span>
              <div>
                <p className="text-xs font-bold">Tanzim Hasan</p>
                <p className="text-[10px] text-muted-foreground">Senior Dev @ TigerIT</p>
              </div>
            </div>

            <Link
              href="/dashboard/sessions/nextjs-live-call"
              className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
            >
              Launch Live Video Room
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MentorDashboardHome({ userName }: { userName: string }) {
  const [earnings, setEarnings] = useState(12500);

  useEffect(() => {
    const storedEarnings = localStorage.getItem("mentorEarnings");
    if (storedEarnings) {
      setTimeout(() => setEarnings(Number(storedEarnings)), 0);
    } else {
      localStorage.setItem("mentorEarnings", "12500");
    }
  }, []);

  const stats = [
    { title: "Total Earnings", value: `৳${earnings.toLocaleString()}`, icon: "💸", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", link: "/dashboard/mentor/earnings", linkText: "Withdraw Options" },
    { title: "Consultations Conducted", value: "8 Sessions", icon: "🤝", color: "text-primary bg-primary/10 border-primary/20", link: "/dashboard/mentor/bookings", linkText: "Manage Bookings" },
    { title: "Average Rating", value: "4.9 ★ (15 Reviews)", icon: "★", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", link: "/dashboard/mentor/reviews", linkText: "View Feedback" }
  ];

  return (
    <div className="space-y-8 animate-scale-up">
      {/* Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="text-primary">{userName}</span> (Mentor)
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your slots availability, review booking queries, and launch live video classrooms.
          </p>
        </div>
        <div className="shrink-0 flex gap-2">
          <Link
            href="/dashboard/mentor/courses/new"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all shadow-md shadow-primary/10"
          >
            + Create Course
          </Link>
          <Link
            href="/dashboard/mentor/availability"
            className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-accent text-foreground transition-all"
          >
            Edit Availability
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{s.title}</p>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center border text-base ${s.color}`}>
                  {s.icon}
                </span>
              </div>
              <p className="text-lg font-black text-foreground">{s.value}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/60">
              <Link href={s.link} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                {s.linkText} <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Enrolled Courses + Next Session Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Course management summary */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-lg font-bold tracking-tight">Your Published Programs</h2>
          
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] bg-primary/10 text-primary border border-primary/20 font-bold">
                    Software & Coding
                  </span>
                  <span className="text-[10px] text-muted-foreground">Published • ৳2,000 / Enroll</span>
                </div>
                <h3 className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                  <Link href="/dashboard/mentor/courses">MERN Stack Development for Freelancing</Link>
                </h3>
                <p className="text-[10px] text-muted-foreground">Total Enrolled: <span className="font-semibold text-foreground">12 students</span> • Lessons: <span className="font-semibold text-foreground">20 videos</span></p>
              </div>
              <Link
                href="/dashboard/mentor/courses"
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-accent text-foreground transition-all sm:self-center"
              >
                Manage Course
              </Link>
            </div>
          </div>
        </div>

        {/* Live Call Widget Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-bold tracking-tight">Upcoming Meeting</h2>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-border/80 shadow-md space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Starts in 30 minutes</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">1-on-1 Consultation</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Student Topic: Code review & Next.js debugging</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50">
              <span className="text-2xl">🎓</span>
              <div>
                <p className="text-xs font-bold">Fahim Hossain</p>
                <p className="text-[10px] text-muted-foreground">Learner Level: Intermediate</p>
              </div>
            </div>

            <Link
              href="/dashboard/sessions/nextjs-live-call"
              className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
            >
              Launch Live Video Room
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [role, setRole] = useState("learner");
  const [userName, setUserName] = useState("Fahim Hossain");
  const [tokenBalance, setTokenBalance] = useState(30);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") || "learner";
    const storedName = localStorage.getItem("userName") || "Fahim Hossain";
    const storedBalance = localStorage.getItem("tokenBalance") || "30";
    
    setTimeout(() => {
      setRole(storedRole);
      setUserName(storedName);
      setTokenBalance(Number(storedBalance));
    }, 0);
  }, []);

  return role === "mentor" ? (
    <MentorDashboardHome userName={userName} />
  ) : (
    <LearnerDashboardHome userName={userName} tokenBalance={tokenBalance} />
  );
}
