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
        role: user.role.toLowerCase(),
        avatar: user.avatar || "👨‍💻",
        avatarUrl: user.avatarUrl,
        headline: user.headline || "",
        bio: user.bio || "",
        experienceYears: user.experienceYears || 0,
        linkedinUrl: user.linkedinUrl || "",
        hourlyRate: user.hourlyRate || 1000,
        skills: safeJsonParse(user.skills, []),
        availabilityDays: safeJsonParse(user.availabilityDays, []),
        availabilitySlots: safeJsonParse(user.availabilitySlots, []),
        isMentorApproved: user.isMentorApproved,
        targetHours: user.targetHours || "Moderate: 3 - 5 hours per week (Recommended)",
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
      avatar,
      avatarUrl,
      headline,
      bio,
      experienceYears,
      linkedinUrl,
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

    if (avatar !== undefined) updateData.avatar = String(avatar);
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (headline !== undefined) updateData.headline = String(headline).slice(0, 200);
    if (bio !== undefined) updateData.bio = String(bio).slice(0, 2000);
    if (linkedinUrl !== undefined) updateData.linkedinUrl = String(linkedinUrl).slice(0, 255);

    if (experienceYears !== undefined) {
      const exp = Number(experienceYears);
      if (!isNaN(exp) && exp >= 0) {
        updateData.experienceYears = Math.min(50, Math.max(0, Math.round(exp)));
      }
    }

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
        role: updatedUser.role.toLowerCase(),
        avatar: updatedUser.avatar,
        avatarUrl: updatedUser.avatarUrl,
        headline: updatedUser.headline,
        bio: updatedUser.bio,
        experienceYears: updatedUser.experienceYears,
        linkedinUrl: updatedUser.linkedinUrl,
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
