import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { foods, guides, recipes } from "./schema";
import { seedFoods, seedFoods2 } from "./seed-foods";
import { seedFoodsIndian } from "./seed-foods-indian";
import { seedGuides } from "./seed-guides";
import { seedRecipes, type SeedRecipe } from "./seed-recipes";
import { seedRecipesGlobal } from "./seed-recipes-global";

function cuisineForIndianRegion(region: string): string {
  if (["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh"].includes(region)) return "South Indian";
  if (["North Indian", "Rajasthan"].includes(region)) return "North Indian";
  return "Indian";
}

function withDefaults(r: SeedRecipe) {
  return {
    ...r,
    country: r.country ?? "India",
    cuisine: r.cuisine ?? cuisineForIndianRegion(r.region),
    isAdapted: r.isAdapted ?? false,
    adaptedNote: r.adaptedNote ?? "",
  };
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const allFoods = [...seedFoods, ...seedFoods2, ...seedFoodsIndian];
  console.log(`Seeding ${allFoods.length} foods...`);
  for (const f of allFoods) {
    await db
      .insert(foods)
      .values(f)
      .onConflictDoUpdate({
        target: foods.slug,
        set: { ...f },
      });
  }
  console.log("Foods done.");

  console.log(`Seeding ${seedGuides.length} guides...`);
  for (const g of seedGuides) {
    await db
      .insert(guides)
      .values(g)
      .onConflictDoUpdate({
        target: guides.slug,
        set: { ...g },
      });
  }
  console.log("Guides done.");

  const allRecipes = [...seedRecipes, ...seedRecipesGlobal];
  console.log(`Seeding ${allRecipes.length} recipes...`);
  for (const r of allRecipes) {
    const v = withDefaults(r);
    await db
      .insert(recipes)
      .values(v)
      .onConflictDoUpdate({
        target: recipes.slug,
        set: { ...v },
      });
  }
  console.log("Recipes done.");

  await pool.end();
  console.log("Seed complete!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
