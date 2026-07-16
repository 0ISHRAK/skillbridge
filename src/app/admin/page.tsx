"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Analytics {
  totalUsers: number;
  breakdown: { mentors: number; learners: number };
  totalCourses: number;
  revenue: {
    courseEnrollments: number;
    consultationBookings: number;
    grossPlatformRevenue: number;
  };
  popularCourses: { id: string; title: string; mentorName: string; enrollmentsCount: number }[];
}

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
    fetchRecentUsers();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setRecentUsers(data.users?.slice(0, 5) || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: analytics?.totalUsers || 0,
      subtitle: `${analytics?.breakdown.learners || 0} learners, ${analytics?.breakdown.mentors || 0} mentors`,
      icon: "👥",
      color: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    },
    {
      title: "Total Courses",
      value: analytics?.totalCourses || 0,
      subtitle: "Published on platform",
      icon: "📚",
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    },
    {
      title: "Gross Revenue",
      value: `৳${(analytics?.revenue.grossPlatformRevenue || 0).toLocaleString()}`,
      subtitle: `Courses: ৳${(analytics?.revenue.courseEnrollments || 0).toLocaleString()} | Bookings: ৳${(analytics?.revenue.consultationBookings || 0).toLocaleString()}`,
      icon: "💰",
      color: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    },
    {
      title: "Platform Health",
      value: "Active",
      subtitle: "All systems operational",
      icon: "🟢",
      color: "bg-green-500/10 border-green-500/20 text-green-500",
    },
  ];

  return (
    <div className="space-y-8 animate-scale-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">Platform overview and management controls</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/reports"
            className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-accent transition-all"
          >
            View Reports
          </Link>
          <Link
            href="/admin/settings"
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-all"
          >
            Platform Settings
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className={`p-5 rounded-2xl border ${stat.color} bg-card`}>
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-2xl font-extrabold mt-3">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">{stat.title}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions + Popular Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/mentors" className="p-4 rounded-xl border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-center space-y-2">
              <span className="text-2xl block">🎓</span>
              <p className="text-[10px] font-bold">Verify Mentors</p>
            </Link>
            <Link href="/admin/users" className="p-4 rounded-xl border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-center space-y-2">
              <span className="text-2xl block">👥</span>
              <p className="text-[10px] font-bold">Manage Users</p>
            </Link>
            <Link href="/admin/bookings" className="p-4 rounded-xl border border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-center space-y-2">
              <span className="text-2xl block">📅</span>
              <p className="text-[10px] font-bold">Bookings</p>
            </Link>
            <Link href="/admin/courses" className="p-4 rounded-xl border border-border hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-center space-y-2">
              <span className="text-2xl block">📚</span>
              <p className="text-[10px] font-bold">Courses</p>
            </Link>
          </div>
        </div>

        {/* Popular Courses */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold">Popular Courses</h2>
          {analytics?.popularCourses && analytics.popularCourses.length > 0 ? (
            <div className="space-y-3">
              {analytics.popularCourses.map((course, idx) => (
                <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{course.title}</p>
                    <p className="text-[10px] text-muted-foreground">by {course.mentorName}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500">{course.enrollmentsCount} enrolled</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">No enrollment data yet</p>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Recent Registrations</h2>
          <Link href="/admin/users" className="text-[10px] font-bold text-primary hover:underline">
            View All →
          </Link>
        </div>
        {recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-semibold">Name</th>
                  <th className="text-left py-2 font-semibold">Email</th>
                  <th className="text-left py-2 font-semibold">Role</th>
                  <th className="text-left py-2 font-semibold">Verified</th>
                  <th className="text-left py-2 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                    <td className="py-2.5 font-medium">{user.name}</td>
                    <td className="py-2.5 text-muted-foreground">{user.email}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        user.role === "mentor" ? "bg-amber-500/10 text-amber-500" :
                        user.role === "admin" ? "bg-red-500/10 text-red-500" :
                        "bg-blue-500/10 text-blue-500"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2.5">
                      {user.isEmailVerified ? (
                        <span className="text-emerald-500 font-bold">✓</span>
                      ) : (
                        <span className="text-red-400 font-bold">✗</span>
                      )}
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-6">No users registered yet</p>
        )}
      </div>
    </div>
  );
}
