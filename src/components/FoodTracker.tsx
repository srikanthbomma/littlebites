"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Plus, Search, Sparkles, Trash2, X } from "lucide-react";

export interface TrackedItem {
  key: string;
  name: string;
  emoji: string;
  groups: string[];
  isAllergen: boolean;
  isIronRich: boolean;
  status: "liked" | "disliked" | "unsure" | null;
  exposures: number;
  logCount: number;
  hasReaction: boolean;
  symptoms: string;
  textures: string[];
  notes: string;
  firstTried: string | null;
  lastTried: string | null;
  loved: boolean;
  favorite: boolean;
  kind: "food" | "recipe" | "custom";
  href: string;
}

interface DashboardData {
  totalCatalog: number;
  triedCount: number;
  notTriedCount: number;
  notTriedTop: { key: string; name: string; emoji: string; reason: string; href: string; ageText: string }[];
  groups: { group: string; tried: number; total: number; liked: number }[];
}

const STATUS_META: Record<string, { label: string; emoji: string; cls: string }> = {
  liked: { label: "Liked", emoji: "😋", cls: "bg-leaf-100 text-leaf-700" },
  unsure: { label: "Unsure", emoji: "😐", cls: "bg-sun-200 text-cocoa-700" },
  disliked: { label: "Disliked", emoji: "🙁", cls: "bg-berry-100 text-berry-600" },
};

const FOOD_GROUPS = ["Fruits", "Vegetables", "Grains", "Millets", "Legumes", "Dairy", "Eggs", "Meat", "Fish/Seafood", "Nuts & Seeds", "Spices & Fats"];
const EMOJI_CHOICES = ["🍎", "🥦", "🍚", "🌾", "🫘", "🧀", "🍳", "🍗", "🐟", "🥜", "🍌", "🥭", "🍲", "🥞", "🍛", "🥥", "🍅", "🥕", "🍠", "🥑", "🫓", "🍯", "🧈", "🥛"];

type Filter = "all" | "favorites" | "liked" | "unsure" | "disliked" | "multi" | "reactions";

export function FoodTracker({ childId }: { childId: number }) {
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [babyName, setBabyName] = useState("Baby");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [groupFilter, setGroupFilter] = useState("");
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<TrackedItem | null>(null);

  // form state
  const [fName, setFName] = useState("");
  const [fEmoji, setFEmoji] = useState("🍽️");
  const [fCategory, setFCategory] = useState("Fruits");
  const [fIndian, setFIndian] = useState(false);
  const [fStatus, setFStatus] = useState("");
  const [fDate, setFDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [fExposures, setFExposures] = useState(1);
  const [fTextures, setFTextures] = useState("");
  const [fSymptoms, setFSymptoms] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function reload() {
    setLoading(true);
    fetch(`/api/tracking?childId=${childId}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.tried ?? []);
        setDashboard(d.dashboard ?? null);
        setInsights(d.insights ?? []);
        setBabyName(d.baby?.name ?? "Baby");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(reload, [childId]);

  const counts = useMemo(() => {
    return {
      favorites: items.filter((i) => i.favorite).length,
      liked: items.filter((i) => i.status === "liked").length,
      unsure: items.filter((i) => i.status === "unsure" || i.status === null).length,
      disliked: items.filter((i) => i.status === "disliked").length,
      multi: items.filter((i) => i.exposures >= 3).length,
      reactions: items.filter((i) => i.hasReaction).length,
    };
  }, [items]);

  const visible = useMemo(() => {
    return items.filter((i) => {
      if (filter === "favorites" && !i.favorite) return false;
      if (filter === "liked" && i.status !== "liked") return false;
      if (filter === "unsure" && !(i.status === "unsure" || i.status === null)) return false;
      if (filter === "disliked" && i.status !== "disliked") return false;
      if (filter === "multi" && i.exposures < 3) return false;
      if (filter === "reactions" && !i.hasReaction) return false;
      if (groupFilter && !i.groups.includes(groupFilter)) return false;
      if (q.trim() && !i.name.toLowerCase().includes(q.trim().toLowerCase())) return false;
      return true;
    });
  }, [items, filter, groupFilter, q]);

  function openAdd() {
    setFName("");
    setFEmoji("🍽️");
    setFCategory("Fruits");
    setFIndian(false);
    setFStatus("liked");
    setFDate(new Date().toISOString().slice(0, 10));
    setFExposures(1);
    setFTextures("");
    setFSymptoms("");
    setFNotes("");
    setEditing(null);
    setShowAdd(true);
  }

  function openEdit(item: TrackedItem) {
    setFName(item.name);
    setFEmoji(item.emoji);
    setFCategory(item.groups.find((g) => FOOD_GROUPS.includes(g)) ?? "Fruits");
    setFIndian(item.groups.includes("Indian"));
    setFStatus(item.status ?? "");
    setFDate(item.firstTried ? new Date(item.firstTried).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
    setFExposures(Math.max(1, item.exposures));
    setFTextures(item.textures.join(", "));
    setFSymptoms(item.symptoms);
    setFNotes(item.notes);
    setEditing(item);
    setShowAdd(true);
  }

  async function save() {
    if (!fName.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          foodKey: editing?.key,
          foodName: fName.trim(),
          foodEmoji: fEmoji,
          category: fCategory,
          isIndian: fIndian,
          status: fStatus,
          symptoms: fSymptoms,
          textures: fTextures,
          notes: fNotes,
          exposuresManual: editing ? Math.max(0, fExposures - editing.logCount) : fExposures,
          dateIntroduced: fDate,
        }),
      });
      setShowAdd(false);
      reload();
    } finally {
      setSaving(false);
    }
  }

  async function removeManual() {
    if (!editing) return;
    await fetch(`/api/tracking?childId=${childId}&foodKey=${encodeURIComponent(editing.key)}`, { method: "DELETE" });
    setShowAdd(false);
    reload();
  }

  const progress = dashboard ? Math.min(100, Math.round((dashboard.triedCount / Math.max(1, dashboard.totalCatalog)) * 100)) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="animate-float-soft text-5xl">📊</p>
        <p className="mt-3 text-sm font-extrabold text-cocoa-500">Building {babyName}&apos;s dashboard…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Overview */}
      <div className="card-shadow rounded-3xl bg-cocoa-900 p-4 text-white">
        <div className="flex items-center justify-between">
          <p className="text-sm font-black">📊 {babyName}&apos;s Food Journey</p>
          <p className="text-sm font-black text-sun-400">
            {dashboard?.triedCount ?? 0}<span className="text-white/50">/{dashboard?.totalCatalog ?? 0}</span>
          </p>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-gradient-to-r from-coral-500 to-sun-400" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {(
            [
              ["favorites", `❤️ ${counts.favorites}`, "favorites"],
              ["liked", `😋 ${counts.liked}`, "liked"],
              ["unsure", `😐 ${counts.unsure}`, "unsure"],
              ["disliked", `🙁 ${counts.disliked}`, "disliked"],
              ["multi", `🔁 ${counts.multi}`, "3+ tries"],
              ["reactions", `⚠️ ${counts.reactions}`, "reactions"],
            ] as [Filter, string, string][]
          ).map(([f, label, sub]) => (
            <button
              key={f}
              onClick={() => setFilter(filter === f ? "all" : f)}
              className={`pressable rounded-2xl p-2 ${filter === f ? "bg-sun-400 text-cocoa-900" : "bg-white/10"}`}
            >
              <p className="text-[15px] font-black">{label}</p>
              <p className={`text-[10px] font-extrabold uppercase ${filter === f ? "text-cocoa-700" : "text-white/60"}`}>{sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="card-shadow mt-3 rounded-3xl bg-gradient-to-br from-coral-500 to-coral-600 p-4 text-white">
          <p className="flex items-center gap-1.5 text-sm font-black">
            <Sparkles size={16} /> AI patterns for {babyName}
          </p>
          <ul className="mt-2 space-y-2">
            {insights.slice(0, 4).map((ins, i) => (
              <li key={i} className="rounded-2xl bg-white/12 p-2.5 text-[13px] leading-relaxed font-bold">
                {ins}
              </li>
            ))}
          </ul>
          <Link href="/ai" className="pressable mt-2.5 flex items-center justify-center gap-1 rounded-2xl bg-white/15 py-2.5 text-xs font-black">
            Get full AI suggestions <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* Category coverage */}
      <h3 className="mt-5 mb-2 text-sm font-black text-cocoa-900">Food groups explored</h3>
      <div className="card-shadow rounded-3xl bg-white p-3">
        {(dashboard?.groups ?? []).map((g) => {
          const pct = g.total > 0 ? Math.round((g.tried / g.total) * 100) : 0;
          const active = groupFilter === g.group;
          return (
            <button
              key={g.group}
              onClick={() => setGroupFilter(active ? "" : g.group)}
              className={`flex w-full items-center gap-2.5 rounded-2xl px-2 py-1.5 text-left ${active ? "bg-coral-50" : ""}`}
            >
              <span className="w-28 shrink-0 truncate text-[11px] font-extrabold text-cocoa-700">{g.group}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-100">
                <span
                  className={`block h-full rounded-full ${g.tried === 0 ? "bg-cream-200" : active ? "bg-coral-500" : "bg-leaf-500"}`}
                  style={{ width: `${Math.max(g.tried === 0 ? 100 : 6, pct)}%`, opacity: g.tried === 0 ? 0.6 : 1 }}
                />
              </span>
              <span className="w-12 shrink-0 text-right text-[11px] font-black text-cocoa-500">
                {g.tried}/{g.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + add */}
      <div className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-3 left-3 text-cocoa-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tracked foods…"
            className="card-shadow w-full rounded-2xl bg-white py-2.5 pr-3 pl-9 text-sm font-bold text-cocoa-900 outline-none placeholder:text-cocoa-400"
          />
        </div>
        <button
          onClick={openAdd}
          className="pressable flex items-center gap-1 rounded-2xl bg-coral-500 px-4 text-sm font-black text-white"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {(filter !== "all" || groupFilter) && (
        <div className="mt-2 flex items-center gap-2">
          <p className="flex-1 text-xs font-extrabold text-cocoa-500">
            Showing {visible.length} · {filter !== "all" ? STATUS_META[filter]?.label ?? filter : ""} {groupFilter}
          </p>
          <button
            onClick={() => {
              setFilter("all");
              setGroupFilter("");
            }}
            className="rounded-full bg-cream-200 px-3 py-1 text-xs font-extrabold text-cocoa-700"
          >
            Clear
          </button>
        </div>
      )}

      {/* Tracked list */}
      <div className="mt-2 space-y-2">
        {visible.map((i) => {
          const sm = i.status ? STATUS_META[i.status] : null;
          return (
            <button
              key={i.key}
              onClick={() => openEdit(i)}
              className="pressable card-shadow flex w-full items-center gap-3 rounded-3xl bg-white p-3 text-left"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-[26px]">
                {i.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-extrabold text-cocoa-900">{i.name}</span>
                  {i.favorite && <span className="text-xs">❤️</span>}
                  {i.hasReaction && <span className="text-xs">⚠️</span>}
                  {i.isIronRich && <span title="Iron rich" className="text-xs">💪</span>}
                </span>
                <span className="mt-0.5 block text-[11px] font-bold text-cocoa-500">
                  {i.exposures}x tried
                  {i.firstTried ? ` · since ${new Date(i.firstTried).toLocaleDateString()}` : ""}
                  {i.textures.length > 0 ? ` · ${i.textures.slice(0, 2).join(", ")}` : ""}
                </span>
                {!!i.symptoms && (
                  <span className="mt-0.5 block truncate text-[11px] font-bold text-berry-600">
                    ⚠️ {i.symptoms}
                  </span>
                )}
              </span>
              {sm && (
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${sm.cls}`}>
                  {sm.emoji} {sm.label}
                </span>
              )}
            </button>
          );
        })}
        {visible.length === 0 && (
          <div className="card-shadow rounded-3xl bg-white p-8 text-center">
            <p className="text-4xl">{items.length === 0 ? "🌱" : "🔍"}</p>
            <p className="mt-2 text-sm font-black text-cocoa-900">
              {items.length === 0 ? `No foods tracked for ${babyName} yet` : "Nothing matches these filters"}
            </p>
            <p className="mt-1 text-xs font-bold text-cocoa-500">
              {items.length === 0 ? "Log meals in the Diary or add foods manually — patterns appear here!" : "Try clearing the filters."}
            </p>
            {items.length === 0 && (
              <button
                onClick={openAdd}
                className="pressable mt-3 rounded-2xl bg-coral-500 px-6 py-3 text-sm font-black text-white"
              >
                Track the first food
              </button>
            )}
          </div>
        )}
      </div>

      {/* Not yet tried */}
      {dashboard && dashboard.notTriedCount > 0 && (
        <>
          <h3 className="mt-5 mb-2 text-sm font-black text-cocoa-900">
            Not yet tried ({dashboard.notTriedCount})
          </h3>
          <div className="space-y-2 pb-4">
            {dashboard.notTriedTop.map((p) => (
              <Link
                key={p.key}
                href={p.href}
                className="pressable card-shadow flex items-center gap-3 rounded-3xl bg-white p-3"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-2xl">
                  {p.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold text-cocoa-900">{p.name}</span>
                  <span className="block text-[11px] font-bold text-cocoa-500">
                    {p.reason} · {p.ageText}
                  </span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-cocoa-400" />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-cocoa-900/50" onClick={() => setShowAdd(false)} />
          <div className="animate-pop-in relative max-h-[92dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] bg-cream-50 p-5 pb-8 sm:rounded-[28px]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-cocoa-900">
                {editing ? "Update food" : "Track a food 📝"}
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                aria-label="Close"
                className="pressable flex h-8 w-8 items-center justify-center rounded-full bg-cream-200 text-cocoa-700"
              >
                <X size={18} />
              </button>
            </div>

            <label className="text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">Food name *</label>
            <input
              value={fName}
              onChange={(e) => setFName(e.target.value)}
              placeholder="e.g. Idli, Mango, Rajma…"
              disabled={!!editing}
              className="card-shadow mt-1.5 w-full rounded-2xl bg-white p-3 font-bold text-cocoa-900 outline-none placeholder:text-cocoa-400 disabled:opacity-60"
            />

            <label className="mt-3 block text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">Emoji</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {EMOJI_CHOICES.map((e) => (
                <button
                  key={e}
                  onClick={() => setFEmoji(e)}
                  className={`pressable flex h-9 w-9 items-center justify-center rounded-xl text-xl ${fEmoji === e ? "bg-cocoa-900" : "card-shadow bg-white"}`}
                >
                  {e}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">Category</label>
                <select
                  value={fCategory}
                  onChange={(e) => setFCategory(e.target.value)}
                  className="card-shadow mt-1.5 w-full rounded-2xl bg-white p-3 font-bold text-cocoa-900 outline-none"
                >
                  {FOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">Date introduced</label>
                <input
                  type="date"
                  value={fDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setFDate(e.target.value)}
                  className="card-shadow mt-1.5 w-full rounded-2xl bg-white p-3 font-bold text-cocoa-900 outline-none"
                />
              </div>
            </div>

            <label className="mt-3 block text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">
              Did {babyName} like it?
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {(["liked", "unsure", "disliked"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFStatus(fStatus === s ? "" : s)}
                  className={`pressable rounded-2xl py-2.5 text-[13px] font-extrabold ${fStatus === s ? "bg-cocoa-900 text-white" : "card-shadow bg-white text-cocoa-700"}`}
                >
                  {STATUS_META[s].emoji} {STATUS_META[s].label}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">Times tried</label>
                <div className="card-shadow mt-1.5 flex items-center justify-between rounded-2xl bg-white px-2 py-1.5">
                  <button onClick={() => setFExposures(Math.max(1, fExposures - 1))} className="pressable flex h-8 w-8 items-center justify-center rounded-xl bg-cream-100 text-lg font-black text-cocoa-700">−</button>
                  <span className="text-lg font-black text-cocoa-900">{fExposures}</span>
                  <button onClick={() => setFExposures(Math.min(99, fExposures + 1))} className="pressable flex h-8 w-8 items-center justify-center rounded-xl bg-cream-100 text-lg font-black text-cocoa-700">+</button>
                </div>
                {editing && editing.logCount > 0 && (
                  <p className="mt-1 text-[11px] font-bold text-cocoa-500">{editing.logCount} from diary logs</p>
                )}
              </div>
              <div>
                <label className="text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">Indian food?</label>
                <button
                  onClick={() => setFIndian(!fIndian)}
                  className={`pressable mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-2xl py-3.5 text-sm font-extrabold ${fIndian ? "bg-leaf-600 text-white" : "card-shadow bg-white text-cocoa-700"}`}
                >
                  {fIndian ? <Check size={16} /> : null} 🇮🇳 {fIndian ? "Yes" : "No"}
                </button>
              </div>
            </div>

            <label className="mt-3 block text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">
              Texture served (comma separated)
            </label>
            <input
              value={fTextures}
              onChange={(e) => setFTextures(e.target.value)}
              placeholder="e.g. mashed, soft pieces, finger food"
              className="card-shadow mt-1.5 w-full rounded-2xl bg-white p-3 font-bold text-cocoa-900 outline-none placeholder:text-cocoa-400"
            />

            <label className="mt-3 block text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">
              Reaction / symptoms (if any)
            </label>
            <input
              value={fSymptoms}
              onChange={(e) => setFSymptoms(e.target.value)}
              placeholder="e.g. small rash around mouth, vomiting once…"
              className="card-shadow mt-1.5 w-full rounded-2xl bg-white p-3 font-bold text-cocoa-900 outline-none placeholder:text-cocoa-400"
            />

            <label className="mt-3 block text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">Notes</label>
            <input
              value={fNotes}
              onChange={(e) => setFNotes(e.target.value)}
              placeholder="Optional notes…"
              className="card-shadow mt-1.5 w-full rounded-2xl bg-white p-3 font-bold text-cocoa-900 outline-none placeholder:text-cocoa-400"
            />

            <button
              onClick={save}
              disabled={!fName.trim() || saving}
              className="pressable mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-coral-500 py-4 text-base font-black text-white disabled:opacity-40"
            >
              <Check size={20} /> {saving ? "Saving…" : editing ? "Save changes" : "Track this food"}
            </button>
            {editing && (
              <button
                onClick={removeManual}
                className="pressable mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-berry-100 py-3 text-sm font-black text-berry-600"
              >
                <Trash2 size={16} /> Remove manual entry
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
