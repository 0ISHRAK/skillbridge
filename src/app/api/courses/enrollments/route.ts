import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate, safeJsonParse } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    const courseIds = enrollments.map((e) => e.courseId);
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
    });
    const courseMap = new Map(courses.map((c) => [c.id, c]));

    const result = enrollments
      .map((enrollment) => {
        const course = courseMap.get(enrollment.courseId);
        if (!course) return null;
        return {
          id: enrollment.id,
          courseId: enrollment.courseId,
          completedLessons: safeJsonParse(enrollment.completedLessons, []),
          course: {
            id: course.id,
            title: course.title,
            category: course.category,
            price: course.price,
            lessons: safeJsonParse(course.lessons, []),
            mentorName: course.mentorName,
          },
        };
      })
      .filter(Boolean);

    return NextResponse.json({ enrollments: result });
  } catch (err) {
    console.error("Enrollments GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
