import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { authenticate } from "../../../lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const skill = searchParams.get("skill") || "";

    const posts = await prisma.skillPost.findMany({
      where: {
        isOpen: true,
        ...(search
          ? {
              OR: [
                { offeredSkill: { contains: search } },
                { recommendedSkill: { contains: search } },
                { authorName: { contains: search } },
              ],
            }
          : {}),
        ...(skill ? { offeredSkill: { contains: skill } } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("skill-posts GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { offeredSkill, recommendedSkill, description, tokenCost } = await request.json();

    if (!offeredSkill || !recommendedSkill) {
      return NextResponse.json(
        { error: "offeredSkill and recommendedSkill are required" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await prisma.skillPost.create({
      data: {
        authorId: user.userId,
        authorName: dbUser.name,
        offeredSkill: String(offeredSkill).slice(0, 100),
        recommendedSkill: String(recommendedSkill).slice(0, 100),
        description: description ? String(description).slice(0, 500) : null,
        tokenCost: Math.max(1, Math.min(50, Number(tokenCost) || 5)),
        isOpen: true,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("skill-posts POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
