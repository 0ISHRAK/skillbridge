import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, type, offeredSkill, message } = await request.json();

    if (!postId || !type || !["barter", "token"].includes(type)) {
      return NextResponse.json(
        { error: "postId and type (barter|token) are required" },
        { status: 400 }
      );
    }

    const post = await prisma.skillPost.findUnique({ where: { id: postId } });
    if (!post || !post.isOpen) {
      return NextResponse.json({ error: "Skill post not found or already closed" }, { status: 404 });
    }

    if (post.authorId === user.userId) {
      return NextResponse.json({ error: "You cannot request your own post" }, { status: 400 });
    }

    // Check for duplicate request
    const existing = await prisma.skillExchangeRequest.findFirst({
      where: { postId, requesterId: user.userId, status: "pending" },
    });
    if (existing) {
      return NextResponse.json({ error: "You already have a pending request for this post" }, { status: 400 });
    }

    const requester = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!requester) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let tokensSpent = 0;

    if (type === "token") {
      tokensSpent = post.tokenCost;
      if (requester.tokenBalance < tokensSpent) {
        return NextResponse.json({ error: "Insufficient token balance" }, { status: 400 });
      }
    }

    const [exchangeRequest] = await prisma.$transaction([
      prisma.skillExchangeRequest.create({
        data: {
          postId,
          requesterId: user.userId,
          requesterName: requester.name,
          type,
          offeredSkill: offeredSkill ? String(offeredSkill).slice(0, 100) : null,
          message: message ? String(message).slice(0, 500) : null,
          status: "pending",
          tokensSpent,
        },
      }),
      ...(type === "token"
        ? [
            prisma.user.update({
              where: { id: user.userId },
              data: { tokenBalance: { decrement: tokensSpent } },
            }),
          ]
        : []),
    ]);

    const { createNotification } = await import("../../../../lib/notifications");
    await createNotification(
      post.authorId,
      "New Skill Exchange Request",
      `${requester.name} wants to learn "${post.offeredSkill}" from you via ${type === "barter" ? "skill barter" : "token exchange"}.`
    );

    return NextResponse.json(
      { request: exchangeRequest, newBalance: requester.tokenBalance - tokensSpent },
      { status: 201 }
    );
  } catch (err) {
    console.error("skill-exchange/request POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
