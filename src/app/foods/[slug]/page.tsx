"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Flame,
  Heart,
  NotebookPen,
  Sparkles,
  Apple,
  Package,
  Lightbulb,
  Baby,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ChildPicker, type ChildItem } from "@/components/ChildPicker";
import { FoodCard, chokingColor, type FoodListItem } from "@/components/FoodCard";
import { LogMealSheet } from "@/components/LogMealSheet";
import { getActiveChildId, useActiveChildId } from "@/lib/child-store";

interface FoodDetail {
  id: number;
  name: string;
  slug: string;
  category: string;
  emoji: string;
  description: string;
  introAgeText: string;
  introAgeMonths: number;
  isAllergen: boolean;
  allergenName: string;
  containsAllergens: string;
  chokingRisk: string;
  nutrition: string;
  benefits: string;
  howToChoose: string;
  serve69: string;
  serve912: string;
  serve12Plus: string;
  storage: string;
  isIronRich: boolean;
  isProteinRich: boolean;
}

const AGES = [
  { key: "serve69", label: "6–9 mo", icon: "👶" },
  { key: "serve912", label: "9–12 mo", icon: "🧒" },
  { key: "serve12Plus", label: "12+ mo", icon: "👧" },
] as const;

export default function FoodDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [activeId, setActiveId] = useActiveChildId();
  const [kids, setKids] = useState<ChildItem[]>([]);
  const [food, setFood] = useState<FoodDetail | null>(null);
  const [related, setRelated] = useState<FoodListItem[]>([]);
  const [ageKey, setAgeKey] = useState<(typeof AGES)[number]["key"]>("serve69");
  const [isFav, setIsFav] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [loggedTick, setLoggedTick] = useState(false);

  useEffect(() => {
    fetch(`/api/foods/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((f: FoodDetail | null) => {
        setFood(f);
        if (f) {
          fetch(`/api/foods?category=${encodeURIComponent(f.category)}`)
            .then((r) => r.json())
            .then((rows: FoodListItem[]) =>
              setRelated(rows.filter((x) => x.slug !== f.slug).slice(0, 4))
            )
            .catch(() => {});
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
    if (!activeId || !food) {
      setIsFav(false);
      return;
    }
    fetch(`/api/favorites?childId=${activeId}`)
      .then((r) => r.json())
      .then((rows: { foodId: number }[]) => setIsFav(rows.some((x) => x.foodId === food.id)))
      .catch(() => {});
  }, [activeId, food]);

  async function toggleFav() {
    if (!activeId || !food) return;
    if (isFav) {
      await fetch(`/api/favorites?childId=${activeId}&foodId=${food.id}`, { method: "DELETE" });
      setIsFav(false);
    } else {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: activeId, foodId: food.id }),
      });
      setIsFav(true);
    }
  }

  if (!food) {
    return (
      <AppShell>
        <div className="flex flex-col items-center px-4 pt-24 text-center">
          <p className="animate-float-soft text-6xl">🍽️</p>
          <p className="mt-3 text-sm font-extrabold text-cocoa-500">Loading food…</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="bg-cocoa-900 px-4 pt-6 pb-20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={toggleFav}
            aria-label="Toggle favorite"
            className={`pressable flex h-10 w-10 items-center justify-center rounded-full ${
              isFav ? "bg-coral-500 text-white" : "bg-white/10 text-white"
            }`}
          >
            <Heart size={20} fill={isFav ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="mt-2 text-center">
          <p className="animate-float-soft text-[76px] leading-none">{food.emoji}</p>
          <h1 className="mt-3 text-[26px] font-black text-white">{food.name}</h1>
          <p className="mt-0.5 text-xs font-extrabold tracking-widest text-white/60 uppercase">
            {food.category}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold text-white">
              <Baby size={13} /> From {food.introAgeText}
            </span>
            {food.isAllergen && (
              <span className="inline-flex items-center gap-1 rounded-full bg-coral-500 px-3 py-1.5 text-xs font-extrabold text-white">
                <AlertTriangle size={13} /> {food.allergenName || "Allergen"}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold ${chokingColor(food.chokingRisk)}`}
            >
              <Flame size={13} /> {food.chokingRisk} choking risk
            </span>
            {food.isIronRich && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sun-400 px-3 py-1.5 text-xs font-extrabold text-cocoa-900">
                <Sparkles size={13} /> Iron-rich
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="card-shadow -mt-12 rounded-3xl bg-white p-4">
          <p className="text-[15px] leading-relaxed font-semibold text-cocoa-700">{food.description}</p>
          {food.containsAllergens && (
            <p className="mt-3 flex items-start gap-2 rounded-2xl bg-coral-50 p-3 text-[13px] font-bold text-coral-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              Contains: {food.containsAllergens}. Introduce in the morning, start tiny, watch for 2 hours.
            </p>
          )}
          <div className="mt-3">
            <ChildPicker children={kids} activeId={activeId} onSelect={setActiveId} compact />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => activeId && setLogOpen(true)}
              disabled={!activeId}
              className="pressable flex items-center justify-center gap-1.5 rounded-2xl bg-coral-500 py-3 text-sm font-black text-white disabled:opacity-40"
            >
              {loggedTick ? <Check size={17} /> : <NotebookPen size={17} />}
              {loggedTick ? "Logged!" : "Log this food"}
            </button>
            <button
              onClick={toggleFav}
              disabled={!activeId}
              className={`pressable flex items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-black disabled:opacity-40 ${
                isFav ? "bg-cocoa-900 text-white" : "bg-cream-100 text-cocoa-900"
              }`}
            >
              <Heart size={17} fill={isFav ? "currentColor" : "none"} />
              {isFav ? "Saved" : "Save"}
            </button>
          </div>
          {!activeId && (
            <p className="mt-2 text-center text-xs font-bold text-cocoa-500">
              <Link href="/kids" className="text-coral-600 underline">Add a child</Link> to log & save foods
            </p>
          )}
        </div>

        {/* Age tabs */}
        <h2 className="mt-6 text-base font-black text-cocoa-900">🔪 How to serve by age</h2>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {AGES.map((a) => (
            <button
              key={a.key}
              onClick={() => setAgeKey(a.key)}
              className={`pressable rounded-2xl py-2.5 text-center ${
                ageKey === a.key ? "bg-cocoa-900 text-white" : "card-shadow bg-white text-cocoa-900"
              }`}
            >
              <span className="block text-lg">{a.icon}</span>
              <span className="block text-xs font-black">{a.label}</span>
            </button>
          ))}
        </div>
        <div className="card-shadow animate-pop-in mt-2.5 rounded-3xl bg-white p-4" key={ageKey}>
          <p className="text-[15px] leading-relaxed font-semibold text-cocoa-700">{food[ageKey]}</p>
        </div>

        {/* Nutrition */}
        <div className="card-shadow mt-3 rounded-3xl bg-leaf-50 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-black text-leaf-700">
            <Apple size={16} /> Nutrition & benefits
          </h3>
          <p className="mt-1.5 text-[13px] font-extrabold text-cocoa-900">{food.nutrition}</p>
          <p className="mt-1 text-[14px] leading-relaxed font-semibold text-cocoa-700">{food.benefits}</p>
        </div>

        <div className="card-shadow mt-3 rounded-3xl bg-white p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-black text-cocoa-900">
            <Lightbulb size={16} className="text-sun-500" /> Choosing & buying
          </h3>
          <p className="mt-1.5 text-[14px] leading-relaxed font-semibold text-cocoa-700">{food.howToChoose}</p>
        </div>

        <div className="card-shadow mt-3 rounded-3xl bg-white p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-black text-cocoa-900">
            <Package size={16} className="text-coral-500" /> Storage
          </h3>
          <p className="mt-1.5 text-[14px] leading-relaxed font-semibold text-cocoa-700">{food.storage}</p>
        </div>

        {related.length > 0 && (
          <>
            <h2 className="mt-6 text-base font-black text-cocoa-900">More {food.category.toLowerCase()}</h2>
            <div className="mt-2.5 space-y-2.5 pb-4">
              {related.map((f) => (
                <FoodCard key={f.id} food={f} />
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
        presetFood={food ? { id: food.id, name: food.name, emoji: food.emoji } : null}
        onSaved={() => {
          setLoggedTick(true);
          setTimeout(() => setLoggedTick(false), 2500);
        }}
      />
    </AppShell>
  );
}
