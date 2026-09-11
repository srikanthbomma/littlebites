"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Heart,
  NotebookPen,
  Search,
  ShieldAlert,
  Sparkles,
  BarChart3,
  ChefHat,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ChildPicker, type ChildItem } from "@/components/ChildPicker";
import { FoodCard, type FoodListItem } from "@/components/FoodCard";
import { LogMealSheet } from "@/components/LogMealSheet";
import { useActiveChildId } from "@/lib/child-store";
import { CATEGORIES } from "@/lib/big9";

interface Stats {
  foodsTried: number;
  logsWeek: number;
  favorites: number;
  allergensStarted: number;
}

const STARTER_SLUGS = ["banana", "avocado", "sweet-potato", "egg", "peanut-butter", "lentils"];

export default function HomePage() {
  const [activeId, setActiveId] = useActiveChildId();
  const [kids, setKids] = useState<ChildItem[]>([]);
  const [stats, setStats] = useState<Stats>({ foodsTried: 0, logsWeek: 0, favorites: 0, allergensStarted: 0 });
  const [starters, setStarters] = useState<FoodListItem[]>([]);
  const [favIds, setFavIds] = useState<Set<number>>(new Set());
  const [logOpen, setLogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/children")
      .then((r) => r.json())
      .then((rows: ChildItem[]) => {
        setKids(rows);
        if (rows.length > 0) {
          const stored = Number(window.localStorage.getItem("littlebites:activeChildId"));
          if (!stored || !rows.some((k) => k.id === stored)) setActiveId(rows[0].id);
        }
      })
      .catch(() => {});
    fetch("/api/foods")
      .then((r) => r.json())
      .then((rows: FoodListItem[]) => {
        setStarters(rows.filter((f) => STARTER_SLUGS.includes(f.slug)));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) {
      setStats({ foodsTried: 0, logsWeek: 0, favorites: 0, allergensStarted: 0 });
      setFavIds(new Set());
      return;
    }
    fetch(`/api/stats?childId=${activeId}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
    fetch(`/api/favorites?childId=${activeId}`)
      .then((r) => r.json())
      .then((rows: { foodId: number }[]) => setFavIds(new Set(rows.map((f) => f.foodId))))
      .catch(() => {});
  }, [activeId]);

  async function toggleFav(food: FoodListItem) {
    if (!activeId) return;
    const has = favIds.has(food.id);
    if (has) {
      await fetch(`/api/favorites?childId=${activeId}&foodId=${food.id}`, { method: "DELETE" });
      setFavIds((s) => {
        const n = new Set(s);
        n.delete(food.id);
        return n;
      });
    } else {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: activeId, foodId: food.id }),
      });
      setFavIds((s) => new Set(s).add(food.id));
    }
  }

  const progress = Math.min(100, Math.round((stats.foodsTried / 100) * 100));

  return (
    <AppShell>
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <img src="/icons/app-icon.png" alt="LittleBites" className="h-12 w-12 rounded-2xl shadow-md" />
          <div className="flex-1">
            <h1 className="text-[22px] leading-tight font-black text-cocoa-900">
              LittleBites<span className="text-coral-500">.</span>
            </h1>
            <p className="text-xs font-bold text-cocoa-500">Starting solids, made simple</p>
          </div>
          <Link
            href="/guides/starting-solids-101"
            className="pressable card-shadow flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-extrabold text-coral-600"
          >
            <Sparkles size={14} /> Start here
          </Link>
        </div>

        {/* Child picker */}
        <div className="mt-4">
          <ChildPicker children={kids} activeId={activeId} onSelect={setActiveId} />
        </div>

        {/* Search */}
        <Link
          href="/foods"
          className="pressable card-shadow mt-4 flex items-center gap-3 rounded-3xl bg-white p-4"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-coral-100 text-coral-600">
            <Search size={20} />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-extrabold text-cocoa-900">What can my baby eat?</span>
            <span className="block text-xs font-bold text-cocoa-500">Search 76 foods + how to serve them</span>
          </span>
          <ChevronRight size={18} className="text-cocoa-400" />
        </Link>

        {/* AI banner */}
        <Link
          href="/ai"
          className="pressable mt-3 flex items-center gap-3 rounded-3xl bg-gradient-to-r from-cocoa-900 to-cocoa-700 p-4 text-white"
        >
          <span className="animate-float-soft text-3xl">✨</span>
          <span className="flex-1">
            <span className="block text-[15px] font-black">Ask the AI Guide</span>
            <span className="block text-xs font-bold text-white/70">
              “Can my baby eat mango?” — safe / caution / avoid verdicts
            </span>
          </span>
          <ChevronRight size={18} className="text-white/60" />
        </Link>

        {/* Progress */}
        <div className="card-shadow mt-4 rounded-3xl bg-cocoa-900 p-4 text-white">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black">💯 100 Foods Challenge</p>
            <p className="text-sm font-black text-sun-400">
              {stats.foodsTried}<span className="text-white/50">/100</span>
            </p>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-gradient-to-r from-coral-500 to-sun-400" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/10 p-2">
              <p className="text-lg font-black">{stats.logsWeek}</p>
              <p className="text-[10px] font-extrabold text-white/60 uppercase">meals logged</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-2">
              <p className="text-lg font-black">{stats.allergensStarted}/9</p>
              <p className="text-[10px] font-extrabold text-white/60 uppercase">allergens</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-2">
              <p className="text-lg font-black">{stats.favorites}</p>
              <p className="text-[10px] font-extrabold text-white/60 uppercase">favorites</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          <button
            onClick={() => setLogOpen(true)}
            className="pressable card-shadow flex flex-col items-center gap-1 rounded-3xl bg-coral-500 p-3 text-white"
          >
            <NotebookPen size={20} />
            <span className="text-[11px] font-black">Log meal</span>
          </button>
          <Link
            href="/diary?tab=tracker"
            className="pressable card-shadow flex flex-col items-center gap-1 rounded-3xl bg-white p-3 text-cocoa-900"
          >
            <BarChart3 size={20} className="text-coral-500" />
            <span className="text-[11px] font-black">Tracker</span>
          </Link>
          <Link
            href="/diary?tab=allergens"
            className="pressable card-shadow flex flex-col items-center gap-1 rounded-3xl bg-white p-3 text-cocoa-900"
          >
            <ShieldAlert size={20} className="text-leaf-600" />
            <span className="text-[11px] font-black">Allergens</span>
          </Link>
          <Link
            href="/guides"
            className="pressable card-shadow flex flex-col items-center gap-1 rounded-3xl bg-white p-3 text-cocoa-900"
          >
            <BookOpen size={20} className="text-sun-500" />
            <span className="text-[11px] font-black">Guides</span>
          </Link>
        </div>

        {/* Indian recipes promo */}
        <Link
          href="/recipes"
          className="pressable card-shadow mt-4 flex items-center gap-3 overflow-hidden rounded-3xl bg-white"
        >
          <span className="flex w-20 shrink-0 items-center justify-center self-stretch bg-gradient-to-br from-leaf-500 to-leaf-700 text-4xl">
            🍛
          </span>
          <span className="flex-1 py-3.5">
            <span className="flex items-center gap-1 text-[15px] font-black text-cocoa-900">
              <ChefHat size={16} className="text-leaf-600" /> World Recipes 🌍
            </span>
            <span className="block text-xs font-bold text-cocoa-500">
              68 baby-safe recipes from 27 countries · pick by country
            </span>
          </span>
          <ChevronRight size={18} className="mr-3 shrink-0 text-cocoa-400" />
        </Link>

        {/* Safety banner */}
        <Link
          href="/guides/choking-hazards-guide"
          className="pressable mt-4 flex items-center gap-3 rounded-3xl bg-berry-100 p-3.5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-berry-600">
            <AlertTriangle size={20} />
          </span>
          <span className="flex-1">
            <span className="block text-[13px] font-black text-berry-600">Safety first: choking hazards</span>
            <span className="block text-xs font-bold text-cocoa-700">
              Grapes, honey, whole nuts — know the risky foods
            </span>
          </span>
          <ChevronRight size={18} className="text-berry-600" />
        </Link>

        {/* Categories */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-base font-black text-cocoa-900">Browse by category</h2>
          <Link href="/foods" className="text-xs font-extrabold text-coral-600">
            View all
          </Link>
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-2.5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              href={`/foods?category=${encodeURIComponent(c.name)}`}
              className="pressable card-shadow flex items-center gap-2 rounded-3xl bg-white p-3"
            >
              <span className="text-[24px]">{c.emoji}</span>
              <span className="text-[11px] leading-tight font-extrabold text-cocoa-700">
                {c.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Starter foods */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-base font-black text-cocoa-900">🌟 Perfect first foods</h2>
          <Link href="/foods" className="text-xs font-extrabold text-coral-600">
            View all 76
          </Link>
        </div>
        <div className="mt-2.5 space-y-2.5">
          {starters.map((f) => (
            <FoodCard
              key={f.id}
              food={f}
              isFavorite={favIds.has(f.id)}
              onToggleFavorite={activeId ? toggleFav : undefined}
            />
          ))}
        </div>

        {/* Favorites nudge */}
        <Link
          href="/foods?favorites=1"
          className="pressable card-shadow mt-4 flex items-center gap-3 rounded-3xl bg-white p-4"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-coral-100 text-coral-600">
            <Heart size={20} />
          </span>
          <span className="flex-1 text-sm font-extrabold text-cocoa-900">Your saved favorites</span>
          <ChevronRight size={18} className="text-cocoa-400" />
        </Link>

        <p className="mt-6 mb-2 text-center text-[11px] font-bold text-cocoa-400">
          Made with 💛 for little eaters · Always supervise meals
        </p>
      </div>

      <LogMealSheet
        open={logOpen}
        onClose={() => setLogOpen(false)}
        childId={activeId}
        children={kids}
        onChildChange={setActiveId}
        onSaved={() => {
          if (activeId)
            fetch(`/api/stats?childId=${activeId}`).then((r) => r.json()).then(setStats).catch(() => {});
        }}
      />
    </AppShell>
  );
}
