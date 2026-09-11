"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";

interface GuideItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  emoji: string;
  imageUrl: string | null;
}

const CATS = ["All", "Getting Started", "Safety", "Allergens", "Nutrition", "Practical"];

export default function GuidesPage() {
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [cat, setCat] = useState("All");

  useEffect(() => {
    fetch("/api/guides").then((r) => r.json()).then(setGuides).catch(() => {});
  }, []);

  const visible = cat === "All" ? guides : guides.filter((g) => g.category === cat);

  return (
    <AppShell>
      <div className="px-4 pt-6">
        <h1 className="text-[22px] font-black text-cocoa-900">Learn 📚</h1>
        <p className="text-xs font-bold text-cocoa-500">Evidence-based guides for confident feeding</p>

        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`pressable shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold ${
                cat === c ? "bg-cocoa-900 text-white" : "card-shadow bg-white text-cocoa-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-3 space-y-3 pb-4">
          {visible.map((g) => (
            <Link
              key={g.id}
              href={`/guides/${g.slug}`}
              className="pressable card-shadow block overflow-hidden rounded-3xl bg-white"
            >
              {g.imageUrl ? (
                <img src={g.imageUrl} alt={g.title} className="h-36 w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-coral-100 via-cream-200 to-sun-200 text-5xl">
                  {g.emoji}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-leaf-100 px-2.5 py-1 text-[10px] font-black tracking-wide text-leaf-700 uppercase">
                    {g.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-cocoa-400">
                    <Clock size={11} /> {g.readMinutes} min
                  </span>
                </div>
                <p className="mt-2 text-[16px] leading-snug font-black text-cocoa-900">{g.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed font-semibold text-cocoa-500">{g.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
