import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { allergenProgress } from "@/db/schema";
import { BIG9 } from "@/lib/big9";

export async function GET(req: NextRequest) {
  const childId = Number(req.nextUrl.searchParams.get("childId"));
  if (!Number.isFinite(childId)) return NextResponse.json([]);
  const rows = await db.select().from(allergenProgress).where(eq(allergenProgress.childId, childId));
  const byName = new Map(rows.map((r) => [r.allergen, r]));
  return NextResponse.json(
    BIG9.map((b) => ({
      allergen: b.name,
      emoji: b.emoji,
      blurb: b.blurb,
      howToServe: b.howToServe,
      status: byName.get(b.name)?.status ?? "Not started",
      exposures: byName.get(b.name)?.exposures ?? 0,
      firstTriedAt: byName.get(b.name)?.firstTriedAt ?? null,
      lastExposureAt: byName.get(b.name)?.lastExposureAt ?? null,
      reactionNotes: byName.get(b.name)?.reactionNotes ?? "",
    }))
  );
}

// Log an exposure (increments count, sets dates, moves Not started -> Trying)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const childId = Number(body.childId);
  const allergen = String(body.allergen ?? "");
  if (!Number.isFinite(childId) || !allergen) {
    return NextResponse.json({ error: "childId and allergen required" }, { status: 400 });
  }
  const now = new Date();
  const existing = await db
    .select()
    .from(allergenProgress)
    .where(and(eq(allergenProgress.childId, childId), eq(allergenProgress.allergen, allergen)))
    .limit(1);

  if (existing.length === 0) {
    const [row] = await db
      .insert(allergenProgress)
      .values({
        childId,
        allergen,
        status: "Trying",
        exposures: 1,
        firstTriedAt: now,
        lastExposureAt: now,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  }
  const [row] = await db
    .update(allergenProgress)
    .set({
      exposures: sql`${allergenProgress.exposures} + 1`,
      lastExposureAt: now,
      status: existing[0].status === "Not started" ? "Trying" : existing[0].status,
      updatedAt: now,
    })
    .where(and(eq(allergenProgress.childId, childId), eq(allergenProgress.allergen, allergen)))
    .returning();
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const childId = Number(body.childId);
  const allergen = String(body.allergen ?? "");
  if (!Number.isFinite(childId) || !allergen) {
    return NextResponse.json({ error: "childId and allergen required" }, { status: 400 });
  }
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (body.status) patch.status = String(body.status);
  if (body.reactionNotes !== undefined) patch.reactionNotes = String(body.reactionNotes);
  const existing = await db
    .select()
    .from(allergenProgress)
    .where(and(eq(allergenProgress.childId, childId), eq(allergenProgress.allergen, allergen)))
    .limit(1);
  if (existing.length === 0) {
    const [row] = await db
      .insert(allergenProgress)
      .values({ childId, allergen, status: String(body.status ?? "Not started"), exposures: 0, reactionNotes: String(body.reactionNotes ?? "") })
      .returning();
    return NextResponse.json(row);
  }
  const [row] = await db
    .update(allergenProgress)
    .set(patch)
    .where(and(eq(allergenProgress.childId, childId), eq(allergenProgress.allergen, allergen)))
    .returning();
  return NextResponse.json(row);
}
