import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticate } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const role = user.role;

    if (role === "learner") {
      const { interests, careerGoal, targetHours } = body;

      if (!interests || !Array.isArray(interests) || interests.length === 0) {
        return NextResponse.json({ error: "Please select at least one interest" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: user.userId },
        data: {
          interests: JSON.stringify(interests),
          careerGoal: careerGoal || null,
          targetHours: targetHours || null,
          isOnboarded: true,
        },
      });
    } else if (role === "mentor") {
      const { skills, hourlyRate, availabilityDays, linkedinUrl } = body;

      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return NextResponse.json({ error: "Please add at least one skill" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: user.userId },
        data: {
          skills: JSON.stringify(skills),
          hourlyRate: Math.max(500, Number(hourlyRate) || 1000),
          availabilityDays: JSON.stringify(availabilityDays || []),
          linkedinUrl: linkedinUrl || null,
          isOnboarded: true,
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid role for onboarding" }, { status: 400 });
    }

    return NextResponse.json({ message: "Onboarding completed successfully" });
  } catch (err) {
    console.error("Onboarding exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
