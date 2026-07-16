import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "skillbridge-dev-secret-change-in-production";

export interface AuthPayload extends jwt.JwtPayload {
  userId: string;
  email?: string;
  role?: string;
  name?: string;
}

export function getJwtSecret(): string {
  return JWT_SECRET;
}

export async function authenticate(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    if (!decoded.userId) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function authenticateAdmin(): Promise<boolean> {
  const decoded = await authenticate();
  if (!decoded) return false;
  return decoded.role === "admin";
}

export function generateSecureToken(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateFileUpload(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return "File too large. Maximum size is 5MB.";
  }
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.";
  }
  return null;
}

export function sanitizeFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "bin";
  const safeName = filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(0, 50);
  return `${Date.now()}-${safeName}.${ext}`;
}
