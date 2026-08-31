import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

const SUBSCRIPTION_PRICE = 799;
const SUBSCRIPTION_DAYS = 30;

export async function POST(request: Request) {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gatewayTxnId } = await request.json();
    if (!gatewayTxnId) {
      return NextResponse.json({ error: "gatewayTxnId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already actively subscribed
    const alreadyActive =
      user.subscriptionStatus === "active" &&
      user.subscriptionExpiry &&
      new Date(user.subscriptionExpiry) > new Date();

    if (alreadyActive) {
      return NextResponse.json(
        { error: "You already have an active All-Access subscription." },
        { status: 400 }
      );
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + SUBSCRIPTION_DAYS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: decoded.userId },
        data: {
          subscriptionPlan: "all_access",
          subscriptionStatus: "active",
          subscriptionExpiry: expiry,
        },
      }),
      prisma.payment.create({
        data: {
          userId: decoded.userId,
          amount: SUBSCRIPTION_PRICE,
          type: "subscription",
          status: "success",
          gatewayTxnId,
        },
      }),
    ]);

    return NextResponse.json({
      message: "All-Access subscription activated!",
      subscription: {
        plan: "all_access",
        status: "active",
        expiry: expiry.toISOString(),
        isActive: true,
      },
    });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
