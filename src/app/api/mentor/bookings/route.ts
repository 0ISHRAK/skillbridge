import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticate();
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const bookings = await prisma.booking.findMany({
      where: { mentorId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    const studentIds = [...new Set(bookings.map((b) => b.studentId))];
    const students = await prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, name: true, email: true },
    });

    const studentMap = new Map(students.map((s) => [s.id, s]));

    const enriched = bookings.map((b) => ({
      id: b.id,
      studentId: b.studentId,
      studentName: studentMap.get(b.studentId)?.name || "Unknown",
      studentEmail: studentMap.get(b.studentId)?.email || "",
      topic: b.topic,
      date: b.date,
      time: b.time,
      price: b.price,
      status: b.status,
      createdAt: b.createdAt,
    }));

    return NextResponse.json({ bookings: enriched });
  } catch (err) {
    console.error("Mentor bookings GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await authenticate();
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

    if (action === "confirmed" || action === "rejected") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: action },
      });

      if (action === "confirmed") {
        const { createNotification } = await import("../../../../lib/notifications");
        await createNotification(
          booking.studentId,
          "Booking Confirmed!",
          `Your session on "${booking.topic}" with your mentor has been confirmed for ${booking.date} at ${booking.time}.`
        );
      }

      return NextResponse.json({ message: `Booking ${action} successfully` });
    }

    if (action === "reschedule" && newTime) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { time: newTime },
      });

      const { createNotification } = await import("../../../../lib/notifications");
      await createNotification(
        booking.studentId,
        "Session Rescheduled",
        `Your session on "${booking.topic}" has been rescheduled to ${newTime}.`
      );

      return NextResponse.json({ message: "Booking rescheduled successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Mentor bookings PUT error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
