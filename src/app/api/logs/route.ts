import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { mealLogs } from "@/db/schema";

export async function GET(req: NextRequest) {
  const childId = Number(req.nextUrl.searchParams.get("childId"));
  if (!Number.isFinite(childId)) return NextResponse.json([]);
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 200) || 200, 500);
  const rows = await db
    .select()
    .from(mealLogs)
    .where(eq(mealLogs.childId, childId))
    .orderBy(desc(mealLogs.loggedAt))
    .limit(limit);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const childId = Number(body.childId);
  const foodName = String(body.foodName ?? "").trim();
  if (!Number.isFinite(childId) || !foodName) {
    return NextResponse.json({ error: "childId and foodName required" }, { status: 400 });
  }
  const [row] = await db
    .insert(mealLogs)
    .values({
      childId,
      foodId: body.foodId ? Number(body.foodId) : null,
      foodName,
      foodEmoji: String(body.foodEmoji ?? "🍽️"),
      mealType: String(body.mealType ?? "Lunch"),
      reaction: String(body.reaction ?? "Liked"),
      notes: String(body.notes ?? ""),
      loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isFinite(id)) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(mealLogs).where(eq(mealLogs.id, id));
  return NextResponse.json({ ok: true });
}
