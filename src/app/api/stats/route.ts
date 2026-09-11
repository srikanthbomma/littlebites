import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { allergenProgress, favorites, mealLogs } from "@/db/schema";

export async function GET(req: NextRequest) {
  const childId = Number(req.nextUrl.searchParams.get("childId"));
  if (!Number.isFinite(childId)) {
    return NextResponse.json({ foodsTried: 0, logsWeek: 0, favorites: 0, allergensStarted: 0 });
  }
  const weekAgo = new Date(Date.now() - 7 * 86400000);

  const tried = await db
    .select({ n: sql<number>`count(distinct ${mealLogs.foodName})` })
    .from(mealLogs)
    .where(eq(mealLogs.childId, childId));
  const week = await db
    .select({ n: sql<number>`count(*)` })
    .from(mealLogs)
    .where(and(eq(mealLogs.childId, childId), gte(mealLogs.loggedAt, weekAgo)));
  const fav = await db
    .select({ n: sql<number>`count(*)` })
    .from(favorites)
    .where(eq(favorites.childId, childId));
  const alg = await db
    .select({ n: sql<number>`count(*)` })
    .from(allergenProgress)
    .where(and(eq(allergenProgress.childId, childId), ne(allergenProgress.status, "Not started")));

  return NextResponse.json({
    foodsTried: Number(tried[0]?.n ?? 0),
    logsWeek: Number(week[0]?.n ?? 0),
    favorites: Number(fav[0]?.n ?? 0),
    allergensStarted: Number(alg[0]?.n ?? 0),
  });
}
