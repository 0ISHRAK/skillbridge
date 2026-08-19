import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
};

export async function POST(request: Request) {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: noCacheHeaders }
      );
    }

    const userId = decoded.userId;
    const { courseId, paymentMethod = "tokens", gatewayTxnId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.published) {
      return NextResponse.json(
        { error: "Course not found or is not published" },
        { status: 404, headers: noCacheHeaders }
      );
    }

    const existing = await prisma.enrollment.findFirst({
      where: { userId, courseId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You are already enrolled in this course / আপনি ইতিমধ্যে এই কোর্সে ভর্তি হয়েছেন" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: noCacheHeaders }
      );
    }

    // Active All-Access subscribers enroll for free
    const isSubscribed =
      user.subscriptionStatus === "active" &&
      user.subscriptionExpiry != null &&
      new Date(user.subscriptionExpiry) > new Date();

    if (isSubscribed) {
      const enrollment = await prisma.enrollment.create({
        data: { userId, courseId, completedLessons: "[]" },
      });
      return NextResponse.json(
        {
          message: "Enrolled via All-Access subscription!",
          requiredTokens: 0,
          viaSubscription: true,
          enrollment,
        },
        { headers: noCacheHeaders }
      );
    }

    const requiredTokens = Math.ceil(course.price / 10);

    // Option A: Paying with Tokens
    if (paymentMethod === "tokens") {
      if (user.tokenBalance < requiredTokens) {
        return NextResponse.json(
          {
            error: `Insufficient tokens. Course costs ${requiredTokens} Tokens (৳${course.price.toLocaleString()}). You have ${user.tokenBalance} Tokens. Top up or pay with Money.`,
            requiredTokens,
            tokenBalance: user.tokenBalance,
          },
          { status: 400, headers: noCacheHeaders }
        );
      }

      const txnId = `TOKEN-${Date.now()}-${Math.floor(Math.random() * 8999 + 1000)}`;

      const [updatedUser, enrollment] = await prisma.$transaction([
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
        prisma.payment.create({
          data: {
            userId,
            amount: course.price,
            type: "course_enrollment",
            status: "success",
            gatewayTxnId: txnId,
          },
        }),
      ]);

      // Notify mentor and student
      try {
        const { createNotification } = await import("../../../../lib/notifications");
        await createNotification(
          userId,
          "Course Enrollment Successful!",
          `You have successfully enrolled in "${course.title}" using ${requiredTokens} Tokens.`
        );
      } catch {}

      return NextResponse.json(
        {
          message: `Successfully enrolled using ${requiredTokens} Tokens!`,
          requiredTokens,
          tokenBalance: updatedUser.tokenBalance,
          enrollment,
        },
        { headers: noCacheHeaders }
      );
    }

    // Option B: Paying with Money (bKash / Nagad / Rocket Sandbox)
    const txnId = gatewayTxnId || `SB-MONEY-${Date.now()}-${Math.floor(Math.random() * 8999 + 1000)}`;

    const [enrollment] = await prisma.$transaction([
      prisma.enrollment.create({
        data: {
          userId,
          courseId,
          completedLessons: "[]",
        },
      }),
      prisma.payment.create({
        data: {
          userId,
          amount: course.price,
          type: "course_enrollment",
          status: "success",
          gatewayTxnId: txnId,
        },
      }),
    ]);

    // Notify user
    try {
      const { createNotification } = await import("../../../../lib/notifications");
      await createNotification(
        userId,
        "Course Payment & Enrollment Complete!",
        `Payment of ৳${course.price.toLocaleString()} via ${paymentMethod.toUpperCase()} confirmed for "${course.title}".`
      );
    } catch {}

    return NextResponse.json(
      {
        message: `Successfully enrolled in "${course.title}" via ${paymentMethod.toUpperCase()}!`,
        paymentMethod,
        transactionId: txnId,
        enrollment,
      },
      { headers: noCacheHeaders }
    );
  } catch (err) {
    console.error("Enrollment error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
