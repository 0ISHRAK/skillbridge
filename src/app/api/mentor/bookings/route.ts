import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticateApprovedMentor } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticateApprovedMentor();
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const bookings = await prisma.booking.findMany({
      where: { mentorId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    const studentIds = [
      ...new Set(bookings.map((b) => b.studentId || b.learnerId).filter(Boolean)),
    ] as string[];

    const students = await prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, name: true, email: true },
    });

    const studentMap = new Map(students.map((s) => [s.id, s]));

    const enriched = bookings.map((b) => {
      const sId = b.studentId || b.learnerId || "";
      return {
        id: b.id,
        studentId: sId,
        studentName: studentMap.get(sId)?.name || "Unknown",
        studentEmail: studentMap.get(sId)?.email || "",
        topic: b.topic || b.skillTitle || "Mentorship Session",
        date: b.date || (b.sessionDate ? new Date(b.sessionDate).toISOString().split("T")[0] : ""),
        time: b.time || "",
        price: b.price,
        status: b.status,
        createdAt: b.createdAt,
      };
    });

    return NextResponse.json({ bookings: enriched });
  } catch (err) {
    console.error("Mentor bookings GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await authenticateApprovedMentor();
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { bookingId, action, newTime } = await request.json();

    if (!bookingId || !action) {
      return NextResponse.json({ error: "bookingId and action are required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking || booking.mentorId !== user.userId) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const studentUserId = booking.studentId || booking.learnerId;

    if (action === "completed") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "completed" },
      });

      if (studentUserId) {
        const { createNotification } = await import("../../../../lib/notifications");
        await createNotification(
          studentUserId,
          "🎉 Session Completed!",
          `Your mentorship session on "${booking.topic || booking.skillTitle}" with ${user.name || "your mentor"} has finished. Thank you for learning with Skillbridge!`
        );
      }

      return NextResponse.json({ message: "Booking marked as completed successfully" });
    }

    if (action === "confirmed") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "confirmed" },
      });

      if (studentUserId) {
        const { createNotification } = await import("../../../../lib/notifications");
        await createNotification(
          studentUserId,
          "Booking Confirmed!",
          `Your session on "${booking.topic || booking.skillTitle}" with your mentor has been confirmed for ${booking.date} at ${booking.time}.`
        );
      }

      return NextResponse.json({ message: "Booking confirmed successfully" });
    }

    if (action === "rejected") {
      const refundTokens = Math.max(1, Math.ceil((booking.price || 1000) / 10));

      if (studentUserId) {
        const student = await prisma.user.findUnique({ where: { id: studentUserId } });
        const newBalance = (student?.tokenBalance ?? 0) + refundTokens;

        await prisma.$transaction([
          prisma.booking.update({
            where: { id: bookingId },
            data: { status: "rejected" },
          }),
          prisma.user.update({
            where: { id: studentUserId },
            data: { tokenBalance: { increment: refundTokens } },
          }),
          prisma.tokenTransaction.create({
            data: {
              userId: studentUserId,
              amount: refundTokens,
              type: "mentor_booking",
              title: `Refund: Session Declined by Mentor`,
              description: `Mentor declined session for "${booking.topic || booking.skillTitle}". ${refundTokens} tokens returned to your wallet.`,
              referenceId: bookingId,
              balanceAfter: newBalance,
            },
          }),
        ]);

        const { createNotification } = await import("../../../../lib/notifications");
        await createNotification(
          studentUserId,
          "Booking Request Declined",
          `Your session request on "${booking.topic || booking.skillTitle}" was declined by the mentor. ${refundTokens} tokens have been refunded to your wallet.`
        );
      } else {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: "rejected" },
        });
      }

      return NextResponse.json({ message: "Booking rejected and tokens refunded successfully" });
    }

    if (action === "reschedule" && newTime) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { time: newTime },
      });

      if (studentUserId) {
        const { createNotification } = await import("../../../../lib/notifications");
        await createNotification(
          studentUserId,
          "Session Rescheduled",
          `Your session on "${booking.topic || booking.skillTitle}" has been rescheduled to ${newTime}.`
        );
      }

      return NextResponse.json({ message: "Booking rescheduled successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Mentor bookings PUT error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
