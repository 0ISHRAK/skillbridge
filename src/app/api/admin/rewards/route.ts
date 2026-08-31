import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateAdmin } from "@/lib/auth";
import { seedDefaultRewardsIfNeeded } from "@/lib/rewards";

export async function GET() {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    await seedDefaultRewardsIfNeeded();

    const [rewards, redemptionsCount, totalSpentResult, totalEarnedResult] = await Promise.all([
      prisma.reward.findMany({
        include: {
          _count: {
            select: { redemptions: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.rewardRedemption.count(),
      prisma.tokenTransaction.aggregate({
        where: { amount: { lt: 0 } },
        _sum: { amount: true },
      }),
      prisma.tokenTransaction.aggregate({
        where: { amount: { gt: 0 } },
        _sum: { amount: true },
      }),
    ]);

    const totalTokensRedeemed = Math.abs(totalSpentResult._sum.amount ?? 0);
    const totalTokensEarned = totalEarnedResult._sum.amount ?? 0;

    return NextResponse.json({
      rewards,
      stats: {
        totalRewards: rewards.length,
        activeRewards: rewards.filter((r) => r.isActive).length,
        totalRedemptions: redemptionsCount,
        totalTokensRedeemed,
        totalTokensEarned,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/rewards error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, tokenCost, type, icon, isActive, isOneTime, discountValue, badge } = body;

    if (!title || !description || typeof tokenCost !== "number" || tokenCost <= 0) {
      return NextResponse.json(
        { error: "Title, description, and a valid positive tokenCost are required" },
        { status: 400 }
      );
    }

    const reward = await prisma.reward.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        tokenCost: Math.round(tokenCost),
        type: (type || "discount").trim(),
        icon: icon || "🎁",
        isActive: isActive !== false,
        isOneTime: !!isOneTime,
        discountValue: discountValue ? Math.round(discountValue) : null,
        badge: badge?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, reward }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/rewards error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
