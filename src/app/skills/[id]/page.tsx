"use client";

import { use, useState } from "react";
import Link from "next/link";

interface Review {
  name: string;
  city: string;
  rating: number;
  comment: string;
}

interface CurriculumSection {
  title: string;
  lectures: string[];
}

interface Course {
  title: string;
  description: string;
  fullDescription: string;
  category: string;
  level: string;
  rating: number;
  reviewsCount: number;
  price: number;
  duration: string;
  hoursCount: string;
  mentorId: string;
  mentorName: string;
  mentorTitle: string;
  mentorAlmaMater: string;
  mentorAvatar: string;
  curriculum: CurriculumSection[];
  reviews: Review[];
}

// Detailed mock data for dynamic course loading
const coursesDetails: Record<string, Course> = {
  "mern-freelancing": {
    title: "MERN Stack Development for Freelancing",
    description: "Learn MongoDB, Express, React, Node.js and build custom web applications for Upwork & Fiverr clients.",
    fullDescription: "The MERN stack is the most popular stack for modern freelance web development. This course takes you from basic JavaScript to building full-stack applications with user authentication, custom database APIs, payment gateways, and responsive dashboards. By the end of this course, you will have 4 portfolio projects and a optimized Upwork profile to land high-income remote gigs.",
    category: "Software & Coding",
    level: "Intermediate",
    rating: 4.9,
    reviewsCount: 142,
    price: 2500,
    duration: "12 Weeks",
    hoursCount: "72 Hours of Live Lectures",
    mentorId: "tanzim-hasan",
    mentorName: "Tanzim Hasan",
    mentorTitle: "Senior Software Engineer @ TigerIT",
    mentorAlmaMater: "BUET '18",
    mentorAvatar: "👨‍💻",
    curriculum: [
      { title: "Week 1-3: Javascript ES6+ & Git Fundamentals", lectures: ["ES6 Syntax, Arrays & Objects", "Asynchronous JS, Promises & Async/Await", "Version control with Git & GitHub"] },
      { title: "Week 4-6: Advanced React & State Management", lectures: ["React Hooks & Custom Hooks", "Tailwind CSS v4 Integration", "Global State Management with Context API"] },
      { title: "Week 7-9: Backend API Development with Express & Node", lectures: ["REST API Architecture", "MongoDB Schema Design & Mongoose", "JWT Authentication & Route Protection"] },
      { title: "Week 10-12: Freelance Portfolio & Payment Gateways", lectures: ["bKash/Nagad Sandbox Payment Flow", "Hosting on Vercel & Render", "Winning Upwork Proposals & Fiverr Gigs"] }
    ],
    reviews: [
      { name: "Sajid Rahman", city: "Dhaka", rating: 5, comment: "Exceptional course! Tanzim's system design lectures helped me clear the junior developer interview easily." },
      { name: "Nabila Khan", city: "Chittagong", rating: 4.8, comment: "Very hands-on. Loved the backend section, the bKash payment simulation was super helpful." }
    ]
  },
  "figma-uiux": {
    title: "Figma UI/UX Design Boot Camp",
    description: "Master modern wireframing, high-fidelity UI designs, prototyping, and developer handoffs in Figma.",
    fullDescription: "Become an elite UI/UX designer. This boot camp covers product design thinking, wireframing, high-fidelity UI design, advanced auto-layout in Figma, component libraries, and interactive prototyping. You will work on real-world briefs, design mobile apps, web dashboards, and understand the design-to-development handoff process.",
    category: "UI/UX & Product Design",
    level: "Beginner",
    rating: 4.8,
    reviewsCount: 88,
    price: 1800,
    duration: "8 Weeks",
    hoursCount: "48 Hours of Live Sessions",
    mentorId: "sabrina-rahman",
    mentorName: "Sabrina Rahman",
    mentorTitle: "Lead UI/UX Designer @ Pathao",
    mentorAlmaMater: "DU '19",
    mentorAvatar: "👩‍🎨",
    curriculum: [
      { title: "Week 1-2: UX Research & User Flow", lectures: ["Introduction to Design Thinking", "User Personas & Empathy Maps", "Creating UX User Flows & Site Maps"] },
      { title: "Week 3-4: Figma Essentials & Wireframing", lectures: ["Figma Interface & Basic Shapes", "Pen Tool, Constraints & Frames", "Low-Fidelity vs High-Fidelity Wireframes"] },
      { title: "Week 5-6: Auto Layout & Design Systems", lectures: ["Figma Auto Layout 5.0 masterclass", "Creating Reusable Components & Variants", "Building a Color & Typography Design System"] },
      { title: "Week 7-8: Prototyping & Portfolio", lectures: ["Smart Animate & Micro-interactions", "Design Handoff to React/HTML devs", "Creating your Behance/Dribbble portfolio"] }
    ],
    reviews: [
      { name: "Yeasin Arafat", city: "Sylhet", rating: 5, comment: "Sabrina is an excellent mentor. Her feedback on my auto-layout files was incredibly detailed!" },
      { name: "Afroza Parvin", city: "Dhaka", rating: 4.5, comment: "High quality course material. Designing the Pathao clone app was the highlight of this program." }
    ]
  },
  "ielts-speaking": {
    title: "IELTS Speaking & Writing Prep",
    description: "Target Band 7.5+ with targeted feedback, mocks, and common topics for study abroad candidates.",
    fullDescription: "Designed for Bangladeshi students planning to study abroad in Canada, UK, or USA. This course provides direct feedback on your speech delivery, pronunciation, lexical resource, and grammatical accuracy. Includes weekly full-length mock writing reviews with scores.",
    category: "IELTS & Communication",
    level: "Intermediate",
    rating: 4.7,
    reviewsCount: 65,
    price: 1200,
    duration: "6 Weeks",
    hoursCount: "36 Hours of Mock & Lectures",
    mentorId: "farhana-yasmin",
    mentorName: "Farhana Yasmin",
    mentorTitle: "IELTS Consultant & Trainer",
    mentorAlmaMater: "Dhaka University",
    mentorAvatar: "👩‍🏫",
    curriculum: [
      { title: "Week 1-2: Speaking Part 1 & Writing Task 1", lectures: ["Common introductory topics", "Describing charts, maps & diagrams", "Fluency & coherence building exercises"] },
      { title: "Week 3-4: Speaking Part 2 & Writing Task 2", lectures: ["Cue Card strategy (2-min talks)", "Opinion & Discussion essays structure", "Lexical Resource for academic words"] },
      { title: "Week 5-6: Speaking Part 3 & Full Mock Tests", lectures: ["Handling complex/abstract questions", "Time management & stress reduction", "One-on-one speaking mock evaluation"] }
    ],
    reviews: [
      { name: "Mustafizur Rahman", city: "Dhaka", rating: 5, comment: "I scored an overall 8.0 band with 7.5 in writing after taking Farhana's feedback sessions. Highly recommended." },
      { name: "Tahmina Akhter", city: "Comilla", rating: 4.5, comment: "Perfect schedule for working professionals. Very helpful tips on speaking structure." }
    ]
  },
  "freelance-masterclass": {
    title: "Upwork & Fiverr Freelancing Masterclass",
    description: "Complete guide on landing remote gigs, writing proposals, setting up billing, and client communication.",
    fullDescription: "Stop competing on low-value gigs. Learn the art of high-ticket freelancing, client retention, contract pricing, proposal customization, and invoicing in USD directly into your Bangladeshi bank account.",
    category: "Freelancing & Career",
    level: "Beginner",
    rating: 5.0,
    reviewsCount: 94,
    price: 1500,
    duration: "4 Weeks",
    hoursCount: "24 Hours of Live Lectures",
    mentorId: "sabrina-rahman",
    mentorName: "Sabrina Rahman",
    mentorTitle: "Freelance Designer",
    mentorAlmaMater: "DU '19",
    mentorAvatar: "👩‍🎨",
    curriculum: [
      { title: "Week 1: Profile Optimization & Niche Setup", lectures: ["Creating a 100% complete Upwork/Fiverr Profile", "Writing a high-converting profile description", "Portfolio presentation that sells"] },
      { title: "Week 2: The Art of Proposal Writing", lectures: ["Analysing job descriptions carefully", "Structuring a 3-part custom proposal cover letter", "Pricing strategies: Fixed-price vs Hourly rates"] },
      { title: "Week 3: Client Management & Communication", lectures: ["Initial interview templates & questions", "Handling difficult client requests", "Securing 5-star reviews on every contract"] },
      { title: "Week 4: Scaling & Local Financial Setup", lectures: ["Withdrawing USD via Payoneer & local bank transfers", "Understanding taxes for Bangladeshi freelancers", "Scaling into an agency model"] }
    ],
    reviews: [
      { name: "Rakibul Hasan", city: "Dhaka", rating: 5, comment: "Outstanding. I changed my proposal layout to Sabrina's format and received 3 interview requests in one week." }
    ]
  },
  "nextjs-advanced": {
    title: "Advanced Next.js & Tailwind CSS v4",
    description: "Deep dive into App Router features, React Server Components, server actions, and compiling styles with Tailwind CSS v4.",
    fullDescription: "Master the leading React framework. This advanced course explores server rendering strategies, incremental static regeneration (ISR), middleware, optimized assets loading, and the latest Tailwind CSS v4 styling syntax.",
    category: "Software & Coding",
    level: "Advanced",
    rating: 4.9,
    reviewsCount: 52,
    price: 3000,
    duration: "5 Weeks",
    hoursCount: "30 Hours of Interactive Demos",
    mentorId: "tanzim-hasan",
    mentorName: "Tanzim Hasan",
    mentorTitle: "Senior Software Engineer @ TigerIT",
    mentorAlmaMater: "BUET '18",
    mentorAvatar: "👨‍💻",
    curriculum: [
      { title: "Week 1: Server Components & Hydration", lectures: ["RSC vs Client Components architecture", "Streaming and suspense boundaries", "Data fetching optimization"] },
      { title: "Week 2: Advanced Routing & Middleware", lectures: ["Parallel routes & Intercepting routes", "Edge middleware & Route validation", "Custom search params parsing"] },
      { title: "Week 3: Tailwind CSS v4 Integration", lectures: ["Tailwind v4 compiler benefits", "Custom theme tokens & CSS variables", "Complex animations and responsive layers"] },
      { title: "Week 4-5: Server Actions & Deployment", lectures: ["Server actions for form submits", "Caches, Revalidation & ISR", "Deploying Next.js to Vercel/Self-hosting"] }
    ],
    reviews: [
      { name: "Asif Anwer", city: "Dhaka", rating: 5, comment: "Brilliant content. Perfect if you already know React and want to learn Next.js depth." }
    ]
  },
  "product-management": {
    title: "Product Management for Tech Startups",
    description: "Learn product discovery, market fits, user personas, writing PRDs, and analytics dashboards.",
    fullDescription: "A comprehensive roadmap for product builders. Learn to translate ideas into successful digital products, write PRDs, manage backlogs, track metrics, and work with engineering & design teams.",
    category: "Digital Marketing",
    level: "Advanced",
    rating: 4.9,
    reviewsCount: 71,
    price: 4000,
    duration: "8 Weeks",
    hoursCount: "48 Hours of Live Mentorship",
    mentorId: "ariful-islam",
    mentorName: "Ariful Islam",
    mentorTitle: "Product Manager @ bKash",
    mentorAlmaMater: "IBA, DU",
    mentorAvatar: "👨&zwj;💼",
    curriculum: [
      { title: "Week 1-2: Product Discovery & MVP Strategy", lectures: ["Identifying user pain points", "Defining Minimum Viable Product scope", "Competitive Analysis & Market Sizing"] },
      { title: "Week 3-4: Roadmaps & Writing PRDs", lectures: ["Writing clear Product Requirement Documents (PRDs)", "Prioritization frameworks: RICE, Moscow", "Designing wireframes & flowcharts"] },
      { title: "Week 5-6: Agile Sprint Planning & Execution", lectures: ["Writing User Stories & Acceptance Criteria", "Managing Scrum backlogs in Jira", "Collaborating with React engineers"] },
      { title: "Week 7-8: Analytics & Launch", lectures: ["A/B Testing methodologies", "Tracking KPIs: Retention, MAU, LTV", "Conducting Post-Mortem meetings"] }
    ],
    reviews: [
      { name: "Zarin Tasnim", city: "Dhaka", rating: 4.9, comment: "Incredible guidance from a real-world PM at bKash. Learned so much about analytics." }
    ]
  }
};

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const course = coursesDetails[id] || coursesDetails["mern-freelancing"];

  // Payment Modal States
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"method" | "number" | "otp" | "pin" | "success">("method");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "rocket" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const handleEnrollClick = () => {
    setIsEnrollModalOpen(true);
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
      setTransactionId(`SB-${Math.floor(Math.random() * 899999 + 100000)}`);
      setPaymentStep("success");
    } else {
      alert("Please enter your transaction PIN.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      {/* Breadcrumb navigation */}
      <div className="text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link> &gt;{" "}
        <Link href="/explore" className="hover:text-primary">Explore</Link> &gt;{" "}
        <span className="text-foreground font-semibold">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Card */}
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {course.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug">
              {course.title}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="text-amber-500 font-bold">⭐ {course.rating} ({course.reviewsCount} Reviews)</span>
              <span>•</span>
              <span>Level: <span className="font-semibold text-foreground">{course.level}</span></span>
              <span>•</span>
              <span>Duration: <span className="font-semibold text-foreground">{course.duration}</span></span>
            </div>
          </div>

          <hr className="border-border" />

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold">About the Course</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {course.fullDescription}
            </p>
          </div>

          {/* Syllabus Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Curriculum Syllabus ({course.duration})</h2>
            <div className="space-y-3">
              {course.curriculum.map((section: CurriculumSection, idx: number) => (
                <div key={idx} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="flex h-5 w-5 rounded-full bg-primary/10 text-primary items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    {section.title}
                  </h3>
                  <ul className="mt-3 pl-7 space-y-1.5 list-disc text-xs text-muted-foreground">
                    {section.lectures.map((lec: string, lIdx: number) => (
                      <li key={lIdx}>{lec}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Mentor Profile details */}
          <div className="bg-muted/50 border border-border rounded-xl p-6 transition-colors duration-300">
            <h2 className="text-lg font-bold mb-4">Your Mentor</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl">
                {course.mentorAvatar}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base">{course.mentorName}</h3>
                <p className="text-xs text-muted-foreground">{course.mentorTitle}</p>
                <p className="text-[10px] text-primary/80 font-bold">Alumnus: {course.mentorAlmaMater}</p>
              </div>
              <div className="sm:ml-auto">
                <Link
                  href={`/mentors/${course.mentorId}`}
                  className="px-4 py-1.5 border border-border text-xs rounded-md font-semibold hover:bg-accent text-foreground transition-all"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Student Testimonials ({course.reviews.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {course.reviews.map((rev: Review, rIdx: number) => (
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

        {/* Sidebar Sticky Booking Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-6">
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Course Investment</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-primary">৳{course.price.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground line-through">৳{(course.price * 1.5).toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-emerald-500 font-bold mt-1">✓ 33% Off Local Launch Discount</p>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground border-y border-border py-4">
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-semibold text-foreground">{course.duration}</span>
              </div>
              <div className="flex justify-between">
                <span>Lectures</span>
                <span className="font-semibold text-foreground">{course.hoursCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Language</span>
                <span className="font-semibold text-foreground">Bengali & English</span>
              </div>
              <div className="flex justify-between">
                <span>Access</span>
                <span className="font-semibold text-foreground">Lifetime Portal Access</span>
              </div>
            </div>

            <button
              onClick={handleEnrollClick}
              className="w-full h-11 flex items-center justify-center font-bold text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 hover:shadow-primary/30"
            >
              Enroll Now with bKash / Nagad
            </button>

            {/* Local payments logos badges */}
            <div className="text-center space-y-2">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Supported Payment Methods</p>
              <div className="flex justify-center items-center gap-3">
                <span className="px-2 py-1 text-[9px] font-bold rounded bg-rose-500 text-white shadow-sm border border-rose-600">bKash</span>
                <span className="px-2 py-1 text-[9px] font-bold rounded bg-orange-500 text-white shadow-sm border border-orange-600">Nagad</span>
                <span className="px-2 py-1 text-[9px] font-bold rounded bg-violet-600 text-white shadow-sm border border-violet-700">Rocket</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Local Payment Gateway Simulation Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl transition-all duration-300">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-[10px] font-bold">
                  S
                </div>
                <h3 className="font-bold text-sm text-zinc-100">Skillbridge Checkout</h3>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content depending on step */}
            <div className="p-5 space-y-6">
              {paymentStep === "method" && (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-400 text-center font-medium">
                    Select a local payment method to pay <span className="text-primary font-bold">৳{course.price.toLocaleString()}</span>
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => handleSelectMethod("bkash")}
                      className="flex items-center justify-between p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all text-left text-zinc-200 group"
                    >
                      <span className="font-bold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                        bKash Checkout
                      </span>
                      <span className="text-xs text-rose-400 font-semibold group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <button
                      onClick={() => handleSelectMethod("nagad")}
                      className="flex items-center justify-between p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-all text-left text-zinc-200 group"
                    >
                      <span className="font-bold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
                        Nagad Checkout
                      </span>
                      <span className="text-xs text-orange-400 font-semibold group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <button
                      onClick={() => handleSelectMethod("rocket")}
                      className="flex items-center justify-between p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 transition-all text-left text-zinc-200 group"
                    >
                      <span className="font-bold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block"></span>
                        Rocket Checkout
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
                  <div className="space-y-1">
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="e.g. 017XXXXXXXX"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-center text-sm font-semibold p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                    />
                    <p className="text-[10px] text-zinc-500 text-center">By continuing, you agree to the terms and conditions.</p>
                  </div>
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
                    <p className="text-[10px] text-zinc-500">We sent an OTP to <span className="font-semibold">{phoneNumber}</span></p>
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
                    <p className="text-[10px] text-zinc-500">This step is completely secure. Enter your {paymentMethod} PIN</p>
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
                    className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
                  >
                    Confirm Payment (৳{course.price.toLocaleString()})
                  </button>
                </form>
              )}

              {paymentStep === "success" && (
                <div className="text-center space-y-4 py-4 animate-scale-up">
                  <span className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-2xl flex items-center justify-center mx-auto">
                    ✓
                  </span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-zinc-100">Enrollment Complete!</h4>
                    <p className="text-xs text-zinc-400">Payment received via {paymentMethod} sandbox</p>
                    <p className="text-[10px] text-zinc-500 font-medium">Transaction ID: {transactionId}</p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsEnrollModalOpen(false)}
                      className="w-full h-9 flex items-center justify-center font-semibold text-xs rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all text-center"
                    >
                      Go to Student Dashboard
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
