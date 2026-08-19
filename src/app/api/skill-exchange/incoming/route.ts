import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all posts by this user
    const myPosts = await prisma.skillPost.findMany({
      where: { authorId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    const postIds = myPosts.map((p) => p.id);

    const requests = await prisma.skillExchangeRequest.findMany({
      where: { postId: { in: postIds } },
      orderBy: { createdAt: "desc" },
    });

    const postMap = Object.fromEntries(myPosts.map((p) => [p.id, p]));

    const enriched = requests.map((r) => ({
      ...r,
      post: postMap[r.postId] ?? null,
    }));

    return NextResponse.json({ posts: myPosts, requests: enriched });
  } catch (err) {
    console.error("skill-exchange/incoming GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
