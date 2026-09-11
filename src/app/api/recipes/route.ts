import { NextRequest, NextResponse } from "next/server";
import { and, asc, ilike, or, lte, eq, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { recipes } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const country = req.nextUrl.searchParams.get("country") ?? "";
  const cuisine = req.nextUrl.searchParams.get("cuisine") ?? "";
  const region = req.nextUrl.searchParams.get("region") ?? "";
  const category = req.nextUrl.searchParams.get("category") ?? "";
  const ageMax = Number(req.nextUrl.searchParams.get("ageMax") ?? "");
  const firstOnly = req.nextUrl.searchParams.get("first") === "1";
  const isMeta = req.nextUrl.searchParams.get("meta") === "1";

  async function fetchRows() {
    if (isMeta) {
      return await db
        .select({
          country: recipes.country,
          cuisine: recipes.cuisine,
          count: sql<number>`count(*)`,
        })
        .from(recipes)
        .groupBy(recipes.country, recipes.cuisine)
        .orderBy(asc(recipes.country));
    }

    const conds: SQL[] = [];
    if (q) {
      conds.push(
        or(
          ilike(recipes.title, `%${q}%`),
          ilike(recipes.description, `%${q}%`),
          ilike(recipes.region, `%${q}%`),
          ilike(recipes.country, `%${q}%`),
          ilike(recipes.cuisine, `%${q}%`)
        ) as SQL
      );
    }
    if (country) conds.push(eq(recipes.country, country));
    if (cuisine) conds.push(eq(recipes.cuisine, cuisine));
    if (region) conds.push(eq(recipes.region, region));
    if (category) conds.push(eq(recipes.category, category));
    if (Number.isFinite(ageMax) && ageMax > 0) conds.push(lte(recipes.ageMinMonths, ageMax));
    if (firstOnly) conds.push(eq(recipes.isFirstFood, true));

    return await db
      .select({
        id: recipes.id,
        title: recipes.title,
        slug: recipes.slug,
        country: recipes.country,
        cuisine: recipes.cuisine,
        region: recipes.region,
        isAdapted: recipes.isAdapted,
        category: recipes.category,
        foodGroup: recipes.foodGroup,
        emoji: recipes.emoji,
        description: recipes.description,
        ageMinMonths: recipes.ageMinMonths,
        ageText: recipes.ageText,
        prepMinutes: recipes.prepMinutes,
        spiceLevel: recipes.spiceLevel,
        allergens: recipes.allergens,
        nutritionBenefits: recipes.nutritionBenefits,
        isFirstFood: recipes.isFirstFood,
      })
      .from(recipes)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(asc(recipes.ageMinMonths), asc(recipes.title));
  }

  try {
    let rows = await fetchRows();
    if (rows.length === 0 && !q && !country && !category) {
      // Database might be empty, try seeding once
      await ensureDatabaseSeeded();
      rows = await fetchRows();
    }
    return NextResponse.json(rows);
  } catch (err: unknown) {
    console.error("Error in /api/recipes, auto-seeding:", err);
    try {
      // Table probably doesn't exist, initialize and retry
      await ensureDatabaseSeeded();
      const rows = await fetchRows();
      return NextResponse.json(rows);
    } catch (retryErr: unknown) {
      console.error("Failed after retry:", retryErr);
      return NextResponse.json([], { status: 200 }); // return empty array instead of 500
    }
  }
}
