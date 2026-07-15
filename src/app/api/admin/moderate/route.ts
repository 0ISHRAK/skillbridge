import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-123456";

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    return decoded.role === "admin" || decoded.role === "mentor";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdmin();
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
