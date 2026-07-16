import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { authenticate, safeJsonParse } from "../../../lib/auth";

export async function GET() {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        hourlyRate: user.hourlyRate,
        skills: safeJsonParse(user.skills, []),
        availabilityDays: safeJsonParse(user.availabilityDays, []),
        availabilitySlots: safeJsonParse(user.availabilitySlots, []),
        isMentorApproved: user.isMentorApproved,
        targetHours: user.targetHours,
      },
    });
  } catch (err) {
    console.error("GET Profile error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const {
      name,
      avatarUrl,
      bio,
      hourlyRate,
      skills,
      availabilityDays,
      availabilitySlots,
      targetHours,
    } = payload;

    const updateData: Record<string, string | number | boolean | null> = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (trimmedName.length === 0 || trimmedName.length > 100) {
        return NextResponse.json(
          { error: "Name must be between 1 and 100 characters" },
          { status: 400 }
        );
      }
      updateData.name = trimmedName;
    }

    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (bio !== undefined) updateData.bio = String(bio).slice(0, 1000);

    if (hourlyRate !== undefined) {
      const rate = Number(hourlyRate);
      if (isNaN(rate) || rate < 0) {
        return NextResponse.json(
          { error: "Hourly rate must be a positive number" },
          { status: 400 }
        );
      }
      updateData.hourlyRate = Math.round(rate);
    }

    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        return NextResponse.json(
          { error: "Skills must be an array" },
          { status: 400 }
        );
      }
      updateData.skills = JSON.stringify(skills);
    }

    if (availabilityDays !== undefined) {
      if (!Array.isArray(availabilityDays)) {
        return NextResponse.json(
          { error: "availabilityDays must be an array" },
          { status: 400 }
        );
      }
      updateData.availabilityDays = JSON.stringify(availabilityDays);
    }

    if (availabilitySlots !== undefined) {
      if (!Array.isArray(availabilitySlots)) {
        return NextResponse.json(
          { error: "availabilitySlots must be an array" },
          { status: 400 }
        );
      }
      updateData.availabilitySlots = JSON.stringify(availabilitySlots);
    }

    if (targetHours !== undefined) updateData.targetHours = String(targetHours);

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        bio: updatedUser.bio,
        hourlyRate: updatedUser.hourlyRate,
        skills: safeJsonParse(updatedUser.skills, []),
        availabilityDays: safeJsonParse(updatedUser.availabilityDays, []),
        availabilitySlots: safeJsonParse(updatedUser.availabilitySlots, []),
        isMentorApproved: updatedUser.isMentorApproved,
        targetHours: updatedUser.targetHours,
      },
    });
  } catch (err) {
    console.error("PUT Profile error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
