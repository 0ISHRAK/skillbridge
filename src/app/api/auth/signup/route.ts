import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { sendEmail } from "../../../../lib/notifications";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "All fields are required / সব তথ্য পূরণ করা আবশ্যক" },
        { status: 400 }
      );
    }

    // Validate email format and check for dummy addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format / ভুল ইমেইল ফরম্যাট" },
        { status: 400 }
      );
    }

    const blacklistPrefixes = ["abc", "xyz", "test", "dummy", "example", "123", "1234", "asdf", "qwer"];
    const emailLower = email.toLowerCase().trim();
    const [localPart, domainPart] = emailLower.split("@");

    if (
      blacklistPrefixes.includes(localPart) || 
      domainPart === "test.com" || 
      domainPart === "example.com" || 
      domainPart.length < 4 || 
      !domainPart.includes(".")
    ) {
      return NextResponse.json(
        { error: "Please use a genuine email address / অনুগ্রহ করে একটি আসল ইমেইল এড্রেস ব্যবহার করুন" },
        { status: 400 }
      );
    }

    if (role !== "learner" && role !== "mentor") {
      return NextResponse.json(
        { error: "Invalid user role selected" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists / এই ইমেইল ইতিমধ্যে ব্যবহার করা হয়েছে" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        isEmailVerified: false,
        verificationToken,
        tokenBalance: role === "learner" ? 30 : 0,
      },
    });

    // Trigger Nodemailer asynchronously (non-blocking)
    // This returns the HTTP signup response immediately without waiting for slow SMTP socket handshakes.
    sendEmail(
      email,
      "Skillbridge Email Verification Code / ইমেইল ভেরিফিকেশন কোড",
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; text-align: center;">Welcome to Skillbridge!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for signing up to Skillbridge. Please use the verification code below to confirm your email address:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0d9488; margin: 20px 0;">
          ${verificationToken}
        </div>
        <p>If you did not request this code, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #64748b; text-align: center;">Skillbridge Team, Dhaka, Bangladesh</p>
      </div>
      `
    ).catch((emailErr) => {
      console.error("Nodemailer failed to send email during signup:", emailErr);
    });

    return NextResponse.json({
      message: "Registration successful! Verification token sent.",
      userId: user.id,
      verificationToken,
    });
  } catch (err) {
    console.error("Signup exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
