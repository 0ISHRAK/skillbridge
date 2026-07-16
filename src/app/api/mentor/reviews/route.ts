import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticate();
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const reviews = await prisma.review.findMany({
      where: { targetId: user.userId, type: "mentor" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("Mentor reviews GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
