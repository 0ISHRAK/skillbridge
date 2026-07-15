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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; role?: string };
    return decoded;
  } catch {
    return null;
  }
}

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
        lessons: JSON.parse(course.lessons),
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
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = Number(price);
    if (lessons !== undefined) updateData.lessons = JSON.stringify(lessons);
    if (published !== undefined) updateData.published = published;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Course updated successfully",
      course: {
        ...updatedCourse,
        lessons: JSON.parse(updatedCourse.lessons),
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
