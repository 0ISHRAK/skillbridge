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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; name?: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const targetId = url.searchParams.get("targetId");
    const type = url.searchParams.get("type"); // "course" | "mentor"

    if (!targetId) {
      return NextResponse.json(
        { error: "targetId parameter is required" },
        { status: 400 }
      );
    }

    const where: {
      targetId: string;
      type?: string;
    } = { targetId };

    if (type) {
      where.type = type;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const totalReviews = reviews.length;
    let averageRating = 0;

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = Math.round((sum / totalReviews) * 10) / 10; // Round to 1 decimal place (e.g. 4.7)
    }

    return NextResponse.json({
      reviews,
      averageRating,
      totalReviews,
    });
  } catch (err) {
    console.error("GET Reviews error:", err);
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

    const { rating, comment, targetId, type } = await request.json();

    if (!rating || !comment || !targetId || !type) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    if (type !== "course" && type !== "mentor") {
      return NextResponse.json(
        { error: "Type must be either 'course' or 'mentor'" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating: parsedRating,
        comment,
        studentId: decoded.userId!,
        studentName: decoded.name || "Student Name",
        targetId,
        type,
      },
    });

    return NextResponse.json({
      message: "Review submitted successfully",
      review,
    });
  } catch (err) {
    console.error("POST Review error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
