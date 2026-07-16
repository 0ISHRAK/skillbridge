import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

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
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.published) {
      return NextResponse.json(
        { error: "Course not found or is not published" },
        { status: 404 }
      );
    }

    const existing = await prisma.enrollment.findFirst({
      where: { userId, courseId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You are already enrolled in this course / আপনি ইতিমধ্যে এই কোর্সে ভর্তি হয়েছেন" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Active All-Access subscribers enroll for free
    const isSubscribed =
      user.subscriptionStatus === "active" &&
      user.subscriptionExpiry != null &&
      new Date(user.subscriptionExpiry) > new Date();

    if (isSubscribed) {
      await prisma.enrollment.create({
        data: { userId, courseId, completedLessons: "[]" },
      });
      return NextResponse.json({
        message: "Enrolled via All-Access subscription! / সাবস্ক্রিপশনের মাধ্যমে কোর্সে ভর্তি সম্পন্ন!",
        requiredTokens: 0,
        viaSubscription: true,
      });
    }

    const requiredTokens = Math.ceil(course.price / 100);

    if (user.tokenBalance < requiredTokens) {
      return NextResponse.json(
        { error: `Insufficient tokens. Requires ৳${course.price.toLocaleString()} (${requiredTokens} Tokens) / অপর্যাপ্ত টোকেন ব্যালেন্স` },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          tokenBalance: {
            decrement: requiredTokens,
          },
        },
      }),
      prisma.enrollment.create({
        data: {
          userId,
          courseId,
          completedLessons: "[]",
        },
      }),
    ]);

    return NextResponse.json({
      message: "Successfully enrolled in course! / কোর্সে সফলভাবে ভর্তি সম্পন্ন হয়েছে!",
      requiredTokens,
    });
  } catch (err) {
    console.error("Enrollment error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
