"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ─── DATA DEFINITIONS ─── */

const partnerInstitutions = [
  { name: "BUET", tag: "Engineering & CS", logo: "🏛️" },
  { name: "Dhaka University (DU)", tag: "Science & Arts", logo: "🎓" },
  { name: "IBA, DU", tag: "Business & Strategy", logo: "💼" },
  { name: "BUBT", tag: "Business & Tech", logo: "🎓" },
  { name: "Pathao", tag: "Product & Tech", logo: "🛵" },
  { name: "bKash", tag: "Fintech & Engineering", logo: "📱" },
  { name: "TigerIT", tag: "Software & R&D", logo: "🐅" },
  { name: "Brain Station 23", tag: "Enterprise Dev", logo: "⚡" },
  { name: "ShopUp", tag: "E-commerce Tech", logo: "🛍️" },
  { name: "Chaldal", tag: "Logistics & Tech", logo: "📦" },
  { name: "BRAC University", tag: "Tech & Research", logo: "🌐" },
  { name: "Optimizely", tag: "Global SaaS", logo: "📊" },
];

const categories = [
  {
    name: "Software & AI Engineering",
    count: "120+ Mentors",
    courses: "18 Live Cohorts",
    icon: "💻",
    gradient: "from-blue-600/15 via-indigo-500/10 to-transparent",
    border: "hover:border-blue-500/50",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    skills: ["React & Next.js", "Node.js", "System Design", "Python & AI", "Docker"],
  },
  {
    name: "UI/UX & Product Design",
    count: "65+ Mentors",
    courses: "12 Live Cohorts",
    icon: "🎨",
    gradient: "from-pink-600/15 via-rose-500/10 to-transparent",
    border: "hover:border-pink-500/50",
    badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    skills: ["Figma Systems", "UX Research", "Prototyping", "Mobile UI", "Design Handoff"],
  },
  {
    name: "Freelancing & Remote Work",
    count: "85+ Mentors",
    courses: "14 Live Cohorts",
    icon: "🚀",
    gradient: "from-emerald-600/15 via-teal-500/10 to-transparent",
    border: "hover:border-emerald-500/50",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    skills: ["Upwork Top Rated", "Fiverr Gigs", "Client Proposals", "Pricing", "bKash Payouts"],
  },
  {
    name: "IELTS & Higher Study Abroad",
    count: "50+ Mentors",
    courses: "9 Live Cohorts",
    icon: "🎓",
    gradient: "from-cyan-600/15 via-sky-500/10 to-transparent",
    border: "hover:border-cyan-500/50",
    badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    skills: ["IELTS Band 7.5+", "SOP Writing", "GRE Prep", "Visa Guidance", "Scholarships"],
  },
  {
    name: "Product Management & Agile",
    count: "40+ Mentors",
    courses: "8 Live Cohorts",
    icon: "👔",
    gradient: "from-amber-600/15 via-orange-500/10 to-transparent",
    border: "hover:border-amber-500/50",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    skills: ["Product Strategy", "Scrum & Agile", "Roadmapping", "SQL & Metrics", "PRD Writing"],
  },
  {
    name: "Digital Growth & Marketing",
    count: "55+ Mentors",
    courses: "10 Live Cohorts",
    icon: "📈",
    gradient: "from-purple-600/15 via-fuchsia-500/10 to-transparent",
    border: "hover:border-purple-500/50",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    skills: ["Meta & Google Ads", "SEO Strategy", "Content Growth", "Analytics", "Funnel Building"],
  },
];

const topMentors = [
  {
    id: "tanzim",
    name: "Tanzim Hasan",
    role: "Senior Software Engineer",
    company: "TigerIT",
    companyBadge: "TigerIT",
    almaMater: "BUET '18",
    category: "tech",
    skills: ["React & Next.js", "System Design", "Node.js", "PostgreSQL"],
    rating: 4.95,
    reviews: 128,
    hourlyRate: 1500,
    avatar: "👨‍💻",
    avatarBg: "from-blue-600 to-indigo-600",
    availability: "Available Today, 8:30 PM",
    bio: "Ex-TigerIT core team. Mentored 400+ junior engineers who landed roles at top BD and remote US/EU firms.",
  },
  {
    id: "sabrina",
    name: "Sabrina Rahman",
    role: "Lead UI/UX Designer",
    company: "Pathao",
    companyBadge: "Pathao",
    almaMater: "DU '19",
    category: "design",
    skills: ["Figma Systems", "Design Strategy", "UX Audits", "Micro-Interactions"],
    rating: 4.92,
    reviews: 94,
    hourlyRate: 1200,
    avatar: "👩‍🎨",
    avatarBg: "from-pink-600 to-rose-600",
    availability: "Available Tomorrow, 6:00 PM",
    bio: "Lead Designer on Pathao SuperApp. Expert in converting complex product workflows into simple consumer experiences.",
  },
  {
    id: "ariful",
    name: "Ariful Islam",
    role: "Senior Product Manager",
    company: "bKash",
    companyBadge: "bKash",
    almaMater: "IBA, DU",
    category: "product",
    skills: ["Fintech Strategy", "Agile Leadership", "Product Discovery", "SQL Analytics"],
    rating: 5.0,
    reviews: 110,
    hourlyRate: 2000,
    avatar: "👨‍💼",
    avatarBg: "from-amber-600 to-orange-600",
    availability: "Available Saturday",
    bio: "Scaling bKash core payments. Specializes in PM career transitions, product execution frameworks, and interview prep.",
  },
  {
    id: "nusrat",
    name: "Nusrat Jahan",
    role: "IELTS Band 8.5 & Chevening Scholar",
    company: "University of Edinburgh Alumna",
    companyBadge: "Edinburgh",
    almaMater: "DU '17",
    category: "study",
    skills: ["IELTS Speaking", "Writing Band 7.5+", "SOP Teardown", "Scholarship Strategy"],
    rating: 4.98,
    reviews: 165,
    hourlyRate: 1400,
    avatar: "👩‍🏫",
    avatarBg: "from-cyan-600 to-sky-600",
    availability: "Available Today, 9:00 PM",
    bio: "Helped 250+ Bangladeshi students score 7.5+ on IELTS and win full-ride Erasmus and Chevening scholarships.",
  },
  {
    id: "mahfuzur",
    name: "Mahfuzur Rahman",
    role: "Full-Stack AI Lead",
    company: "Brain Station 23",
    companyBadge: "Brain Station 23",
    almaMater: "BUET '20",
    category: "tech",
    skills: ["AI Engineering", "LLM Integration", "FastAPI", "Full-Stack TypeScript"],
    rating: 4.9,
    reviews: 82,
    hourlyRate: 1600,
    avatar: "🤖",
    avatarBg: "from-purple-600 to-indigo-600",
    availability: "Available Tomorrow, 9:30 PM",
    bio: "Building enterprise generative AI solutions. Mentoring developers on migrating from basic web apps to AI-native products.",
  },
  {
    id: "farzana",
    name: "Farzana Akter",
    role: "Top Rated Plus Freelancer",
    company: "Upwork ($150k+ Earned)",
    companyBadge: "Upwork Plus",
    almaMater: "BRAC '18",
    category: "freelance",
    skills: ["Upwork Proposals", "High-Ticket Clients", "Figma to Code", "Contract Negotiation"],
    rating: 4.96,
    reviews: 142,
    hourlyRate: 1300,
    avatar: "👩‍💻",
    avatarBg: "from-emerald-600 to-teal-600",
    availability: "Available Today, 7:00 PM",
    bio: "Full-time international freelancer from Dhaka. Showing students how to bypass bidding wars and attract recurring $2k+/mo contracts.",
  },
  {
    id: "shakil",
    name: "Shakil Ahmed",
    role: "Senior Backend Engineer",
    company: "ShopUp",
    companyBadge: "ShopUp",
    almaMater: "BUBT '19",
    category: "tech",
    skills: ["Node.js & Go", "PostgreSQL", "Microservices", "Docker & System Design"],
    rating: 4.97,
    reviews: 108,
    hourlyRate: 1400,
    avatar: "👨‍💻",
    avatarBg: "from-indigo-600 to-cyan-600",
    availability: "Available Today, 8:00 PM",
    bio: "BUBT CSE alumnus now leading core order processing at ShopUp. Mentoring students on scalable backend architecture and cracking tech interviews.",
  },
  {
    id: "tanmoy",
    name: "Tanmoy Roy",
    role: "Senior Remote Engineer",
    company: "Toptal & Automattic Contributor",
    companyBadge: "Toptal Core",
    almaMater: "DU '17",
    category: "freelance",
    skills: ["Remote US/EU Jobs", "Upwork Mastery", "React Architecture", "Global Client Pitching"],
    rating: 4.99,
    reviews: 175,
    hourlyRate: 1500,
    avatar: "👨‍💻",
    avatarBg: "from-emerald-600 to-cyan-600",
    availability: "Available Sunday, 8:30 PM",
    bio: "Working remotely for US tech firms since 2019. Coaching Bangladeshi software engineers on cracking remote technical screenings and landing $3k-$6k/mo remote roles.",
  },
];

const testimonials = [
  {
    name: "Tanvir Hasan",
    title: "Full-Stack Developer at Brain Station 23",
    prev: "CSE Graduate, BUBT",
    outcome: "🎯 Landed Tech Offer in 45 Days",
    quote:
      "Coming from BUBT, I lacked confidence with complex system design and live coding rounds. My mentor Shakil helped me build production-grade projects and prepped me for mock interviews. I landed an offer at Brain Station 23 within 45 days!",
    initials: "TH",
    color: "from-indigo-500 to-cyan-500",
    rating: 5,
  },
  {
    name: "Fahim Hossain",
    title: "Software Engineer at TigerIT",
    prev: "CS Graduate, AIUB",
    outcome: "🎯 Landed SWE Role in 2 Months",
    quote:
      "I was struggling with technical interviews and complex system design. Tanzim Hasan did 3 rigorous mock interviews with me and restructured my GitHub projects. Within 60 days, I passed TigerIT's recruitment and landed my dream role!",
    initials: "FH",
    color: "from-blue-500 to-indigo-500",
    rating: 5,
  },
  {
    name: "Nusrat Milon",
    title: "Freelance Product Designer",
    prev: "Fresher, DU Alumna",
    outcome: "💰 First $1,500 Client in 3 Weeks",
    quote:
      "Sabrina reviewed my Upwork profile and broke down how top agencies evaluate Figma design portfolios. I revamped my case studies, sent 4 tailored proposals, and closed a $1,500 ongoing contract within 3 weeks. SkillBridge paid for itself 20x over.",
    initials: "NM",
    color: "from-pink-500 to-rose-500",
    rating: 5,
  },
  {
    name: "Tahmid Rahman",
    title: "IELTS Band 8.0 & Erasmus Scholar",
    prev: "Undergrad, BRAC University",
    outcome: "🎓 Full-Ride EU Masters Scholarship",
    quote:
      "Nusrat's 1-on-1 IELTS speaking drills gave me the exact confidence and idiomatic phrasing I needed. She also tore down my Statement of Purpose line by line. I went from Band 6.5 to 8.0 and got accepted into my Erasmus program in Sweden!",
    initials: "TR",
    color: "from-emerald-500 to-teal-500",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How does payment work with bKash, Nagad, and Rocket?",
    a: "Booking on SkillBridge is 100% seamless for Bangladesh. You can pay directly via bKash, Nagad, or Rocket using our secure gateway, or load Skill Tokens into your wallet for instant 1-click checkout. No foreign credit card is required.",
  },
  {
    q: "What is the Skill Exchange and how can I learn for free?",
    a: "The Skill Exchange lets you swap skills with peers without spending money. For example, if you know React or Graphic Design, you can offer to teach someone for 1 hour. You earn Skill Tokens which you can then redeem for 1-on-1 sessions or courses in any subject!",
  },
  {
    q: "How are mentors vetted and verified?",
    a: "Every mentor on SkillBridge undergoes a strict manual verification process. We verify their academic background (BUET, DU, IBA, BUBT, BRAC, etc.), current employment at top tech companies (Pathao, bKash, TigerIT, etc.), and review their portfolio/GitHub before granting verified status.",
  },
  {
    q: "Can complete beginners join SkillBridge?",
    a: "Yes! We have beginner-friendly courses, foundation roadmaps, and mentors who specialize in mentoring freshers, students transitioning from non-tech degrees, and first-time freelancers.",
  },
  {
    q: "How and when do mentors receive their payouts?",
    a: "Mentors set their own hourly rates in BDT. Once a session is successfully completed, earnings are credited to your balance. You can withdraw your earnings directly to your personal bKash, Nagad, or Bangladeshi bank account anytime.",
  },
  {
    q: "What happens if a mentor doesn't show up or I'm unsatisfied?",
    a: "We provide a 100% Satisfaction Guarantee. If a session does not take place or there is a technical issue, your payment/tokens are automatically refunded to your wallet or original payment method immediately.",
  },
];

const skillSimOptions = [
  { skill: "React & Web Dev", tokens: 30, category: "Tech" },
  { skill: "Figma UI/UX Design", tokens: 25, category: "Design" },
  { skill: "IELTS Speaking Practice", tokens: 25, category: "Languages" },
  { skill: "Python & Data Basics", tokens: 30, category: "Tech" },
  { skill: "Upwork Proposal Writing", tokens: 20, category: "Freelancing" },
  { skill: "Digital Marketing & SEO", tokens: 20, category: "Marketing" },
];

const redeemSimOptions = [
  { goal: "1-on-1 Mock Interview with TigerIT SWE", cost: 120, icon: "🎯" },
  { goal: "Complete Portfolio & Resume Teardown", cost: 60, icon: "📄" },
  { goal: "Premium Course 20% Discount Voucher", cost: 40, icon: "🎟️" },
  { goal: "Verified Certificate Credential", cost: 60, icon: "📜" },
];

/* ─── TYPES ─── */

type UserData = {
  name: string;
  role: string;
  tokenBalance: number;
  subscription: { isActive: boolean };
};

type Enrollment = { id: string; courseId: string };
type Booking = { id: string; status: string; date: string; topic: string; mentorName: string };

/* ─── LOGGED IN HOME ─── */

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
      fetch("/api/courses/enrollments").then((r) => (r.ok ? r.json() : { enrollments: [] })),
      fetch("/api/bookings").then((r) => (r.ok ? r.json() : { bookings: [] })),
    ])
      .then(([enrollData, bookingData]) => {
        setEnrollments(enrollData.enrollments || []);
        setBookings(bookingData.bookings || []);
        setStatsLoaded(true);
      })
      .catch(() => setStatsLoaded(true));
  }, []);

  const upcomingSessions = bookings.filter((b) => b.status === "confirmed");

  const quickActions =
    user.role === "mentor"
      ? [
          {
            icon: "📚",
            label: "My Published Courses",
            href: "/dashboard/mentor/courses",
            desc: "Manage lessons & students",
            color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:border-blue-500/50",
          },
          {
            icon: "📅",
            label: "Session Bookings",
            href: "/dashboard/mentor/bookings",
            desc: "Review incoming student slots",
            color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/50",
          },
          {
            icon: "🤝",
            label: "Skill Exchange",
            href: "/dashboard/exchanges",
            desc: "Swap skills with peers",
            color: "from-purple-500/10 to-fuchsia-500/10 border-purple-500/20 hover:border-purple-500/50",
          },
          {
            icon: "💸",
            label: "Earnings & Payouts",
            href: "/dashboard/mentor/earnings",
            desc: "Direct bKash / Bank transfer",
            color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/50",
          },
        ]
      : [
          {
            icon: "🔍",
            label: "Explore Mentors & Courses",
            href: "/explore",
            desc: "Find verified 1-on-1 guidance",
            color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:border-blue-500/50",
          },
          {
            icon: "🤝",
            label: "Free Skill Exchange",
            href: "/dashboard/exchanges",
            desc: "Swap skills without money",
            color: "from-purple-500/10 to-fuchsia-500/10 border-purple-500/20 hover:border-purple-500/50",
          },
          {
            icon: "📚",
            label: "My Learning",
            href: "/dashboard/courses",
            desc: "Continue active courses",
            color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/50",
          },
          {
            icon: "📅",
            label: "Book 1-on-1 Session",
            href: "/dashboard/book",
            desc: "Personal code & career reviews",
            color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/50",
          },
        ];

  return (
    <div className="relative w-full overflow-hidden min-h-screen">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[400px] bg-secondary/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Hero Welcome Banner */}
      <section className="relative border-b border-border/80 bg-card/60 backdrop-blur-md overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Greeting + Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  {greeting}, {firstName}! 👋
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                  Welcome to your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                    Learning Hub
                  </span>
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
                  {user.role === "mentor"
                    ? "Manage your students, update your calendar slots, and expand your impact across Bangladesh."
                    : "Track your active courses, schedule upcoming mentorship calls, or swap skills in the exchange."}
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2 max-w-xl rounded-2xl border border-border p-2 bg-background/80 backdrop-blur-md shadow-xl shadow-primary/5 focus-within:border-primary/50 transition-all">
                <div className="flex items-center gap-3 px-3 flex-1">
                  <svg className="w-5 h-5 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search any skill, course, or mentor (e.g. Next.js, IELTS, Sabrina Rahman)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        window.location.href = `/explore?q=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                    className="w-full text-sm bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none py-2"
                  />
                </div>
                <Link
                  href={`/explore?q=${encodeURIComponent(searchQuery)}`}
                  className="px-6 h-11 flex items-center justify-center font-bold text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 shrink-0"
                >
                  Search
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/dashboard"
                  className="px-6 h-11 flex items-center justify-center font-bold text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-lg shadow-primary/20"
                >
                  Go to Main Dashboard →
                </Link>
                <Link
                  href="/explore"
                  className="px-6 h-11 flex items-center justify-center font-bold text-sm rounded-xl border border-border hover:bg-accent text-foreground transition-all"
                >
                  Explore Top Mentors
                </Link>
                <Link
                  href="/pricing"
                  className="px-5 h-11 flex items-center justify-center font-bold text-sm rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/15 transition-all gap-2"
                >
                  🪙 Get Skill Tokens
                </Link>
              </div>
            </div>

            {/* Right: Stats Overview Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {[
                {
                  label: "Enrolled Courses",
                  value: statsLoaded ? enrollments.length : "…",
                  icon: "📚",
                  sub: "Active learning track",
                  href: "/dashboard/courses",
                  accent: "text-blue-500",
                  bg: "bg-blue-500/10 border-blue-500/20",
                },
                {
                  label: "Upcoming Sessions",
                  value: statsLoaded ? upcomingSessions.length : "…",
                  icon: "📅",
                  sub: "Confirmed bookings",
                  href: "/dashboard/sessions",
                  accent: "text-emerald-500",
                  bg: "bg-emerald-500/10 border-emerald-500/20",
                },
                {
                  label: "Skill Tokens",
                  value: user.tokenBalance,
                  icon: "🪙",
                  sub: user.subscription.isActive ? "All-Access Active" : "Available balance",
                  href: "/dashboard/billing",
                  accent: "text-amber-500",
                  bg: "bg-amber-500/10 border-amber-500/20",
                },
                {
                  label: "Skill Exchange",
                  value: "Active",
                  icon: "🤝",
                  sub: "Swap skills for free",
                  href: "/dashboard/exchanges",
                  accent: "text-purple-500",
                  bg: "bg-purple-500/10 border-purple-500/20",
                },
              ].map((stat) => (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="group p-5 rounded-2xl bg-card border border-border hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl mb-3 ${stat.bg}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className={`text-2xl sm:text-3xl font-black ${stat.accent}`}>{stat.value}</p>
                    <p className="text-xs font-bold text-foreground mt-1">{stat.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{stat.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Jump Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Quick Navigation</p>
            <h2 className="text-2xl font-extrabold tracking-tight mt-1">What would you like to accomplish?</h2>
          </div>
          <Link href="/explore" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            Browse directory →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`group p-6 rounded-2xl border bg-gradient-to-br ${action.color} hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-4`}
            >
              <div className="w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center text-2xl shadow-sm border border-border/50">
                {action.icon}
              </div>
              <div>
                <p className="font-extrabold text-base group-hover:text-primary transition-colors">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Mentors Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Recommended For You</p>
            <h2 className="text-2xl font-extrabold tracking-tight mt-1">Top Bangladeshi Mentors Ready To Guide You</h2>
          </div>
          <Link href="/explore?tab=mentors" className="text-sm font-semibold text-primary hover:underline">
            View all 500+ mentors →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topMentors.slice(0, 3).map((mentor) => (
            <div
              key={mentor.id}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${mentor.avatarBg} text-white flex items-center justify-center text-2xl shadow-md shrink-0`}>
                    {mentor.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base truncate">{mentor.name}</h3>
                    <p className="text-xs text-muted-foreground truncate font-medium">
                      {mentor.role} · <span className="text-foreground">{mentor.company}</span>
                    </p>
                    <p className="text-[11px] text-primary font-semibold">{mentor.almaMater}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{mentor.bio}</p>

                <div className="flex flex-wrap gap-1.5">
                  {mentor.skills.slice(0, 3).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-accent/15 text-accent-foreground font-medium border border-border/60">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Rate</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-sm font-black text-primary">৳{mentor.hourlyRate.toLocaleString()}/hr</p>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      ({Math.round(mentor.hourlyRate / 10)} 🪙)
                    </span>
                  </div>
                </div>
                <Link
                  href={`/explore?tab=mentors&q=${encodeURIComponent(mentor.name)}`}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-sm"
                >
                  Book Session
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── GUEST HOME (HIGH-CONVERTING LANDING PAGE) ─── */

function GuestHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [heroTab, setHeroTab] = useState<"session" | "course" | "swap">("session");

  // Hero Interactive Session State
  const [selectedTopic, setSelectedTopic] = useState("React & Tailwind v4");
  const [selectedDuration, setSelectedDuration] = useState<60 | 90>(60);
  const [bookingTriggered, setBookingTriggered] = useState(false);

  // Skill Simulator State
  const [simTeachSkill, setSimTeachSkill] = useState(skillSimOptions[0]);
  const [simLearnGoal, setSimLearnGoal] = useState(redeemSimOptions[0]);

  // Mentors Filter
  const [mentorFilter, setMentorFilter] = useState<"all" | "tech" | "design" | "product" | "study" | "freelance">("all");

  // FAQ open index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // How it works journey tab
  const [journeyTab, setJourneyTab] = useState<"learner" | "mentor">("learner");

  // Calculate dynamic session price in hero card
  const baseRate = selectedTopic === "React & Tailwind v4" ? 1500 : selectedTopic === "System Design & Architecture" ? 2000 : 1800;
  const currentFee = selectedDuration === 60 ? baseRate : Math.round(baseRate * 1.45);
  const tokenEquivalent = Math.round(currentFee / 10);

  const filteredMentors = topMentors.filter((m) => {
    if (mentorFilter === "all") return true;
    return m.category === mentorFilter;
  });

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background ambient mesh */}
      <div className="absolute top-0 left-1/3 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse-subtle" />
      <div className="absolute top-1/3 right-[-100px] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-2/3 left-[-150px] w-[600px] h-[500px] bg-accent/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ───────────────────────────────────────────────────────── */}
      {/* ─── 1. HERO SECTION ─── */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Luminous live pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/25 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>🇧🇩 #1 Peer Mentorship & Skill Network in Bangladesh</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
              Bridge Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                Skill Gap.
              </span>
              <br />
              Learn From The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-accent">
                Top 1%.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              1-on-1 career mentorship, live cohort masterclasses, and free peer skill swaps. Learn directly from senior engineers, product designers, and leaders at{" "}
              <span className="font-semibold text-foreground">BUET, DU, Pathao, bKash, TigerIT,</span> and top tech companies.
            </p>

            {/* Smart Search Bar */}
            <div className="max-w-xl mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-border/80 p-2 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10 focus-within:border-primary/50 transition-all">
                <div className="flex items-center gap-3 px-3 flex-1">
                  <svg className="w-5 h-5 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search skills, mentors, or topics (e.g. Next.js, IELTS, Sabrina)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        window.location.href = `/explore?q=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                    className="w-full text-sm bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none py-2"
                  />
                </div>
                <Link
                  href={`/explore?q=${encodeURIComponent(searchQuery)}`}
                  className="px-7 h-11 flex items-center justify-center font-bold text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 shrink-0"
                >
                  Search
                </Link>
              </div>

              {/* Trending Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start text-xs text-muted-foreground mt-3">
                <span className="font-semibold text-foreground/80">Trending:</span>
                {[
                  { label: "⚡ Next.js 16", q: "Next.js" },
                  { label: "🎨 Figma Design", q: "Figma" },
                  { label: "💼 System Design", q: "System Design" },
                  { label: "🗣️ IELTS 7.5+", q: "IELTS" },
                  { label: "🚀 Upwork Freelancing", q: "Freelancing" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={`/explore?q=${encodeURIComponent(item.q)}`}
                    className="px-2.5 py-1 rounded-lg bg-card border border-border/80 hover:border-primary/40 hover:text-primary transition-all text-[11px] font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTAs + Trust Row */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/auth?mode=signup"
                  className="px-8 h-13 flex items-center justify-center font-bold text-base rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-95 transition-all shadow-xl shadow-primary/25 group"
                >
                  <span>Start Learning Free</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  href="/auth?mode=signup&role=mentor"
                  className="px-8 h-13 flex items-center justify-center font-bold text-base rounded-2xl border-2 border-border/80 hover:border-primary/40 bg-card/50 hover:bg-card text-foreground transition-all backdrop-blur-sm"
                >
                  Become a Mentor
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> Pay via bKash, Nagad & Rocket
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> 25 Free Starter Tokens
                </span>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Interactive Live Preview Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Ambient card back-glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-2xl -z-10 scale-95" />

            <div className="w-full max-w-md bg-card/90 border border-border/80 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-7 space-y-6 animate-float relative">
              
              {/* Interactive Tabs Header */}
              <div className="flex rounded-xl bg-muted/60 p-1 border border-border/60">
                {[
                  { id: "session", label: "🎯 1-on-1 Mentor" },
                  { id: "course", label: "🚀 Live Cohort" },
                  { id: "swap", label: "🤝 Free Swap" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setHeroTab(t.id as "session" | "course" | "swap")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      heroTab === t.id
                        ? "bg-card text-foreground shadow-sm border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: 1-on-1 Mentorship */}
              {heroTab === "session" && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Mentor Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                        👨‍💻
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-extrabold text-foreground">Tanzim Hasan</p>
                          <span className="text-blue-500 text-xs" title="Verified Mentor">✓</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          Senior SWE @ <span className="font-semibold text-foreground">TigerIT</span> · BUET &apos;18
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 rounded-full font-bold">
                      🟢 Available Today
                    </span>
                  </div>

                  {/* Interactive Topic Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Select Session Topic</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        "React & Tailwind v4",
                        "System Design & Architecture",
                        "Mock Technical Interview",
                      ].map((topic) => (
                        <button
                          key={topic}
                          onClick={() => setSelectedTopic(topic)}
                          className={`w-full px-3 py-2 text-left rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                            selectedTopic === topic
                              ? "bg-primary/10 text-primary border border-primary/30"
                              : "bg-muted/40 hover:bg-muted/70 text-foreground border border-transparent"
                          }`}
                        >
                          <span>{topic}</span>
                          {selectedTopic === topic && <span className="text-primary font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration + Price Details */}
                  <div className="bg-muted/40 rounded-2xl p-4 space-y-2.5 border border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Session Duration</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelectedDuration(60)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                            selectedDuration === 60 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                          }`}
                        >
                          60 min
                        </button>
                        <button
                          onClick={() => setSelectedDuration(90)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                            selectedDuration === 90 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                          }`}
                        >
                          90 min
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Scheduled Time</span>
                      <span className="font-semibold text-foreground">Tonight, 8:30 PM (BDT)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                      <span className="text-muted-foreground font-medium">Session Fee</span>
                      <div className="text-right">
                        <span className="font-black text-base text-primary">৳{currentFee.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground ml-1.5">(or {tokenEquivalent} Tokens)</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods Badges */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                    <span>Pay with:</span>
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-600 border border-pink-500/20 text-[10px]">bKash</span>
                      <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[10px]">Nagad</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[10px]">Rocket</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px]">Tokens</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href="/auth?mode=signup"
                    onClick={() => {
                      setBookingTriggered(true);
                      setTimeout(() => setBookingTriggered(false), 3000);
                    }}
                    className="w-full h-11 flex items-center justify-center font-bold text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-lg shadow-primary/20"
                  >
                    {bookingTriggered ? "✓ Redirecting to Booking..." : "Book this 1-on-1 Session →"}
                  </Link>
                </div>
              )}

              {/* TAB 2: Live Cohort Masterclass */}
              {heroTab === "course" && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-500 border border-purple-500/20">
                      Live Masterclass
                    </span>
                    <span className="text-xs font-bold text-amber-500">⭐ 4.98 (85 reviews)</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base text-foreground">MERN Stack & Next.js 16 Masterclass</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      From Zero to Production-Ready Web Applications & Upwork Client Proposals.
                    </p>
                  </div>

                  <div className="bg-muted/40 rounded-2xl p-4 space-y-3 border border-border/50">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Lead Instructor</span>
                      <span className="font-semibold">Sabrina Rahman (Lead Designer @ Pathao)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Cohort Batch</span>
                      <span className="font-bold text-emerald-500">Batch 04 · Starts Friday</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Cohort Seats</span>
                        <span className="font-bold">42 / 50 Enrolled (8 seats left)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full w-[84%]" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Price</p>
                      <p className="text-base font-black text-primary">৳2,500 <span className="text-xs font-normal text-muted-foreground">(or 250 Tokens)</span></p>
                    </div>
                    <Link
                      href="/explore"
                      className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/95 transition-all shadow-md"
                    >
                      Enroll in Cohort
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 3: Zero-Cost Skill Swap */}
              {heroTab === "swap" && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      🤝 Zero-Cost Barter
                    </span>
                    <span className="text-xs font-bold text-emerald-600">0 BDT Required</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base text-foreground">Swap Figma UI/UX for Python / AI</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Farhan Ahmed (BRAC &apos;22) is offering to teach Figma Design Systems in exchange for Python Backend mentoring.
                    </p>
                  </div>

                  <div className="bg-muted/40 rounded-2xl p-4 space-y-2 text-xs border border-border/50">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Offered Skill</span>
                      <span className="font-bold text-pink-500">🎨 Figma UI Design</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wanted In Return</span>
                      <span className="font-bold text-blue-500">🐍 Python & FastAPI</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border/50">
                      <span className="text-muted-foreground">Token Cost</span>
                      <span className="font-extrabold text-emerald-500">FREE (Direct Peer Swap)</span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/exchanges"
                    className="w-full h-11 flex items-center justify-center font-bold text-sm rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 transition-all shadow-lg"
                  >
                    Initiate Free Skill Swap →
                  </Link>
                </div>
              )}

              {/* Trust Indicators Footer on Hero Card */}
              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60">
                <span className="flex items-center gap-1">
                  <span>⭐ 4.95/5</span>
                  <span className="text-muted-foreground/60">(2,400+ Sessions)</span>
                </span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <span>🛡️ 100% Refund Guarantee</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* ─── 2. PARTNER & ALUMNI NETWORK MARQUEE ─── */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="border-y border-border/80 bg-card/40 backdrop-blur-sm py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Mentors & Alumni From Bangladesh&apos;s Leading Companies & Universities
          </p>
        </div>

        {/* Marquee Track */}
        <div className="relative w-full overflow-hidden flex items-center">
          <div className="flex gap-4 animate-marquee whitespace-nowrap">
            {[...partnerInstitutions, ...partnerInstitutions].map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-primary/40 transition-colors"
              >
                <span className="text-xl">{item.logo}</span>
                <div>
                  <p className="text-xs font-extrabold text-foreground">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{item.tag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* ─── 3. PLATFORM PILLARS (WHY SKILLBRIDGE) ─── */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-3 mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">The SkillBridge Difference</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Everything You Need to Fast-Track Your Career</h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Traditional online courses have a 5% completion rate. SkillBridge combines 1-on-1 human mentorship, project-driven cohorts, and a free token economy so you never get stuck.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: "🎯",
              title: "1-on-1 Video Mentorship",
              desc: "Personalized guidance, live debugging, resume overhauls, and mock interviews with senior Bangladeshi engineers & designers.",
              badge: "Personalized",
              color: "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/50",
            },
            {
              icon: "🚀",
              title: "Cohort Masterclasses",
              desc: "Learn in tight groups with top instructors. Build capstone projects, get weekly code reviews, and earn verified certificates.",
              badge: "Project-Driven",
              color: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/50",
            },
            {
              icon: "🤝",
              title: "Zero-Money Skill Exchange",
              desc: "Swap your skills with peers for free. Teach what you know, earn Skill Tokens, and learn what you need without spending a single Taka.",
              badge: "100% Free Barter",
              color: "border-purple-500/20 bg-purple-500/5 hover:border-purple-500/50",
            },
            {
              icon: "💳",
              title: "Local BD Payment & Payouts",
              desc: "Pay easily via bKash, Nagad, or Rocket. Mentors receive instant withdrawals directly to their personal mobile wallets.",
              badge: "bKash & Nagad",
              color: "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/50",
            },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className={`p-7 rounded-3xl border ${pillar.color} hover:shadow-xl transition-all duration-300 flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-card border border-border flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                    {pillar.icon}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-card border border-border text-muted-foreground">
                    {pillar.badge}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* ─── 4. INTERACTIVE SKILL EXCHANGE & TOKEN SIMULATOR ─── */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-card via-card to-primary/5 border-y border-border/80 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Simulator Left Intro */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span>🤝 The SkillBridge Token Economy</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Learn Any High-Value Skill For <span className="text-emerald-500">0 BDT.</span>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Don&apos;t have a budget for courses or mentorship right now? No problem. On SkillBridge, your knowledge is currency.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                  <span><strong>Teach a peer:</strong> Offer 1 hour of mentoring in a skill you already know.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                  <span><strong>Earn Skill Tokens:</strong> Tokens are instantly credited to your wallet.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                  <span><strong>Redeem for Mentorship:</strong> Book senior engineers and designers for free!</span>
                </li>
              </ul>
              <Link
                href="/dashboard/exchanges"
                className="inline-flex items-center gap-2 px-7 h-12 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
              >
                <span>Try Skill Exchange Now</span>
                <span>→</span>
              </Link>
            </div>

            {/* Simulator Right Interactive Widget */}
            <div className="lg:col-span-7">
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <h3 className="font-extrabold text-base text-foreground">Interactive Skill Exchange Simulator</h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Live Demo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Step 1: Skill to Teach */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      1. What can you teach?
                    </label>
                    <div className="space-y-1.5">
                      {skillSimOptions.map((opt) => (
                        <button
                          key={opt.skill}
                          onClick={() => setSimTeachSkill(opt)}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${
                            simTeachSkill.skill === opt.skill
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "bg-muted/40 hover:bg-muted/70 text-foreground border border-border/50"
                          }`}
                        >
                          <span>{opt.skill}</span>
                          <span className="font-bold text-[11px]">+{opt.tokens} Tokens</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: What to Learn */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      2. What do you want to learn?
                    </label>
                    <div className="space-y-1.5">
                      {redeemSimOptions.map((opt) => (
                        <button
                          key={opt.goal}
                          onClick={() => setSimLearnGoal(opt)}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${
                            simLearnGoal.goal === opt.goal
                              ? "bg-emerald-600 text-white shadow-md"
                              : "bg-muted/40 hover:bg-muted/70 text-foreground border border-border/50"
                          }`}
                        >
                          <span className="truncate mr-2">{opt.icon} {opt.goal}</span>
                          <span className="font-bold text-[11px] shrink-0">{opt.cost} Tokens</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calculation Outcome Box */}
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 rounded-2xl p-5 border border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs text-muted-foreground font-medium">Simulation Result:</p>
                    <p className="text-sm font-extrabold text-foreground">
                      Teach <span className="text-primary font-black">{simTeachSkill.skill}</span> (Earn {simTeachSkill.tokens} Tokens)
                      <br />
                      Redeem for <span className="text-emerald-500 font-black">{simLearnGoal.goal}</span>
                    </p>
                  </div>
                  <div className="text-center sm:text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Out-Of-Pocket</p>
                    <p className="text-2xl font-black text-emerald-500">৳0 BDT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* ─── 5. HIGH-DEMAND CATEGORIES EXPLORER ─── */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-3 mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Browse By Discipline</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">High-Demand Skills For Bangladesh</h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Learn skills tailored for both the local Bangladeshi tech market and international remote freelancing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/explore?category=${encodeURIComponent(cat.name)}`}
              className={`group p-7 rounded-3xl border bg-gradient-to-br ${cat.gradient} border-border/80 ${cat.border} hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cat.badgeColor}`}>
                    {cat.count}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.courses}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {cat.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-card/80 border border-border/60 text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-primary group-hover:underline">
                <span>Explore category</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-border bg-card hover:bg-accent text-sm font-bold transition-all shadow-sm"
          >
            <span>Browse Full Directory (500+ Mentors & Courses)</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* ─── 6. FEATURED MENTORS SPOTLIGHT ─── */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="bg-card/40 border-t border-border/80 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Verified Industry Leaders</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Learn From Bangladesh&apos;s Top 1%</h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Book 1-on-1 private sessions for code reviews, portfolio teardowns, and interview mockups.
            </p>
          </div>

          {/* Mentors Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {[
              { id: "all", label: "All Disciplines" },
              { id: "tech", label: "💻 Tech & Engineering" },
              { id: "design", label: "🎨 UI/UX Design" },
              { id: "product", label: "👔 Product & Strategy" },
              { id: "study", label: "🎓 IELTS & Study Abroad" },
              { id: "freelance", label: "💼 Freelance & Remote" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMentorFilter(tab.id as "all" | "tech" | "design" | "product" | "study" | "freelance")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  mentorFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="p-7 rounded-3xl bg-card border border-border/80 hover:border-primary/30 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top: Avatar & Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mentor.avatarBg} text-white flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                      {mentor.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-base truncate text-foreground">{mentor.name}</h3>
                        <span className="text-blue-500 text-xs shrink-0" title="Admin Verified">✓</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold truncate">
                        {mentor.role}
                      </p>
                      <p className="text-[11px] text-primary/90 font-bold">
                        {mentor.company} · <span className="text-muted-foreground font-normal">{mentor.almaMater}</span>
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {mentor.bio}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted/60 text-foreground border border-border/50">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Availability Pill */}
                  <div className="text-[11px] text-emerald-500 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{mentor.availability}</span>
                  </div>
                </div>

                {/* Bottom: Rate & Booking */}
                <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-xs">
                      <span>⭐ {mentor.rating}</span>
                      <span className="text-[10px] text-muted-foreground">({mentor.reviews} reviews)</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <p className="text-sm font-black text-primary">৳{mentor.hourlyRate.toLocaleString()}/hr</p>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        ({Math.round(mentor.hourlyRate / 10)} 🪙)
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/explore?tab=mentors&q=${encodeURIComponent(mentor.name)}`}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
                  >
                    Book Session
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/explore?tab=mentors"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-border bg-card hover:bg-accent text-sm font-bold transition-all shadow-sm"
            >
              <span>View All 500+ Mentors Across Bangladesh</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* ─── 7. HOW IT WORKS (DUAL JOURNEY: LEARNERS VS MENTORS) ─── */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Simple Step-By-Step Flow</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How SkillBridge Works</h2>
          <p className="text-base text-muted-foreground max-w-lg mx-auto">
            Get started in less than 2 minutes — whether you want to learn or teach.
          </p>

          {/* Toggle Switch */}
          <div className="inline-flex rounded-2xl bg-card border border-border p-1.5 shadow-sm mt-4">
            <button
              onClick={() => setJourneyTab("learner")}
              className={`px-6 py-2 rounded-xl text-xs font-extrabold transition-all ${
                journeyTab === "learner"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🎓 For Curious Learners
            </button>
            <button
              onClick={() => setJourneyTab("mentor")}
              className={`px-6 py-2 rounded-xl text-xs font-extrabold transition-all ${
                journeyTab === "mentor"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              💼 For Expert Mentors
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px border-t-2 border-dashed border-border/80 pointer-events-none" />

          {journeyTab === "learner" ? (
            <>
              <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 shadow-sm relative">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-2xl font-black mx-auto shadow-sm">
                  01
                </div>
                <h3 className="font-extrabold text-lg">Find Your Mentor or Course</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Search by specific technology, university alumni (BUET, DU, BUBT), target company (Pathao, bKash), or hourly budget.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 shadow-sm relative">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center text-2xl font-black mx-auto shadow-sm">
                  02
                </div>
                <h3 className="font-extrabold text-lg">Book with bKash or Tokens</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pick a convenient time slot and pay securely via bKash, Nagad, Rocket, or redeem free Skill Tokens from peer swaps.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 shadow-sm relative">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center text-2xl font-black mx-auto shadow-sm">
                  03
                </div>
                <h3 className="font-extrabold text-lg">Level Up 1-on-1</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Join your live video call, get actionable advice, code reviews, and leave with concrete steps to advance your career.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 shadow-sm relative">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-2xl font-black mx-auto shadow-sm">
                  01
                </div>
                <h3 className="font-extrabold text-lg">Create Mentor Profile</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Submit your LinkedIn, university credentials, and company experience for quick admin verification in under 24 hours.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 shadow-sm relative">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-2xl font-black mx-auto shadow-sm">
                  02
                </div>
                <h3 className="font-extrabold text-lg">Set Rates & Availability</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You decide your hourly rate in BDT, create live cohort courses, and set which evenings or weekends you are open.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 shadow-sm relative">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center text-2xl font-black mx-auto shadow-sm">
                  03
                </div>
                <h3 className="font-extrabold text-lg">Teach & Withdraw to bKash</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Conduct sessions on your schedule and withdraw your earnings directly to your bKash, Nagad, or Bangladeshi bank.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-12">
          <Link
            href={journeyTab === "learner" ? "/auth?mode=signup" : "/auth?mode=signup&role=mentor"}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/95 transition-all shadow-xl shadow-primary/20"
          >
            <span>{journeyTab === "learner" ? "Start Learning for Free" : "Apply as a Mentor Today"}</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* ─── 8. AUTHENTIC BANGLADESHI SUCCESS STORIES ─── */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="bg-muted/40 border-t border-border/80 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Real Results</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Learners Who Transformed Their Careers</h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Real stories from Bangladeshi graduates, developers, and designers who broke through on SkillBridge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-8 rounded-3xl bg-card border border-border/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  {/* Star Rating & Outcome Pill */}
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400 text-sm">
                      {"★★★★★".split("").map((s, i) => (
                        <span key={i}>{s}</span>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {t.outcome}
                    </span>
                  </div>

                  {/* Quote */}
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-border flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-foreground">{t.name}</p>
                    <p className="text-xs font-semibold text-primary">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground">{t.prev}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* ─── 9. FREQUENTLY ASKED QUESTIONS (ACCORDION) ─── */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-3 mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Got Questions?</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-base text-muted-foreground">
            Everything you need to know about booking, payments, the token economy, and mentor verification.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-extrabold text-sm sm:text-base flex items-center justify-between gap-4 hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className={`text-xl transform transition-transform ${isOpen ? "rotate-45 text-primary" : "text-muted-foreground"}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* ─── 10. HIGH-CONVERSION BOTTOM CALL TO ACTION ─── */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-gradient-to-tr from-primary via-primary to-secondary rounded-3xl p-10 sm:p-16 text-center text-primary-foreground relative overflow-hidden shadow-2xl space-y-7">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] pointer-events-none" />

          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-white/15 text-white border border-white/20 backdrop-blur-md">
            <span>🎁 Claim 25 Free Skill Tokens On Signup</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-2xl mx-auto">
            Ready to Bridge Your Skill Gap?
          </h2>

          <p className="text-base sm:text-lg text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">
            Join over 10,000+ Bangladeshi learners and verified mentors. Start learning free or apply to mentor on Bangladesh&apos;s fastest growing skill platform.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              href="/auth?mode=signup"
              className="px-8 h-13 flex items-center justify-center font-bold text-sm sm:text-base rounded-2xl bg-background text-foreground hover:bg-background/90 transition-all shadow-xl"
            >
              🎓 Join as a Learner (Free)
            </Link>
            <Link
              href="/auth?mode=signup&role=mentor"
              className="px-8 h-13 flex items-center justify-center font-bold text-sm sm:text-base rounded-2xl border-2 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-white/10 transition-all"
            >
              💼 Apply to Mentor & Earn
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-primary-foreground/75 pt-2">
            <span>✓ Pay securely with bKash / Nagad</span>
            <span>✓ Free 25 Starter Tokens</span>
            <span>✓ 100% Satisfaction Guarantee</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── MAIN HOME COMPONENT ─── */

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 space-y-8">
        <div className="h-12 bg-muted rounded-2xl animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-3xl animate-pulse" />
      </div>
    );
  }

  return user ? <LoggedInHome user={user} /> : <GuestHome />;
}
