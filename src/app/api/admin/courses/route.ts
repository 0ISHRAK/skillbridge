import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-123456";

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    return decoded.role === "admin" || decoded.role === "mentor";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const isAdmin = await checkAdmin();
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
      lessons: JSON.parse(c.lessons),
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
