import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticate();
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const mentor = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { availabilityDays: true, availabilitySlots: true },
    });

    return NextResponse.json({
      days: mentor?.availabilityDays ? JSON.parse(mentor.availabilityDays) : [],
      slots: mentor?.availabilitySlots ? JSON.parse(mentor.availabilitySlots) : [],
    });
  } catch (err) {
    console.error("Mentor availability GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await authenticate();
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { days, slots } = await request.json();

    if (!Array.isArray(days) || !Array.isArray(slots)) {
      return NextResponse.json({ error: "days and slots must be arrays" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.userId },
      data: {
        availabilityDays: JSON.stringify(days),
        availabilitySlots: JSON.stringify(slots),
      },
    });

    return NextResponse.json({ message: "Availability updated successfully" });
  } catch (err) {
    console.error("Mentor availability PUT error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
