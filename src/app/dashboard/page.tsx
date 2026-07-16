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

  const stats = [
    { title: "Skill Token Balance", value: `${tokenBalance} Tokens`, icon: "💳", color: "text-primary bg-primary/10 border-primary/20", link: "/pricing", linkText: "Buy Tokens" },
    { title: "Completed Lessons", value: `${completedLessonsTotal} Lesson${completedLessonsTotal !== 1 ? "s" : ""}`, icon: "🎓", color: "text-teal-500 bg-teal-500/10 border-teal-500/20", link: "/dashboard/courses", linkText: "View Courses" },
    { title: "Scheduled Sessions", value: `${upcomingCount} Upcoming Call${upcomingCount !== 1 ? "s" : ""}`, icon: "📅", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", link: "/dashboard/sessions", linkText: "View Schedule" }
  ];

  return (
    <div className="space-y-8 animate-scale-up">
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
          <Link href="/explore" className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-accent text-foreground transition-all">
            Explore Mentors
          </Link>
          <Link href="/pricing" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all shadow-md shadow-primary/10">
            Buy Tokens
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
          <h2 className="text-lg font-bold tracking-tight">Your Enrolled Programs</h2>

          {enrollments.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card border border-border text-center">
              <span className="text-3xl block mb-2">📚</span>
              <p className="text-sm font-semibold">No courses enrolled yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Find a course that fits your goals.</p>
              <Link href="/explore" className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/10">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.slice(0, 3).map((enrollment) => {
                const course = enrollment.course;
                const total = Array.isArray(course.lessons) ? course.lessons.length : 0;
                const done = Array.isArray(enrollment.completedLessons) ? enrollment.completedLessons.length : 0;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={enrollment.id} className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] bg-primary/10 text-primary border border-primary/20 font-medium">
                          {course.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{done} of {total} Lessons Done</span>
                      </div>
                      <h3 className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                        <Link href={`/dashboard/courses/${course.id}`}>{course.title}</Link>
                      </h3>
                      <div className="space-y-1 max-w-xs">
                        <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[9px] text-muted-foreground font-semibold">{pct}% Complete</p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-accent text-foreground transition-all sm:self-center"
                    >
                      Resume Learning
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-bold tracking-tight">Active Consultation</h2>

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
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50">
                <span className="text-2xl">👨‍💻</span>
                <div>
                  <p className="text-xs font-bold">{upcomingBooking.mentorName}</p>
                  <p className="text-[10px] text-muted-foreground">Your Mentor</p>
                </div>
              </div>
              <Link
                href={`/dashboard/sessions/${upcomingBooking.id}`}
                className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
              >
                Launch Live Video Room
              </Link>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-3">
              <span className="text-3xl block">📅</span>
              <p className="text-sm font-semibold">No upcoming sessions</p>
              <p className="text-xs text-muted-foreground">Book a mentor to start a 1-on-1 session.</p>
              <Link
                href="/dashboard/book"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
              >
                Book a Session
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
    <div className="space-y-8 animate-scale-up">
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
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
          <Link href="/dashboard/mentor/courses/new" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all shadow-md shadow-primary/10">
            + Create Course
          </Link>
          <Link href="/dashboard/mentor/availability" className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-accent text-foreground transition-all">
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
            <div className="p-8 rounded-2xl bg-card border border-border text-center">
              <span className="text-3xl block mb-2">📖</span>
              <p className="text-sm font-semibold">No courses yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Create your first course to start earning.</p>
              <Link href="/dashboard/mentor/courses/new" className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/10">
                Create a Course
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
                  <Link href="/dashboard/mentor/courses" className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-accent text-foreground transition-all sm:self-center">
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
                className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
              >
                Launch Video Room
              </Link>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-3">
              <span className="text-3xl block">📅</span>
              <p className="text-sm font-semibold">No upcoming sessions</p>
              <p className="text-xs text-muted-foreground">Pending bookings will appear here.</p>
              <Link href="/dashboard/mentor/bookings" className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-accent text-foreground transition-all">
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
    async function loadDashboard() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          setRole(localStorage.getItem("userRole") || "learner");
          setUserName(localStorage.getItem("userName") || "User");
          setIsLoading(false);
          return;
        }
        const meData = await meRes.json();
        const user = meData.user;

        setRole(user.role);
        setUserName(user.name);
        setTokenBalance(user.tokenBalance || 0);

        // Update localStorage too
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userName", user.name);
        localStorage.setItem("tokenBalance", String(user.tokenBalance || 0));

        if (user.role === "learner") {
          const [enrollRes, bookRes] = await Promise.all([
            fetch("/api/courses/enrollments"),
            fetch("/api/bookings"),
          ]);

          if (enrollRes.ok) {
            const d = await enrollRes.json();
            setEnrollments(d.enrollments || []);
          }
          if (bookRes.ok) {
            const d = await bookRes.json();
            const upcoming = (d.bookings || []).find(
              (b: Booking) => b.status === "confirmed" || b.status === "pending"
            );
            setUpcomingBooking(upcoming || null);
          }
        } else if (user.role === "mentor") {
          const [courseRes, bookRes] = await Promise.all([
            fetch("/api/mentor/courses"),
            fetch("/api/mentor/bookings"),
          ]);

          if (courseRes.ok) {
            const d = await courseRes.json();
            setMentorCourses(d.courses || []);
          }
          if (bookRes.ok) {
            const d = await bookRes.json();
            const upcoming = (d.bookings || []).find(
              (b: Booking) => b.status === "confirmed" || b.status === "pending"
            );
            setUpcomingBooking(upcoming || null);
          }
        }
      } catch {
        setRole(localStorage.getItem("userRole") || "learner");
        setUserName(localStorage.getItem("userName") || "User");
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-scale-up">
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 animate-pulse">
          <div className="h-7 bg-accent rounded w-1/3 mb-2" />
          <div className="h-3 bg-accent rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
