import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticateAdmin } from "../../../../lib/auth";

export async function PUT(request: Request) {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { mentorId, approved } = await request.json();

    if (!mentorId || typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "mentorId (string) and approved (boolean) are required" },
        { status: 400 }
      );
    }

    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
    });

    if (!mentor || mentor.role !== "mentor") {
      return NextResponse.json(
        { error: "Mentor not found or user is not a mentor" },
        { status: 404 }
      );
    }

    const updatedMentor = await prisma.user.update({
      where: { id: mentorId },
      data: {
        isMentorApproved: approved,
        mentorApplicationStatus: approved ? "approved" : "rejected",
      },
    });

    // Send in-app notification to the mentor
    if (approved) {
      await prisma.notification.create({
        data: {
          userId: mentor.id,
          title: "🎉 Mentor Application Approved!",
          content: "Congratulations! Your mentor profile has been verified and approved by administration. You can now set your availability schedule and publish courses.",
          link: "/dashboard/mentor/availability",
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          userId: mentor.id,
          title: "⚠️ Mentor Application Update",
          content: "Your mentor application was reviewed and not approved at this time. Please update your profile information or contact support.",
          link: "/dashboard/settings",
        },
      });
    }

    return NextResponse.json({
      message: `Mentor verification status successfully toggled to ${approved}`,
      mentor: {
        id: updatedMentor.id,
        email: updatedMentor.email,
        name: updatedMentor.name,
        isMentorApproved: updatedMentor.isMentorApproved,
        mentorApplicationStatus: updatedMentor.mentorApplicationStatus,
      },
    });
  } catch (err) {
    console.error("Admin Verify Mentor exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
