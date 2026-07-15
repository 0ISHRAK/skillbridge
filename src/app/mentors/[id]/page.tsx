"use client";

import { use, useState } from "react";
import Link from "next/link";

interface MentorReview {
  name: string;
  city: string;
  rating: number;
  comment: string;
}

interface Mentor {
  name: string;
  role: string;
  almaMater: string;
  category: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  skills: string[];
  avatar: string;
  experience: string;
  availableDays: string[];
  availableSlots: string[];
  reviews: MentorReview[];
}

// Mock Data for Mentors in Bangladesh
const mentorsDetails: Record<string, Mentor> = {
  "tanzim-hasan": {
    name: "Tanzim Hasan",
    role: "Senior Software Engineer @ TigerIT",
    almaMater: "BUET (Computer Science & Engineering, Batch of 2018)",
    category: "Software & Coding",
    bio: "Senior engineer with 6+ years of experience in JavaScript frameworks, cloud architecture, and database design. I specialize in system architecture design, code review guidance, and mock interviews to prepare graduates for high-paying roles.",
    rating: 4.9,
    reviewsCount: 120,
    hourlyRate: 1500,
    skills: ["React", "Node.js", "System Design", "Next.js", "Docker", "MongoDB", "SQL"],
    avatar: "👨‍💻",
    experience: "tigerIT (3 years), Selise (2 years), Freelancing (1 year)",
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableSlots: ["08:00 PM", "09:00 PM", "10:00 PM"],
    reviews: [
      { name: "Sajid Rahman", city: "Dhaka", rating: 5, comment: "Tanzim helped me debug a complex state management issue in React. His explanations are very simple and visual." },
      { name: "Mehedi Hasan", city: "Khulna", rating: 4.8, comment: "Best mentor for learning Next.js App Router and server actions. Got my first client project review done by him." }
    ]
  },
  "sabrina-rahman": {
    name: "Sabrina Rahman",
    role: "Lead UI/UX Designer @ Pathao",
    almaMater: "Dhaka University (Fine Arts, Batch of 2019)",
    category: "UI/UX & Product Design",
    bio: "Passionate about creating human-centric digital interfaces. Leading the design team at Pathao. I can help you build stunning Behance portfolios, learn auto-layout hacks, review design cases, and master freelance proposals.",
    rating: 4.8,
    reviewsCount: 85,
    hourlyRate: 1200,
    skills: ["Figma", "Design Systems", "Prototyping", "UX Audit", "Wireframing", "User Research"],
    avatar: "👩‍🎨",
    experience: "Pathao (2 years), Ghoori Learning (1.5 years), Freelance (2 years)",
    availableDays: ["Tuesday", "Thursday"],
    availableSlots: ["04:00 PM", "05:30 PM", "07:00 PM"],
    reviews: [
      { name: "Nusrat Milon", city: "Dhaka", rating: 5, comment: "Sabrina reviewed my Figma workspace and design system files. Extremely insightful feedback." }
    ]
  },
  "ariful-islam": {
    name: "Ariful Islam",
    role: "Product Manager @ bKash",
    almaMater: "IBA, University of Dhaka",
    category: "Freelancing & Career",
    bio: "Managing core consumer payment products at bKash. Experience in scaling products to millions of active users. I offer career consulting, product design thinking mentoring, Agile Scrum practices guidance, and MBA application reviews.",
    rating: 5.0,
    reviewsCount: 90,
    hourlyRate: 2000,
    skills: ["Agile PM", "Product Strategy", "KPIs", "User Interviews", "MBA Prep", "Product Analytics"],
    avatar: "👨‍💼",
    experience: "bKash (3 years), Shohoz (2 years)",
    availableDays: ["Saturday"],
    availableSlots: ["10:00 AM", "11:30 AM", "03:00 PM", "04:30 PM"],
    reviews: [
      { name: "Tahmid Chowdhury", city: "Chittagong", rating: 5, comment: "Highly professional mentorship. Ariful helped me structure my product roadmap cases for an upcoming PM interview." }
    ]
  },
  "farhana-yasmin": {
    name: "Farhana Yasmin",
    role: "IELTS Consultant & Trainer",
    almaMater: "Dhaka University (English Literature)",
    category: "IELTS & Communication",
    bio: "Certified English trainer with 5+ years of training study abroad candidates. I provide focused speaking mock evaluations, writing essay structure feedback, and customized grammar checkups.",
    rating: 4.7,
    reviewsCount: 48,
    hourlyRate: 1000,
    skills: ["IELTS Prep", "Spoken English", "Academic Writing", "Vocabulary", "Grammar Check"],
    avatar: "👩‍🏫",
    experience: "British Council Partner School (3 years), Freelance Coach (2 years)",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    availableSlots: ["02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
    reviews: [
      { name: "Zubayer Hossain", city: "Sylhet", rating: 4.6, comment: "Great speaking drills. Her advice on grammatical accuracy helped me score 7.5 in Speaking." }
    ]
  }
};

export default function MentorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const mentor = mentorsDetails[id] || mentorsDetails["tanzim-hasan"];

  // Booking states
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Payment states
  const [paymentStep, setPaymentStep] = useState<"method" | "number" | "otp" | "pin" | "success">("method");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "rocket" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");

  // Simulated calendar dates for July 2026
  const calendarDates = Array.from({ length: 14 }, (_, i) => i + 14); // July 14 to July 27

  const handleBookClick = () => {
    if (!selectedDate || !selectedSlot) {
      alert("Please select a date and time slot first.");
      return;
    }
    setIsBookingModalOpen(true);
    setPaymentStep("method");
    setPaymentMethod(null);
  };

  const handleSelectMethod = (method: "bkash" | "nagad" | "rocket") => {
    setPaymentMethod(method);
    setPaymentStep("number");
  };

  const handleNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 11) {
      setPaymentStep("otp");
    } else {
      alert("Please enter a valid 11-digit mobile number.");
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setPaymentStep("pin");
    } else {
      alert("Please enter the 6-digit OTP code.");
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length >= 4) {
      setPaymentStep("success");
    } else {
      alert("Please enter your transaction PIN.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link> &gt;{" "}
        <Link href="/explore" className="hover:text-primary">Explore Mentors</Link> &gt;{" "}
        <span className="text-foreground font-semibold">{mentor.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Profile Header Info */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-5xl">
              {mentor.avatar}
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{mentor.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                  Verified Mentor
                </span>
              </div>
              <p className="text-sm font-semibold text-primary">{mentor.role}</p>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <span>🎓 {mentor.almaMater}</span>
              </p>
              <div className="flex items-center gap-4 text-xs font-bold text-amber-500 pt-1">
                <span>⭐ {mentor.rating} ({mentor.reviewsCount} sessions)</span>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold">About Me</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {mentor.bio}
            </p>
          </div>

          {/* Experience Timeline */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Background & Experience</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              💼 <span className="font-semibold text-foreground">Positions Held:</span> {mentor.experience}
            </p>
          </div>

          {/* Skills List */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Expertise & Skills</h2>
            <div className="flex flex-wrap gap-2">
              {mentor.skills.map((s: string) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-md text-xs bg-accent text-accent-foreground border border-border font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Reviews from Students ({mentor.reviews.length})</h2>
            <div className="space-y-4">
              {mentor.reviews.map((rev: MentorReview, rIdx: number) => (
                <div key={rIdx} className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-500 text-xs">{"★".repeat(Math.round(rev.rating))}</span>
                    <span className="text-[10px] text-muted-foreground">{rev.city}, BD</span>
                  </div>
                  <p className="text-xs italic text-muted-foreground leading-relaxed">
                    &quot;{rev.comment}&quot;
                  </p>
                  <p className="text-xs font-bold text-foreground">{rev.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card & Calendar Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-6">
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Session Rate (1 Hour)</p>
              <p className="text-2xl font-extrabold text-primary mt-1">৳{mentor.hourlyRate.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Includes 1-on-1 video call and chat follow-up</p>
            </div>

            {/* Step 1: Select Date */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-foreground block">1. Select Date (July 2026)</label>
              <div className="grid grid-cols-4 gap-2">
                {calendarDates.map((date) => {
                  const isSelected = selectedDate === date;
                  return (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedSlot(null); // Reset slot
                      }}
                      className={`py-2 rounded-lg border text-center text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground font-bold"
                          : "bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground"
                      }`}
                    >
                      <p className="text-[9px] uppercase opacity-70">July</p>
                      <p className="text-sm font-extrabold">{date}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Time Slot */}
            {selectedDate && (
              <div className="space-y-3 animate-fade-in">
                <label className="text-xs font-bold text-foreground block">2. Available Slots (BDT Time)</label>
                <div className="grid grid-cols-2 gap-2">
                  {mentor.availableSlots.map((slot: string) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 rounded-lg border text-center text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground font-bold"
                            : "bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={handleBookClick}
              disabled={!selectedDate || !selectedSlot}
              className="w-full h-11 flex items-center justify-center font-bold text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Book Session via bKash / Nagad
            </button>

            {/* Secure Payment details */}
            <div className="text-center space-y-2 border-t border-border/60 pt-4">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Local Sandbox Payment</p>
              <div className="flex justify-center items-center gap-3">
                <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-rose-500 text-white shadow-sm">bKash</span>
                <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-orange-500 text-white shadow-sm">Nagad</span>
                <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-violet-600 text-white shadow-sm">Rocket</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking bKash/Nagad Payment Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl transition-all">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-[10px] font-bold">
                  S
                </div>
                <h3 className="font-bold text-sm text-zinc-100">Mentor Consultation Checkout</h3>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-6">
              {paymentStep === "method" && (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-400 text-center font-medium">
                    Paying <span className="text-primary font-bold">৳{mentor.hourlyRate.toLocaleString()}</span> to book session on <span className="font-bold text-zinc-200">July {selectedDate}, 2026 at {selectedSlot}</span>
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => handleSelectMethod("bkash")}
                      className="flex items-center justify-between p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all text-left text-zinc-200 group"
                    >
                      <span className="font-bold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                        bKash Payment
                      </span>
                      <span className="text-xs text-rose-400 font-semibold group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <button
                      onClick={() => handleSelectMethod("nagad")}
                      className="flex items-center justify-between p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-all text-left text-zinc-200 group"
                    >
                      <span className="font-bold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
                        Nagad Payment
                      </span>
                      <span className="text-xs text-orange-400 font-semibold group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <button
                      onClick={() => handleSelectMethod("rocket")}
                      className="flex items-center justify-between p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 transition-all text-left text-zinc-200 group"
                    >
                      <span className="font-bold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block"></span>
                        Rocket Payment
                      </span>
                      <span className="text-xs text-violet-400 font-semibold group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === "number" && (
                <form onSubmit={handleNumberSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase text-white ${
                      paymentMethod === "bkash" ? "bg-rose-500" : paymentMethod === "nagad" ? "bg-orange-500" : "bg-violet-600"
                    }`}>
                      {paymentMethod}
                    </span>
                    <p className="text-xs text-zinc-300">Enter your {paymentMethod} Account Number</p>
                  </div>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="e.g. 017XXXXXXXX"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-sm font-semibold p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all"
                  >
                    Send OTP Verification Code
                  </button>
                </form>
              )}

              {paymentStep === "otp" && (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-zinc-300">Verification Code Sent</p>
                    <p className="text-[10px] text-zinc-500">OTP code sent to {phoneNumber}</p>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center tracking-widest text-sm font-bold p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all"
                  >
                    Verify OTP
                  </button>
                </form>
              )}

              {paymentStep === "pin" && (
                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-zinc-300">Enter Payment PIN</p>
                  </div>
                  <input
                    type="password"
                    maxLength={5}
                    placeholder="••••"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center tracking-widest text-sm font-bold p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md"
                  >
                    Confirm Booking (৳{mentor.hourlyRate.toLocaleString()})
                  </button>
                </form>
              )}

              {paymentStep === "success" && (
                <div className="text-center space-y-4 py-4">
                  <span className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-2xl flex items-center justify-center mx-auto">
                    ✓
                  </span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-zinc-100">Booking Confirmed!</h4>
                    <p className="text-xs text-zinc-400">Scheduled on July {selectedDate}, 2026 at {selectedSlot}</p>
                    <p className="text-[10px] text-zinc-500">We have emailed you the Google Meet conference details.</p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsBookingModalOpen(false)}
                      className="w-full h-9 flex items-center justify-center font-semibold text-xs rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all text-center"
                    >
                      Go to Dashboard Calendar
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
