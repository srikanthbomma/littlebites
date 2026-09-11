import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { foodTracking, foods, recipes } from "@/db/schema";
import { getChildFoodData, customKey } from "@/lib/food-data";
import { buildDashboard, buildInsights, norm } from "@/lib/ai-engine";

export async function GET(req: NextRequest) {
  const childId = Number(req.nextUrl.searchParams.get("childId"));
  if (!Number.isFinite(childId)) return NextResponse.json({ error: "childId required" }, { status: 400 });
  const data = await getChildFoodData(childId);
  const dashboard = buildDashboard(data.tried, data.catalog, data.baby);
  const insights = buildInsights(data.baby, data.tried, data.catalog, data.allergenStates);
  return NextResponse.json({
    baby: data.baby,
    tried: data.tried,
    dashboard,
    insights,
    allergenStates: data.allergenStates,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const childId = Number(body.childId);
  const foodName = String(body.foodName ?? "").trim();
  if (!Number.isFinite(childId) || !foodName) {
    return NextResponse.json({ error: "childId and foodName required" }, { status: 400 });
  }

  // resolve key: explicit > catalog match > custom
  let foodKey = String(body.foodKey ?? "").trim();
  if (!foodKey) {
    const allF = await db.select({ name: foods.name, slug: foods.slug }).from(foods);
    const allR = await db.select({ title: recipes.title, slug: recipes.slug }).from(recipes);
    const hitF = allF.find((x) => norm(x.name) === norm(foodName));
    const hitR = allR.find((x) => norm(x.title) === norm(foodName));
    foodKey = hitF ? `food:${hitF.slug}` : hitR ? `recipe:${hitR.slug}` : customKey(foodName);
  }

  const values = {
    childId,
    foodKey,
    foodName,
    foodEmoji: String(body.foodEmoji ?? "🍽️"),
    category: String(body.category ?? ""),
    isIndian: Boolean(body.isIndian),
    status: String(body.status ?? ""),
    symptoms: String(body.symptoms ?? ""),
    textures: String(body.textures ?? ""),
    notes: String(body.notes ?? ""),
    exposuresManual: Number(body.exposuresManual ?? 0) || 0,
    dateIntroduced: body.dateIntroduced ? String(body.dateIntroduced) : null,
    updatedAt: new Date(),
  };

  const [row] = await db
    .insert(foodTracking)
    .values(values)
    .onConflictDoUpdate({
      target: [foodTracking.childId, foodTracking.foodKey],
      set: { ...values },
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const childId = Number(req.nextUrl.searchParams.get("childId"));
  const foodKey = req.nextUrl.searchParams.get("foodKey") ?? "";
  if (!Number.isFinite(childId) || !foodKey) {
    return NextResponse.json({ error: "childId and foodKey required" }, { status: 400 });
  }
  await db
    .delete(foodTracking)
    .where(and(eq(foodTracking.childId, childId), eq(foodTracking.foodKey, foodKey)));
  return NextResponse.json({ ok: true });
}
