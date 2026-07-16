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
      },
    });

    return NextResponse.json({
      message: `Mentor verification status successfully toggled to ${approved}`,
      mentor: {
        id: updatedMentor.id,
        email: updatedMentor.email,
        name: updatedMentor.name,
        isMentorApproved: updatedMentor.isMentorApproved,
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
