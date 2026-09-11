"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MiniMarkdown } from "@/lib/mini-markdown";

interface Guide {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  emoji: string;
  imageUrl: string | null;
  content: string;
}

export default function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [others, setOthers] = useState<Guide[]>([]);

  useEffect(() => {
    fetch(`/api/guides/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setGuide)
      .catch(() => {});
    fetch("/api/guides")
      .then((r) => r.json())
      .then((rows: Guide[]) => setOthers(rows.filter((g) => g.slug !== slug).slice(0, 3)))
      .catch(() => {});
  }, [slug]);

  if (!guide) {
    return (
      <AppShell>
        <div className="flex flex-col items-center px-4 pt-24 text-center">
          <p className="animate-float-soft text-6xl">📚</p>
          <p className="mt-3 text-sm font-extrabold text-cocoa-500">Loading guide…</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="relative">
        {guide.imageUrl ? (
          <img src={guide.imageUrl} alt={guide.title} className="h-56 w-full object-cover" />
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-coral-500 via-coral-600 to-cocoa-900 text-6xl">
            {guide.emoji}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="pressable absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-cocoa-900"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute right-4 bottom-4 left-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black tracking-wide text-coral-700 uppercase">
              {guide.category}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-extrabold text-white">
              <Clock size={11} /> {guide.readMinutes} min read
            </span>
          </div>
          <h1 className="mt-2 text-[24px] leading-tight font-black text-white">{guide.title}</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="card-shadow rounded-3xl bg-white p-5">
          <MiniMarkdown text={guide.content} />
        </div>

        <div className="mt-4 rounded-3xl bg-sun-200 p-4">
          <p className="text-[13px] leading-relaxed font-bold text-cocoa-700">
            ⚕️ This guide is for education only and isn&apos;t medical advice. Always follow your
            pediatrician&apos;s guidance — especially for allergies, growth, or feeding concerns.
          </p>
        </div>

        {others.length > 0 && (
          <>
            <h2 className="mt-6 text-base font-black text-cocoa-900">Keep learning</h2>
            <div className="mt-2.5 space-y-2.5 pb-4">
              {others.map((g) => (
                <Link
                  key={g.id}
                  href={`/guides/${g.slug}`}
                  className="pressable card-shadow flex items-center gap-3 rounded-3xl bg-white p-3"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-2xl">
                    {g.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold text-cocoa-900">{g.title}</span>
                    <span className="block text-xs font-bold text-cocoa-500">
                      {g.category} · {g.readMinutes} min
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
