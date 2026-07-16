import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export async function GET() {
  try {
    const decoded = await authenticate();

    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const isSubscribed =
      user.subscriptionStatus === "active" &&
      user.subscriptionExpiry != null &&
      new Date(user.subscriptionExpiry) > new Date();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        tokenBalance: user.tokenBalance,
        skillsList: user.skillsList ?? "[]",
        subscription: {
          plan: user.subscriptionPlan ?? null,
          status: user.subscriptionStatus ?? null,
          expiry: user.subscriptionExpiry?.toISOString() ?? null,
          isActive: isSubscribed,
        },
      },
    });
  } catch (err) {
    console.error("Auth Me exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
