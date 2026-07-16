import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { authenticate } from "../../../lib/auth";

export async function GET(request: Request) {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("GET Messages error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const { receiverId, content } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "receiverId and content are required" },
        { status: 400 }
      );
    }

    if (receiverId === userId) {
      return NextResponse.json(
        { error: "You cannot send a message to yourself" },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: "Message content exceeds maximum length of 5000 characters" },
        { status: 400 }
      );
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId,
        content: content.slice(0, 5000),
        read: false,
      },
    });

    return NextResponse.json({
      message: "Message sent successfully",
      sentMessage: message,
    });
  } catch (err) {
    console.error("POST Message error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
