import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  date,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";

export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  birthdate: date("birthdate"),
  avatarEmoji: text("avatar_emoji").default("👶"),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const foods = pgTable(
  "foods",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    category: text("category").notNull(),
    emoji: text("emoji").notNull().default("🍽️"),
    description: text("description").notNull().default(""),
    introAgeText: text("intro_age_text").notNull().default("6 months"),
    introAgeMonths: integer("intro_age_months").notNull().default(6),
    isAllergen: boolean("is_allergen").notNull().default(false),
    allergenName: text("allergen_name").default(""),
    containsAllergens: text("contains_allergens").default(""),
    chokingRisk: text("choking_risk").notNull().default("Low"),
    nutrition: text("nutrition").notNull().default(""),
    benefits: text("benefits").notNull().default(""),
    howToChoose: text("how_to_choose").notNull().default(""),
    serve69: text("serve_6_9").notNull().default(""),
    serve912: text("serve_9_12").notNull().default(""),
    serve12Plus: text("serve_12_plus").notNull().default(""),
    storage: text("storage").notNull().default(""),
    isIronRich: boolean("is_iron_rich").notNull().default(false),
    isProteinRich: boolean("is_protein_rich").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [uniqueIndex("foods_slug_idx").on(t.slug)]
);

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    childId: integer("child_id"),
    foodId: integer("food_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [uniqueIndex("fav_child_food_idx").on(t.childId, t.foodId)]
);

export const mealLogs = pgTable("meal_logs", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  foodId: integer("food_id"),
  foodName: text("food_name").notNull(),
  foodEmoji: text("food_emoji").default("🍽️"),
  mealType: text("meal_type").notNull().default("Lunch"),
  reaction: text("reaction").notNull().default("Liked"),
  notes: text("notes").default(""),
  loggedAt: timestamp("logged_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const allergenProgress = pgTable(
  "allergen_progress",
  {
    id: serial("id").primaryKey(),
    childId: integer("child_id").notNull(),
    allergen: text("allergen").notNull(),
    status: text("status").notNull().default("Not started"),
    exposures: integer("exposures").notNull().default(0),
    firstTriedAt: timestamp("first_tried_at"),
    lastExposureAt: timestamp("last_exposure_at"),
    reactionNotes: text("reaction_notes").default(""),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [uniqueIndex("allergen_child_idx").on(t.childId, t.allergen)]
);

export const guides = pgTable(
  "guides",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    category: text("category").notNull().default("Getting Started"),
    readMinutes: integer("read_minutes").notNull().default(5),
    emoji: text("emoji").notNull().default("📚"),
    imageUrl: text("image_url").default(""),
    content: text("content").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [uniqueIndex("guides_slug_idx").on(t.slug)]
);

export const recipes = pgTable(
  "recipes",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    country: text("country").notNull().default("India"),
    cuisine: text("cuisine").notNull().default("Indian"),
    region: text("region").notNull().default("Pan-Indian"),
    isAdapted: boolean("is_adapted").notNull().default(false),
    adaptedNote: text("adapted_note").notNull().default(""),
    category: text("category").notNull().default("Mains"),
    foodGroup: text("food_group").notNull().default("Grains"),
    emoji: text("emoji").notNull().default("🍛"),
    description: text("description").notNull().default(""),
    ageMinMonths: integer("age_min_months").notNull().default(6),
    ageText: text("age_text").notNull().default("6 months+"),
    prepMinutes: integer("prep_minutes").notNull().default(20),
    spiceLevel: text("spice_level").notNull().default("None"),
    ingredients: jsonb("ingredients").$type<string[]>().notNull().default([]),
    steps: jsonb("steps").$type<string[]>().notNull().default([]),
    texture69: text("texture_6_9").notNull().default(""),
    texture912: text("texture_9_12").notNull().default(""),
    texture12Plus: text("texture_12_plus").notNull().default(""),
    allergens: text("allergens").notNull().default(""),
    nutritionBenefits: text("nutrition_benefits").notNull().default(""),
    isFirstFood: boolean("is_first_food").notNull().default(false),
    baseFoodSlugs: jsonb("base_food_slugs").$type<string[]>().notNull().default([]),
    tips: text("tips").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [uniqueIndex("recipes_slug_idx").on(t.slug)]
);

export const foodTracking = pgTable(
  "food_tracking",
  {
    id: serial("id").primaryKey(),
    childId: integer("child_id").notNull(),
    foodKey: text("food_key").notNull(),
    foodName: text("food_name").notNull(),
    foodEmoji: text("food_emoji").notNull().default("🍽️"),
    category: text("category").notNull().default(""),
    isIndian: boolean("is_indian").notNull().default(false),
    status: text("status").notNull().default(""),
    symptoms: text("symptoms").notNull().default(""),
    textures: text("textures").notNull().default(""),
    notes: text("notes").notNull().default(""),
    exposuresManual: integer("exposures_manual").notNull().default(0),
    dateIntroduced: date("date_introduced"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [uniqueIndex("tracking_child_key_idx").on(t.childId, t.foodKey)]
);

export type Child = typeof children.$inferSelect;
export type Food = typeof foods.$inferSelect;
export type MealLog = typeof mealLogs.$inferSelect;
export type AllergenRow = typeof allergenProgress.$inferSelect;
export type Guide = typeof guides.$inferSelect;
export type Recipe = typeof recipes.$inferSelect;
export type FoodTracking = typeof foodTracking.$inferSelect;
