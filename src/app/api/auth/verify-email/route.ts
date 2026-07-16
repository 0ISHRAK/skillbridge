import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getJwtSecret } from "../../../../lib/auth";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { token, email } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required / ইমেইল প্রয়োজন" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found. Please sign up again. / অ্যাকাউন্ট পাওয়া যায়নি" },
        { status: 400 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: "Email already verified. Please log in. / ইমেইল ইতিমধ্যে যাচাই করা হয়েছে" },
        { status: 400 }
      );
    }

    // Sandbox: accept any 6-digit code
    if (!/^\d{6}$/.test(token)) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit code." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
      },
    });

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("auth_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      message: "Email successfully verified! / ইমেইল সফলভাবে যাচাই করা হয়েছে!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Verification exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
