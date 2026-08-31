import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "../../../../lib/db";
import { authenticateAdmin, safeJsonParse } from "../../../../lib/auth";

const noCacheHeaders = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
};

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
      mentorName: c.mentorName || "Mentor",
      approvalStatus: c.approvalStatus || (c.isApproved || c.published ? "approved" : "pending"),
      isApproved: c.approvalStatus === "approved" || Boolean(c.isApproved) || Boolean(c.published),
      lessons: safeJsonParse(c.lessons, []),
      whatYouLearn: safeJsonParse(c.whatYouLearn, []),
      requirements: safeJsonParse(c.requirements, []),
    }));

    return NextResponse.json({ courses: parsedCourses }, { headers: noCacheHeaders });
  } catch (err) {
    console.error("Admin GET Courses error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: noCacheHeaders }
    );
  }
}


export async function POST(request: Request) {
  try {
    if (!(await authenticateAdmin())) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const payload = await request.json();
    const title = String(payload.title || "").trim();
    const description = String(payload.description || "").trim();
    const category = String(payload.category || "").trim();

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Title, description, and category are required" }, { status: 400 });
    }

    const admin = await prisma.user.findFirst({
      where: { OR: [{ role: "admin" }, { role: "ADMIN" }] },
      select: { id: true, name: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin account not found" }, { status: 500 });
    }

    const isPublished = Boolean(payload.published);
    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        mentorId: admin.id,
        mentorName: String(payload.instructor || "").trim() || admin.name,
        thumbnail: String(payload.thumbnail || "").trim() || null,
        level: String(payload.level || "Beginner").trim(),
        duration: String(payload.duration || "").trim() || null,
        price: Math.max(0, Number(payload.price) || 0),
        whatYouLearn: JSON.stringify(Array.isArray(payload.whatYouLearn) ? payload.whatYouLearn : []),
        requirements: JSON.stringify(Array.isArray(payload.requirements) ? payload.requirements : []),
        lessons: JSON.stringify(Array.isArray(payload.lessons) ? payload.lessons : []),
        published: isPublished,
        approvalStatus: isPublished ? "approved" : "pending",
      },
    });

    return NextResponse.json({
      message: "Course created successfully",
      course: {
        ...course,
        lessons: safeJsonParse(course.lessons, []),
        whatYouLearn: safeJsonParse(course.whatYouLearn, []),
        requirements: safeJsonParse(course.requirements, []),
      },
    }, { status: 201 });
  } catch (err) {
    console.error("Admin POST Course error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
