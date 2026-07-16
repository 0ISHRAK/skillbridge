import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { authenticateAdmin } from "../../../../../lib/auth";

export async function DELETE(request: Request) {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role === "admin") {
      return NextResponse.json(
        { error: "Cannot delete an admin user" },
        { status: 403 }
      );
    }

    await prisma.$transaction([
      prisma.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }),
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.review.deleteMany({ where: { studentId: userId } }),
      prisma.enrollment.deleteMany({ where: { userId } }),
      prisma.booking.deleteMany({ where: { OR: [{ studentId: userId }, { mentorId: userId }] } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({
      message: "User and all associated data deleted successfully",
    });
  } catch (err) {
    console.error("Admin delete user error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
