import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
};

export async function GET() {
  try {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noCacheHeaders });

    const recipients = await prisma.user.findMany({
      where: {
        id: { not: user.userId },
      },
      select: { id: true, name: true, role: true, avatarUrl: true, headline: true },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      take: 50,
    });

    return NextResponse.json({ recipients }, { headers: noCacheHeaders });
  } catch (err) {
    console.error("Message recipients error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: noCacheHeaders });
  }
}
