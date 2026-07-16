import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT = 100;
const WINDOW_MS = 60 * 1000;

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin") || "*";

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (request.nextUrl.pathname.startsWith("/api")) {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    } else {
      const rateData = rateLimitMap.get(ip)!;
      if (now > rateData.resetTime) {
        rateData.count = 1;
        rateData.resetTime = now + WINDOW_MS;
      } else {
        rateData.count += 1;
      }

      if (rateData.count > LIMIT) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests. Rate limit exceeded / অতিরিক্ত রিকোয়েস্ট পাঠানো হয়েছে" }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": origin,
            },
          }
        );
      }
    }
  }

  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
