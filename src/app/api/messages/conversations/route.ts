import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-123456";

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };
    return decoded.userId || null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await authenticate();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find all messages involving the user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // Map by other participant's ID
    const conversationMap = new Map<string, { latestMessage: { id: string; content: string; createdAt: Date; senderId: string; read: boolean }; unreadCount: number }>();

    for (const msg of messages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;

      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, {
          latestMessage: msg,
          unreadCount: 0,
        });
      }

      // Count unread incoming messages
      if (msg.receiverId === userId && msg.senderId === otherId && !msg.read) {
        const entry = conversationMap.get(otherId)!;
        entry.unreadCount += 1;
      }
    }

    // Load participants' details from database
    const conversations = [];
    for (const [otherId, info] of conversationMap.entries()) {
      const partner = await prisma.user.findUnique({
        where: { id: otherId },
      });

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
