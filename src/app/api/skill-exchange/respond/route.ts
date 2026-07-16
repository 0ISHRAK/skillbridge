import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export async function PUT(request: Request) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, action } = await request.json();

    if (!requestId || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "requestId and action (accept|reject) are required" },
        { status: 400 }
      );
    }

    const exchangeRequest = await prisma.skillExchangeRequest.findUnique({
      where: { id: requestId },
    });
    if (!exchangeRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const post = await prisma.skillPost.findUnique({ where: { id: exchangeRequest.postId } });
    if (!post || post.authorId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (exchangeRequest.status !== "pending") {
      return NextResponse.json({ error: "Request already resolved" }, { status: 400 });
    }

    const newStatus = action === "accept" ? "accepted" : "rejected";

    await prisma.skillExchangeRequest.update({
      where: { id: requestId },
      data: { status: newStatus },
    });

    if (action === "reject" && exchangeRequest.type === "token" && exchangeRequest.tokensSpent > 0) {
      await prisma.user.update({
        where: { id: exchangeRequest.requesterId },
        data: { tokenBalance: { increment: exchangeRequest.tokensSpent } },
      });
    }

    if (action === "accept") {
      await prisma.skillPost.update({
        where: { id: post.id },
        data: { isOpen: false },
      });
    }

    const { createNotification } = await import("../../../../lib/notifications");
    const author = await prisma.user.findUnique({ where: { id: user.userId } });
    const authorName = author?.name ?? "The post author";

    if (action === "accept") {
      await createNotification(
        exchangeRequest.requesterId,
        "Skill Exchange Accepted!",
        `${authorName} accepted your request for "${post.offeredSkill}". Connect via messages to schedule your session.`
      );
    } else {
      const refundNote =
        exchangeRequest.type === "token" && exchangeRequest.tokensSpent > 0
          ? ` Your ${exchangeRequest.tokensSpent} tokens have been refunded.`
          : "";
      await createNotification(
        exchangeRequest.requesterId,
        "Skill Exchange Request Declined",
        `${authorName} declined your request for "${post.offeredSkill}".${refundNote}`
      );
    }

    return NextResponse.json({ message: `Request ${newStatus}` });
  } catch (err) {
    console.error("skill-exchange/respond PUT error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
