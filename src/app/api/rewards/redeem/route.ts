import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { redeemReward } from "@/lib/rewards";

export async function POST(request: Request) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in to redeem rewards." }, { status: 401 });
    }

    const body = await request.json();
    const { rewardId, metadata } = body;

    if (!rewardId || typeof rewardId !== "string") {
      return NextResponse.json({ error: "rewardId is required" }, { status: 400 });
    }

    const result = await redeemReward({
      userId: user.userId,
      rewardId,
      metadata,
    });

    return NextResponse.json({
      success: true,
      message: "Reward redeemed successfully!",
      redemption: result.redemption,
      transaction: result.transaction,
      redemptionCode: result.redemptionCode,
      newBalance: result.newBalance,
    });
  } catch (err: unknown) {
    console.error("POST /api/rewards/redeem error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to redeem reward";
    const status = errorMessage.includes("Insufficient") || errorMessage.includes("already") ? 400 : 500;
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
