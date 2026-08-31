"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Enrollment = {
  id: string;
  courseId: string;
  completedLessons: string[];
  course: {
    id: string;
    title: string;
    category: string;
    lessons: string[];
    mentorName: string;
  };
};

type Booking = {
  id: string;
  mentorName: string;
  topic: string;
  date: string;
  time: string;
  status: string;
  price: number;
};

type MentorCourse = {
  id: string;
  title: string;
  category: string;
  price: number;
  published: boolean;
  lessons: string[];
};

const RECOMMENDED_COURSES = [
  {
    id: "rec-1",
    title: "Full-Stack Next.js 15 & Modern Web Development",
    category: "Technology",
    icon: "🚀",
    mentorName: "Tanzim Hasan",
    mentorRole: "Senior Engineer",
    rating: "4.9 ★ (1,420 learners)",
    price: "৳1,800",
    tokenPrice: "180 🪙",
    badge: "🔥 Best Seller",
    link: "/explore?category=Technology",
  },
  {
    id: "rec-2",
    title: "Freelancing & International Client Acquisition",
    category: "Freelance & Remote",
    icon: "💼",
    mentorName: "Farzana Akter",
    mentorRole: "Top Rated Plus Freelancer",
    rating: "5.0 ★ (980 learners)",
    price: "৳1,500",
    tokenPrice: "150 🪙",
    badge: "💼 Career Track",
    link: "/explore?category=Freelance+%26+Remote+Work",
  },
  {
    id: "rec-3",
    title: "UI/UX & Design Systems with Figma",
    category: "Design",
    icon: "🎨",
    mentorName: "Shakil Ahmed",
    mentorRole: "Lead Product Designer",
    rating: "4.8 ★ (750 learners)",
    price: "৳1,400",
    tokenPrice: "140 🪙",
    badge: "🎨 High Demand",
    link: "/explore?category=Design",
  },
];

const SPOTLIGHT_MENTORS = [
  {
    id: "mentor-farzana",
    name: "Farzana Akter",
    role: "Top Rated Plus Freelancer",
    specialty: "Upwork & Remote Global",
    rate: "৳1,500/hr",
    tokenRate: "150 🪙",
    rating: "4.9 ★ (120+ sessions)",
    avatar: "👩‍💻",
  },
  {
    id: "mentor-shakil",
    name: "Shakil Ahmed",
    role: "Senior Software Engineer",
    specialty: "TigerIT | Ex-Pathao",
    rate: "৳1,400/hr",
    tokenRate: "140 🪙",
    rating: "5.0 ★ (95+ sessions)",
    avatar: "👨‍💻",
  },
  {
    id: "mentor-tanzim",
    name: "Tanzim Hasan",
    role: "Engineering Lead",
    specialty: "Fullstack Architecture",
    rate: "৳1,600/hr",
    tokenRate: "160 🪙",
    rating: "4.9 ★ (140+ sessions)",
    avatar: "👨‍💻",
  },
];

function LearnerDashboardHome({
  userName,
  tokenBalance,
  enrollments,
  upcomingBooking,
}: {
  userName: string;
  tokenBalance: number;
  enrollments: Enrollment[];
  upcomingBooking: Booking | null;
}) {
  const completedLessonsTotal = enrollments.reduce(
    (acc, e) => acc + (Array.isArray(e.completedLessons) ? e.completedLessons.length : 0),
    0
  );
  const upcomingCount = upcomingBooking ? 1 : 0;
  const nextTargetTokens = 50;
  const progressPercent = Math.min(100, Math.round((tokenBalance / nextTargetTokens) * 100));

  return (
    <div className="space-y-8 animate-scale-up max-w-7xl mx-auto">
      {/* Premium Hero Banner with Integrated Token Rewards Widget */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Column: Greeting & Actions */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary/15 text-primary border border-primary/25 flex items-center gap-1">
                <span>🎓</span> Learner Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Student
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Assalamu Alaikum, <span className="text-primary">{userName || "Learner"}</span>! 👋
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Master in-demand skills from Bangladesh&apos;s leading tech and freelance mentors, complete interactive lesson quizzes to earn tokens, and swap knowledge 1-on-1.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {enrollments.length > 0 ? (
                <Link
                  href={`/dashboard/courses/${enrollments[0].course.id}`}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all shadow-md shadow-primary/25 flex items-center gap-2 cursor-pointer"
                >
                  <span>▶ Resume Learning</span>
                </Link>
              ) : (
                <Link
                  href="/explore"
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all shadow-md shadow-primary/25 flex items-center gap-2 cursor-pointer"
                >
                  <span>🚀 Explore All Courses</span>
                  <span>→</span>
                </Link>
              )}

              <Link
                href="/explore?tab=mentors"
                className="px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/40 hover:text-primary text-xs font-bold text-foreground transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>⭐ Book a Mentor</span>
              </Link>

              <Link
                href="/dashboard/exchanges"
                className="px-4 py-2.5 rounded-xl bg-card border border-border hover:border-amber-500/40 hover:text-amber-500 text-xs font-bold text-foreground transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>🤝 Skill Exchange</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Rewards Card */}
          <div className="w-full lg:w-80 rounded-2xl bg-card/90 border border-amber-500/25 p-5 shadow-sm space-y-4 backdrop-blur-xs shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪙</span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Reward Balance</p>
                  <p className="text-xl font-black text-amber-500">{tokenBalance} Tokens</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-1 rounded-lg border border-border/60">
                ≈ ৳{tokenBalance * 10} BDT
              </span>
            </div>

            {/* Token Progress Milestone */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-muted-foreground">Level 1 Milestone</span>
                <span className="text-primary">{tokenBalance}/{nextTargetTokens} 🪙</span>
              </div>
              <div className="w-full h-2 rounded-full bg-accent overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground">
                Earn +10 🪙 per completed lesson to unlock 50 🪙 discount vouchers.
              </p>
            </div>

            <Link
              href="/dashboard/rewards"
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>🎁 Open Rewards Store</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4-Pillar Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1 */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-3 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reward Tokens</span>
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-base font-bold">
              🪙
            </span>
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{tokenBalance} <span className="text-xs font-normal text-muted-foreground">Tokens</span></p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Worth ৳{(tokenBalance * 10).toLocaleString()} BDT in platform value</p>
          </div>
          <div className="pt-3 border-t border-border/60">
            <Link href="/dashboard/rewards" className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1">
              Rewards Store <span>→</span>
            </Link>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-3 hover:border-teal-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lessons Finished</span>
            <span className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-500 flex items-center justify-center text-base font-bold">
              🎓
            </span>
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{completedLessonsTotal} <span className="text-xs font-normal text-muted-foreground">Lessons</span></p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{enrollments.length} Enrolled Course{enrollments.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="pt-3 border-t border-border/60">
            <Link href="/dashboard/courses" className="text-xs font-bold text-teal-500 hover:underline flex items-center gap-1">
              View Curriculum <span>→</span>
            </Link>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-3 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">1-on-1 Sessions</span>
            <span className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center text-base font-bold">
              📅
            </span>
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{upcomingCount} <span className="text-xs font-normal text-muted-foreground">Upcoming</span></p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Direct Video & Code Mentoring</p>
          </div>
          <div className="pt-3 border-t border-border/60">
            <Link href="/dashboard/sessions" className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
              Manage Sessions <span>→</span>
            </Link>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-3 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Study Target</span>
            <span className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center text-base font-bold">
              🔥
            </span>
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">3 - 5 <span className="text-xs font-normal text-muted-foreground">Hrs / Wk</span></p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Recommended Pace for Mastery</p>
          </div>
          <div className="pt-3 border-t border-border/60">
            <Link href="/dashboard/settings" className="text-xs font-bold text-purple-500 hover:underline flex items-center gap-1">
              Adjust Goal <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Enrolled / Recommended Programs (8 Cols) & Mentorship Spotlight (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Programs (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">Your Enrolled Programs</h2>
              <p className="text-xs text-muted-foreground">Access your active curriculum, lectures, and quizzes.</p>
            </div>
            <Link href="/explore" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              <span>Browse Catalog</span>
              <span>↗</span>
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground">Recommended Career Tracks to Start Today</h3>
                    <p className="text-xs text-muted-foreground">Choose a program to start learning and earning reward tokens.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {RECOMMENDED_COURSES.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-background/80 border border-border/90 flex flex-col justify-between space-y-3 hover:border-primary/50 transition-all group shadow-xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{rec.icon}</span>
                          <span className="text-[9px] uppercase font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                            {rec.badge}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {rec.title}
                        </h4>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-muted-foreground">By {rec.mentorName}</p>
                          <p className="text-[9px] font-semibold text-amber-500">{rec.rating}</p>
                        </div>
                      </div>
                      <div className="pt-2.5 border-t border-border/60 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-foreground">{rec.price}</p>
                          <p className="text-[9px] font-bold text-amber-500">{rec.tokenPrice}</p>
                        </div>
                        <Link
                          href={rec.link}
                          className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold hover:bg-primary/95 transition-all shadow-xs"
                        >
                          Enroll ↗
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => {
                const course = enrollment.course;
                const total = Array.isArray(course.lessons) ? course.lessons.length : 0;
                const done = Array.isArray(enrollment.completedLessons) ? enrollment.completedLessons.length : 0;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={enrollment.id} className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {course.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">{done} of {total} Lessons Finished</span>
                      </div>
                      <h3 className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                        <Link href={`/dashboard/courses/${course.id}`}>{course.title}</Link>
                      </h3>
                      <div className="space-y-1 max-w-sm">
                        <div className="w-full bg-accent rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-primary to-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[9px] text-muted-foreground font-semibold">{pct}% Complete</p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-xs sm:self-center shrink-0"
                    >
                      Resume Learning →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: 1-on-1 Mentorship Spotlight (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">1-on-1 Mentorship</h2>
              <p className="text-xs text-muted-foreground">Book sessions with proven experts.</p>
            </div>
            <Link href="/explore?tab=mentors" className="text-xs font-bold text-primary hover:underline">
              All Mentors ↗
            </Link>
          </div>

          {upcomingBooking ? (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-border shadow-sm space-y-5 relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                    {upcomingBooking.date} at {upcomingBooking.time}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Upcoming 1-on-1 Call</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Topic: {upcomingBooking.topic}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/60">
                <span className="text-2xl">👨‍💻</span>
                <div>
                  <p className="text-xs font-bold text-foreground">{upcomingBooking.mentorName}</p>
                  <p className="text-[10px] text-muted-foreground">Your Assigned Mentor</p>
                </div>
              </div>
              <Link
                href="/dashboard/sessions"
                className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
              >
                Join Video Room
              </Link>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">⭐</span>
                  <h3 className="text-xs font-bold text-foreground">Available Mentors</h3>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Now
                </span>
              </div>

              <div className="space-y-3">
                {SPOTLIGHT_MENTORS.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-background/80 border border-border/80 flex items-center justify-between gap-3 hover:border-primary/40 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0">
                        {m.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{m.name}</p>
                        <p className="text-[10px] text-muted-foreground">{m.role}</p>
                        <p className="text-[10px] font-extrabold text-primary mt-0.5">
                          {m.rate} <span className="text-amber-500 font-bold">({m.tokenRate})</span>
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/explore?tab=mentors&q=${encodeURIComponent(m.name)}`}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold hover:bg-primary/95 transition-all shadow-xs shrink-0"
                    >
                      Book
                    </Link>
                  </div>
                ))}
              </div>

              <Link
                href="/explore?tab=mentors"
                className="w-full py-2.5 rounded-xl border border-border text-center text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-all block"
              >
                Browse All 500+ Mentors →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MentorDashboardHome({
  userName,
  courses,
  upcomingBooking,
}: {
  userName: string;
  courses: MentorCourse[];
  upcomingBooking: Booking | null;
}) {
  const stats = [
    { title: "Published Courses", value: `${courses.filter(c => c.published).length} Course${courses.filter(c => c.published).length !== 1 ? "s" : ""}`, icon: "📚", color: "text-primary bg-primary/10 border-primary/20", link: "/dashboard/mentor/courses", linkText: "Manage Courses" },
    { title: "Upcoming Sessions", value: upcomingBooking ? "1 Upcoming" : "No Sessions", icon: "🤝", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", link: "/dashboard/mentor/bookings", linkText: "Manage Bookings" },
    { title: "Earnings", value: "View Details", icon: "💸", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", link: "/dashboard/mentor/earnings", linkText: "See Earnings" }
  ];

  return (
    <div className="space-y-8 animate-scale-up max-w-7xl mx-auto">
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-sm">
        <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="text-primary">{userName}</span> (Mentor)
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your slots, review booking queries, and launch live video classrooms.
          </p>
        </div>
        <div className="shrink-0 flex gap-2">
          <Link href="/dashboard/mentor/courses/new" className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all shadow-md shadow-primary/10">
            + Create Course
          </Link>
          <Link href="/dashboard/mentor/availability" className="px-4 py-2.5 border border-border rounded-xl text-xs font-semibold hover:bg-accent text-foreground transition-all">
            Edit Availability
          </Link>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-lg font-bold tracking-tight">Your Published Programs</h2>

          {courses.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-3">
              <span className="text-3xl block">📖</span>
              <p className="text-sm font-semibold">No courses published yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">Create your first course to start earning in BDT and tokens.</p>
              <Link href="/dashboard/mentor/courses/new" className="inline-flex items-center px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/10">
                + Create a Course
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 3).map((course) => (
                <div key={course.id} className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${course.published ? "bg-primary/10 text-primary border-primary/20" : "bg-accent text-muted-foreground border-border"}`}>
                        {course.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {course.published ? "Published" : "Draft"} • ৳{course.price.toLocaleString()} / Enroll
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                      <Link href="/dashboard/mentor/courses">{course.title}</Link>
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Lessons: <span className="font-semibold text-foreground">{Array.isArray(course.lessons) ? course.lessons.length : 0}</span>
                    </p>
                  </div>
                  <Link href="/dashboard/mentor/courses" className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-accent text-foreground transition-all sm:self-center">
                    Manage Course
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-bold tracking-tight">Upcoming Meeting</h2>

          {upcomingBooking ? (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-border/80 shadow-md space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                    {upcomingBooking.date} at {upcomingBooking.time}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">1-on-1 Consultation</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Topic: {upcomingBooking.topic}</p>
                </div>
              </div>
              <Link
                href={`/dashboard/sessions/${upcomingBooking.id}`}
                className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
              >
                Launch Video Room
              </Link>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-3">
              <span className="text-3xl block">📅</span>
              <p className="text-sm font-semibold">No upcoming sessions</p>
              <p className="text-xs text-muted-foreground">Pending bookings will appear here.</p>
              <Link href="/dashboard/mentor/bookings" className="inline-flex items-center px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-accent text-foreground transition-all">
                View Bookings
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [role, setRole] = useState("learner");
  const [userName, setUserName] = useState("");
  const [tokenBalance, setTokenBalance] = useState(0);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [mentorCourses, setMentorCourses] = useState<MentorCourse[]>([]);
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        const meRes = await fetch(`/api/auth/me?_t=${Date.now()}`, { cache: "no-store" });
        if (!meRes.ok) {
          if (isMounted) {
            setRole(localStorage.getItem("userRole") || "learner");
            setUserName(localStorage.getItem("userName") || "User");
            setIsLoading(false);
          }
          return;
        }
        const meData = await meRes.json();
        const user = meData.user;

        if (isMounted) {
          setRole(user.role);
          setUserName(user.name);
          setTokenBalance(user.tokenBalance || 0);

          localStorage.setItem("userRole", user.role);
          localStorage.setItem("userName", user.name);
          localStorage.setItem("tokenBalance", String(user.tokenBalance || 0));
        }

        if (user.role === "learner") {
          const [enrollRes, bookRes] = await Promise.all([
            fetch(`/api/courses/enrollments?_t=${Date.now()}`, { cache: "no-store" }),
            fetch(`/api/bookings?_t=${Date.now()}`, { cache: "no-store" }),
          ]);

          if (enrollRes.ok && isMounted) {
            const d = await enrollRes.json();
            setEnrollments(d.enrollments || []);
          }
          if (bookRes.ok && isMounted) {
            const d = await bookRes.json();
            const upcoming = (d.bookings || []).find(
              (b: Booking) => b.status === "confirmed" || b.status === "pending"
            );
            setUpcomingBooking(upcoming || null);
          }
        } else if (user.role === "mentor") {
          const [courseRes, bookRes] = await Promise.all([
            fetch(`/api/mentor/courses?_t=${Date.now()}`, { cache: "no-store" }),
            fetch(`/api/mentor/bookings?_t=${Date.now()}`, { cache: "no-store" }),
          ]);

          if (courseRes.ok && isMounted) {
            const d = await courseRes.json();
            setMentorCourses(d.courses || []);
          }
          if (bookRes.ok && isMounted) {
            const d = await bookRes.json();
            const upcoming = (d.bookings || []).find(
              (b: Booking) => b.status === "confirmed" || b.status === "pending"
            );
            setUpcomingBooking(upcoming || null);
          }
        }
      } catch {
        if (isMounted) {
          setRole(localStorage.getItem("userRole") || "learner");
          setUserName(localStorage.getItem("userName") || "User");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-scale-up max-w-7xl mx-auto">
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 animate-pulse">
          <div className="h-7 bg-accent rounded w-1/3 mb-2" />
          <div className="h-3 bg-accent rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border animate-pulse">
              <div className="h-3 bg-accent rounded w-2/3 mb-4" />
              <div className="h-5 bg-accent rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return role === "mentor" ? (
    <MentorDashboardHome userName={userName} courses={mentorCourses} upcomingBooking={upcomingBooking} />
  ) : (
    <LearnerDashboardHome userName={userName} tokenBalance={tokenBalance} enrollments={enrollments} upcomingBooking={upcomingBooking} />
  );
}
