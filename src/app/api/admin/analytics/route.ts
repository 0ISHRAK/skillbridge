import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticateAdmin } from "../../../../lib/auth";

export async function GET() {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const totalUsers = await prisma.user.count();
    const mentorsCount = await prisma.user.count({ where: { role: "mentor" } });
    const learnersCount = await prisma.user.count({ where: { role: "learner" } });
    const totalCoursesCount = await prisma.course.count();

    const enrollments = await prisma.enrollment.findMany();
    const courses = await prisma.course.findMany();

    const coursePriceMap = new Map<string, number>();
    courses.forEach((c) => coursePriceMap.set(c.id, c.price));

    let courseRevenue = 0;
    enrollments.forEach((e) => {
      const price = coursePriceMap.get(e.courseId) || 0;
      courseRevenue += price;
    });

    const confirmedBookings = await prisma.booking.findMany({
      where: { status: "confirmed" },
    });

    let bookingRevenue = 0;
    confirmedBookings.forEach((b) => {
      bookingRevenue += b.price;
    });

    const grossRevenue = courseRevenue + bookingRevenue;

    const enrollmentCountsMap = new Map<string, number>();
    enrollments.forEach((e) => {
      const count = enrollmentCountsMap.get(e.courseId) || 0;
      enrollmentCountsMap.set(e.courseId, count + 1);
    });

    const sortedCourseIds = Array.from(enrollmentCountsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

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
