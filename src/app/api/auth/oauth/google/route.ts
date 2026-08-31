import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const role = url.searchParams.get("role") || "learner";
    const clientId = process.env.GOOGLE_CLIENT_ID;

    // Detect base URL dynamically for localhost or production domain
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${protocol}://${host}/api/auth/oauth/google/callback`;

    if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL(
          `/auth?error=${encodeURIComponent("Google OAuth is not configured yet. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment.")}`,
          `${protocol}://${host}`
        )
      );
    }

    const statePayload = {
      csrf: crypto.randomBytes(16).toString("hex"),
      role: role === "mentor" ? "mentor" : "learner",
    };
    const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

    const cookieStore = await cookies();
    cookieStore.set("oauth_state", statePayload.csrf, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    });

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("state", state);
    googleAuthUrl.searchParams.set("prompt", "select_account");

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (err) {
    console.error("Google OAuth start error:", err);
    return NextResponse.redirect(new URL("/auth?error=oauth_init_failed", request.url));
  }
}
