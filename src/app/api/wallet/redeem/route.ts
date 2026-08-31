import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

const PROMO_CODES: Record<string, { tokens: number; label: string; description: string }> = {
  WELCOME25: {
    tokens: 25,
    label: "Welcome Gift Bonus",
    description: "Welcome to SkillBridge! 25 bonus tokens awarded.",
  },
  SKILL50: {
    tokens: 50,
    label: "SkillBoost Special Voucher",
    description: "50 bonus tokens voucher applied for active learners.",
  },
  BANGLADESH2026: {
    tokens: 40,
    label: "Digital Bangladesh Grant",
    description: "40 bonus tokens granted for tech upskilling in BD.",
  },
  DEVSTUDENT: {
    tokens: 30,
    label: "Student Developer Bonus",
    description: "30 bonus tokens for student portfolio development.",
  },
  EID2026: {
    tokens: 35,
    label: "Community Celebration Voucher",
    description: "35 bonus tokens celebration voucher.",
  },
};

export async function POST(request: Request) {
  try {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const rawCode = String(body.code || "").trim().toUpperCase();

    if (!rawCode) {
      return NextResponse.json({ error: "Please enter a voucher or promo code" }, { status: 400 });
    }

    // 1. Check if it matches a predefined promo code
    if (PROMO_CODES[rawCode]) {
      const promo = PROMO_CODES[rawCode];

      // Check if user already used this promo code
      const alreadyClaimed = await prisma.tokenTransaction.findFirst({
        where: {
          userId: user.userId,
          referenceId: `promo-${rawCode}`,
        },
      });

      if (alreadyClaimed) {
        return NextResponse.json(
          { error: `You have already redeemed the promo code "${rawCode}".` },
          { status: 400 }
        );
      }

      const [updatedUser, tokenTx] = await prisma.$transaction([
        prisma.user.update({
          where: { id: user.userId },
          data: { tokenBalance: { increment: promo.tokens } },
          select: { tokenBalance: true },
        }),
        prisma.tokenTransaction.create({
          data: {
            userId: user.userId,
            amount: promo.tokens,
            type: "promo_code",
            title: `Redeemed Promo: ${rawCode}`,
            description: promo.description,
            referenceId: `promo-${rawCode}`,
            balanceAfter: 0, // updated in post-processing if needed
          },
        }),
        prisma.notification.create({
          data: {
            userId: user.userId,
            title: `🎁 +${promo.tokens} Tokens Added!`,
            content: `Voucher code ${rawCode} redeemed successfully: ${promo.label}`,
            link: "/dashboard/billing",
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Successfully redeemed ${promo.tokens} tokens for code "${rawCode}"!`,
        tokenBalance: updatedUser.tokenBalance,
        tokensAwarded: promo.tokens,
        promoTitle: promo.label,
        transaction: tokenTx,
      });
    }

    // 2. Check if it matches a RewardRedemption voucher code (e.g. SB-DISC-... or SB-MENT-...)
    const rewardRedemption = await prisma.rewardRedemption.findUnique({
      where: { redemptionCode: rawCode },
      include: { reward: true },
    });

    if (rewardRedemption) {
      if (rewardRedemption.userId !== user.userId) {
        return NextResponse.json({ error: "This reward voucher belongs to another user." }, { status: 403 });
      }
      return NextResponse.json({
        success: true,
        isRewardVoucher: true,
        message: `Valid Reward Voucher: "${rewardRedemption.reward.title}" (Status: ${rewardRedemption.status}).`,
        voucher: {
          code: rewardRedemption.redemptionCode,
          title: rewardRedemption.reward.title,
          type: rewardRedemption.reward.type,
          status: rewardRedemption.status,
          date: rewardRedemption.createdAt,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid voucher code. Check spelling or try: WELCOME25, SKILL50, BANGLADESH2026, DEVSTUDENT" },
      { status: 404 }
    );
  } catch (err) {
    console.error("Voucher redemption error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
