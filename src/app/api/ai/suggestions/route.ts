import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recipes } from "@/db/schema";
import { getChildFoodData } from "@/lib/food-data";
import { buildSuggestions, norm, toPick } from "@/lib/ai-engine";

export async function GET(req: NextRequest) {
  const childId = Number(req.nextUrl.searchParams.get("childId"));
  if (!Number.isFinite(childId)) {
    return NextResponse.json({ error: "childId required" }, { status: 400 });
  }
  const data = await getChildFoodData(childId);
  const buckets = buildSuggestions(data.baby, data.tried, data.catalog, data.allergenStates, data.recipes);

  // recipe ideas from tried ingredients (base slug coverage)
  const triedSlugs = new Set(
    data.tried.filter((t) => t.kind === "food" && t.slug).map((t) => t.slug as string)
  );
  const triedNames = data.tried.map((t) => norm(t.name));
  const allRecipes = await db.select().from(recipes);
  const slugToName = new Map(data.catalog.map((c) => [c.slug ?? "", c.name]));
  const ideas = allRecipes
    .map((r) => {
      const bases = (r.baseFoodSlugs ?? []) as string[];
      if (bases.length === 0) return null;
      const hit = bases.filter(
        (b) => triedSlugs.has(b) || triedNames.some((n) => n.includes(b.replace(/-/g, " ")) || b.replace(/-/g, " ").includes(n))
      );
      const missing = bases.filter((b) => !hit.includes(b));
      return { r, hit, missing, coverage: hit.length / bases.length };
    })
    .filter((x) => x && x.hit.length >= 2 && x.coverage >= 0.4)
    .sort((a, b) => b!.coverage - a!.coverage || b!.hit.length - a!.hit.length)
    .slice(0, 4)
    .map((x) => {
      const item = data.recipes.find((c) => c.key === `recipe:${x!.r.slug}`)!;
      return {
        recipe: toPick(item, `${x!.hit.length}/${x!.hit.length + x!.missing.length} ingredients already tried`),
        coverage: `${x!.hit.length}/${x!.hit.length + x!.missing.length} ingredients tried`,
        missing: x!.missing.map((m) => slugToName.get(m) ?? m).slice(0, 3),
      };
    });

  return NextResponse.json({ ...buckets, recipeIdeas: ideas, baby: data.baby });
}
