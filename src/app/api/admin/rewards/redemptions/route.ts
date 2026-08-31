import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || 100), 200);
    const search = url.searchParams.get("search")?.toLowerCase() || "";

    const redemptions = await prisma.rewardRedemption.findMany({
      include: {
        reward: true,
        user: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const filtered = search
      ? redemptions.filter(
          (r) =>
            r.redemptionCode.toLowerCase().includes(search) ||
            r.reward.title.toLowerCase().includes(search) ||
            r.user.name.toLowerCase().includes(search) ||
            r.user.email.toLowerCase().includes(search)
        )
      : redemptions;

    return NextResponse.json({ redemptions: filtered });
  } catch (err) {
    console.error("GET /api/admin/rewards/redemptions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
