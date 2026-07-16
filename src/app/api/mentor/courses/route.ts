import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate, safeJsonParse } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticate();
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      where: { mentorId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    const courseIds = courses.map((c) => c.id);
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
    });

    const enrollmentCounts = new Map<string, number>();
    enrollments.forEach((e) => {
      enrollmentCounts.set(e.courseId, (enrollmentCounts.get(e.courseId) || 0) + 1);
    });

    const parsed = courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      price: c.price,
      published: c.published,
      lessons: safeJsonParse(c.lessons, []),
      students: enrollmentCounts.get(c.id) || 0,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ courses: parsed });
  } catch (err) {
    console.error("Mentor courses GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticate();
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, description, category, price, lessons } = await request.json();

    if (!title || !description || !category || !lessons || !Array.isArray(lessons) || lessons.length === 0) {
      return NextResponse.json({ error: "Title, description, category, and at least one lesson are required" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title: String(title).slice(0, 200),
        description: String(description).slice(0, 2000),
        category: String(category),
        price: Math.max(0, Number(price) || 0),
        published: true,
        lessons: JSON.stringify(lessons),
        mentorId: user.userId,
        mentorName: user.name || "Mentor",
      },
    });

    return NextResponse.json({ message: "Course created successfully", course: { id: course.id, title: course.title } });
  } catch (err) {
    console.error("Mentor courses POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
