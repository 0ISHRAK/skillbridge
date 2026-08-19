import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { authenticate } from "../../../lib/auth";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const targetId = url.searchParams.get("targetId");
    const type = url.searchParams.get("type");

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
      averageRating = Math.round((sum / totalReviews) * 10) / 10;
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
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
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

    const existingReview = await prisma.review.findFirst({
      where: {
        studentId: decoded.userId,
        targetId,
        type,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already submitted a review for this item" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating: parsedRating,
        comment: comment.slice(0, 2000),
        studentId: decoded.userId,
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
