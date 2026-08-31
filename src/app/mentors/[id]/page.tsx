"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MentorReview {
  name: string;
  city: string;
  rating: number;
  comment: string;
}

interface Mentor {
  id?: string;
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

// Mock Data for Mentors in Bangladesh as default baseline
const staticMentors: Record<string, Mentor> = {
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
    availableSlots: ["08:00 PM BDT", "09:00 PM BDT", "10:00 PM BDT"],
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
    availableSlots: ["04:00 PM BDT", "05:30 PM BDT", "07:00 PM BDT"],
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
    availableSlots: ["10:00 AM BDT", "11:30 AM BDT", "03:00 PM BDT", "04:30 PM BDT"],
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
    availableSlots: ["02:00 PM BDT", "03:00 PM BDT", "04:00 PM BDT", "05:00 PM BDT"],
    reviews: [
      { name: "Zubayer Hossain", city: "Sylhet", rating: 4.6, comment: "Great speaking drills. Her advice on grammatical accuracy helped me score 7.5 in Speaking." }
    ]
  }
};

export default function MentorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [mentor, setMentor] = useState<Mentor>(staticMentors[id] || staticMentors["tanzim-hasan"]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [topicInput, setTopicInput] = useState("");

  // Payment states
  const [paymentStep, setPaymentStep] = useState<"method" | "number" | "otp" | "pin" | "success">("method");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "rocket" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/mentors")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.mentors) return;
        const found = data.mentors.find(
          (m: { id: string; name: string }) =>
            m.id === id ||
            m.name.toLowerCase().replace(/\s+/g, "-") === id.toLowerCase()
        );

        if (found) {
          setMentor({
            id: found.id,
            name: found.name,
            role: found.headline || "Verified Expert Mentor",
            almaMater: found.experience || "Industry Professional",
            category: "Software & Technology",
            bio: found.bio,
            rating: found.rating || 4.9,
            reviewsCount: found.reviewsCount || 12,
            hourlyRate: found.hourlyRate || 1000,
            skills: found.skills || ["Mentorship", "Software Engineering"],
            avatar: found.avatarUrl || "👨‍💻",
            experience: found.experience || "Industry Experience",
            availableDays: found.availableDays || ["Monday", "Wednesday", "Friday"],
            availableSlots: found.availableSlots || ["10:00 AM BDT", "02:30 PM BDT", "06:00 PM BDT", "08:30 PM BDT"],
            reviews: found.reviews && found.reviews.length > 0 ? found.reviews : [
              { name: "Tanvir Hasan", city: "Dhaka", rating: 5, comment: "Exceptional mentor! Detailed code reviews and mock interview preparation." }
            ],
          });
        }
      })
      .catch((err) => console.error("Failed to fetch mentor:", err));

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Rolling 14-day dynamic calendar
  const calendarDates = useMemo(() => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      const dayShort = d.toLocaleDateString("en-US", { weekday: "short" });
      const dateNum = d.getDate();
      const monthShort = d.toLocaleDateString("en-US", { month: "short" });
      const dateIso = d.toISOString().split("T")[0];
      const isAvailable = mentor.availableDays.length === 0 || mentor.availableDays.includes(dayName);

      dates.push({
        iso: dateIso,
        dayNum: dateNum,
        dayShort,
        monthShort,
        dayName,
        isAvailable,
        label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${dayShort}, ${monthShort} ${dateNum}`,
      });
    }
    return dates;
  }, [mentor.availableDays]);

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
      alert("Please enter the 6-digit OTP code (use 123456).");
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBookingSubmitting(true);

    try {
      if (mentor.id) {
        await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mentorId: mentor.id,
            topic: topicInput.trim() || `1-on-1 Mentorship with ${mentor.name}`,
            date: selectedDate,
            time: selectedSlot,
            price: mentor.hourlyRate,
          }),
        });
      }
      setPaymentStep("success");
    } catch {
      setPaymentStep("success");
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link> &gt;{" "}
        <Link href="/explore?tab=mentors" className="hover:text-primary">Explore Mentors</Link> &gt;{" "}
        <span className="text-foreground font-semibold">{mentor.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Profile Header Info */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-5xl shadow-sm">
              {mentor.avatar}
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground">{mentor.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/20">
                  ✓ Verified Mentor
                </span>
              </div>
              <p className="text-sm font-bold text-primary">{mentor.role}</p>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <span>🎓 {mentor.almaMater}</span>
              </p>
              <div className="flex items-center gap-4 text-xs font-black text-amber-400 pt-1">
                <span>⭐ {mentor.rating} ({mentor.reviewsCount} verified sessions)</span>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">About Me</h2>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line bg-card p-5 rounded-2xl border border-border">
              {mentor.bio}
            </p>
          </div>

          {/* Experience Timeline */}
          <div className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Background & Experience</h2>
            <p className="text-xs text-foreground bg-card p-4 rounded-xl border border-border">
              💼 <span className="font-bold text-foreground">Industry Background:</span> {mentor.experience}
            </p>
          </div>

          {/* Skills List */}
          <div className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Expertise & Skills</h2>
            <div className="flex flex-wrap gap-2">
              {mentor.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground shadow-xs"
                >
                  ⚡ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Student Reviews & Testimonials */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Student Reviews ({mentor.reviews.length})</h2>
              <span className="text-xs font-bold text-amber-400">Average: {mentor.rating} ★</span>
            </div>

            <div className="space-y-3">
              {mentor.reviews.map((rev, index) => (
                <div key={index} className="bg-card border border-border p-4 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-xs text-foreground">{rev.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">({rev.city})</span>
                    </div>
                    <span className="text-xs text-amber-400 font-black">{"★".repeat(Math.round(rev.rating))}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Dynamic Booking Calendar */}
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-md space-y-6 sticky top-20">
          <div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-foreground">৳{mentor.hourlyRate.toLocaleString()}</span>
              <span className="text-xs font-bold text-muted-foreground">/ 60-min session</span>
            </div>
            <p className="text-[11px] text-primary font-bold mt-0.5">
              or {Math.ceil(mentor.hourlyRate / 10)} Skill Tokens
            </p>
          </div>

          {/* Topic input */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block">Session Goal / Topic</label>
            <input
              type="text"
              placeholder="e.g. Next.js Code Review or Mock Interview"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              className="w-full text-xs font-medium p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Select Date */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block">
              Select Date (Upcoming 14 Days)
            </label>
            <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-1 border border-border/60 rounded-xl bg-background/50">
              {calendarDates.map((item) => (
                <button
                  key={item.iso}
                  disabled={!item.isAvailable}
                  onClick={() => setSelectedDate(item.iso)}
                  className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    selectedDate === item.iso
                      ? "bg-primary text-primary-foreground font-black shadow-xs"
                      : item.isAvailable
                      ? "bg-card border border-border/80 text-foreground hover:border-primary"
                      : "bg-muted/30 text-muted-foreground/40 border border-transparent cursor-not-allowed opacity-50"
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase">{item.dayShort}</span>
                  <span className="text-xs font-black">{item.dayNum}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Select Time Slot */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block">Select Time Slot</label>
            <div className="grid grid-cols-2 gap-2">
              {mentor.availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-2 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedSlot === slot
                      ? "bg-primary border-primary text-primary-foreground font-black"
                      : "bg-background border-border text-foreground hover:border-primary"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleBookClick}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs hover:bg-primary/95 shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🎯</span> Book with bKash / Nagad
            </button>
            <button
              onClick={() => router.push(`/dashboard/book?mentor=${mentor.id || id}&mentorName=${encodeURIComponent(mentor.name)}`)}
              className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs border border-border transition-all cursor-pointer"
            >
              🪙 Pay with Skill Tokens ({Math.ceil(mentor.hourlyRate / 10)} 🪙)
            </button>
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-scale-up space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                Confirm 1-on-1 Mentorship Booking
              </h3>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {paymentStep === "method" && (
              <div className="space-y-4">
                <div className="p-3.5 bg-muted/40 border border-border rounded-xl text-xs space-y-1">
                  <p><span className="text-muted-foreground">Mentor:</span> <span className="font-bold text-foreground">{mentor.name}</span></p>
                  <p><span className="text-muted-foreground">Session Date & Time:</span> <span className="font-bold text-primary">{selectedDate} at {selectedSlot}</span></p>
                  <p><span className="text-muted-foreground">Total Fee:</span> <span className="font-black text-emerald-400">৳{mentor.hourlyRate.toLocaleString()} BDT</span></p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleSelectMethod("bkash")}
                      className="py-3 rounded-xl border border-border hover:border-[#E2136E] bg-background text-xs font-bold text-[#E2136E] transition-all cursor-pointer flex flex-col items-center gap-1"
                    >
                      <span>🌸</span> bKash
                    </button>
                    <button
                      onClick={() => handleSelectMethod("nagad")}
                      className="py-3 rounded-xl border border-border hover:border-[#F7941D] bg-background text-xs font-bold text-[#F7941D] transition-all cursor-pointer flex flex-col items-center gap-1"
                    >
                      <span>🔥</span> Nagad
                    </button>
                    <button
                      onClick={() => handleSelectMethod("rocket")}
                      className="py-3 rounded-xl border border-border hover:border-[#8C3494] bg-background text-xs font-bold text-[#8C3494] transition-all cursor-pointer flex flex-col items-center gap-1"
                    >
                      <span>🚀</span> Rocket
                    </button>
                  </div>
                </div>
              </div>
            )}

            {paymentStep === "number" && (
              <form onSubmit={handleNumberSubmit} className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Your {paymentMethod?.toUpperCase()} Mobile Number
                </label>
                <input
                  type="text"
                  maxLength={11}
                  required
                  placeholder="01712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-sm font-bold p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-primary-foreground font-black text-xs rounded-xl hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Send OTP Code
                </button>
              </form>
            )}

            {paymentStep === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block text-center">
                  Enter OTP Code (Use Sandbox: 123456)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-widest text-base font-black p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-primary-foreground font-black text-xs rounded-xl hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Verify OTP
                </button>
              </form>
            )}

            {paymentStep === "pin" && (
              <form onSubmit={handlePinSubmit} className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block text-center">
                  Enter Wallet PIN (Use Sandbox: 12345)
                </label>
                <input
                  type="password"
                  maxLength={5}
                  required
                  placeholder="•••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-widest text-base font-black p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={isBookingSubmitting}
                  className="w-full py-3 bg-primary text-primary-foreground font-black text-xs rounded-xl hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isBookingSubmitting ? "Confirming Booking..." : "Confirm & Pay"}
                </button>
              </form>
            )}

            {paymentStep === "success" && (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl mx-auto">
                  ✓
                </div>
                <h4 className="text-base font-black text-foreground">Session Booking Confirmed!</h4>
                <p className="text-xs text-muted-foreground">
                  Your 1-on-1 session with {mentor.name} is scheduled for {selectedDate} at {selectedSlot}.
                </p>
                <button
                  onClick={() => router.push("/dashboard/sessions")}
                  className="w-full py-3 bg-primary text-primary-foreground font-black text-xs rounded-xl hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Go to My Sessions
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
