import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-123456";

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };
    return decoded.userId || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const userId = await authenticate();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const courseId = url.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found / You are not enrolled" },
        { status: 404 }
      );
    }

    const completed = JSON.parse(enrollment.completedLessons);

    return NextResponse.json({ completed });
  } catch (err) {
    console.error("GET Progress error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await authenticate();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { courseId, lessonId, completed } = await request.json();

    if (!courseId || !lessonId || completed === undefined) {
      return NextResponse.json(
        { error: "courseId, lessonId, and completed status are required" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment record not found" },
        { status: 404 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    let completedList: string[] = JSON.parse(enrollment.completedLessons);

    if (completed) {
      if (!completedList.includes(lessonId)) {
        completedList.push(lessonId);
      }
    } else {
      completedList = completedList.filter((id) => id !== lessonId);
    }

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        completedLessons: JSON.stringify(completedList),
      },
    });

    const parsedLessons = JSON.parse(course.lessons);
    const totalLessons = Array.isArray(parsedLessons) ? parsedLessons.length : 1;
    const progressPercent = Math.round((completedList.length / totalLessons) * 100);

    return NextResponse.json({
      message: "Lesson status updated successfully",
      completed: completedList,
      progressPercent,
    });
  } catch (err) {
    console.error("POST Progress error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
