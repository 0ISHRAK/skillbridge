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

    if (action === "confirmed" || action === "rejected") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: action },
      });

      if (action === "confirmed" && studentUserId) {
        const { createNotification } = await import("../../../../lib/notifications");
        await createNotification(
          studentUserId,
          "Booking Confirmed!",
          `Your session on "${booking.topic || booking.skillTitle}" with your mentor has been confirmed for ${booking.date} at ${booking.time}.`
        );
      }

      return NextResponse.json({ message: `Booking ${action} successfully` });
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
