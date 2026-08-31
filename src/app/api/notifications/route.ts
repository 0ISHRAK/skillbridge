import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { createNotification } from "../../../lib/notifications";
import { authenticate } from "../../../lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
};

export async function GET() {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: noCacheHeaders }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ notifications }, { headers: noCacheHeaders });
  } catch (err) {
    console.error("GET Notifications error:", err);
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

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Only admins can create notifications for other users" },
        { status: 403, headers: noCacheHeaders }
      );
    }

    const { targetUserId, title, content } = await request.json();

    if (!targetUserId || !title || !content) {
      return NextResponse.json(
        { error: "targetUserId, title, and content are required" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const notification = await createNotification(targetUserId, title, content);

    if (!notification) {
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500, headers: noCacheHeaders }
      );
    }

    return NextResponse.json(
      {
        message: "Notification generated and dispatched",
        notification,
      },
      { headers: noCacheHeaders }
    );
  } catch (err) {
    console.error("POST Notification error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: noCacheHeaders }
      );
    }

    const userId = decoded.userId;
    const { id, readAll } = await request.json();

    if (readAll) {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return NextResponse.json(
        { message: "All notifications marked as read" },
        { headers: noCacheHeaders }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Notification id is required unless marking all read" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404, headers: noCacheHeaders }
      );
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json(
      { message: "Notification marked as read" },
      { headers: noCacheHeaders }
    );
  } catch (err) {
    console.error("PUT Notification error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
