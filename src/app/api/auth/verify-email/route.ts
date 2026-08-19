import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { createSession } from "../../../../lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { token, email } = await request.json();
    const normalizedToken = String(token ?? "").trim();

    if (!normalizedToken) {
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

    if (!/^\d{6}$/.test(normalizedToken)) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit code." },
        { status: 400 }
      );
    }

    if (!user.verificationToken || normalizedToken !== user.verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification code. Please try again. / কোডটি সঠিক নয়" },
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

    const sessionToken = await createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set("session_token", sessionToken, {
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
        role: user.role.toLowerCase(),
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
