import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "./db";

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export async function authenticate(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  try {
    const tokenHash = hashSessionToken(token);
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session) return null;

    if (session.expiresAt <= new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    return {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role.toLowerCase(),
      name: session.user.name,
    };
  } catch {
    return null;
  }
}

export function createSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      userId,
      expiresAt,
    },
  });

  return token;
}

export async function deleteCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  cookieStore.delete("session_token");
}

export async function authenticateAdmin(): Promise<boolean> {
  const decoded = await authenticate();
  if (!decoded) return false;
  return decoded.role === "admin";
}

export async function authenticateApprovedMentor(): Promise<AuthPayload | null> {
  const user = await authenticate();
  if (!user || user.role !== "mentor") return null;

  const profile = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { isMentorApproved: true },
  });

  return profile?.isMentorApproved ? user : null;
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
