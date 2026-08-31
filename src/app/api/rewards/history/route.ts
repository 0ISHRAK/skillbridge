import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100);
    const typeFilter = url.searchParams.get("type"); // "earned", "spent", or specific type

    const whereClause: { userId: string; amount?: { gt?: number; lt?: number }; type?: string } = {
      userId: user.userId,
    };

    if (typeFilter === "earned") {
      whereClause.amount = { gt: 0 };
    } else if (typeFilter === "spent") {
      whereClause.amount = { lt: 0 };
    } else if (typeFilter && typeFilter !== "all") {
      whereClause.type = typeFilter;
    }

    const [transactions, profile, totalEarnedResult, totalSpentResult] = await Promise.all([
      prisma.tokenTransaction.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.user.findUnique({
        where: { id: user.userId },
        select: { tokenBalance: true },
      }),
      prisma.tokenTransaction.aggregate({
        where: { userId: user.userId, amount: { gt: 0 } },
        _sum: { amount: true },
      }),
      prisma.tokenTransaction.aggregate({
        where: { userId: user.userId, amount: { lt: 0 } },
        _sum: { amount: true },
      }),
    ]);

    const totalEarned = totalEarnedResult._sum.amount ?? 0;
    const totalSpent = Math.abs(totalSpentResult._sum.amount ?? 0);

    return NextResponse.json({
      transactions,
      tokenBalance: profile?.tokenBalance ?? 0,
      stats: {
        totalEarned,
        totalSpent,
        netBalance: profile?.tokenBalance ?? 0,
        transactionsCount: transactions.length,
      },
    });
  } catch (err) {
    console.error("GET /api/rewards/history error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
