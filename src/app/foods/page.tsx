"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heart, Search, Sparkles, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ChildPicker, type ChildItem } from "@/components/ChildPicker";
import { FoodCard, type FoodListItem } from "@/components/FoodCard";
import { useActiveChildId, getActiveChildId } from "@/lib/child-store";
import { CATEGORIES } from "@/lib/big9";

function FoodsInner() {
  const params = useSearchParams();
  const [activeId, setActiveId] = useActiveChildId();
  const [kids, setKids] = useState<ChildItem[]>([]);
  const [all, setAll] = useState<FoodListItem[]>([]);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [allergensOnly, setAllergensOnly] = useState(false);
  const [ironOnly, setIronOnly] = useState(false);
  const [favOnly, setFavOnly] = useState(params.get("favorites") === "1");
  const [favIds, setFavIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/children")
      .then((r) => r.json())
      .then((rows: ChildItem[]) => {
        setKids(rows);
        const stored = getActiveChildId();
        if (!stored && rows.length > 0) setActiveId(rows[0].id);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (category) sp.set("category", category);
    if (allergensOnly) sp.set("allergens", "1");
    if (ironOnly) sp.set("iron", "1");
    const t = setTimeout(() => {
      fetch(`/api/foods?${sp.toString()}`)
        .then((r) => r.json())
        .then((rows: FoodListItem[]) => {
          setAll(rows);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q, category, allergensOnly, ironOnly]);

  useEffect(() => {
    if (!activeId) {
      setFavIds(new Set());
      return;
    }
    fetch(`/api/favorites?childId=${activeId}`)
      .then((r) => r.json())
      .then((rows: { foodId: number }[]) => setFavIds(new Set(rows.map((f) => f.foodId))))
      .catch(() => {});
  }, [activeId]);

  const visible = useMemo(
    () => (favOnly ? all.filter((f) => favIds.has(f.id)) : all),
    [all, favOnly, favIds]
  );

  async function toggleFav(food: FoodListItem) {
    if (!activeId) return;
    if (favIds.has(food.id)) {
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

  return (
    <div className="px-4 pt-6">
      <h1 className="text-[22px] font-black text-cocoa-900">Food Database 🍽️</h1>
      <p className="text-xs font-bold text-cocoa-500">76 foods · when & how to serve each one</p>

      <div className="mt-3">
        <ChildPicker children={kids} activeId={activeId} onSelect={setActiveId} compact />
      </div>

      <div className="relative mt-3">
        <Search size={18} className="absolute top-3.5 left-3.5 text-cocoa-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search banana, salmon, iron…"
          className="card-shadow w-full rounded-2xl bg-white py-3 pr-10 pl-11 text-[15px] font-bold text-cocoa-900 outline-none placeholder:text-cocoa-400"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            aria-label="Clear search"
            className="absolute top-3 right-3 text-cocoa-400"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          onClick={() => setCategory("")}
          className={`pressable shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold ${
            category === "" ? "bg-cocoa-900 text-white" : "card-shadow bg-white text-cocoa-700"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.name}
            onClick={() => setCategory(category === c.name ? "" : c.name)}
            className={`pressable shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold ${
              category === c.name ? "bg-cocoa-900 text-white" : "card-shadow bg-white text-cocoa-700"
            }`}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      <div className="mt-2.5 flex gap-2">
        <button
          onClick={() => setAllergensOnly(!allergensOnly)}
          className={`pressable flex-1 rounded-2xl py-2 text-xs font-extrabold ${
            allergensOnly ? "bg-coral-500 text-white" : "card-shadow bg-white text-cocoa-700"
          }`}
        >
          ⚠️ Allergens
        </button>
        <button
          onClick={() => setIronOnly(!ironOnly)}
          className={`pressable flex flex-1 items-center justify-center gap-1 rounded-2xl py-2 text-xs font-extrabold ${
            ironOnly ? "bg-coral-500 text-white" : "card-shadow bg-white text-cocoa-700"
          }`}
        >
          <Sparkles size={13} /> Iron-rich
        </button>
        <button
          onClick={() => setFavOnly(!favOnly)}
          className={`pressable flex flex-1 items-center justify-center gap-1 rounded-2xl py-2 text-xs font-extrabold ${
            favOnly ? "bg-coral-500 text-white" : "card-shadow bg-white text-cocoa-700"
          }`}
        >
          <Heart size={13} /> Saved
        </button>
      </div>

      <p className="mt-4 mb-2 text-xs font-extrabold text-cocoa-500">
        {loading ? "Searching…" : `${visible.length} food${visible.length === 1 ? "" : "s"}`}
      </p>
      <div className="space-y-2.5 pb-4">
        {visible.map((f) => (
          <FoodCard
            key={f.id}
            food={f}
            isFavorite={favIds.has(f.id)}
            onToggleFavorite={activeId ? toggleFav : undefined}
          />
        ))}
        {!loading && visible.length === 0 && (
          <div className="card-shadow rounded-3xl bg-white p-8 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-2 text-sm font-black text-cocoa-900">
              {all.length === 0 ? "Database not seeded yet" : "No foods found"}
            </p>
            <p className="mt-1 text-xs font-bold text-cocoa-500">
              {all.length === 0
                ? "Your database is connected, but the 76 foods haven't been loaded yet."
                : favOnly
                  ? "Tap the heart on any food to save it here."
                  : "Try a different search or filter."}
            </p>
            {all.length === 0 && (
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await fetch("/api/seed");
                    const res = await fetch("/api/foods");
                    const data = await res.json();
                    setAll(data);
                  } catch {
                    /* ignore */
                  } finally {
                    setLoading(false);
                  }
                }}
                className="pressable mt-4 inline-flex items-center gap-2 rounded-2xl bg-coral-500 px-5 py-3 text-sm font-black text-white"
              >
                <Sparkles size={16} /> Load 76 Foods (1-Click)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FoodsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-6 text-sm font-bold text-cocoa-500">Loading…</div>}>
        <FoodsInner />
      </Suspense>
    </AppShell>
  );
}
