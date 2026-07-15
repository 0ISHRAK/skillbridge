import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-123456";

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };
    return decoded.userId || null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await authenticate();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse JSON arrays safely
    const skills = user.skills ? JSON.parse(user.skills) : [];
    const availabilityDays = user.availabilityDays ? JSON.parse(user.availabilityDays) : [];
    const availabilitySlots = user.availabilitySlots ? JSON.parse(user.availabilitySlots) : [];

    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        hourlyRate: user.hourlyRate,
        skills,
        availabilityDays,
        availabilitySlots,
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
    const userId = await authenticate();
    if (!userId) {
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

    // Build update parameters
    const updateData: Record<string, string | number | boolean | null> = {};
    if (name !== undefined) updateData.name = name;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (bio !== undefined) updateData.bio = bio;
    if (hourlyRate !== undefined) updateData.hourlyRate = Number(hourlyRate);
    if (skills !== undefined) updateData.skills = JSON.stringify(skills);
    if (availabilityDays !== undefined) updateData.availabilityDays = JSON.stringify(availabilityDays);
    if (availabilitySlots !== undefined) updateData.availabilitySlots = JSON.stringify(availabilitySlots);
    if (targetHours !== undefined) updateData.targetHours = targetHours;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
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
        skills: updatedUser.skills ? JSON.parse(updatedUser.skills) : [],
        availabilityDays: updatedUser.availabilityDays ? JSON.parse(updatedUser.availabilityDays) : [],
        availabilitySlots: updatedUser.availabilitySlots ? JSON.parse(updatedUser.availabilitySlots) : [],
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
