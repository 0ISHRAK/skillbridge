import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { authenticateAdmin, safeJsonParse } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await authenticateAdmin())) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403, headers: noCacheHeaders });
    }

    const { id } = await params;
    const payload = await request.json();
    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404, headers: noCacheHeaders });
    }

    let approvalStatus = course.approvalStatus;
    let published = course.published;

    if (payload.action === "approve" || payload.approvalStatus === "approved") {
      approvalStatus = "approved";
      published = true;
    } else if (payload.action === "reject" || payload.approvalStatus === "rejected") {
      approvalStatus = "rejected";
      published = false;
    } else if (payload.published !== undefined) {
      published = Boolean(payload.published);
    }

    const updateData = {
      ...(payload.title !== undefined && { title: String(payload.title).trim() }),
      ...(payload.description !== undefined && { description: String(payload.description).trim() }),
      ...(payload.category !== undefined && { category: String(payload.category).trim() }),
      ...(payload.instructor !== undefined && { mentorName: String(payload.instructor).trim() || course.mentorName }),
      ...(payload.thumbnail !== undefined && { thumbnail: String(payload.thumbnail).trim() || null }),
      ...(payload.level !== undefined && { level: String(payload.level).trim() || "Beginner" }),
      ...(payload.duration !== undefined && { duration: String(payload.duration).trim() || null }),
      ...(payload.price !== undefined && { price: Math.max(0, Number(payload.price) || 0) }),
      ...(payload.whatYouLearn !== undefined && { whatYouLearn: JSON.stringify(payload.whatYouLearn) }),
      ...(payload.requirements !== undefined && { requirements: JSON.stringify(payload.requirements) }),
      ...(payload.lessons !== undefined && { lessons: JSON.stringify(payload.lessons) }),
      published,
      approvalStatus,
    };

    const updatedCourse = await prisma.course.update({ where: { id }, data: updateData });

    // Send notification to course mentor on approval state change
    if (payload.action || payload.approvalStatus) {
      try {
        const { createNotification } = await import("../../../../../lib/notifications");
        if (approvalStatus === "approved") {
          await createNotification(
            course.mentorId,
            "Course Approved! 🎉",
            `Your course "${course.title}" has been approved by admin and is now live for students!`
          );
        } else if (approvalStatus === "rejected") {
          await createNotification(
            course.mentorId,
            "Course Application Review",
            `Your course "${course.title}" was reviewed and not approved at this time.`
          );
        }
      } catch (notifErr) {
        console.error("Failed to notify mentor of course approval status:", notifErr);
      }
    }

    return NextResponse.json({
      message: `Course ${approvalStatus === "approved" ? "approved & published" : approvalStatus === "rejected" ? "rejected" : "updated"} successfully`,
      course: {
        ...updatedCourse,
        lessons: safeJsonParse(updatedCourse.lessons, []),
        whatYouLearn: safeJsonParse(updatedCourse.whatYouLearn, []),
        requirements: safeJsonParse(updatedCourse.requirements, []),
      },
    }, { headers: noCacheHeaders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : "";
    console.error("Admin PUT Course error:", msg, stack);
    return NextResponse.json({ error: msg }, { status: 500, headers: noCacheHeaders });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await authenticateAdmin())) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Admin DELETE Course error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
