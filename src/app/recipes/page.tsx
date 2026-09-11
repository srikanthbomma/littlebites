"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ChevronRight, Clock, RefreshCw, Search, Sparkles, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ChildPicker, type ChildItem } from "@/components/ChildPicker";
import { getActiveChildId, useActiveChildId, ageInMonths } from "@/lib/child-store";

interface RecipeItem {
  id: number;
  title: string;
  slug: string;
  country: string;
  cuisine: string;
  region: string;
  isAdapted: boolean;
  category: string;
  emoji: string;
  description: string;
  ageMinMonths: number;
  ageText: string;
  prepMinutes: number;
  allergens: string;
  isFirstFood: boolean;
}

interface CountryMeta {
  country: string;
  cuisine: string;
  count: number;
}

const FLAGS: Record<string, string> = {
  India: "🇮🇳",
  Italy: "🇮🇹",
  France: "🇫🇷",
  Spain: "🇪🇸",
  Greece: "🇬🇷",
  "United Kingdom": "🇬🇧",
  Germany: "🇩🇪",
  Sweden: "🇸🇪",
  "United States": "🇺🇸",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Peru: "🇵🇪",
  Argentina: "🇦🇷",
  Morocco: "🇲🇦",
  Egypt: "🇪🇬",
  Nigeria: "🇳🇬",
  Ethiopia: "🇪🇹",
  "Türkiye": "🇹🇷",
  Lebanon: "🇱🇧",
  Israel: "🇮🇱",
  China: "🇨🇳",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  Thailand: "🇹🇭",
  Vietnam: "🇻🇳",
  Indonesia: "🇮🇩",
  Philippines: "🇵🇭",
};

const INDIA_REGIONS = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "North Indian", "Pan-Indian", "Rajasthan"];
const RECIPE_CATS = ["Breakfast", "Mains", "Sides", "Snacks & Drinks"];

function RecipesInner() {
  const params = useSearchParams();
  const [activeId, setActiveId] = useActiveChildId();
  const [kids, setKids] = useState<ChildItem[]>([]);
  const [all, setAll] = useState<RecipeItem[]>([]);
  const [countries, setCountries] = useState<CountryMeta[]>([]);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState(params.get("country") ?? "");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [firstOnly, setFirstOnly] = useState(false);
  const [ageFilter, setAgeFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  const babyAge = useMemo(() => {
    const k = kids.find((x) => x.id === activeId);
    return ageInMonths(k?.birthdate);
  }, [kids, activeId]);

  const totalCount = useMemo(() => countries.reduce((s, c) => s + Number(c.count), 0), [countries]);

  useEffect(() => {
    fetch("/api/children")
      .then((r) => r.json())
      .then((rows: ChildItem[]) => {
        setKids(rows);
        const stored = getActiveChildId();
        if (!stored && rows.length > 0) setActiveId(rows[0].id);
      })
      .catch(() => {});
    fetch("/api/recipes?meta=1")
      .then((r) => r.json())
      .then(setCountries)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (country) sp.set("country", country);
    if (region) sp.set("region", region);
    if (category) sp.set("category", category);
    if (firstOnly) sp.set("first", "1");
    if (ageFilter && babyAge !== null) sp.set("ageMax", String(babyAge));
    const t = setTimeout(() => {
      fetch(`/api/recipes?${sp.toString()}`)
        .then((r) => r.json())
        .then((rows: RecipeItem[]) => {
          setAll(rows);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q, country, region, category, firstOnly, ageFilter, babyAge]);

  function pickCountry(c: string) {
    setCountry(country === c ? "" : c);
    setRegion("");
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="text-[22px] font-black text-cocoa-900">World Recipes 🌍</h1>
      <p className="text-xs font-bold text-cocoa-500">
        {totalCount > 0 ? `${totalCount} baby-safe recipes` : "Baby-safe recipes"} · {countries.length} countries · always beef & pork free
      </p>

      <div className="mt-3">
        <ChildPicker children={kids} activeId={activeId} onSelect={setActiveId} compact />
      </div>

      <div className="relative mt-3">
        <Search size={18} className="absolute top-3.5 left-3.5 text-cocoa-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search idli, pasta, pho, tagine…"
          className="card-shadow w-full rounded-2xl bg-white py-3 pr-10 pl-11 text-[15px] font-bold text-cocoa-900 outline-none placeholder:text-cocoa-400"
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Clear search" className="absolute top-3 right-3 text-cocoa-400">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Country explorer */}
      <p className="mt-4 mb-2 text-xs font-black tracking-widest text-cocoa-500 uppercase">
        Explore by country
      </p>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          onClick={() => {
            setCountry("");
            setRegion("");
          }}
          className={`pressable flex w-[76px] shrink-0 flex-col items-center gap-0.5 rounded-3xl p-3 ${
            country === "" ? "bg-cocoa-900 text-white" : "card-shadow bg-white text-cocoa-900"
          }`}
        >
          <span className="text-[26px]">🌍</span>
          <span className="text-[10px] leading-tight font-extrabold">All</span>
          <span className={`text-[10px] font-bold ${country === "" ? "text-white/60" : "text-cocoa-400"}`}>
            {totalCount}
          </span>
        </button>
        {countries.map((c) => (
          <button
            key={c.country}
            onClick={() => pickCountry(c.country)}
            className={`pressable flex w-[76px] shrink-0 flex-col items-center gap-0.5 rounded-3xl p-3 ${
              country === c.country ? "bg-cocoa-900 text-white" : "card-shadow bg-white text-cocoa-900"
            }`}
          >
            <span className="text-[26px]">{FLAGS[c.country] ?? "🌍"}</span>
            <span className="w-full truncate text-center text-[10px] leading-tight font-extrabold">
              {c.country}
            </span>
            <span className={`text-[10px] font-bold ${country === c.country ? "text-white/60" : "text-cocoa-400"}`}>
              {c.count}
            </span>
          </button>
        ))}
      </div>

      {/* India regions */}
      {country === "India" && (
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            onClick={() => setRegion("")}
            className={`pressable shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold ${region === "" ? "bg-cocoa-900 text-white" : "card-shadow bg-white text-cocoa-700"}`}
          >
            All India
          </button>
          {INDIA_REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(region === r ? "" : r)}
              className={`pressable shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold ${region === r ? "bg-cocoa-900 text-white" : "card-shadow bg-white text-cocoa-700"}`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2.5 grid grid-cols-4 gap-2">
        {RECIPE_CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(category === c ? "" : c)}
            className={`pressable rounded-2xl py-2 text-[11px] font-extrabold ${category === c ? "bg-coral-500 text-white" : "card-shadow bg-white text-cocoa-700"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-2.5 flex gap-2">
        <button
          onClick={() => setFirstOnly(!firstOnly)}
          className={`pressable flex flex-1 items-center justify-center gap-1 rounded-2xl py-2 text-xs font-extrabold ${firstOnly ? "bg-coral-500 text-white" : "card-shadow bg-white text-cocoa-700"}`}
        >
          <Sparkles size={13} /> First foods
        </button>
        <button
          onClick={() => setAgeFilter(!ageFilter)}
          disabled={babyAge === null}
          className={`pressable flex-1 rounded-2xl py-2 text-xs font-extrabold disabled:opacity-40 ${ageFilter ? "bg-coral-500 text-white" : "card-shadow bg-white text-cocoa-700"}`}
        >
          👶 Good for my baby{babyAge !== null ? ` (${babyAge}mo)` : ""}
        </button>
      </div>

      <p className="mt-4 mb-2 text-xs font-extrabold text-cocoa-500">
        {loading ? "Searching…" : `${all.length} recipe${all.length === 1 ? "" : "s"}${country ? ` · ${FLAGS[country] ?? ""} ${country}` : ""}`}
      </p>
      <div className="space-y-2.5 pb-4">
        {all.map((r) => (
          <Link
            key={r.id}
            href={`/recipes/${r.slug}`}
            className="pressable card-shadow flex items-center gap-3 rounded-3xl bg-white p-3"
          >
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-[32px]">
              {r.emoji}
              <span className="absolute -right-1 -bottom-1 text-lg">{FLAGS[r.country] ?? "🌍"}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-[15px] font-extrabold text-cocoa-900">{r.title}</span>
                {r.isFirstFood && <Sparkles size={13} className="shrink-0 text-coral-500" />}
              </span>
              <span className="mt-0.5 block truncate text-xs font-bold text-cocoa-500">
                {r.cuisine} · {country === "India" || !country ? `${r.region} · ` : ""}From {r.ageText}
              </span>
              <span className="mt-1.5 flex flex-wrap items-center gap-1">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-cream-100 px-2 py-0.5 text-[10px] font-extrabold text-cocoa-700">
                  <Clock size={10} /> {r.prepMinutes} min
                </span>
                {r.isAdapted && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-leaf-100 px-2 py-0.5 text-[10px] font-extrabold text-leaf-700">
                    <RefreshCw size={10} /> Adapted
                  </span>
                )}
                {r.allergens && !/^none/i.test(r.allergens) && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-coral-100 px-2 py-0.5 text-[10px] font-extrabold text-coral-700">
                    <AlertTriangle size={10} /> {r.allergens.split(";")[0].split("(")[0].trim()}
                  </span>
                )}
              </span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-cocoa-400" />
          </Link>
        ))}
        {!loading && all.length === 0 && (
          <div className="card-shadow rounded-3xl bg-white p-8 text-center">
            <p className="text-4xl">🍛</p>
            <p className="mt-2 text-sm font-black text-cocoa-900">No recipes found</p>
            <p className="mt-1 text-xs font-bold text-cocoa-500">Try a different search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecipesPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-6 text-sm font-bold text-cocoa-500">Loading…</div>}>
        <RecipesInner />
      </Suspense>
    </AppShell>
  );
}
