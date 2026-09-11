import { NextRequest, NextResponse } from "next/server";
import { and, eq, ne, or, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { recipes } from "@/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const rows = await db.select().from(recipes).where(eq(recipes.slug, slug)).limit(1);
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const recipe = rows[0];
  // Prefer same-country recipes, then same category
  const related = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      slug: recipes.slug,
      country: recipes.country,
      cuisine: recipes.cuisine,
      region: recipes.region,
      category: recipes.category,
      emoji: recipes.emoji,
      ageText: recipes.ageText,
      ageMinMonths: recipes.ageMinMonths,
      prepMinutes: recipes.prepMinutes,
      allergens: recipes.allergens,
      isFirstFood: recipes.isFirstFood,
      description: recipes.description,
    })
    .from(recipes)
    .where(
      and(
        or(eq(recipes.country, recipe.country), eq(recipes.category, recipe.category)),
        ne(recipes.slug, slug)
      )
    )
    .orderBy(
      desc(sql`case when ${recipes.country} = ${recipe.country} then 1 else 0 end`),
      desc(sql`case when ${recipes.category} = ${recipe.category} then 1 else 0 end`)
    )
    .limit(4);
  return NextResponse.json({ recipe, related });
}
