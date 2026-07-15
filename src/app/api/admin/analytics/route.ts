import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-123456";

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    return decoded.role === "admin" || decoded.role === "mentor";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // 1. Total User Counts & Role Breakdown
    const totalUsers = await prisma.user.count();
    const mentorsCount = await prisma.user.count({ where: { role: "mentor" } });
    const learnersCount = await prisma.user.count({ where: { role: "learner" } });

    // 2. Courses count
    const totalCoursesCount = await prisma.course.count();

    // 3. Financial calculations
    const enrollments = await prisma.enrollment.findMany();
    const courses = await prisma.course.findMany();
    
    // Map course price by courseId
    const coursePriceMap = new Map<string, number>();
    courses.forEach((c) => coursePriceMap.set(c.id, c.price));

    let courseRevenue = 0;
    enrollments.forEach((e) => {
      const price = coursePriceMap.get(e.courseId) || 0;
      courseRevenue += price;
    });

    const confirmedBookings = await prisma.booking.findMany({
      where: {
        status: "confirmed",
      },
    });

    let bookingRevenue = 0;
    confirmedBookings.forEach((b) => {
      bookingRevenue += b.price;
    });

    const grossRevenue = courseRevenue + bookingRevenue;

    // 4. Popular courses calculation
    const enrollmentCountsMap = new Map<string, number>();
    enrollments.forEach((e) => {
      const count = enrollmentCountsMap.get(e.courseId) || 0;
      enrollmentCountsMap.set(e.courseId, count + 1);
    });

    const sortedCourseIds = Array.from(enrollmentCountsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3); // top 3

    const popularCourses = [];
    for (const [courseId, count] of sortedCourseIds) {
      const courseDetails = courses.find((c) => c.id === courseId);
      if (courseDetails) {
        popularCourses.push({
          id: courseDetails.id,
          title: courseDetails.title,
          mentorName: courseDetails.mentorName,
          enrollmentsCount: count,
        });
      }
    }

    return NextResponse.json({
      analytics: {
        totalUsers,
        breakdown: {
          mentors: mentorsCount,
          learners: learnersCount,
        },
        totalCourses: totalCoursesCount,
        revenue: {
          courseEnrollments: courseRevenue,
          consultationBookings: bookingRevenue,
          grossPlatformRevenue: grossRevenue,
        },
        popularCourses,
      },
    });
  } catch (err) {
    console.error("Admin Analytics error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
