import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { authenticate } from "../../../lib/auth";

export async function GET(request: Request) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");

    if (bookingId) {
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          OR: [{ studentId: user.userId }, { mentorId: user.userId }, { learnerId: user.userId }],
        },
      });

      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      return NextResponse.json({ booking });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ studentId: user.userId }, { learnerId: user.userId }, { mentorId: user.userId }],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("Bookings GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mentorId, topic, date, time, price } = await request.json();

    if (!mentorId || !topic || !date || !time) {
      return NextResponse.json({ error: "All booking fields are required" }, { status: 400 });
    }

    const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
    if (!mentor || mentor.role.toLowerCase() !== "mentor" || !mentor.isMentorApproved) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    const student = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const tokenCost = Math.max(1, Math.ceil((price || 1000) / 10));
    if (student.tokenBalance < tokenCost) {
      return NextResponse.json({ error: "Insufficient token balance" }, { status: 400 });
    }

    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          studentId: user.userId,
          learnerId: user.userId,
          mentorId,
          mentorName: mentor.name,
          topic: String(topic).slice(0, 500),
          date: String(date),
          time: String(time),
          price: price || 1000,
          status: "pending",
        },
      }),
      prisma.user.update({
        where: { id: user.userId },
        data: { tokenBalance: { decrement: tokenCost } },
      }),
      prisma.tokenTransaction.create({
        data: {
          userId: user.userId,
          amount: -tokenCost,
          type: "mentor_booking",
          title: `1-on-1 Mentorship Booking: ${mentor.name}`,
          description: `Booked session on "${topic}" for ${date} at ${time}.`,
          balanceAfter: student.tokenBalance - tokenCost,
        },
      }),
    ]);

    const { createNotification } = await import("../../../lib/notifications");
    await createNotification(
      mentorId,
      "New Booking Request",
      `${student.name} has requested a session on "${topic}" for ${date} at ${time}.`
    );

    return NextResponse.json({
      message: "Booking created successfully",
      booking: { id: booking.id, status: booking.status },
      newBalance: student.tokenBalance - tokenCost,
    });
  } catch (err) {
    console.error("Bookings POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, status } = await request.json();
    if (!bookingId || !status) {
      return NextResponse.json({ error: "bookingId and status are required" }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        OR: [{ studentId: user.userId }, { learnerId: user.userId }, { mentorId: user.userId }],
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // If a learner is cancelling a pending booking, refund tokens
    const studentUserId = booking.studentId || booking.learnerId;
    const isLearner = studentUserId === user.userId;
    const tokenCost = Math.max(1, Math.ceil((booking.price || 1000) / 10));

    if (status === "cancelled" && booking.status === "pending" && isLearner) {
      const student = await prisma.user.findUnique({ where: { id: studentUserId } });
      const newBal = (student?.tokenBalance ?? 0) + tokenCost;

      const [updated] = await prisma.$transaction([
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: "cancelled" },
        }),
        prisma.user.update({
          where: { id: studentUserId },
          data: { tokenBalance: { increment: tokenCost } },
        }),
        prisma.tokenTransaction.create({
          data: {
            userId: studentUserId,
            amount: tokenCost,
            type: "mentor_booking",
            title: `Refund: Cancelled Session Request`,
            description: `Cancelled session request with ${booking.mentorName || "mentor"}. ${tokenCost} tokens returned to wallet.`,
            referenceId: bookingId,
            balanceAfter: newBal,
          },
        }),
      ]);

      if (booking.mentorId) {
        const { createNotification } = await import("../../../lib/notifications");
        await createNotification(
          booking.mentorId,
          "Booking Request Cancelled",
          `The session request for "${booking.topic || booking.skillTitle}" scheduled for ${booking.date} was cancelled by the learner.`
        );
      }

      return NextResponse.json({ message: "Booking cancelled and tokens refunded", booking: updated });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return NextResponse.json({ message: "Booking updated", booking: updated });
  } catch (err) {
    console.error("Bookings PUT error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
