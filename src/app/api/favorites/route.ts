import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites } from "@/db/schema";

export async function GET(req: NextRequest) {
  const childId = Number(req.nextUrl.searchParams.get("childId"));
  if (!Number.isFinite(childId)) return NextResponse.json([]);
  const rows = await db.select().from(favorites).where(eq(favorites.childId, childId));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const childId = Number(body.childId);
  const foodId = Number(body.foodId);
  if (!Number.isFinite(childId) || !Number.isFinite(foodId)) {
    return NextResponse.json({ error: "childId and foodId required" }, { status: 400 });
  }
  const [row] = await db
    .insert(favorites)
    .values({ childId, foodId })
    .onConflictDoNothing()
    .returning();
  return NextResponse.json(row ?? { childId, foodId }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const childId = Number(req.nextUrl.searchParams.get("childId"));
  const foodId = Number(req.nextUrl.searchParams.get("foodId"));
  if (!Number.isFinite(childId) || !Number.isFinite(foodId)) {
    return NextResponse.json({ error: "childId and foodId required" }, { status: 400 });
  }
  await db
    .delete(favorites)
    .where(and(eq(favorites.childId, childId), eq(favorites.foodId, foodId)));
  return NextResponse.json({ ok: true });
}
