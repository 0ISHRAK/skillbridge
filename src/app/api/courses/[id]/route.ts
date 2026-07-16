import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate, safeJsonParse } from "../../../../lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      course: {
        ...course,
        lessons: safeJsonParse(course.lessons, []),
      },
    });
  } catch (err) {
    console.error("GET Course ID error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decoded = await authenticate();

    if (!decoded || decoded.role !== "mentor") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (course.mentorId !== decoded.userId) {
      return NextResponse.json(
        { error: "Forbidden - You do not own this course" },
        { status: 403 }
      );
    }

    const payload = await request.json();
    const { title, description, category, price, lessons, published } = payload;

    const updateData: Record<string, string | number | boolean | null> = {};
    if (title !== undefined) updateData.title = String(title);
    if (description !== undefined) updateData.description = String(description);
    if (category !== undefined) updateData.category = String(category);
    if (price !== undefined) updateData.price = Math.max(0, Number(price) || 0);
    if (lessons !== undefined) updateData.lessons = JSON.stringify(lessons);
    if (published !== undefined) updateData.published = Boolean(published);

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Course updated successfully",
      course: {
        ...updatedCourse,
        lessons: safeJsonParse(updatedCourse.lessons, []),
      },
    });
  } catch (err) {
    console.error("PUT Course ID error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decoded = await authenticate();

    if (!decoded || decoded.role !== "mentor") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (course.mentorId !== decoded.userId) {
      return NextResponse.json(
        { error: "Forbidden - You do not own this course" },
        { status: 403 }
      );
    }

    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Course successfully deleted",
    });
  } catch (err) {
    console.error("DELETE Course ID error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
