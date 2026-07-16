import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { safeJsonParse } from "../../../lib/auth";

export async function GET() {
  try {
    const mentors = await prisma.user.findMany({
      where: {
        role: "mentor",
        isMentorApproved: true,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        hourlyRate: true,
        skills: true,
        availabilityDays: true,
        availabilitySlots: true,
        avatarUrl: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = mentors.map((m) => ({
      id: m.id,
      name: m.name,
      bio: m.bio || "",
      hourlyRate: m.hourlyRate,
      skills: safeJsonParse(m.skills, []),
      availabilityDays: safeJsonParse(m.availabilityDays, []),
      availabilitySlots: safeJsonParse(m.availabilitySlots, []),
      avatarUrl: m.avatarUrl,
    }));

    return NextResponse.json({ mentors: parsed });
  } catch (err) {
    console.error("Mentors GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
