import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { sendEmail } from "../../../../lib/notifications";
import { generateSecureToken } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || user.isEmailVerified) {
      return NextResponse.json({
        message: "If the email is registered and unverified, a new code will be sent.",
      });
    }

    const verificationToken = generateSecureToken();

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    sendEmail(
      email.toLowerCase().trim(),
      "Skillbridge Email Verification Code / ইমেইল ভেরিফিকেশন কোড",
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; text-align: center;">Verification Code Resent</h2>
        <p>Hi ${user.name},</p>
        <p>Here is your new verification code:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0d9488; margin: 20px 0;">
          ${verificationToken}
        </div>
        <p>If you did not request this code, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #64748b; text-align: center;">Skillbridge Team, Dhaka, Bangladesh</p>
      </div>
      `
    ).catch((emailErr) => {
      console.error("Resend verification email failed:", emailErr);
    });

    return NextResponse.json({
      message: "If the email is registered and unverified, a new code will be sent.",
    });
  } catch (err) {
    console.error("Resend verification exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
