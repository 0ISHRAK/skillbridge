import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, tokenCost, type, icon, isActive, isOneTime, discountValue, badge } = body;

    const existing = await prisma.reward.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    const updated = await prisma.reward.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(description !== undefined && { description: String(description).trim() }),
        ...(tokenCost !== undefined && { tokenCost: Math.round(Number(tokenCost)) }),
        ...(type !== undefined && { type: String(type).trim() }),
        ...(icon !== undefined && { icon: String(icon).trim() }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(isOneTime !== undefined && { isOneTime: Boolean(isOneTime) }),
        ...(discountValue !== undefined && { discountValue: discountValue ? Math.round(Number(discountValue)) : null }),
        ...(badge !== undefined && { badge: badge ? String(badge).trim() : null }),
      },
    });

    return NextResponse.json({ success: true, reward: updated });
  } catch (err) {
    console.error("PUT /api/admin/rewards/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.reward.findUnique({
      where: { id },
      include: { _count: { select: { redemptions: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    // If redemptions exist, safely deactivate it rather than hard-deleting to preserve history
    if (existing._count.redemptions > 0) {
      await prisma.reward.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: "Reward has redemptions and was deactivated instead of permanently deleted",
      });
    }

    await prisma.reward.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Reward deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/admin/rewards/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
