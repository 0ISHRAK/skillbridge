import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticateApprovedMentor } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticateApprovedMentor();
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [reviews, mentor] = await Promise.all([
      prisma.review.findMany({
        where: {
          OR: [
            { mentorId: user.userId },
            { targetId: user.userId, type: "mentor" },
          ],
        },
        include: {
          learner: {
            select: { name: true, avatar: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          name: true,
          rating: true,
          reviewsCount: true,
          headline: true,
        },
      }),
    ]);

    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      studentName: r.learner?.name || r.studentName || "Verified Student",
      studentAvatar: r.learner?.avatar || null,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({
      reviews: formattedReviews,
      mentor: {
        id: mentor?.id || user.userId,
        name: mentor?.name || "Mentor",
        rating: mentor?.rating || 5.0,
        reviewsCount: mentor?.reviewsCount || reviews.length,
        headline: mentor?.headline || "Verified Mentor",
      },
    });
  } catch (err) {
    console.error("Mentor reviews GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
