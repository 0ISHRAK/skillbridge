import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/auth";
import { seedDefaultRewardsIfNeeded } from "@/lib/rewards";

export async function GET() {
  try {
    await seedDefaultRewardsIfNeeded();

    const user = await authenticate();
    let tokenBalance = 0;
    let userRedemptions: Array<{
      id: string;
      rewardId: string;
      tokensSpent: number;
      redemptionCode: string;
      status: string;
      createdAt: Date;
      reward: { title: string; type: string; icon: string | null };
    }> = [];

    if (user) {
      const [profile, redemptions] = await Promise.all([
        prisma.user.findUnique({
          where: { id: user.userId },
          select: { tokenBalance: true },
        }),
        prisma.rewardRedemption.findMany({
          where: { userId: user.userId },
          include: {
            reward: {
              select: { title: true, type: true, icon: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      tokenBalance = profile?.tokenBalance ?? 0;
      userRedemptions = redemptions;
    }

    const rewards = await prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { tokenCost: "asc" },
    });

    return NextResponse.json({
      rewards,
      tokenBalance,
      userRedemptions,
      isLoggedIn: !!user,
    });
  } catch (err) {
    console.error("GET /api/rewards error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
