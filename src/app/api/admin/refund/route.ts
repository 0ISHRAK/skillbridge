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

    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking record not found" },
        { status: 404 }
      );
    }

    if (booking.status === "refunded") {
      return NextResponse.json(
        { error: "This booking has already been refunded" },
        { status: 400 }
      );
    }

    const studentUserId = booking.studentId || booking.learnerId;
    if (!studentUserId) {
      return NextResponse.json(
        { error: "Booking does not have an associated student" },
        { status: 400 }
      );
    }

    const refundTokens = Math.max(1, Math.ceil(booking.price / 10));

    const student = await prisma.user.findUnique({
      where: { id: studentUserId },
      select: { tokenBalance: true },
    });

    const newBalance = (student?.tokenBalance ?? 0) + refundTokens;

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: studentUserId },
        data: {
          tokenBalance: {
            increment: refundTokens,
          },
        },
        select: { tokenBalance: true },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "refunded" },
      }),
      prisma.tokenTransaction.create({
        data: {
          userId: studentUserId,
          amount: refundTokens,
          type: "admin_adjustment",
          title: `Refund for Booking: ${booking.topic}`,
          description: `Admin processed refund of ${refundTokens} tokens for session on ${booking.date}.`,
          referenceId: bookingId,
          balanceAfter: newBalance,
        },
      }),
      prisma.notification.create({
        data: {
          userId: studentUserId,
          title: `🪙 +${refundTokens} Tokens Refunded`,
          content: `Your session booking on "${booking.topic}" has been refunded by administration. ${refundTokens} tokens added to your wallet.`,
          link: "/dashboard/billing",
        },
      }),
    ]);

    // If mentor is associated, notify mentor of cancellation/refund
    if (booking.mentorId) {
      await prisma.notification.create({
        data: {
          userId: booking.mentorId,
          title: "ℹ️ Session Booking Cancelled & Refunded",
          content: `The mentorship session on "${booking.topic}" scheduled for ${booking.date} has been refunded to the student.`,
          link: "/dashboard/mentor/bookings",
        },
      });
    }

    return NextResponse.json({
      message: "Refund processed successfully",
      bookingId,
      refundedTokens: refundTokens,
      newBalance: updatedUser.tokenBalance,
    });
  } catch (err) {
    console.error("Admin Refund error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
