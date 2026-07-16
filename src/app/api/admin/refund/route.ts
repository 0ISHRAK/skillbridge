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

    const refundTokens = Math.ceil(booking.price / 100);

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "refunded" },
      }),
      prisma.user.update({
        where: { id: booking.studentId },
        data: {
          tokenBalance: {
            increment: refundTokens,
          },
        },
      }),
    ]);

    return NextResponse.json({
      message: "Refund processed successfully",
      bookingId,
      refundedTokens: refundTokens,
    });
  } catch (err) {
    console.error("Admin Refund error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
