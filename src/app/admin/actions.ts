"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { events } from "@/db/schema";
import { endSession, isAdmin, passwordMatches, startSession } from "@/lib/auth";

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  if (!passwordMatches(String(form.get("password") ?? ""))) return "That password isn't right.";
  await startSession();
  refresh();
  return null;
}

export async function logout() {
  await endSession();
  refresh();
}

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Not signed in");
}

export async function moderate(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const op = String(form.get("op"));
  if (!Number.isInteger(id)) return;
  const days = (n: number) => new Date(Date.now() + n * 86_400_000);
  const patch =
    op === "approve" ? { status: "approved" as const }
    : op === "reject" ? { status: "rejected" as const }
    : op === "feature" ? { featuredUntil: days(7) }
    : op === "unfeature" ? { featuredUntil: null }
    : null;
  if (!patch) return;
  await db.update(events).set(patch).where(eq(events.id, id));
  refresh();
}
