import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { createNotification } from "../../../lib/notifications";
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

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("GET Notifications error:", err);
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

    const { targetUserId, title, content } = await request.json();

    if (!targetUserId || !title || !content) {
      return NextResponse.json(
        { error: "targetUserId, title, and content are required" },
        { status: 400 }
      );
    }

    const notification = await createNotification(targetUserId, title, content);

    return NextResponse.json({
      message: "Notification generated and dispatched",
      notification,
    });
  } catch (err) {
    console.error("POST Notification error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await authenticate();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, readAll } = await request.json();

    if (readAll) {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ message: "All notifications marked as read" });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Notification id is required unless marking all read" },
        { status: 400 }
      );
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("PUT Notification error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
