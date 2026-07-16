import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export async function GET() {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    const conversationMap = new Map<string, { latestMessage: { id: string; content: string; createdAt: Date; senderId: string; read: boolean }; unreadCount: number }>();

    for (const msg of messages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;

      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, {
          latestMessage: msg,
          unreadCount: 0,
        });
      }

      if (msg.receiverId === userId && msg.senderId === otherId && !msg.read) {
        const entry = conversationMap.get(otherId)!;
        entry.unreadCount += 1;
      }
    }

    const otherIds = Array.from(conversationMap.keys());

    const partners = await prisma.user.findMany({
      where: { id: { in: otherIds } },
    });

    const partnerMap = new Map(partners.map((p) => [p.id, p]));

    const conversations = [];
    for (const [otherId, info] of conversationMap.entries()) {
      const partner = partnerMap.get(otherId);

      if (partner) {
        conversations.push({
          id: partner.id,
          name: partner.name,
          role: partner.role,
          avatarUrl: partner.avatarUrl,
          latestMessage: {
            content: info.latestMessage.content,
            createdAt: info.latestMessage.createdAt,
            senderId: info.latestMessage.senderId,
          },
          unreadCount: info.unreadCount,
        });
      }
    }

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("GET Conversations list error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
