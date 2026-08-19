"use client";

import { useState, useEffect } from "react";

interface ReportData {
  userGrowth: { total: number; thisMonth: number; lastMonth: number };
  courseStats: { total: number; avgPrice: number; totalLessons: number };
  bookingStats: { total: number; confirmed: number; pending: number; refunded: number; disputed: number };
  revenueBreakdown: { courses: number; bookings: number; total: number };
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [analyticsRes, usersRes, bookingsRes, coursesRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/users"),
        fetch("/api/admin/bookings"),
        fetch("/api/admin/courses"),
      ]);

      const analytics = analyticsRes.ok ? (await analyticsRes.json()).analytics : null;
      const usersData = usersRes.ok ? (await usersRes.json()).users || [] : [];
      const bookingsData = bookingsRes.ok ? (await bookingsRes.json()).bookings || [] : [];
      const coursesData = coursesRes.ok ? (await coursesRes.json()).courses || [] : [];

      setUsers(usersData);
      setBookings(bookingsData);

      const now = new Date();
      const thisMonth = usersData.filter((u: any) => {
        const d = new Date(u.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
      const lastMonth = usersData.filter((u: any) => {
        const d = new Date(u.createdAt);
        return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
      }).length;

      const totalLessons = coursesData.reduce((sum: number, c: any) => sum + (c.lessons?.length || 0), 0);
      const avgPrice = coursesData.length > 0
        ? Math.round(coursesData.reduce((sum: number, c: any) => sum + c.price, 0) / coursesData.length)
        : 0;

      setData({
        userGrowth: { total: usersData.length, thisMonth, lastMonth },
        courseStats: { total: coursesData.length, avgPrice, totalLessons },
        bookingStats: {
          total: bookingsData.length,
          confirmed: bookingsData.filter((b: any) => b.status === "confirmed").length,
          pending: bookingsData.filter((b: any) => b.status === "pending").length,
          refunded: bookingsData.filter((b: any) => b.status === "refunded").length,
          disputed: bookingsData.filter((b: any) => b.status === "disputed").length,
        },
        revenueBreakdown: {
          courses: analytics?.revenue?.courseEnrollments || 0,
          bookings: analytics?.revenue?.consultationBookings || 0,
          total: analytics?.revenue?.grossPlatformRevenue || 0,
        },
      });
    } catch (err) {
      console.error("Failed to fetch report data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const growthRate = data?.userGrowth.lastMonth
    ? Math.round(((data.userGrowth.thisMonth - data.userGrowth.lastMonth) / data.userGrowth.lastMonth) * 100)
    : data?.userGrowth.thisMonth ? 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Platform Reports</h1>
        <p className="text-xs text-muted-foreground mt-1">Analytics and insights for platform performance</p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">User Growth</h3>
            <span className="text-2xl">📈</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-extrabold">{data?.userGrowth.total}</p>
              <p className="text-[10px] text-muted-foreground">Total Users</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-primary">{data?.userGrowth.thisMonth}</p>
              <p className="text-[10px] text-muted-foreground">This Month</p>
            </div>
            <div>
              <p className={`text-2xl font-extrabold ${growthRate >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {growthRate >= 0 ? "+" : ""}{growthRate}%
              </p>
              <p className="text-[10px] text-muted-foreground">Growth Rate</p>
            </div>
          </div>
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Learners</span>
              <span className="font-bold">{users.filter((u) => u.role === "learner").length}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1">
              <span className="text-muted-foreground">Mentors</span>
              <span className="font-bold">{users.filter((u) => u.role === "mentor").length}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1">
              <span className="text-muted-foreground">Verified Users</span>
              <span className="font-bold text-emerald-500">{users.filter((u) => u.isEmailVerified).length}</span>
            </div>
          </div>
        </div>

        {/* Revenue Report */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Revenue Report</h3>
            <span className="text-2xl">💰</span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-emerald-500">৳{(data?.revenueBreakdown.total || 0).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Gross Platform Revenue</p>
          </div>
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Course Enrollments</span>
              <span className="font-bold">৳{(data?.revenueBreakdown.courses || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Consultation Bookings</span>
              <span className="font-bold">৳{(data?.revenueBreakdown.bookings || 0).toLocaleString()}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: data?.revenueBreakdown.total
                    ? `${Math.round((data.revenueBreakdown.courses / data.revenueBreakdown.total) * 100)}%`
                    : "50%",
                }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground text-center">
              Courses vs Bookings revenue split
            </p>
          </div>
        </div>

        {/* Booking Stats */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Booking Analytics</h3>
            <span className="text-2xl">📅</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-extrabold">{data?.bookingStats.total}</p>
              <p className="text-[10px] text-muted-foreground">Total Bookings</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-500">{data?.bookingStats.confirmed}</p>
              <p className="text-[10px] text-muted-foreground">Confirmed</p>
            </div>
          </div>
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
              </span>
              <span className="font-bold">{data?.bookingStats.pending}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-500" /> Disputed
              </span>
              <span className="font-bold">{data?.bookingStats.disputed}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-400" /> Refunded
              </span>
              <span className="font-bold">{data?.bookingStats.refunded}</span>
            </div>
          </div>
        </div>

        {/* Course Stats */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Course Analytics</h3>
            <span className="text-2xl">📚</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-extrabold">{data?.courseStats.total}</p>
              <p className="text-[10px] text-muted-foreground">Courses</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-primary">{data?.courseStats.totalLessons}</p>
              <p className="text-[10px] text-muted-foreground">Total Lessons</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-amber-500">৳{data?.courseStats.avgPrice}</p>
              <p className="text-[10px] text-muted-foreground">Avg Price</p>
            </div>
          </div>
          <div className="pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              Average {data?.courseStats.total ? Math.round(data.courseStats.totalLessons / data.courseStats.total) : 0} lessons per course
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
