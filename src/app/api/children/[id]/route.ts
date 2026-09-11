import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { allergenProgress, children, favorites, mealLogs } from "@/db/schema";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  const body = await req.json();
  const patch: Partial<typeof children.$inferInsert> = {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.birthdate !== undefined) patch.birthdate = body.birthdate ? String(body.birthdate) : null;
  if (body.avatarEmoji !== undefined) patch.avatarEmoji = String(body.avatarEmoji);
  if (body.notes !== undefined) patch.notes = String(body.notes);
  const [row] = await db.update(children).set(patch).where(eq(children.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  await db.delete(favorites).where(eq(favorites.childId, id));
  await db.delete(mealLogs).where(eq(mealLogs.childId, id));
  await db.delete(allergenProgress).where(eq(allergenProgress.childId, id));
  await db.delete(children).where(eq(children.id, id));
  return NextResponse.json({ ok: true });
}
