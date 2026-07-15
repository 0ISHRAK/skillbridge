import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-123456";

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; role?: string; name?: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";
    const mentorId = url.searchParams.get("mentorId") || "";

    const where: {
      published: boolean;
      category?: string;
      mentorId?: string;
      OR?: Array<{ title: { contains: string } } | { description: { contains: string } }>;
    } = {
      published: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (mentorId) {
      where.mentorId = mentorId;
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const parsedCourses = courses.map((course) => ({
      ...course,
      lessons: JSON.parse(course.lessons),
    }));

    return NextResponse.json({ courses: parsedCourses });
  } catch (err) {
    console.error("GET Courses error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const decoded = await authenticate();
    if (!decoded || decoded.role !== "mentor") {
      return NextResponse.json(
        { error: "Unauthorized - Mentor access required" },
        { status: 403 }
      );
    }

    const payload = await request.json();
    const { title, description, category, price, lessons } = payload;

    if (!title || !description || !category || !lessons || !Array.isArray(lessons) || lessons.length === 0) {
      return NextResponse.json(
        { error: "All fields and at least one lesson are required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        price: Number(price) || 0,
        lessons: JSON.stringify(lessons),
        mentorId: decoded.userId!,
        mentorName: decoded.name || "Mentor Name",
      },
    });

    return NextResponse.json({
      message: "Course created successfully",
      course: {
        ...course,
        lessons: JSON.parse(course.lessons),
      },
    });
  } catch (err) {
    console.error("POST Course error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
