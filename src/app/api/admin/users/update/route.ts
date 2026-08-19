import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { authenticateAdmin } from "../../../../../lib/auth";

export async function PUT(request: Request) {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { userId, email, updates } = await request.json();

    if (!userId && !email) {
      return NextResponse.json(
        { error: "userId or email is required" },
        { status: 400 }
      );
    }

    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const data: Record<string, any> = {};

    if (updates.role && ["learner", "mentor", "admin"].includes(updates.role)) {
      data.role = updates.role;
    }

    if (typeof updates.addTokens === "number" && updates.addTokens > 0) {
      data.tokenBalance = user.tokenBalance + updates.addTokens;
    }

    if (typeof updates.isEmailVerified === "boolean") {
      data.isEmailVerified = updates.isEmailVerified;
    }

    if (typeof updates.isMentorApproved === "boolean") {
      data.isMentorApproved = updates.isMentorApproved;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        tokenBalance: updated.tokenBalance,
        isEmailVerified: updated.isEmailVerified,
        isMentorApproved: updated.isMentorApproved,
      },
    });
  } catch (err) {
    console.error("Admin update user error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
