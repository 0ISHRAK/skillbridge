import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.skillExchangeRequest.findMany({
      where: { requesterId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with post data
    const postIds = [...new Set(requests.map((r) => r.postId))];
    const posts = await prisma.skillPost.findMany({
      where: { id: { in: postIds } },
    });
    const postMap = Object.fromEntries(posts.map((p) => [p.id, p]));

    const enriched = requests.map((r) => ({
      ...r,
      post: postMap[r.postId] ?? null,
    }));

    return NextResponse.json({ requests: enriched });
  } catch (err) {
    console.error("skill-exchange/requests GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
