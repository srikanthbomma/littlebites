// Server-side aggregation: meal logs + manual tracking + catalog metadata
// into unified TriedEntry[] + Assessable catalog for the AI engine & tracker UI.
import { db } from "@/db";
import { allergenProgress, children, foods, foodTracking, mealLogs, recipes } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  Assessable,
  AllergenState,
  BabyCtx,
  TriedEntry,
  groupsForFood,
  groupsForRecipe,
  norm,
} from "./ai-engine";
import { BIG9 } from "./big9";

export function ageMonthsOf(birthdate: string | null): number | null {
  if (!birthdate) return null;
  const b = new Date(birthdate + "T12:00:00");
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let m = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) m -= 1;
  return Math.max(0, m);
}

function customKey(name: string): string {
  return "custom:" + norm(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

const STATUS_ORDER: Record<string, number> = { liked: 0, unsure: 1, disliked: 2 };

export interface ChildFoodData {
  baby: BabyCtx;
  tried: TriedEntry[];
  catalog: Assessable[];
  recipes: Assessable[];
  allergenStates: AllergenState[];
}

export async function getChildFoodData(childId: number): Promise<ChildFoodData> {
  const [kid] = await db.select().from(children).where(eq(children.id, childId)).limit(1);
  const baby: BabyCtx = {
    name: kid?.name ?? "Baby",
    ageMonths: ageMonthsOf(kid?.birthdate ?? null),
  };

  const [allFoods, allRecipes, logs, manual, allergens] = await Promise.all([
    db.select().from(foods),
    db.select().from(recipes),
    db.select().from(mealLogs).where(eq(mealLogs.childId, childId)),
    db.select().from(foodTracking).where(eq(foodTracking.childId, childId)),
    db.select().from(allergenProgress).where(eq(allergenProgress.childId, childId)),
  ]);

  const foodCatalog: Assessable[] = allFoods.map((f) => ({
    kind: "food",
    key: `food:${f.slug}`,
    name: f.name,
    slug: f.slug,
    emoji: f.emoji,
    groups: groupsForFood({ slug: f.slug, category: f.category, isAllergen: f.isAllergen }),
    ageMin: f.introAgeMonths,
    ageText: f.introAgeText,
    isAllergen: f.isAllergen,
    allergenName: f.allergenName ?? "",
    allergensText: f.containsAllergens ?? "",
    chokingRisk: f.chokingRisk,
    isIronRich: f.isIronRich,
    isFirstFood: ["banana", "avocado", "sweet-potato", "oatmeal", "rice", "lentils", "moong-dal", "ragi", "toor-dal", "quinoa", "pear"].includes(f.slug),
    description: f.description,
    prep69: f.serve69,
    prep912: f.serve912,
    prep12: f.serve12Plus,
    nutrition: `${f.nutrition}. ${f.benefits}`,
    href: `/foods/${f.slug}`,
  }));

  const recipeCatalog: Assessable[] = allRecipes.map((r) => ({
    kind: "recipe",
    key: `recipe:${r.slug}`,
    name: r.title,
    slug: r.slug,
    emoji: r.emoji,
    groups: groupsForRecipe({ foodGroup: r.foodGroup, allergens: r.allergens, country: r.country }),
    ageMin: r.ageMinMonths,
    ageText: r.ageText,
    isAllergen: false,
    allergenName: "",
    allergensText: r.allergens,
    chokingRisk: "Low (texture-prepped)",
    isIronRich: ["Legumes", "Meat", "Eggs", "Millets"].includes(r.foodGroup),
    isFirstFood: r.isFirstFood,
    description: r.description,
    prep69: r.texture69,
    prep912: r.texture912,
    prep12: r.texture12Plus,
    nutrition: r.nutritionBenefits,
    href: `/recipes/${r.slug}`,
    country: r.country,
    cuisine: r.cuisine,
    isAdapted: r.isAdapted,
    adaptedNote: r.adaptedNote,
  }));

  const catalog = [...foodCatalog, ...recipeCatalog];
  const byName = new Map<string, Assessable>();
  for (const c of catalog) byName.set(norm(c.name), c);

  // group logs by normalized food name
  const logGroups = new Map<string, typeof logs>();
  for (const l of logs) {
    const n = norm(l.foodName);
    if (!logGroups.has(n)) logGroups.set(n, []);
    logGroups.get(n)!.push(l);
  }

  const reactionToStatus = (r: string): "liked" | "disliked" | "unsure" => {
    if (r === "Loved" || r === "Liked") return "liked";
    if (r === "Disliked" || r === "Refused") return "disliked";
    return "unsure";
  };

  const manualByKey = new Map(manual.map((m) => [m.foodKey, m]));
  const tried: TriedEntry[] = [];

  // entries from logs
  for (const [name, rows] of logGroups) {
    const match = byName.get(name);
    const key = match ? match.key : customKey(name);
    const m = manualByKey.get(key);
    const sorted = [...rows].sort((a, b) => +new Date(a.loggedAt ?? 0) - +new Date(b.loggedAt ?? 0));
    const last = sorted[sorted.length - 1];
    const counts = { liked: 0, disliked: 0, unsure: 0 };
    for (const r of rows) counts[reactionToStatus(r.reaction)]++;
    const derived = (Object.keys(counts) as ("liked" | "disliked" | "unsure")[]).sort(
      (a, b) => counts[b] - counts[a] || STATUS_ORDER[a] - STATUS_ORDER[b]
    )[0];
    const status = (m?.status as TriedEntry["status"]) || derived;
    const exposures = rows.length + (m?.exposuresManual ?? 0);
    const loved = rows.some((r) => r.reaction === "Loved");
    const hasReaction = rows.some((r) => r.reaction === "Rash / Concern") || !!(m?.symptoms?.trim());
    const symptoms = [
      m?.symptoms?.trim() ? m.symptoms.trim() : "",
      ...rows.filter((r) => r.reaction === "Rash / Concern" && r.notes?.trim()).map((r) => r.notes!.trim()),
    ]
      .filter(Boolean)
      .join("; ");
    tried.push({
      key,
      name: match?.name ?? rows[0].foodName,
      emoji: match?.emoji ?? m?.foodEmoji ?? rows[0].foodEmoji ?? "🍽️",
      groups: match?.groups ?? [m?.category || "Spices & Fats", ...(m?.isIndian ? ["Indian"] : [])],
      isAllergen: match?.isAllergen ?? false,
      allergenName: match?.allergenName ?? "",
      isIronRich: match?.isIronRich ?? false,
      status,
      exposures,
      logCount: rows.length,
      hasReaction,
      symptoms,
      textures: (m?.textures ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      notes: [m?.notes?.trim() ?? "", ...rows.map((r) => r.notes?.trim() ?? "").filter(Boolean)].filter(Boolean).join(" • ").slice(0, 500),
      firstTried: m?.dateIntroduced ?? (sorted[0].loggedAt ? new Date(sorted[0].loggedAt).toISOString() : null),
      lastTried: last.loggedAt ? new Date(last.loggedAt).toISOString() : null,
      loved,
      favorite: status === "liked" && (loved || exposures >= 3),
      kind: match?.kind === "recipe" ? "recipe" : match?.kind === "food" ? "food" : "custom",
      slug: match?.slug,
      href: match?.href ?? "/foods",
    });
    manualByKey.delete(key);
  }

  // manual-only entries (added via tracker without diary logs)
  for (const m of manualByKey.values()) {
    const match = byName.get(norm(m.foodName));
    const key = m.foodKey;
    tried.push({
      key,
      name: match?.name ?? m.foodName,
      emoji: match?.emoji ?? m.foodEmoji ?? "🍽️",
      groups: match?.groups ?? [m.category || "Spices & Fats", ...(m.isIndian ? ["Indian"] : [])],
      isAllergen: match?.isAllergen ?? false,
      allergenName: match?.allergenName ?? "",
      isIronRich: match?.isIronRich ?? false,
      status: (m.status as TriedEntry["status"]) || null,
      exposures: m.exposuresManual ?? 0,
      logCount: 0,
      hasReaction: !!m.symptoms?.trim(),
      symptoms: m.symptoms ?? "",
      textures: (m.textures ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      notes: m.notes ?? "",
      firstTried: m.dateIntroduced ?? null,
      lastTried: m.dateIntroduced ?? null,
      loved: false,
      favorite: m.status === "liked" && (m.exposuresManual ?? 0) >= 3,
      kind: match?.kind === "recipe" ? "recipe" : match?.kind === "food" ? "food" : "custom",
      slug: match?.slug,
      href: match?.href ?? "/foods",
    });
  }

  tried.sort((a, b) => (b.lastTried ?? "").localeCompare(a.lastTried ?? ""));

  const byAllergen = new Map(allergens.map((a) => [a.allergen, a]));
  const allergenStates: AllergenState[] = BIG9.map((b) => ({
    name: b.name,
    emoji: b.emoji,
    status: byAllergen.get(b.name)?.status ?? "Not started",
    exposures: byAllergen.get(b.name)?.exposures ?? 0,
  }));

  return { baby, tried, catalog, recipes: recipeCatalog, allergenStates };
}

export { customKey };
