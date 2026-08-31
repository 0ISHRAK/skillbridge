import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { authenticate } from "../../../lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
};

export async function GET(request: Request) {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: noCacheHeaders }
      );
    }

    const userId = decoded.userId;
    const url = new URL(request.url);
    const counterpartyId = url.searchParams.get("userId");

    if (!counterpartyId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: counterpartyId },
          { senderId: counterpartyId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    await prisma.message.updateMany({
      where: {
        senderId: counterpartyId,
        receiverId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ messages }, { headers: noCacheHeaders });
  } catch (err) {
    console.error("GET Messages error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: noCacheHeaders }
      );
    }

    const userId = decoded.userId;
    const { receiverId, content } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "receiverId and content are required" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    if (receiverId === userId) {
      return NextResponse.json(
        { error: "You cannot send a message to yourself" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: "Message content exceeds maximum length of 5000 characters" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404, headers: noCacheHeaders }
      );
    }

    const [message, sender] = await Promise.all([
      prisma.message.create({
        data: {
          senderId: userId,
          receiverId,
          content: content.slice(0, 5000),
          read: false,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, role: true },
      }),
    ]);

    // Send in-app notification to the recipient
    const snippet = content.length > 60 ? `${content.slice(0, 60)}...` : content;
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: `💬 New message from ${sender?.name || "User"}`,
        content: snippet,
        link: `/dashboard/messages?userId=${userId}`,
      },
    }).catch(() => {});

    return NextResponse.json(
      {
        message: "Message sent successfully",
        sentMessage: message,
      },
      { headers: noCacheHeaders }
    );
  } catch (err) {
    console.error("POST Message error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
