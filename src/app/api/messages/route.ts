import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
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

export async function GET(request: Request) {
  try {
    const userId = await authenticate();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const counterpartyId = url.searchParams.get("userId");

    if (!counterpartyId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    // Get messages history
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: counterpartyId },
          { senderId: counterpartyId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark incoming messages as read
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
    const userId = await authenticate();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { receiverId, content } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "receiverId and content are required" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId,
        content,
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
