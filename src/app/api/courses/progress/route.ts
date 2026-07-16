import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate, safeJsonParse } from "../../../../lib/auth";

export async function GET(request: Request) {
  try {
    const decoded = await authenticate();
    if (!decoded) {
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
      where: { userId: decoded.userId, courseId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found / You are not enrolled" },
        { status: 404 }
      );
    }

    const completed = safeJsonParse<string[]>(enrollment.completedLessons, []);

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
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
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

    const parsedLessons = safeJsonParse<Array<{ id?: string }>>(course.lessons, []);
    const validLessonIds = parsedLessons.map((l) => l.id).filter(Boolean);

    if (validLessonIds.length > 0 && !validLessonIds.includes(lessonId)) {
      return NextResponse.json(
        { error: "Invalid lessonId - lesson does not belong to this course" },
        { status: 400 }
      );
    }

    let completedList: string[] = safeJsonParse<string[]>(enrollment.completedLessons, []);

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

    const totalLessons = Math.max(parsedLessons.length, 1);
    const progressPercent = Math.min(100, Math.round((completedList.length / totalLessons) * 100));

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
