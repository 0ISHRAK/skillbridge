import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticateAdmin } from "../../../../lib/auth";

export async function GET() {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        tokenBalance: true,
        isMentorApproved: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Admin GET Users error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
