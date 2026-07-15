import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { sendEmail } from "../../../../lib/notifications";

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
      where: { email },
    });

    if (!user) {
      // Return success messaging anyway to prevent account enumeration
      return NextResponse.json({
        message: "If the email is registered, a password reset code will be generated.",
      });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour expiration

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Send reset password email via Nodemailer SMTP
    try {
      await sendEmail(
        email,
        "Skillbridge Password Reset Code / পাসওয়ার্ড রিসেট কোড",
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg;">
          <h2 style="color: #1e3a8a; text-align: center;">Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password. Use the verification code below to set a new password:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #dc2626; margin: 20px 0;">
            ${resetToken}
          </div>
          <p>This code will expire in 1 hour. If you did not make this request, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b; text-align: center;">Skillbridge Team, Dhaka, Bangladesh</p>
        </div>
        `
      );
    } catch (emailErr) {
      console.error("Forgot password SMTP dispatch failed:", emailErr);
    }

    return NextResponse.json({
      message: "Reset code generated successfully and dispatched.",
      resetToken,
    });
  } catch (err) {
    console.error("Forgot password exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
