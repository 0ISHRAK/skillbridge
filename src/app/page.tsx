"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const categories = [
  { name: "Software & Coding", count: "120+ Mentors", icon: "💻", color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:border-blue-500/50" },
  { name: "Freelancing & Career", count: "80+ Mentors", icon: "🚀", color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/50" },
  { name: "UI/UX & Product Design", count: "65+ Mentors", icon: "🎨", color: "from-pink-500/10 to-rose-500/10 border-pink-500/20 hover:border-pink-500/50" },
  { name: "IELTS & Communication", count: "45+ Mentors", icon: "🗣️", color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/50" },
  { name: "Digital Marketing", count: "50+ Mentors", icon: "📈", color: "from-purple-500/10 to-fuchsia-500/10 border-purple-500/20 hover:border-purple-500/50" },
  { name: "Higher Study Abroad", count: "40+ Mentors", icon: "🎓", color: "from-cyan-500/10 to-sky-500/10 border-cyan-500/20 hover:border-cyan-500/50" },
];

const steps = [
  { number: "01", title: "Browse & Filter", description: "Search by category, skill, or price. View mentor profiles, ratings, and availability before committing.", icon: "🔍", color: "text-primary border-primary/30 bg-primary/10" },
  { number: "02", title: "Book a Session", description: "Pick a time slot that works for you and pay securely via bKash, Nagad, or Rocket using Skill Tokens.", icon: "📅", color: "text-secondary border-secondary/30 bg-secondary/10" },
  { number: "03", title: "Learn 1-on-1", description: "Join your live video session, get personalized feedback, and leave with a clear action plan.", icon: "🎯", color: "text-primary border-primary/30 bg-primary/10" },
];

const features = [
  { icon: "🏅", title: "Verified Mentors", desc: "Every mentor is reviewed and approved by admins before listing." },
  { icon: "💳", title: "Local Payments", desc: "Buy Skill Tokens via bKash, Nagad, or Rocket — no credit card needed." },
  { icon: "🔒", title: "Secure & Private", desc: "Your data is protected with JWT auth, bcrypt passwords, and HTTPS." },
  { icon: "⭐", title: "Rated & Reviewed", desc: "Learners leave ratings after each session so you always know what to expect." },
  { icon: "🔔", title: "Smart Notifications", desc: "Get instant alerts for booking confirmations, approvals, and reminders." },
  { icon: "🌏", title: "Bangladesh-Focused", desc: "Local mentors, local pricing, and career tracks built for the BD market." },
];

const topMentors = [
  { name: "Tanzim Hasan", role: "Senior Software Engineer", company: "TigerIT", almaMater: "BUET '18", skills: ["React", "Node.js", "System Design"], rating: 4.9, reviews: 120, hourlyRate: 1500, avatar: "👨‍💻" },
  { name: "Sabrina Rahman", role: "Lead UI/UX Designer", company: "Pathao", almaMater: "DU '19", skills: ["Figma", "Design Systems", "Prototyping"], rating: 4.8, reviews: 85, hourlyRate: 1200, avatar: "👩‍🎨" },
  { name: "Ariful Islam", role: "Product Manager", company: "bKash", almaMater: "IBA, DU", skills: ["Agile PM", "Product Strategy", "SQL"], rating: 5.0, reviews: 90, hourlyRate: 2000, avatar: "👨‍💼" },
];

const testimonials = [
  { quote: "I was struggling to transition from university to a professional dev role. My mentor Tanzim helped me prep for interviews and structure my resume. Within 2 months I landed a role at TigerIT!", name: "Fahim Hossain", title: "Software Engineer — TigerIT", initials: "FH" },
  { quote: "Sabrina reviewed my Upwork profile and gave feedback on my design portfolio. I got my first contract worth $500 in three weeks. SkillBridge is a game changer for BD freelancers!", name: "Nusrat Milon", title: "Freelance UI Designer — DU Alumna", initials: "NM" },
];

type UserData = {
  name: string;
  role: string;
  tokenBalance: number;
  subscription: { isActive: boolean };
};

type Enrollment = { id: string; courseId: string };
type Booking = { id: string; status: string; date: string; topic: string; mentorName: string };

function LoggedInHome({ user }: { user: UserData }) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const firstName = user.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    Promise.all([
      fetch("/api/courses/enrollments").then((r) => r.ok ? r.json() : { enrollments: [] }),
      fetch("/api/bookings").then((r) => r.ok ? r.json() : { bookings: [] }),
    ]).then(([enrollData, bookingData]) => {
      setEnrollments(enrollData.enrollments || []);
      setBookings(bookingData.bookings || []);
      setStatsLoaded(true);
    }).catch(() => setStatsLoaded(true));
  }, []);

  const upcomingSessions = bookings.filter((b) => b.status === "confirmed");

  const quickActions = user.role === "mentor" ? [
    { icon: "📚", label: "My Courses", href: "/dashboard/mentor/courses", desc: "Manage your published courses", color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:border-blue-500/40" },
    { icon: "📅", label: "Bookings", href: "/dashboard/mentor/bookings", desc: "Review incoming session requests", color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/40" },
    { icon: "🤝", label: "Skill Exchange", href: "/dashboard/exchanges", desc: "Post or browse skill swaps", color: "from-purple-500/10 to-fuchsia-500/10 border-purple-500/20 hover:border-purple-500/40" },
    { icon: "💸", label: "Earnings", href: "/dashboard/mentor/earnings", desc: "Track your payouts", color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40" },
  ] : [
    { icon: "🔍", label: "Explore", href: "/explore", desc: "Find courses & mentors", color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:border-blue-500/40" },
    { icon: "🤝", label: "Skill Exchange", href: "/dashboard/exchanges", desc: "Swap skills with peers for free", color: "from-purple-500/10 to-fuchsia-500/10 border-purple-500/20 hover:border-purple-500/40" },
    { icon: "📚", label: "My Courses", href: "/dashboard/courses", desc: "Continue where you left off", color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/40" },
    { icon: "📅", label: "Book a Session", href: "/dashboard/book", desc: "1-on-1 with a mentor", color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40" },
  ];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[500px] bg-primary/6 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[400px] bg-secondary/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* ─── HERO BANNER ─── */}
      <section className="relative bg-gradient-to-br from-card via-card to-primary/5 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(var(--primary-rgb,99,102,241),0.08)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Greeting + search */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  {greeting}, {firstName}!
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Welcome back to{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    SkillBridge
                  </span>
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                  {user.role === "mentor"
                    ? "Manage your courses, review bookings, and grow your teaching impact."
                    : "Pick up where you left off, book a new session, or explore the Skill Exchange."}
                </p>
              </div>

              {/* Search */}
              <div className="flex gap-2 max-w-lg rounded-xl border border-border p-1.5 bg-background/70 backdrop-blur-sm shadow-lg shadow-primary/5">
                <div className="flex items-center gap-2 px-3 flex-1">
                  <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search courses, mentors, skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") window.location.href = `/explore?q=${encodeURIComponent(searchQuery)}`; }}
                    className="w-full text-sm bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none py-2"
                  />
                </div>
                <Link
                  href={`/explore?q=${encodeURIComponent(searchQuery)}`}
                  className="px-5 h-10 flex items-center justify-center font-bold text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shrink-0"
                >
                  Search
                </Link>
              </div>

              {/* CTA row */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="px-5 h-10 flex items-center justify-center font-bold text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
                >
                  Go to Dashboard →
                </Link>
                <Link
                  href="/explore"
                  className="px-5 h-10 flex items-center justify-center font-bold text-sm rounded-xl border border-border hover:bg-accent text-foreground transition-all"
                >
                  Explore Courses
                </Link>
              </div>
            </div>

            {/* Right: Stats cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Enrolled Courses", value: statsLoaded ? enrollments.length : "…", icon: "📚", sub: "Active learning", href: "/dashboard/courses", accent: "text-blue-500", bg: "bg-blue-500/8 border-blue-500/15" },
                { label: "Upcoming Sessions", value: statsLoaded ? upcomingSessions.length : "…", icon: "📅", sub: "Confirmed bookings", href: "/dashboard/sessions", accent: "text-emerald-500", bg: "bg-emerald-500/8 border-emerald-500/15" },
                { label: "Skill Tokens", value: user.tokenBalance, icon: "🪙", sub: user.subscription.isActive ? "All-Access active" : "Available balance", href: "/dashboard/billing", accent: "text-amber-500", bg: "bg-amber-500/8 border-amber-500/15" },
                { label: "Skill Exchange", value: "New", icon: "🤝", sub: "Swap skills for free", href: "/dashboard/exchanges", accent: "text-purple-500", bg: "bg-purple-500/8 border-purple-500/15" },
              ].map((stat) => (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="group p-5 rounded-2xl bg-card border border-border hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl mb-3 ${stat.bg}`}>
                    {stat.icon}
                  </div>
                  <p className={`text-2xl font-extrabold ${stat.accent}`}>{stat.value}</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{stat.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── QUICK ACTIONS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center space-y-2 mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Jump Right In</p>
          <h2 className="text-2xl font-extrabold tracking-tight">What would you like to do today?</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`group p-6 rounded-2xl border bg-gradient-to-br ${action.color} hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-4`}
            >
              <div className="w-12 h-12 rounded-xl bg-background/70 flex items-center justify-center text-2xl shadow-sm border border-border/40">
                {action.icon}
              </div>
              <div>
                <p className="font-extrabold text-base group-hover:text-primary transition-colors">{action.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── RECENT SESSIONS (if any) ─── */}
      {statsLoaded && bookings.length > 0 && (
        <section className="bg-card border-t border-border py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Activity</p>
                <h2 className="text-2xl font-extrabold tracking-tight mt-1">Recent Sessions</h2>
              </div>
              <Link href="/dashboard/sessions" className="text-sm font-semibold text-primary hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.slice(0, 4).map((b) => (
                <div key={b.id} className="p-5 rounded-2xl bg-background border border-border flex items-center gap-4 hover:border-primary/20 hover:shadow-md transition-all">
                  <div className={`w-1.5 h-12 rounded-full shrink-0 ${b.status === "confirmed" ? "bg-emerald-500" : b.status === "pending" ? "bg-amber-400" : "bg-muted-foreground/30"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{b.topic}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">with {b.mentorName} · {b.date}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                    b.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : b.status === "pending" ? "bg-amber-400/10 text-amber-500 border-amber-400/20"
                    : "bg-muted text-muted-foreground border-border"
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── EXPLORE CATEGORIES ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center space-y-2 mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Explore</p>
          <h2 className="text-2xl font-extrabold tracking-tight">Browse by Category</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">Find the right course or mentor for your goals.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/explore?category=${encodeURIComponent(cat.name)}`}
              className={`group p-6 rounded-2xl border bg-gradient-to-br ${cat.color} hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 transition-all duration-300`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-background/60 flex items-center justify-center text-2xl shadow-sm border border-border/50">{cat.icon}</div>
                <div>
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.count}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/explore" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-accent text-foreground transition-all">
            Browse all courses & mentors <span>→</span>
          </Link>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-gradient-to-tr from-primary via-primary to-secondary py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6 relative">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary-foreground">
            {user.role === "mentor" ? "Ready to teach someone today?" : "Ready to learn something new?"}
          </h2>
          <p className="text-base text-primary-foreground/80 max-w-xl mx-auto">
            {user.role === "mentor"
              ? "Post a new course or list a skill exchange offer — your next student is waiting."
              : "Explore 500+ courses and verified mentors, or swap skills through the Skill Exchange."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              href={user.role === "mentor" ? "/dashboard/mentor/courses/new" : "/explore"}
              className="px-8 h-12 flex items-center justify-center font-bold text-sm rounded-xl bg-background text-foreground hover:bg-background/95 transition-all shadow-xl"
            >
              {user.role === "mentor" ? "📚 Create a Course" : "🔍 Explore Now"}
            </Link>
            <Link
              href="/dashboard/exchanges"
              className="px-8 h-12 flex items-center justify-center font-bold text-sm rounded-xl border-2 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-white/10 transition-all"
            >
              🤝 Skill Exchange
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function GuestHome() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-subtle" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* ─── HERO ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Connecting 10,000+ Bangladeshi Learners & Mentors
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Bridge your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">skill gap.</span>
              <br />
              Learn from the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">top 1%.</span>
            </h1>

            <p className="text-base text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
              1-on-1 mentorship, live courses, and career guidance from industry professionals at{" "}
              <span className="font-semibold text-foreground">BUET, DU, Pathao, bKash,</span> and top BD tech companies.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto lg:mx-0 rounded-xl border border-border p-1.5 bg-card shadow-lg shadow-primary/5">
              <div className="flex items-center gap-2 px-3 flex-1">
                <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search skills, mentors, courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") window.location.href = `/explore?q=${encodeURIComponent(searchQuery)}`; }}
                  className="w-full text-sm bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none py-2"
                />
              </div>
              <Link href={`/explore?q=${encodeURIComponent(searchQuery)}`} className="px-5 h-10 flex items-center justify-center font-bold text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 shrink-0">
                Search
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start text-xs text-muted-foreground">
              <span className="font-medium">Trending:</span>
              {["React", "Freelancing", "IELTS Prep", "Figma", "Next.js"].map((tag) => (
                <Link key={tag} href={`/explore?q=${encodeURIComponent(tag)}`} className="px-2.5 py-1 rounded-md bg-accent text-accent-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all">
                  {tag}
                </Link>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
              <Link href="/auth?mode=signup" className="px-6 h-11 flex items-center justify-center font-bold text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-lg shadow-primary/20">
                Start Learning Free
              </Link>
              <Link href="/auth?mode=signup&role=mentor" className="px-6 h-11 flex items-center justify-center font-bold text-sm rounded-xl border border-border hover:bg-accent text-foreground transition-all">
                Become a Mentor →
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-md">
              <div className="bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-float">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-lg">👨‍💻</div>
                    <div>
                      <p className="text-sm font-bold">Tanzim Hasan</p>
                      <p className="text-[11px] text-muted-foreground">TigerIT · BUET &apos;18</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full font-bold">Available</span>
                </div>
                <div className="space-y-2 bg-muted/40 rounded-xl p-4">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Session Topic</span><span className="font-semibold">React & Tailwind v4</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Date & Time</span><span className="font-semibold">Tonight, 8:30 PM (BDT)</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Session Fee</span><span className="font-bold text-primary">৳1,500 / hr</span></div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["React", "Node.js", "System Design", "Next.js"].map((s) => (
                    <span key={s} className="px-2 py-0.5 text-[10px] bg-accent rounded border border-border font-medium">{s}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                  <span>⭐ 4.9 <span className="text-muted-foreground/60">(120 reviews)</span></span>
                  <span>1,250+ sessions conducted</span>
                </div>
                <Link href="/auth?mode=signup" className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20">
                  Book this Session
                </Link>
              </div>
              <div className="absolute -left-6 top-10 glass px-4 py-2.5 rounded-xl shadow-lg border border-border items-center gap-2.5 hidden sm:flex">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-sm font-bold">৳</div>
                <div><p className="text-[10px] text-muted-foreground">Pay via</p><p className="text-xs font-bold">bKash · Nagad · Rocket</p></div>
              </div>
              <div className="absolute -right-4 bottom-16 glass px-4 py-2.5 rounded-xl shadow-lg border border-border items-center gap-2.5 hidden sm:flex">
                <span className="text-xl">🏆</span>
                <div><p className="text-[10px] text-muted-foreground">Admin-verified</p><p className="text-xs font-bold">500+ Mentors</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="border-y border-border bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10K+", label: "Active Learners", color: "text-primary" },
              { value: "500+", label: "Verified Mentors", color: "text-secondary" },
              { value: "98%", label: "Satisfaction Rate", color: "text-primary" },
              { value: "৳1.5M+", label: "Earned by Mentors", color: "text-secondary" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className={`text-3xl sm:text-4xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Explore by Category</p>
          <h2 className="text-3xl font-extrabold tracking-tight">High-Demand Skills for Bangladesh</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">Learn skills that open doors — from local BD companies to remote international clients.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link key={cat.name} href={`/explore?category=${encodeURIComponent(cat.name)}`} className={`group p-6 rounded-2xl border bg-gradient-to-br ${cat.color} hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 transition-all duration-300`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-background/60 flex items-center justify-center text-2xl shadow-sm border border-border/50">{cat.icon}</div>
                <div>
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.count}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/explore" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-accent text-foreground transition-all">
            Browse all courses & mentors <span>→</span>
          </Link>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-card border-t border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">How It Works</p>
            <h2 className="text-3xl font-extrabold tracking-tight">Start Learning in 3 Simple Steps</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">From signup to your first live session in minutes — no complicated setup required.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px border-t-2 border-dashed border-border/60 pointer-events-none" />
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-4 relative">
                <div className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center shadow-sm ${step.color}`}>
                  <span className="text-xl">{step.icon}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">{step.number}</p>
                  <h3 className="font-extrabold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-7 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/95 transition-all shadow-lg shadow-primary/20">
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Why SkillBridge</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Built for Bangladesh. Trusted by Thousands.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all group">
              <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center text-xl mb-4 group-hover:bg-primary/15 transition-colors border border-primary/10">{f.icon}</div>
              <h3 className="font-bold text-base mb-1.5">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TOP MENTORS ─── */}
      <section className="bg-muted/40 border-t border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Featured Mentors</p>
            <h2 className="text-3xl font-extrabold tracking-tight">Learn from Industry Leaders</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">Senior professionals from top Bangladeshi companies ready to guide your career.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {topMentors.map((mentor) => (
              <div key={mentor.name} className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl border border-primary/20 shrink-0">{mentor.avatar}</div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base truncate">{mentor.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{mentor.role} · {mentor.company}</p>
                    <p className="text-[10px] text-primary/80 font-semibold">{mentor.almaMater}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-accent text-accent-foreground font-medium border border-border">{s}</span>
                  ))}
                </div>
                <div className="mt-auto border-t border-border/60 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Rating</p>
                    <p className="text-xs font-bold">⭐ {mentor.rating} <span className="font-normal text-muted-foreground">({mentor.reviews}+ reviews)</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Session Fee</p>
                    <p className="text-sm font-extrabold text-primary">৳{mentor.hourlyRate.toLocaleString()}/hr</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/explore?tab=mentors" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-card text-foreground transition-all">
              View all mentors <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Success Stories</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Real Learners. Real Results.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">Bangladeshi students and professionals who transformed their careers through SkillBridge.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {testimonials.map((t) => (
            <div key={t.name} className="p-7 rounded-2xl bg-card border border-border space-y-5 hover:shadow-md transition-all">
              <div className="flex gap-0.5 text-amber-400">{"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}</div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 border-t border-border/60 pt-4">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">{t.initials}</div>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-gradient-to-tr from-primary via-primary to-secondary py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-7 relative">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-foreground leading-tight">Ready to Bridge Your Skill Gap?</h2>
          <p className="text-base text-primary-foreground/85 max-w-xl mx-auto leading-relaxed">
            Join thousands of Bangladeshi learners and mentors building careers on SkillBridge. Get started free — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link href="/auth?mode=signup" className="px-8 h-12 flex items-center justify-center font-bold text-sm rounded-xl bg-background text-foreground hover:bg-background/95 transition-all shadow-xl">
              🎓 Join as a Learner
            </Link>
            <Link href="/auth?mode=signup&role=mentor" className="px-8 h-12 flex items-center justify-center font-bold text-sm rounded-xl border-2 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-white/10 transition-all">
              💼 Apply as a Mentor
            </Link>
          </div>
          <p className="text-xs text-primary-foreground/60 mt-2">Free to join · Pay only when you book · Cancel anytime</p>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  // Show nothing until auth check completes to avoid flash
  if (!authChecked) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 space-y-6">
        <div className="h-10 bg-muted rounded-xl animate-pulse w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
        <div className="h-48 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  return user ? <LoggedInHome user={user} /> : <GuestHome />;
}
