import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";

/** Moderation is switched off until ADMIN_PASSWORD is set. */
export function adminEnabled() {
  return !!process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 8;
}

function token() {
  return createHmac("sha256", process.env.ADMIN_PASSWORD!).update("admin-session-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function passwordMatches(input: string) {
  return adminEnabled() && safeEqual(input, process.env.ADMIN_PASSWORD!);
}

export async function isAdmin() {
  if (!adminEnabled()) return false;
  const c = (await cookies()).get(COOKIE)?.value;
  return !!c && safeEqual(c, token());
}

export async function startSession() {
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}
