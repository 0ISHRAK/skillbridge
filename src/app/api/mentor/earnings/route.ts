import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticate();
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const confirmedBookings = await prisma.booking.findMany({
      where: { mentorId: user.userId, status: "confirmed" },
    });

    const totalEarnings = confirmedBookings.reduce((sum, b) => sum + b.price, 0);

    const courses = await prisma.course.findMany({
      where: { mentorId: user.userId },
    });

    const courseIds = courses.map((c) => c.id);
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
    });

    let courseEarnings = 0;
    enrollments.forEach((e) => {
      const course = courses.find((c) => c.id === e.courseId);
      if (course) courseEarnings += course.price;
    });

    const mentor = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { tokenBalance: true },
    });

    return NextResponse.json({
      earnings: {
        bookingRevenue: totalEarnings,
        courseRevenue: courseEarnings,
        totalRevenue: totalEarnings + courseEarnings,
        walletBalance: mentor?.tokenBalance || 0,
        totalBookings: confirmedBookings.length,
        totalStudents: enrollments.length,
      },
    });
  } catch (err) {
    console.error("Mentor earnings GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
