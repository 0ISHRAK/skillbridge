import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticateAdmin, safeJsonParse } from "../../../../lib/auth";

export async function GET() {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
    });

    const parsedCourses = courses.map((c) => ({
      ...c,
      lessons: safeJsonParse(c.lessons, []),
    }));

    return NextResponse.json({ courses: parsedCourses });
  } catch (err) {
    console.error("Admin GET Courses error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
