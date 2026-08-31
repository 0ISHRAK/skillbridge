import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export async function POST() {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.subscriptionStatus !== "active") {
      return NextResponse.json(
        { error: "No active subscription to cancel." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: decoded.userId },
      data: { subscriptionStatus: "cancelled" },
    });

    const isStillActive =
      updated.subscriptionExpiry && new Date(updated.subscriptionExpiry) > new Date();

    return NextResponse.json({
      message: "Subscription cancelled. Access continues until the expiry date.",
      subscription: {
        plan: updated.subscriptionPlan,
        status: updated.subscriptionStatus,
        expiry: updated.subscriptionExpiry?.toISOString() ?? null,
        isActive: Boolean(isStillActive),
      },
    });
  } catch (err) {
    console.error("Cancel subscription error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
