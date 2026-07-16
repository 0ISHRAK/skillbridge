import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { authenticate } from "../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { studentId: user.userId },
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
    if (!mentor || mentor.role !== "mentor") {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    const student = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const tokenCost = Math.max(1, Math.ceil((price || 1000) / 1000));
    if (student.tokenBalance < tokenCost) {
      return NextResponse.json({ error: "Insufficient token balance" }, { status: 400 });
    }

    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          studentId: user.userId,
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
