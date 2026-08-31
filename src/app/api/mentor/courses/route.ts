import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate, safeJsonParse } from "../../../../lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
};

export async function GET() {
  try {
    const authUser = await authenticate();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401, headers: noCacheHeaders });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, role: true },
    });

    if (!dbUser || (dbUser.role !== "mentor" && dbUser.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized - Mentor or Admin access required" }, { status: 403, headers: noCacheHeaders });
    }

    const courses = await prisma.course.findMany({
      where: dbUser.role === "admin" ? {} : { mentorId: authUser.userId },
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
      thumbnail: c.thumbnail,
      published: c.published,
      approvalStatus: c.approvalStatus,
      lessons: safeJsonParse(c.lessons, []),
      students: enrollmentCounts.get(c.id) || 0,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ courses: parsed }, { headers: noCacheHeaders });
  } catch (err) {
    console.error("Mentor courses GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: noCacheHeaders });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await authenticate();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401, headers: noCacheHeaders });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, name: true, role: true },
    });

    if (!dbUser || (dbUser.role !== "mentor" && dbUser.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized - Mentor or Admin account required" }, { status: 403, headers: noCacheHeaders });
    }

    const body = await request.json();
    const { title, description, category, price, lessons, thumbnail, level, duration, whatYouLearn, requirements } = body;

    if (!title || !description || !category || !lessons) {
      return NextResponse.json({ error: "Title, description, category, and lessons are required." }, { status: 400, headers: noCacheHeaders });
    }

    const parsedLessons = typeof lessons === "string"
      ? lessons
      : JSON.stringify(Array.isArray(lessons) ? lessons : []);

    if (parsedLessons === "[]" || (Array.isArray(lessons) && lessons.length === 0)) {
      return NextResponse.json({ error: "Please add at least one lesson." }, { status: 400, headers: noCacheHeaders });
    }

    const parsedPrice = Math.round(Math.max(0, Number(price) || 0));
    const isAdmin = dbUser.role === "admin";

    const course = await prisma.course.create({
      data: {
        title: String(title).trim().slice(0, 200),
        description: String(description).trim().slice(0, 2000),
        category: String(category).trim(),
        price: parsedPrice,
        thumbnail: thumbnail ? String(thumbnail).trim() : null,
        level: level ? String(level).trim() : "Beginner",
        duration: duration ? String(duration).trim() : null,
        whatYouLearn: typeof whatYouLearn === "string" ? whatYouLearn : JSON.stringify(Array.isArray(whatYouLearn) ? whatYouLearn : []),
        requirements: typeof requirements === "string" ? requirements : JSON.stringify(Array.isArray(requirements) ? requirements : []),
        published: isAdmin, // Admins auto-publish, mentors wait for approval
        isApproved: isAdmin,
        approvalStatus: isAdmin ? "approved" : "pending",
        lessons: parsedLessons,
        mentorId: dbUser.id,
        mentorName: dbUser.name || "Mentor",
      },
    });

    if (isAdmin) {
      try {
        await prisma.course.update({
          where: { id: course.id },
          data: { published: true, approvalStatus: "approved" },
        });
      } catch {}
    }

    // Notify admins if created by mentor
    if (!isAdmin) {
      try {
        const admins = await prisma.user.findMany({
          where: { OR: [{ role: "admin" }, { role: "ADMIN" }] },
          select: { id: true },
        });
        const { createNotification } = await import("../../../../lib/notifications");
        for (const admin of admins) {
          await createNotification(
            admin.id,
            "New Course Pending Approval 📚",
            `${dbUser.name || "A mentor"} submitted a new course: "${course.title}". Review in Admin Panel.`
          );
        }
      } catch (notifErr) {
        console.error("Failed to notify admins of new course:", notifErr);
      }
    }

    return NextResponse.json(
      {
        message: isAdmin
          ? "Course created and published!"
          : "Course created successfully and submitted for admin approval.",
        course: { id: course.id, title: course.title, approvalStatus: course.approvalStatus },
      },
      { headers: noCacheHeaders }
    );
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Mentor courses POST error:", errMsg, err);
    return NextResponse.json({ error: `Creation failed: ${errMsg}` }, { status: 500, headers: noCacheHeaders });
  }
}
