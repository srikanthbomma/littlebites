import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Load .env.local first (Next.js convention), fall back to .env
if (existsSync(resolve(process.cwd(), ".env.local"))) {
  config({ path: resolve(process.cwd(), ".env.local") });
} else {
  config({ path: resolve(process.cwd(), ".env") });
}

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

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS "children" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "birthdate" date,
  "avatar_emoji" text DEFAULT '👶',
  "notes" text DEFAULT '',
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "foods" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "category" text NOT NULL,
  "emoji" text NOT NULL DEFAULT '🍽️',
  "description" text NOT NULL DEFAULT '',
  "intro_age_text" text NOT NULL DEFAULT '6 months',
  "intro_age_months" integer NOT NULL DEFAULT 6,
  "is_allergen" boolean NOT NULL DEFAULT false,
  "allergen_name" text DEFAULT '',
  "contains_allergens" text DEFAULT '',
  "choking_risk" text NOT NULL DEFAULT 'Low',
  "nutrition" text NOT NULL DEFAULT '',
  "benefits" text NOT NULL DEFAULT '',
  "how_to_choose" text NOT NULL DEFAULT '',
  "serve_6_9" text NOT NULL DEFAULT '',
  "serve_9_12" text NOT NULL DEFAULT '',
  "serve_12_plus" text NOT NULL DEFAULT '',
  "storage" text NOT NULL DEFAULT '',
  "is_iron_rich" boolean NOT NULL DEFAULT false,
  "is_protein_rich" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "favorites" (
  "id" serial PRIMARY KEY,
  "child_id" integer,
  "food_id" integer NOT NULL,
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "fav_child_food_idx" UNIQUE ("child_id", "food_id")
);

CREATE TABLE IF NOT EXISTS "meal_logs" (
  "id" serial PRIMARY KEY,
  "child_id" integer NOT NULL,
  "food_id" integer,
  "food_name" text NOT NULL,
  "food_emoji" text DEFAULT '🍽️',
  "meal_type" text NOT NULL DEFAULT 'Lunch',
  "reaction" text NOT NULL DEFAULT 'Liked',
  "notes" text DEFAULT '',
  "logged_at" timestamp DEFAULT now(),
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "allergen_progress" (
  "id" serial PRIMARY KEY,
  "child_id" integer NOT NULL,
  "allergen" text NOT NULL,
  "status" text NOT NULL DEFAULT 'Not started',
  "exposures" integer NOT NULL DEFAULT 0,
  "first_tried_at" timestamp,
  "last_exposure_at" timestamp,
  "reaction_notes" text DEFAULT '',
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "allergen_child_idx" UNIQUE ("child_id", "allergen")
);

CREATE TABLE IF NOT EXISTS "guides" (
  "id" serial PRIMARY KEY,
  "title" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "excerpt" text NOT NULL DEFAULT '',
  "category" text NOT NULL DEFAULT 'Getting Started',
  "read_minutes" integer NOT NULL DEFAULT 5,
  "emoji" text NOT NULL DEFAULT '📚',
  "image_url" text DEFAULT '',
  "content" text NOT NULL DEFAULT '',
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "recipes" (
  "id" serial PRIMARY KEY,
  "title" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "country" text NOT NULL DEFAULT 'India',
  "cuisine" text NOT NULL DEFAULT 'Indian',
  "region" text NOT NULL DEFAULT 'Pan-Indian',
  "is_adapted" boolean NOT NULL DEFAULT false,
  "adapted_note" text NOT NULL DEFAULT '',
  "category" text NOT NULL DEFAULT 'Mains',
  "food_group" text NOT NULL DEFAULT 'Grains',
  "emoji" text NOT NULL DEFAULT '🍛',
  "description" text NOT NULL DEFAULT '',
  "age_min_months" integer NOT NULL DEFAULT 6,
  "age_text" text NOT NULL DEFAULT '6 months+',
  "prep_minutes" integer NOT NULL DEFAULT 20,
  "spice_level" text NOT NULL DEFAULT 'None',
  "ingredients" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "steps" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "texture_6_9" text NOT NULL DEFAULT '',
  "texture_9_12" text NOT NULL DEFAULT '',
  "texture_12_plus" text NOT NULL DEFAULT '',
  "allergens" text NOT NULL DEFAULT '',
  "nutrition_benefits" text NOT NULL DEFAULT '',
  "is_first_food" boolean NOT NULL DEFAULT false,
  "base_food_slugs" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "tips" text NOT NULL DEFAULT '',
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "food_tracking" (
  "id" serial PRIMARY KEY,
  "child_id" integer NOT NULL,
  "food_key" text NOT NULL,
  "food_name" text NOT NULL,
  "food_emoji" text NOT NULL DEFAULT '🍽️',
  "category" text NOT NULL DEFAULT '',
  "is_indian" boolean NOT NULL DEFAULT false,
  "status" text NOT NULL DEFAULT '',
  "symptoms" text NOT NULL DEFAULT '',
  "textures" text NOT NULL DEFAULT '',
  "notes" text NOT NULL DEFAULT '',
  "exposures_manual" integer NOT NULL DEFAULT 0,
  "date_introduced" date,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "tracking_child_key_idx" UNIQUE ("child_id", "food_key")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'country') THEN
    ALTER TABLE "recipes" ADD COLUMN "country" text NOT NULL DEFAULT 'India';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'cuisine') THEN
    ALTER TABLE "recipes" ADD COLUMN "cuisine" text NOT NULL DEFAULT 'Indian';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'is_adapted') THEN
    ALTER TABLE "recipes" ADD COLUMN "is_adapted" boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'adapted_note') THEN
    ALTER TABLE "recipes" ADD COLUMN "adapted_note" text NOT NULL DEFAULT '';
  END IF;
END $$;
`;

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL environment variable is missing! Please set it in .env or .env.local"
    );
  }

  const hostDisplay = dbUrl.split("@")[1]?.split("/")[0] || dbUrl;
  console.log(`Connecting to database at: ${hostDisplay}`);

  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzle(pool);

  console.log("Checking and creating database tables...");
  await pool.query(INIT_SQL);

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
  console.log("🎉 Seed complete! All tables and data are ready.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
