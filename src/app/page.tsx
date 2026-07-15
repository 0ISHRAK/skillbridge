"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Software & Coding", count: "120+ Mentors", icon: "💻", color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20" },
    { name: "Freelancing & Career", count: "80+ Mentors", icon: "🚀", color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20" },
    { name: "UI/UX & Product Design", count: "65+ Mentors", icon: "🎨", color: "from-pink-500/10 to-rose-500/10 border-pink-500/20" },
    { name: "IELTS & Communication", count: "45+ Mentors", icon: "🗣️", color: "from-amber-500/10 to-orange-500/10 border-amber-500/20" },
    { name: "Digital Marketing", count: "50+ Mentors", icon: "📈", color: "from-purple-500/10 to-fuchsia-500/10 border-purple-500/20" },
    { name: "Higher Study Abroad", count: "40+ Mentors", icon: "🎓", color: "from-cyan-500/10 to-sky-500/10 border-cyan-500/20" },
  ];

  const topMentors = [
    {
      name: "Tanzim Hasan",
      role: "Senior Software Engineer @ TigerIT",
      almaMater: "BUET '18",
      skills: ["React", "Node.js", "System Design"],
      rating: "4.9 (120+ reviews)",
      hourlyRate: "৳1,500/hr",
      avatar: "👨‍💻",
    },
    {
      name: "Sabrina Rahman",
      role: "Lead UI/UX Designer @ Pathao",
      almaMater: "DU '19",
      skills: ["Figma", "Design Systems", "Prototyping"],
      rating: "4.8 (85+ reviews)",
      hourlyRate: "৳1,200/hr",
      avatar: "👩‍🎨",
    },
    {
      name: "Ariful Islam",
      role: "Product Manager @ bKash",
      almaMater: "IBA, DU",
      skills: ["Agile", "Product Strategy", "SQL"],
      rating: "5.0 (90+ reviews)",
      hourlyRate: "৳2,000/hr",
      avatar: "👨‍💼",
    },
  ];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-subtle" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6">
            {/* Localized Banner Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Connecting 10,000+ Bangladeshi Learners & Mentors
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Bridge your skill gap.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Learn from the top 1%.
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl">
              Connect directly for 1-on-1 mentorship, live classes, and resume reviews with industry professionals from 
              <span className="font-semibold text-foreground"> BUET, DU, Pathao, bKash, TigerIT,</span> and top global organizations.
            </p>

            {/* Quick Search */}
            <div className="flex flex-col sm:flex-row gap-2 max-w-xl shadow-lg shadow-primary/5 rounded-xl border border-border p-2 bg-card">
              <div className="flex items-center gap-2 px-3 flex-1">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="What skill or mentor are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <Link
                href={`/explore?q=${encodeURIComponent(searchQuery)}`}
                className="px-6 h-11 flex items-center justify-center font-semibold text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
              >
                Search
              </Link>
            </div>

            {/* Popular Searches */}
            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 justify-center md:justify-start">
              <span>Popular:</span>
              {["React", "Freelancing on Upwork", "IELTS Practice", "UI/UX Design"].map((tag) => (
                <Link
                  key={tag}
                  href={`/explore?q=${encodeURIComponent(tag)}`}
                  className="px-2.5 py-1 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Interactive Feature Visual / Card Panel */}
          <div className="md:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm aspect-square bg-gradient-to-tr from-primary/10 to-secondary/15 rounded-3xl p-6 border border-border flex flex-col justify-between shadow-2xl animate-float">
              {/* Floating glass card 1 */}
              <div className="absolute -top-6 -left-6 glass p-4 rounded-xl shadow-lg border border-border max-w-[200px] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-lg">
                  ৳
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Local Payments</p>
                  <p className="text-sm font-semibold">bKash & Nagad</p>
                </div>
              </div>

              {/* Floating glass card 2 */}
              <div className="absolute -bottom-6 -right-6 glass p-4 rounded-xl shadow-lg border border-border max-w-[220px] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-lg">
                  🏆
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Certified Mentors</p>
                  <p className="text-sm font-semibold">Top Universities & Hubs</p>
                </div>
              </div>

              {/* Central Premium Card Content */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold">
                    SB
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Next Session</h3>
                    <p className="text-xs text-muted-foreground">Live Pair Programming</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Topic</span>
                    <span className="font-medium text-foreground">React & Tailwind v4</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Mentor</span>
                    <span className="font-medium text-foreground">Tanzim Hasan (TigerIT)</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Date & Time</span>
                    <span className="font-medium text-foreground">Tonight, 8:30 PM (BDT)</span>
                  </div>
                </div>
              </div>

              <div className="w-full pt-4">
                <Link
                  href="/auth?mode=signup"
                  className="w-full py-2.5 flex items-center justify-center font-bold text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-all text-center"
                >
                  Reserve Your Spot
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 border-y border-border py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">10K+</p>
              <p className="text-sm text-muted-foreground mt-1">Active Students</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-secondary">500+</p>
              <p className="text-sm text-muted-foreground mt-1">Expert Mentors</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">98%</p>
              <p className="text-sm text-muted-foreground mt-1">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-secondary">৳1.5M+</p>
              <p className="text-sm text-muted-foreground mt-1">Earned by Mentors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Browse Skills by Category</h2>
          <p className="text-muted-foreground">
            Learn high-income digital skills tailored for the local and international remote freelance job market.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/explore?category=${encodeURIComponent(cat.name.toLowerCase())}`}
              className={`p-6 rounded-2xl border bg-gradient-to-br ${cat.color} hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.count}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card py-20 border-t border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight">How Skillbridge Works</h2>
            <p className="text-muted-foreground">
              Master any skill with 1-on-1 personalized sessions in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4 relative">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                1
              </div>
              <h3 className="font-bold text-lg">Pick a Mentor or Course</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Browse our verified database of industry experts and courses specialized in software, UI/UX, or marketing.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4 relative">
              <div className="w-14 h-14 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-xl font-bold text-secondary">
                2
              </div>
              <h3 className="font-bold text-lg">Book a Convenient Slot</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Select a time slot on the calendar and securely pay via bKash, Nagad, or credit card.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4 relative">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                3
              </div>
              <h3 className="font-bold text-lg">Attend & Learn 1-on-1</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Connect via our custom video call portal for hands-on, live mentorship and code review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Meet Top Mentors from Bangladesh</h2>
          <p className="text-muted-foreground">
            Get mentored by senior leaders working at local tech giants and global companies.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topMentors.map((mentor) => (
            <div
              key={mentor.name}
              className="p-6 rounded-2xl bg-card border border-border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl border border-primary/20">
                    {mentor.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{mentor.name}</h3>
                    <p className="text-xs text-muted-foreground">{mentor.role}</p>
                    <p className="text-[10px] text-primary/80 font-semibold">{mentor.almaMater}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-accent text-accent-foreground font-medium border border-border">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/60 pt-4 flex items-center justify-between mt-4">
                <div>
                  <p className="text-[10px] text-muted-foreground">Rating</p>
                  <p className="text-xs font-semibold">{mentor.rating}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Session Fee</p>
                  <p className="text-sm font-bold text-primary">{mentor.hourlyRate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 border-t border-border py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Success Stories</h2>
            <p className="text-muted-foreground">
              See how learners in Bangladesh land remote development, design, and product jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="text-amber-400 text-lg">★★★★★</div>
              <p className="text-sm italic text-muted-foreground">
                &quot;I was struggling to transition from university to a professional software engineer role. My mentor Tanzim helped me prepare for Coding Interviews and structured my resume. Within 2 months, I landed a role at TigerIT!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-xs">
                  FH
                </div>
                <div>
                  <h4 className="text-sm font-bold">Fahim Hossain</h4>
                  <p className="text-[10px] text-muted-foreground">Software Dev (BUET Alumnus)</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="text-amber-400 text-lg">★★★★★</div>
              <p className="text-sm italic text-muted-foreground">
                &quot;I wanted to learn Freelancing on Upwork as a UI Designer. Sabrina reviewed my profile and gave me feedback on my portfolio. I got my first contract worth $500 within three weeks. Skillbridge is a game changer!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-xs">
                  NM
                </div>
                <div>
                  <h4 className="text-sm font-bold">Nusrat Milon</h4>
                  <p className="text-[10px] text-muted-foreground">Freelance Designer (DU Alumna)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-tr from-primary to-secondary text-primary-foreground py-20">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Bridge Your Skill Gap?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Become a learner or share your expertise as a mentor. Help build the future of Bangladesh&apos;s tech and freelance ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth?mode=signup"
              className="px-8 h-12 flex items-center justify-center font-bold rounded-lg bg-background text-foreground hover:bg-background/95 transition-all shadow-lg"
            >
              Sign Up as Student
            </Link>
            <Link
              href="/auth?mode=signup&role=mentor"
              className="px-8 h-12 flex items-center justify-center font-bold rounded-lg border border-primary-foreground bg-transparent hover:bg-white/10 transition-all"
            >
              Apply as Mentor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
