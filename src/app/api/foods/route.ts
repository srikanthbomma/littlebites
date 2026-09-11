import { NextRequest, NextResponse } from "next/server";
import { and, asc, ilike, or, eq, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { foods } from "@/db/schema";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const category = req.nextUrl.searchParams.get("category") ?? "";
  const allergensOnly = req.nextUrl.searchParams.get("allergens") === "1";
  const ironOnly = req.nextUrl.searchParams.get("iron") === "1";

  const conds: SQL[] = [];
  if (q) {
    conds.push(or(ilike(foods.name, `%${q}%`), ilike(foods.category, `%${q}%`)) as SQL);
  }
  if (category) conds.push(eq(foods.category, category));
  if (allergensOnly) conds.push(eq(foods.isAllergen, true));
  if (ironOnly) conds.push(eq(foods.isIronRich, true));

  const rows = await db
    .select({
      id: foods.id,
      name: foods.name,
      slug: foods.slug,
      category: foods.category,
      emoji: foods.emoji,
      introAgeText: foods.introAgeText,
      isAllergen: foods.isAllergen,
      allergenName: foods.allergenName,
      chokingRisk: foods.chokingRisk,
      isIronRich: foods.isIronRich,
    })
    .from(foods)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(asc(foods.name));

  return NextResponse.json(rows);
}
