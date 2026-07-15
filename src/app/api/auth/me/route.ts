import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-123456";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No session token found" },
        { status: 401 }
      );
    }

    let decoded: { userId?: string } & jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId?: string } & jwt.JwtPayload;
    } catch {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    if (!decoded.userId) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token body" },
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        tokenBalance: user.tokenBalance,
      },
    });
  } catch (err) {
    console.error("Auth Me exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
