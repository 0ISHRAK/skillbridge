import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error || "Google authentication was cancelled")}`, baseUrl)
    );
  }

  try {
    // Decode and validate state
    let statePayload: { csrf: string; role?: string } = { csrf: "" };
    try {
      statePayload = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    } catch {
      return NextResponse.redirect(new URL("/auth?error=invalid_oauth_state", baseUrl));
    }

    const cookieStore = await cookies();
    const storedCsrf = cookieStore.get("oauth_state")?.value;
    if (!storedCsrf || storedCsrf !== statePayload.csrf) {
      return NextResponse.redirect(new URL("/auth?error=csrf_validation_failed", baseUrl));
    }
    cookieStore.delete("oauth_state");

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/oauth/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/auth?error=google_credentials_missing", baseUrl));
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error("Google token exchange failed:", errBody);
      return NextResponse.redirect(new URL("/auth?error=token_exchange_failed", baseUrl));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL("/auth?error=fetch_userinfo_failed", baseUrl));
    }

    const googleUser = await userResponse.json();
    const email = String(googleUser.email || "").toLowerCase().trim();
    const name = String(googleUser.name || "Google User").trim();
    const avatarUrl = googleUser.picture || null;

    if (!email) {
      return NextResponse.redirect(new URL("/auth?error=email_not_provided", baseUrl));
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user account
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const chosenRole = statePayload.role === "mentor" ? "mentor" : "learner";

      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: chosenRole,
          avatar: "👨‍💻",
          avatarUrl,
          isEmailVerified: true,
          tokenBalance: chosenRole === "learner" ? 25 : 0,
        },
      });
    } else {
      // Existing user: ensure email verification is true and update avatar if not present
      const updateData: { isEmailVerified: boolean; avatarUrl?: string } = {
        isEmailVerified: true,
      };
      if (!user.avatarUrl && avatarUrl) {
        updateData.avatarUrl = avatarUrl;
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    // Create session token and set cookie
    const sessionToken = await createSession(user.id);
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (user.role.toLowerCase() === "mentor" && !user.isMentorApproved) {
      return NextResponse.redirect(new URL("/auth/mentor-pending", baseUrl));
    }

    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  } catch (err) {
    console.error("Google OAuth callback exception:", err);
    return NextResponse.redirect(new URL("/auth?error=oauth_callback_error", baseUrl));
  }
}
