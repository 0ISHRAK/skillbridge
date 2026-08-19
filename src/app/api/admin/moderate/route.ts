import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticateAdmin } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { type, id } = await request.json();

    if (!type || !id) {
      return NextResponse.json(
        { error: "type and id are required parameters" },
        { status: 400 }
      );
    }

    if (type === "review") {
      const review = await prisma.review.findUnique({ where: { id } });
      if (!review) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404 }
        );
      }
      await prisma.review.delete({ where: { id } });
      return NextResponse.json({ message: "Review successfully deleted by moderator" });
    }

    if (type === "message") {
      const message = await prisma.message.findUnique({ where: { id } });
      if (!message) {
        return NextResponse.json(
          { error: "Message not found" },
          { status: 404 }
        );
      }
      await prisma.message.delete({ where: { id } });
      return NextResponse.json({ message: "Message successfully deleted by moderator" });
    }

    return NextResponse.json(
      { error: "Invalid type. Must be 'review' or 'message'" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Admin Moderation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
