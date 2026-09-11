"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, ChevronRight, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ChildPicker, type ChildItem } from "@/components/ChildPicker";
import { FoodTracker } from "@/components/FoodTracker";
import { LogMealSheet } from "@/components/LogMealSheet";
import { getActiveChildId, useActiveChildId } from "@/lib/child-store";

interface LogRow {
  id: number;
  foodName: string;
  foodEmoji: string | null;
  mealType: string;
  reaction: string;
  notes: string | null;
  loggedAt: string;
}

interface AllergenRow {
  allergen: string;
  emoji: string;
  blurb: string;
  howToServe: string;
  status: string;
  exposures: number;
  lastExposureAt: string | null;
  reactionNotes: string;
}

const REACTION_EMOJI: Record<string, string> = {
  Loved: "😍",
  Liked: "🙂",
  Neutral: "😐",
  Disliked: "🙁",
  Refused: "🙅",
  "Rash / Concern": "⚠️",
};

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (same(d, today)) return "Today";
  if (same(d, yest)) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

type Tab = "meals" | "tracker" | "allergens";

function DiaryInner() {
  const params = useSearchParams();
  const initial = params.get("tab");
  const [activeId, setActiveId] = useActiveChildId();
  const [kids, setKids] = useState<ChildItem[]>([]);
  const [tab, setTab] = useState<Tab>(
    initial === "allergens" ? "allergens" : initial === "tracker" ? "tracker" : "meals"
  );
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [allergens, setAllergens] = useState<AllergenRow[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [savingAllergen, setSavingAllergen] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

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

  function reload() {
    if (!activeId) {
      setLogs([]);
      setAllergens([]);
      return;
    }
    fetch(`/api/logs?childId=${activeId}`)
      .then((r) => r.json())
      .then(setLogs)
      .catch(() => {});
    fetch(`/api/allergens?childId=${activeId}`)
      .then((r) => r.json())
      .then((rows: AllergenRow[]) => {
        setAllergens(rows);
        const d: Record<string, string> = {};
        rows.forEach((a) => (d[a.allergen] = a.reactionNotes ?? ""));
        setNotesDraft(d);
      })
      .catch(() => {});
  }

  useEffect(reload, [activeId]);

  const grouped = useMemo(() => {
    const m = new Map<string, LogRow[]>();
    logs.forEach((l) => {
      const key = new Date(l.loggedAt).toDateString();
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(l);
    });
    return [...m.entries()];
  }, [logs]);

  const foodsTried = useMemo(() => new Set(logs.map((l) => l.foodName.toLowerCase())).size, [logs]);
  const introduced = allergens.filter((a) => a.status === "Introduced").length;
  const trying = allergens.filter((a) => a.status === "Trying").length;

  async function deleteLog(id: number) {
    await fetch(`/api/logs?id=${id}`, { method: "DELETE" });
    setLogs((s) => s.filter((l) => l.id !== id));
  }

  async function logExposure(allergen: string) {
    if (!activeId) return;
    setSavingAllergen(allergen);
    await fetch("/api/allergens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: activeId, allergen }),
    });
    const rows: AllergenRow[] = await fetch(`/api/allergens?childId=${activeId}`).then((r) => r.json());
    setAllergens(rows);
    setSavingAllergen(null);
  }

  async function cycleStatus(a: AllergenRow) {
    if (!activeId) return;
    const next = a.status === "Not started" ? "Trying" : a.status === "Trying" ? "Introduced" : "Not started";
    setAllergens((s) => s.map((x) => (x.allergen === a.allergen ? { ...x, status: next } : x)));
    await fetch("/api/allergens", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: activeId, allergen: a.allergen, status: next }),
    });
  }

  async function saveNotes(allergen: string) {
    if (!activeId) return;
    await fetch("/api/allergens", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: activeId, allergen, reactionNotes: notesDraft[allergen] ?? "" }),
    });
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="text-[22px] font-black text-cocoa-900">Diary 📓</h1>
      <p className="text-xs font-bold text-cocoa-500">Meals, food tracker & allergen exposures</p>

      <div className="mt-3">
        <ChildPicker children={kids} activeId={activeId} onSelect={setActiveId} />
      </div>

      {!activeId ? (
        <div className="card-shadow mt-6 rounded-3xl bg-white p-8 text-center">
          <p className="text-4xl">👶</p>
          <p className="mt-2 text-sm font-black text-cocoa-900">Add your little one to begin</p>
          <Link
            href="/kids"
            className="pressable mt-3 inline-block rounded-2xl bg-coral-500 px-6 py-3 text-sm font-black text-white"
          >
            Add a child
          </Link>
        </div>
      ) : (
        <>
          <div className="card-shadow mt-4 grid grid-cols-3 gap-1 rounded-3xl bg-white p-1">
            {(["meals", "tracker", "allergens"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pressable rounded-2xl py-2.5 text-[13px] font-black capitalize ${
                  tab === t ? "bg-cocoa-900 text-white" : "text-cocoa-500"
                }`}
              >
                {t === "meals" ? "🍽️ Meals" : t === "tracker" ? "📊 Tracker" : `🛡️ ${introduced}/9`}
              </button>
            ))}
          </div>

          {tab === "tracker" && (
            <div className="mt-3 pb-4">
              <FoodTracker key={activeId} childId={activeId} />
            </div>
          )}

          {tab === "meals" && (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="card-shadow rounded-3xl bg-white p-3">
                  <p className="text-xl font-black text-cocoa-900">{foodsTried}</p>
                  <p className="text-[10px] font-extrabold text-cocoa-500 uppercase">foods tried</p>
                </div>
                <div className="card-shadow rounded-3xl bg-white p-3">
                  <p className="text-xl font-black text-cocoa-900">{logs.length}</p>
                  <p className="text-[10px] font-extrabold text-cocoa-500 uppercase">meals logged</p>
                </div>
                <button
                  onClick={() => setLogOpen(true)}
                  className="pressable rounded-3xl bg-coral-500 p-3 text-white"
                >
                  <Plus size={20} className="mx-auto" />
                  <p className="mt-0.5 text-[10px] font-black uppercase">log meal</p>
                </button>
              </div>

              {grouped.length === 0 && (
                <div className="card-shadow mt-4 rounded-3xl bg-white p-8 text-center">
                  <p className="text-4xl">🍽️</p>
                  <p className="mt-2 text-sm font-black text-cocoa-900">No meals yet</p>
                  <p className="mt-1 text-xs font-bold text-cocoa-500">
                    Log every taste — it powers your tracker and AI suggestions!
                  </p>
                  <button
                    onClick={() => setLogOpen(true)}
                    className="pressable mt-3 rounded-2xl bg-coral-500 px-6 py-3 text-sm font-black text-white"
                  >
                    Log the first meal
                  </button>
                </div>
              )}

              {grouped.map(([day, rows]) => (
                <div key={day} className="mt-5">
                  <p className="mb-2 text-xs font-black tracking-widest text-cocoa-500 uppercase">
                    {dayLabel(rows[0].loggedAt)}
                  </p>
                  <div className="space-y-2">
                    {rows.map((l) => (
                      <div key={l.id} className="card-shadow flex items-center gap-3 rounded-3xl bg-white p-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-[26px]">
                          {l.foodEmoji || "🍽️"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-extrabold text-cocoa-900">
                            {l.foodName}
                          </span>
                          <span className="block text-xs font-bold text-cocoa-500">
                            {l.mealType} · {REACTION_EMOJI[l.reaction] ?? "🙂"} {l.reaction}
                          </span>
                          {!!l.notes && (
                            <span className="block truncate text-xs font-semibold text-cocoa-400">
                              “{l.notes}”
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => deleteLog(l.id)}
                          aria-label="Delete log"
                          className="pressable flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-100 text-cocoa-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === "allergens" && (
            <>
              <div className="card-shadow mt-3 rounded-3xl bg-leaf-700 p-4 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black">🛡️ Big 9 Progress</p>
                  <p className="text-sm font-black">{introduced}/9 introduced</p>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-sun-400"
                    style={{ width: `${(introduced / 9) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-bold text-white/80">
                  {trying} in progress · Serve each allergen 2–3× per week to maintain tolerance.
                </p>
                <Link
                  href="/guides/introducing-allergens"
                  className="pressable mt-3 flex items-center justify-center gap-1 rounded-2xl bg-white/15 py-2.5 text-xs font-black"
                >
                  How to introduce allergens <ChevronRight size={14} />
                </Link>
              </div>

              <div className="mt-3 space-y-2.5 pb-4">
                {allergens.map((a) => (
                  <div key={a.allergen} className="card-shadow rounded-3xl bg-white p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-[28px]">
                        {a.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-black text-cocoa-900">{a.allergen}</p>
                        <p className="text-xs font-bold text-cocoa-500">
                          {a.exposures} exposure{a.exposures === 1 ? "" : "s"}
                          {a.lastExposureAt
                            ? ` · last ${new Date(a.lastExposureAt).toLocaleDateString()}`
                            : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => cycleStatus(a)}
                        className={`pressable flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black ${
                          a.status === "Introduced"
                            ? "bg-leaf-100 text-leaf-700"
                            : a.status === "Trying"
                              ? "bg-sun-200 text-cocoa-700"
                              : "bg-cream-100 text-cocoa-500"
                        }`}
                      >
                        {a.status === "Introduced" && <Check size={12} />}
                        {a.status}
                      </button>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed font-semibold text-cocoa-700">
                      {a.howToServe}
                    </p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        onClick={() => logExposure(a.allergen)}
                        disabled={savingAllergen === a.allergen}
                        className="pressable flex-1 rounded-2xl bg-coral-500 py-2.5 text-[13px] font-black text-white disabled:opacity-50"
                      >
                        {savingAllergen === a.allergen ? "Saving…" : "+ Log exposure"}
                      </button>
                    </div>
                    <input
                      value={notesDraft[a.allergen] ?? ""}
                      onChange={(e) =>
                        setNotesDraft((s) => ({ ...s, [a.allergen]: e.target.value }))
                      }
                      onBlur={() => saveNotes(a.allergen)}
                      placeholder="Reaction notes (optional)…"
                      className="mt-2 w-full rounded-2xl bg-cream-100 px-3.5 py-2.5 text-[13px] font-bold text-cocoa-900 outline-none placeholder:text-cocoa-400"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <LogMealSheet
        open={logOpen}
        onClose={() => setLogOpen(false)}
        childId={activeId}
        children={kids}
        onChildChange={setActiveId}
        onSaved={reload}
      />
    </div>
  );
}

export default function DiaryPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-6 text-sm font-bold text-cocoa-500">Loading…</div>}>
        <DiaryInner />
      </Suspense>
    </AppShell>
  );
}
