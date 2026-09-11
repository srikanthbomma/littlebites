"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Baby,
  Check,
  ChevronRight,
  Clock,
  Flame,
  NotebookPen,
  Sparkles,
  Apple,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ChildPicker, type ChildItem } from "@/components/ChildPicker";
import { LogMealSheet } from "@/components/LogMealSheet";
import { getActiveChildId, useActiveChildId } from "@/lib/child-store";

interface Recipe {
  id: number;
  title: string;
  slug: string;
  region: string;
  category: string;
  emoji: string;
  description: string;
  ageMinMonths: number;
  ageText: string;
  prepMinutes: number;
  spiceLevel: string;
  ingredients: string[];
  steps: string[];
  texture69: string;
  texture912: string;
  texture12Plus: string;
  allergens: string;
  nutritionBenefits: string;
  isFirstFood: boolean;
  baseFoodSlugs: string[];
  tips: string;
  country: string;
  cuisine: string;
  isAdapted: boolean;
  adaptedNote: string;
}

interface Related {
  id: number;
  title: string;
  slug: string;
  country: string;
  cuisine: string;
  region: string;
  category: string;
  emoji: string;
  ageText: string;
  prepMinutes: number;
  allergens: string;
  isFirstFood: boolean;
  description: string;
}

const AGES = [
  { key: "texture69", label: "6–9 mo", icon: "👶" },
  { key: "texture912", label: "9–12 mo", icon: "🧒" },
  { key: "texture12Plus", label: "12+ mo", icon: "👧" },
] as const;

export default function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [activeId, setActiveId] = useActiveChildId();
  const [kids, setKids] = useState<ChildItem[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [related, setRelated] = useState<Related[]>([]);
  const [ageKey, setAgeKey] = useState<(typeof AGES)[number]["key"]>("texture69");
  const [logOpen, setLogOpen] = useState(false);
  const [loggedTick, setLoggedTick] = useState(false);
  const [triedNames, setTriedNames] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/recipes/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { recipe: Recipe; related: Related[] } | null) => {
        if (d) {
          setRecipe(d.recipe);
          setRelated(d.related);
        }
      })
      .catch(() => {});
    fetch("/api/children")
      .then((r) => r.json())
      .then((rows: ChildItem[]) => {
        setKids(rows);
        const stored = getActiveChildId();
        if (!stored && rows.length > 0) setActiveId(rows[0].id);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!activeId) {
      setTriedNames([]);
      return;
    }
    fetch(`/api/tracking?childId=${activeId}`)
      .then((r) => r.json())
      .then((d) => setTriedNames((d.tried ?? []).map((t: { name: string }) => t.name.toLowerCase())))
      .catch(() => {});
  }, [activeId]);

  const ingredientStatus = useMemo(() => {
    if (!recipe) return [];
    return recipe.ingredients.map((ing) => {
      const low = ing.toLowerCase();
      const tried = triedNames.some((n) => n.length >= 3 && low.includes(n));
      return { ing, tried };
    });
  }, [recipe, triedNames]);

  if (!recipe) {
    return (
      <AppShell>
        <div className="flex flex-col items-center px-4 pt-24 text-center">
          <p className="animate-float-soft text-6xl">🍛</p>
          <p className="mt-3 text-sm font-extrabold text-cocoa-500">Loading recipe…</p>
        </div>
      </AppShell>
    );
  }

  const hasAllergens = recipe.allergens && !/^none/i.test(recipe.allergens.trim());

  return (
    <AppShell>
      <div className="bg-leaf-700 px-4 pt-6 pb-20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-black tracking-widest text-white uppercase">
            {recipe.country} · {recipe.region}
          </span>
        </div>
        <div className="mt-2 text-center">
          <p className="animate-float-soft text-[76px] leading-none">{recipe.emoji}</p>
          <h1 className="mt-3 px-2 text-[24px] leading-tight font-black text-white">{recipe.title}</h1>
          <p className="mt-0.5 text-xs font-extrabold tracking-widest text-white/60 uppercase">
            {recipe.category} · {recipe.cuisine} cuisine
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold text-white">
              <Baby size={13} /> From {recipe.ageText}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold text-white">
              <Clock size={13} /> {recipe.prepMinutes} min
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold text-white">
              <Flame size={13} /> Spice: {recipe.spiceLevel}
            </span>
            {recipe.isFirstFood && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sun-400 px-3 py-1.5 text-xs font-extrabold text-cocoa-900">
                <Sparkles size={13} /> Great first food
              </span>
            )}
            {hasAllergens && (
              <span className="inline-flex items-center gap-1 rounded-full bg-coral-500 px-3 py-1.5 text-xs font-extrabold text-white">
                <AlertTriangle size={13} /> {recipe.allergens.split(";")[0].split("(")[0].trim()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="card-shadow -mt-12 rounded-3xl bg-white p-4">
          <p className="text-[15px] leading-relaxed font-semibold text-cocoa-700">{recipe.description}</p>
          {recipe.isAdapted && recipe.adaptedNote && (
            <p className="mt-3 flex items-start gap-2 rounded-2xl bg-leaf-50 p-3 text-[13px] font-bold text-leaf-700">
              <span className="text-base">🔄</span>
              {recipe.adaptedNote}
            </p>
          )}
          {hasAllergens && (
            <p className="mt-3 flex items-start gap-2 rounded-2xl bg-coral-50 p-3 text-[13px] font-bold text-coral-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              Allergens: {recipe.allergens}. If new to baby, serve a tiny amount in the morning and watch for 2 hours.
            </p>
          )}
          <div className="mt-3">
            <ChildPicker children={kids} activeId={activeId} onSelect={setActiveId} compact />
          </div>
          <button
            onClick={() => activeId && setLogOpen(true)}
            disabled={!activeId}
            className="pressable mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-coral-500 py-3 text-sm font-black text-white disabled:opacity-40"
          >
            {loggedTick ? <Check size={17} /> : <NotebookPen size={17} />}
            {loggedTick ? "Logged to diary!" : "I made this — log it"}
          </button>
          {!activeId && (
            <p className="mt-2 text-center text-xs font-bold text-cocoa-500">
              <Link href="/kids" className="text-coral-600 underline">Add a child</Link> to log recipes
            </p>
          )}
        </div>

        {/* Ingredients */}
        <h2 className="mt-6 flex items-center gap-1.5 text-base font-black text-cocoa-900">
          <ListChecks size={18} className="text-leaf-600" /> Ingredients
        </h2>
        {activeId && (
          <p className="mt-0.5 text-xs font-bold text-cocoa-500">
            ✓ = already tried by your baby · ○ = new ingredient
          </p>
        )}
        <div className="card-shadow mt-2 rounded-3xl bg-white p-2">
          {ingredientStatus.map((it, i) => (
            <div key={i} className="flex items-center gap-2.5 border-b border-cream-100 px-2.5 py-2.5 last:border-0">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                  activeId && it.tried ? "bg-leaf-100 text-leaf-700" : "bg-cream-100 text-cocoa-400"
                }`}
              >
                {activeId && it.tried ? <Check size={13} /> : "○"}
              </span>
              <span className="text-[14px] font-semibold text-cocoa-700">{it.ing}</span>
            </div>
          ))}
        </div>

        {/* Steps */}
        <h2 className="mt-6 text-base font-black text-cocoa-900">👩‍🍳 Preparation</h2>
        <div className="mt-2 space-y-2">
          {recipe.steps.map((s, i) => (
            <div key={i} className="card-shadow flex gap-3 rounded-3xl bg-white p-3.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral-500 text-[13px] font-black text-white">
                {i + 1}
              </span>
              <p className="text-[14px] leading-relaxed font-semibold text-cocoa-700">{s}</p>
            </div>
          ))}
        </div>

        {/* Texture tabs */}
        <h2 className="mt-6 text-base font-black text-cocoa-900">🥄 Texture by age</h2>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {AGES.map((a) => (
            <button
              key={a.key}
              onClick={() => setAgeKey(a.key)}
              className={`pressable rounded-2xl py-2.5 text-center ${ageKey === a.key ? "bg-cocoa-900 text-white" : "card-shadow bg-white text-cocoa-900"}`}
            >
              <span className="block text-lg">{a.icon}</span>
              <span className="block text-xs font-black">{a.label}</span>
            </button>
          ))}
        </div>
        <div className="card-shadow animate-pop-in mt-2.5 rounded-3xl bg-white p-4" key={ageKey}>
          <p className="text-[15px] leading-relaxed font-semibold text-cocoa-700">{recipe[ageKey]}</p>
        </div>

        <div className="card-shadow mt-3 rounded-3xl bg-leaf-50 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-black text-leaf-700">
            <Apple size={16} /> Nutritional benefits
          </h3>
          <p className="mt-1.5 text-[14px] leading-relaxed font-semibold text-cocoa-700">{recipe.nutritionBenefits}</p>
        </div>

        <div className="card-shadow mt-3 rounded-3xl bg-white p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-black text-cocoa-900">
            <Lightbulb size={16} className="text-sun-500" /> Tips
          </h3>
          <p className="mt-1.5 text-[14px] leading-relaxed font-semibold text-cocoa-700">{recipe.tips}</p>
        </div>

        <Link
          href="/ai"
          className="pressable mt-3 flex items-center gap-3 rounded-3xl bg-cocoa-900 p-4 text-white"
        >
          <span className="text-2xl">✨</span>
          <span className="flex-1 text-[13px] font-extrabold">
            Ask the AI Guide if {recipe.title.split("(")[0].trim()} suits your baby right now
          </span>
          <ChevronRight size={18} />
        </Link>

        {related.length > 0 && (
          <>
            <h2 className="mt-6 text-base font-black text-cocoa-900">More {recipe.category.toLowerCase()} recipes</h2>
            <div className="mt-2.5 space-y-2.5 pb-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/recipes/${r.slug}`}
                  className="pressable card-shadow flex items-center gap-3 rounded-3xl bg-white p-3"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-[26px]">
                    {r.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold text-cocoa-900">{r.title}</span>
                    <span className="block text-xs font-bold text-cocoa-500">
                      {r.cuisine} · {r.country} · From {r.ageText}
                    </span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-cocoa-400" />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <LogMealSheet
        open={logOpen}
        onClose={() => setLogOpen(false)}
        childId={activeId}
        children={kids}
        onChildChange={setActiveId}
        presetFood={recipe ? { id: 0, name: recipe.title, emoji: recipe.emoji } : null}
        onSaved={() => {
          setLoggedTick(true);
          setTimeout(() => setLoggedTick(false), 2500);
        }}
      />
    </AppShell>
  );
}
