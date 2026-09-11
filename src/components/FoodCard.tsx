"use client";

import Link from "next/link";
import { AlertTriangle, Flame, Heart, Sparkles } from "lucide-react";

export interface FoodListItem {
  id: number;
  name: string;
  slug: string;
  category: string;
  emoji: string;
  introAgeText: string;
  isAllergen: boolean;
  allergenName: string;
  chokingRisk: string;
  isIronRich: boolean;
}

export function chokingColor(risk: string) {
  const r = risk.toLowerCase();
  if (r.startsWith("high")) return "bg-berry-100 text-berry-600";
  if (r.startsWith("moderate")) return "bg-sun-200 text-cocoa-700";
  return "bg-leaf-100 text-leaf-700";
}

export function FoodCard({
  food,
  isFavorite,
  onToggleFavorite,
}: {
  food: FoodListItem;
  isFavorite?: boolean;
  onToggleFavorite?: (food: FoodListItem) => void;
}) {
  return (
    <Link
      href={`/foods/${food.slug}`}
      className="pressable card-shadow flex items-center gap-3 rounded-3xl bg-white p-3"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-[32px]">
        {food.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-extrabold text-cocoa-900">{food.name}</span>
          {food.isIronRich && (
            <span title="Iron rich">
              <Sparkles size={13} className="shrink-0 text-coral-500" />
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs font-bold text-cocoa-500">
          From {food.introAgeText} · {food.category}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1">
          {food.isAllergen && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-coral-100 px-2 py-0.5 text-[10px] font-extrabold text-coral-700">
              <AlertTriangle size={10} />
              {food.allergenName || "Allergen"}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${chokingColor(
              food.chokingRisk
            )}`}
          >
            <Flame size={10} />
            {food.chokingRisk} risk
          </span>
        </span>
      </span>
      {onToggleFavorite && (
        <button
          aria-label="Toggle favorite"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(food);
          }}
          className={`pressable flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isFavorite ? "bg-coral-500 text-white" : "bg-cream-100 text-cocoa-400"
          }`}
        >
          <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      )}
    </Link>
  );
}
