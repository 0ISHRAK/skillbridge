"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  duration: string;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  lessons: Lesson[];
  mentorId: string;
  mentorName: string;
  published: boolean;
}

const LEVEL_MAP: Record<string, string> = {
  "Software & Coding": "Intermediate",
  "UI/UX & Product Design": "Beginner",
  "IELTS & Communication": "Intermediate",
  "Freelancing & Career": "Beginner",
  "Digital Marketing": "Advanced",
  "Higher Study Abroad": "Beginner",
};

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [course, setCourse] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Enrollment state
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  // Payment modal states (for non-subscribed users)
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"method" | "number" | "otp" | "pin" | "success" | "error">("method");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "rocket" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [modalError, setModalError] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [courseRes, subRes, enrollRes] = await Promise.all([
          fetch(`/api/courses/${id}`),
          fetch("/api/subscription/status").catch(() => null),
          fetch("/api/courses/enrollments").catch(() => null),
        ]);

        if (!courseRes.ok) {
          setNotFound(true);
          return;
        }
        const courseData = await courseRes.json();
        setCourse(courseData.course);

        if (subRes?.ok) {
          const subData = await subRes.json();
          if (subData.subscription?.isActive) setIsSubscribed(true);
        }

        if (enrollRes?.ok) {
          const enrollData = await enrollRes.json();
          const alreadyEnrolled = (enrollData.enrollments || []).some(
            (e: { courseId: string }) => e.courseId === id
          );
          if (alreadyEnrolled) setIsEnrolled(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSubscriberEnroll = async () => {
    setEnrolling(true);
    setEnrollError("");
    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEnrolled(true);
        setEnrollSuccess(true);
      } else {
        setEnrollError(data.error || "Enrollment failed. Please try again.");
      }
    } catch {
      setEnrollError("Network error. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const openPaymentModal = () => {
    setIsEnrollModalOpen(true);
    setPaymentStep("method");
    setPaymentMethod(null);
    setPhoneNumber("");
    setOtp("");
    setPin("");
    setTransactionId("");
    setModalError("");
  };

  const handleSelectMethod = (method: "bkash" | "nagad" | "rocket") => {
    setPaymentMethod(method);
    setPaymentStep("number");
  };

  const handleNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 11) setPaymentStep("otp");
    else setModalError("Enter a valid 11-digit mobile number.");
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) { setModalError(""); setPaymentStep("pin"); }
    else setModalError("Enter the 6-digit OTP code.");
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) { setModalError("Enter your payment PIN."); return; }
    setConfirming(true);
    setModalError("");
    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        const txnId = `SB-${Math.floor(Math.random() * 899999 + 100000)}`;
        setTransactionId(txnId);
        setPaymentStep("success");
        setIsEnrolled(true);
      } else {
        setModalError(data.error || "Enrollment failed.");
        setPaymentStep("error");
      }
    } catch {
      setModalError("Network error. Please try again.");
      setPaymentStep("error");
    } finally {
      setConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="animate-pulse space-y-6">
          <div className="h-3 bg-accent rounded w-1/3" />
          <div className="h-8 bg-accent rounded w-2/3" />
          <div className="h-4 bg-accent rounded w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-40 bg-accent rounded-xl" />
              <div className="h-40 bg-accent rounded-xl" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-64 bg-accent rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 text-center space-y-4">
        <span className="text-4xl block">🔍</span>
        <h1 className="text-2xl font-extrabold">Course Not Found</h1>
        <p className="text-sm text-muted-foreground">This course may have been removed or the link is invalid.</p>
        <Link href="/explore" className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-lg hover:bg-primary/95 transition-all">
          Browse All Courses
        </Link>
      </div>
    );
  }

  const level = LEVEL_MAP[course.category] || "Beginner";
  const lessonCount = course.lessons.length;
  const totalMinutes = course.lessons.reduce((acc, l) => {
    const m = parseInt(l.duration) || 0;
    return acc + m;
  }, 0);
  const totalHours = Math.round(totalMinutes / 60);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link> &gt;{" "}
        <Link href="/explore" className="hover:text-primary">Explore</Link> &gt;{" "}
        <span className="text-foreground font-semibold">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {course.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug">{course.title}</h1>
            <p className="text-base text-muted-foreground leading-relaxed">{course.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>Level: <span className="font-semibold text-foreground">{level}</span></span>
              <span>•</span>
              <span>{lessonCount} lessons</span>
              {totalHours > 0 && <><span>•</span><span className="font-semibold text-foreground">~{totalHours}h total</span></>}
            </div>
          </div>

          <hr className="border-border" />

          {/* Curriculum */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Course Curriculum ({lessonCount} lessons)</h2>
            <div className="space-y-2">
              {course.lessons.map((lesson, idx) => (
                <div key={lesson.id || idx} className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{lesson.title}</span>
                  </div>
                  {lesson.duration && (
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0 ml-4">{lesson.duration}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mentor */}
          <div className="bg-muted/50 border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Your Mentor</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
                👤
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base">{course.mentorName}</h3>
                <p className="text-xs text-muted-foreground">Verified SkillBridge Mentor</p>
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
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-6">
            {/* Subscription badge */}
            {isSubscribed && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">All-Access Plan</p>
                <p className="text-xs text-emerald-600 mt-0.5 font-medium">This course is included in your subscription</p>
              </div>
            )}

            {/* Price */}
            {!isSubscribed && (
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Course Investment</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-primary">৳{course.price.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="space-y-3 text-xs text-muted-foreground border-y border-border py-4">
              <div className="flex justify-between">
                <span>Lessons</span>
                <span className="font-semibold text-foreground">{lessonCount} lessons</span>
              </div>
              {totalHours > 0 && (
                <div className="flex justify-between">
                  <span>Total Duration</span>
                  <span className="font-semibold text-foreground">~{totalHours} hours</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Language</span>
                <span className="font-semibold text-foreground">Bengali & English</span>
              </div>
              <div className="flex justify-between">
                <span>Access</span>
                <span className="font-semibold text-foreground">Lifetime Portal Access</span>
              </div>
            </div>

            {/* CTA */}
            {isEnrolled ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-xs font-bold text-emerald-500">✓ You are enrolled in this course</p>
                </div>
                <Link
                  href="/dashboard/courses"
                  className="w-full h-11 flex items-center justify-center font-bold text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-all text-center"
                >
                  Go to My Courses →
                </Link>
              </div>
            ) : isSubscribed ? (
              <div className="space-y-3">
                {enrollSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-xs font-bold text-emerald-500">✓ Enrolled successfully!</p>
                  </div>
                )}
                {enrollError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
                    <p className="text-xs text-destructive font-semibold">{enrollError}</p>
                  </div>
                )}
                {!enrollSuccess ? (
                  <button
                    onClick={handleSubscriberEnroll}
                    disabled={enrolling}
                    className="w-full h-11 flex items-center justify-center font-bold text-sm rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {enrolling ? "Enrolling..." : "Enroll Free — All-Access Plan ✓"}
                  </button>
                ) : (
                  <Link
                    href="/dashboard/courses"
                    className="w-full h-11 flex items-center justify-center font-bold text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-all text-center"
                  >
                    Go to My Courses →
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={openPaymentModal}
                  className="w-full h-11 flex items-center justify-center font-bold text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
                >
                  Enroll Now with bKash / Nagad
                </button>
                <p className="text-[10px] text-center text-muted-foreground">
                  Or{" "}
                  <Link href="/pricing#subscription" className="text-primary underline font-semibold">
                    subscribe for ৳799/month
                  </Link>{" "}
                  to unlock all courses
                </p>
              </div>
            )}

            {/* Payment method badges */}
            {!isSubscribed && !isEnrolled && (
              <div className="text-center space-y-2">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Supported Payment Methods</p>
                <div className="flex justify-center items-center gap-3">
                  <span className="px-2 py-1 text-[9px] font-bold rounded bg-rose-500 text-white">bKash</span>
                  <span className="px-2 py-1 text-[9px] font-bold rounded bg-orange-500 text-white">Nagad</span>
                  <span className="px-2 py-1 text-[9px] font-bold rounded bg-violet-600 text-white">Rocket</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal (non-subscribed users) */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-[10px] font-bold">S</div>
                <h3 className="font-bold text-sm text-zinc-100">Skillbridge Checkout</h3>
              </div>
              <button onClick={() => setIsEnrollModalOpen(false)} className="text-zinc-400 hover:text-zinc-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-6">
              {paymentStep === "method" && (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-400 text-center font-medium">
                    Pay <span className="text-primary font-bold">৳{course.price.toLocaleString()}</span> for <span className="font-bold text-zinc-200">{course.title}</span>
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {(["bkash", "nagad", "rocket"] as const).map((m) => (
                      <button key={m} onClick={() => handleSelectMethod(m)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left text-zinc-200 group ${
                          m === "bkash" ? "border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10" :
                          m === "nagad" ? "border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10" :
                          "border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10"
                        }`}
                      >
                        <span className="font-bold text-sm flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full inline-block ${m === "bkash" ? "bg-rose-500" : m === "nagad" ? "bg-orange-500" : "bg-violet-600"}`} />
                          {m.charAt(0).toUpperCase() + m.slice(1)} Checkout
                        </span>
                        <span className={`text-xs font-semibold group-hover:translate-x-1 transition-transform ${m === "bkash" ? "text-rose-400" : m === "nagad" ? "text-orange-400" : "text-violet-400"}`}>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentStep === "number" && (
                <form onSubmit={handleNumberSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase text-white ${paymentMethod === "bkash" ? "bg-rose-500" : paymentMethod === "nagad" ? "bg-orange-500" : "bg-violet-600"}`}>
                      {paymentMethod}
                    </span>
                    <p className="text-xs text-zinc-300">Enter your {paymentMethod} account number</p>
                  </div>
                  {modalError && <p className="text-[10px] text-destructive text-center font-semibold">{modalError}</p>}
                  <input type="text" maxLength={11} placeholder="e.g. 017XXXXXXXX" required value={phoneNumber}
                    onChange={(e) => { setModalError(""); setPhoneNumber(e.target.value.replace(/\D/g, "")); }}
                    className="w-full text-center text-sm font-semibold p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                  />
                  <button type="submit" className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all">
                    Send OTP Verification Code
                  </button>
                </form>
              )}

              {paymentStep === "otp" && (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-zinc-300">Verification Code Sent</p>
                    <p className="text-[10px] text-zinc-500">OTP sent to {phoneNumber}</p>
                  </div>
                  {modalError && <p className="text-[10px] text-destructive text-center font-semibold">{modalError}</p>}
                  <input type="text" maxLength={6} placeholder="Enter 6-digit OTP" required value={otp}
                    onChange={(e) => { setModalError(""); setOtp(e.target.value.replace(/\D/g, "")); }}
                    className="w-full text-center tracking-widest text-sm font-bold p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                  />
                  <button type="submit" className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all">
                    Verify OTP
                  </button>
                </form>
              )}

              {paymentStep === "pin" && (
                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-zinc-300">Enter Payment PIN</p>
                    <p className="text-[10px] text-zinc-500">Confirm payment of ৳{course.price.toLocaleString()} via {paymentMethod}</p>
                  </div>
                  {modalError && <p className="text-[10px] text-destructive text-center font-semibold">{modalError}</p>}
                  <input type="password" maxLength={5} placeholder="••••" required value={pin}
                    onChange={(e) => { setModalError(""); setPin(e.target.value.replace(/\D/g, "")); }}
                    className="w-full text-center tracking-widest text-sm font-bold p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                  />
                  <button type="submit" disabled={confirming}
                    className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {confirming ? "Processing..." : `Confirm Payment (৳${course.price.toLocaleString()})`}
                  </button>
                </form>
              )}

              {paymentStep === "success" && (
                <div className="text-center space-y-4 py-4">
                  <span className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-2xl flex items-center justify-center mx-auto">✓</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-zinc-100">Enrollment Complete!</h4>
                    <p className="text-xs text-zinc-400">Payment received via {paymentMethod} sandbox</p>
                    <p className="text-[10px] text-zinc-500 font-medium">Transaction ID: {transactionId}</p>
                  </div>
                  <Link href="/dashboard/courses" onClick={() => setIsEnrollModalOpen(false)}
                    className="w-full h-9 flex items-center justify-center font-semibold text-xs rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all"
                  >
                    Go to My Courses
                  </Link>
                </div>
              )}

              {paymentStep === "error" && (
                <div className="text-center space-y-4 py-4">
                  <span className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-2xl flex items-center justify-center mx-auto">✗</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-zinc-100">Enrollment Failed</h4>
                    <p className="text-xs text-destructive font-semibold">{modalError}</p>
                  </div>
                  <div className="space-y-2 pt-2">
                    <button onClick={() => { setPaymentStep("method"); setModalError(""); }}
                      className="w-full h-9 flex items-center justify-center font-semibold text-xs rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all"
                    >
                      Try Again
                    </button>
                    <Link href="/dashboard/billing" onClick={() => setIsEnrollModalOpen(false)}
                      className="w-full h-9 flex items-center justify-center font-semibold text-xs rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all"
                    >
                      Buy More Tokens →
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
