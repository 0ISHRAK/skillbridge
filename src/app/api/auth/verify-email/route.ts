import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token / অকার্যকর যাচাইকরণ টোকেন" },
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

    return NextResponse.json({
      message: "Email successfully verified! / ইমেইল সফলভাবে যাচাই করা হয়েছে!",
    });
  } catch (err) {
    console.error("Verification exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
