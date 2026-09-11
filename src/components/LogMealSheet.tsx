"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { MEAL_TYPES, REACTIONS } from "@/lib/big9";
import type { ChildItem } from "./ChildPicker";

export interface PresetFood {
  id: number;
  name: string;
  emoji: string;
}

const REACTION_EMOJI: Record<string, string> = {
  Loved: "😍",
  Liked: "🙂",
  Neutral: "😐",
  Disliked: "🙁",
  Refused: "🙅",
  "Rash / Concern": "⚠️",
};

export function LogMealSheet({
  open,
  onClose,
  childId,
  children,
  onChildChange,
  presetFood,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  childId: number | null;
  children: ChildItem[];
  onChildChange: (id: number) => void;
  presetFood?: PresetFood | null;
  onSaved?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PresetFood[]>([]);
  const [selected, setSelected] = useState<PresetFood | null>(null);
  const [mealType, setMealType] = useState<string>("Lunch");
  const [reaction, setReaction] = useState<string>("Liked");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected(presetFood ?? null);
      setQuery("");
      setNotes("");
      setReaction("Liked");
      const hour = new Date().getHours();
      setMealType(hour < 10 ? "Breakfast" : hour < 14 ? "Lunch" : hour < 17 ? "Snack" : "Dinner");
      setDate(new Date().toISOString().slice(0, 10));
      if (!childId && children.length > 0) onChildChange(children[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/foods?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) setResults(await res.json());
    }, 250);
    return () => clearTimeout(t);
  }, [query, open]);

  const canSave = useMemo(
    () => childId !== null && (selected !== null || query.trim().length > 0) && !saving,
    [childId, selected, query, saving]
  );

  if (!open) return null;

  async function save() {
    if (!childId) return;
    const foodName = selected?.name ?? query.trim();
    if (!foodName) return;
    setSaving(true);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          foodId: selected?.id ?? null,
          foodName,
          foodEmoji: selected?.emoji ?? "🍽️",
          mealType,
          reaction,
          notes,
          loggedAt: new Date(date + "T12:00:00").toISOString(),
        }),
      });
      if (res.ok) {
        onSaved?.();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-cocoa-900/50" onClick={onClose} />
      <div className="animate-pop-in relative max-h-[92dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] bg-cream-50 p-5 pb-8 sm:rounded-[28px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-cocoa-900">Log a meal 📝</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="pressable flex h-8 w-8 items-center justify-center rounded-full bg-cream-200 text-cocoa-700"
          >
            <X size={18} />
          </button>
        </div>

        {children.length > 1 && (
          <div className="mb-4 flex gap-2">
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => onChildChange(c.id)}
                className={`pressable flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold ${
                  c.id === childId ? "bg-cocoa-900 text-white" : "bg-cream-200 text-cocoa-700"
                }`}
              >
                <span>{c.avatarEmoji || "👶"}</span> {c.name}
              </button>
            ))}
          </div>
        )}
        {children.length === 0 && (
          <p className="mb-4 rounded-2xl bg-sun-200 p-3 text-sm font-bold text-cocoa-700">
            Add a child first in the Kids tab to start logging meals.
          </p>
        )}

        <label className="text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">Food</label>
        {selected ? (
          <div className="mt-1.5 flex items-center gap-2.5 rounded-2xl bg-white p-3 card-shadow">
            <span className="text-3xl">{selected.emoji}</span>
            <span className="flex-1 text-[15px] font-extrabold text-cocoa-900">{selected.name}</span>
            <button
              onClick={() => {
                setSelected(null);
                setQuery("");
              }}
              className="pressable rounded-full bg-cream-200 px-3 py-1.5 text-xs font-extrabold text-cocoa-700"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative mt-1.5">
            <Search size={18} className="absolute top-3.5 left-3.5 text-cocoa-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search foods or type anything…"
              className="w-full rounded-2xl border-2 border-transparent bg-white py-3 pr-3 pl-11 text-[15px] font-bold text-cocoa-900 outline-none placeholder:text-cocoa-400 focus:border-coral-500 card-shadow"
            />
            {results.length > 0 && (
              <div className="card-shadow absolute top-full right-0 left-0 z-10 mt-2 max-h-56 overflow-y-auto rounded-2xl bg-white p-1.5">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left hover:bg-cream-100"
                  >
                    <span className="text-2xl">{r.emoji}</span>
                    <span className="text-sm font-extrabold text-cocoa-900">{r.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <label className="mt-4 block text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">
          Meal
        </label>
        <div className="mt-1.5 grid grid-cols-4 gap-2">
          {MEAL_TYPES.map((m) => (
            <button
              key={m}
              onClick={() => setMealType(m)}
              className={`pressable rounded-2xl py-2.5 text-[13px] font-extrabold ${
                mealType === m ? "bg-coral-500 text-white" : "bg-white text-cocoa-700 card-shadow"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">
          Reaction
        </label>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {REACTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setReaction(r)}
              className={`pressable flex items-center justify-center gap-1 rounded-2xl py-2.5 text-[13px] font-extrabold ${
                reaction === r ? "bg-cocoa-900 text-white" : "bg-white text-cocoa-700 card-shadow"
              }`}
            >
              <span>{REACTION_EMOJI[r]}</span> {r}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">Date</label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="card-shadow mt-1.5 w-full rounded-2xl bg-white p-3 font-bold text-cocoa-900 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional…"
              className="card-shadow mt-1.5 w-full rounded-2xl bg-white p-3 font-bold text-cocoa-900 outline-none placeholder:text-cocoa-400"
            />
          </div>
        </div>

        <button
          onClick={save}
          disabled={!canSave}
          className="pressable mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-coral-500 py-4 text-base font-black text-white disabled:opacity-40"
        >
          <Check size={20} /> Save to diary
        </button>
      </div>
    </div>
  );
}
