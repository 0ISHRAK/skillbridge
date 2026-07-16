import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { createNotification } from "../../../lib/notifications";
import { authenticate } from "../../../lib/auth";

export async function GET() {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
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
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Only admins can create notifications for other users" },
        { status: 403 }
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

    if (!notification) {
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }

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
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
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

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
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
