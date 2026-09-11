"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Send,
  ShieldAlert,
  Sparkles,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ChildPicker, type ChildItem } from "@/components/ChildPicker";
import { getActiveChildId, useActiveChildId } from "@/lib/child-store";

interface AiAnswerMsg {
  verdict: "safe" | "caution" | "avoid" | "info";
  title: string;
  summary: string;
  bullets: string[];
  prep?: string;
  texture?: string;
  allergenNote?: string | null;
  triedNote?: string | null;
  doctorBox: "none" | "mild" | "urgent";
  links: { label: string; href: string }[];
  followUps: string[];
  matchedKey?: string | null;
}

interface ChatMsg {
  id: number;
  role: "user" | "ai";
  text?: string;
  answer?: AiAnswerMsg;
}

interface SuggestionBuckets {
  tryNext: Pick[];
  newIndian: Pick[];
  worldCuisines: { country: string; cuisine: string; flag: string; picks: Pick[] }[];
  similarToLiked: Pick[];
  unexplored: { group: string; picks: Pick[] }[];
  ironRich: Pick[];
  allergensPending: { allergen: string; emoji: string; howTo: string; href: string }[];
  recipeIdeas: { recipe: Pick; coverage: string; missing: string[] }[];
  combos: { title: string; detail: string; href?: string }[];
}

interface Pick {
  key: string;
  kind: string;
  name: string;
  emoji: string;
  reason: string;
  href: string;
  ageText: string;
  country?: string;
  cuisine?: string;
}

const QUICK = [
  "Can my baby eat mango?",
  "What should we try next?",
  "What Indian foods next?",
  "Italian foods?",
  "Japanese foods?",
  "World food tour?",
  "What should we avoid?",
  "Which allergens are left?",
  "Iron-rich ideas?",
];

const VERDICT_STYLE: Record<string, { bar: string; badge: string; icon: typeof CheckCircle2 }> = {
  safe: { bar: "bg-leaf-500", badge: "bg-leaf-100 text-leaf-700", icon: CheckCircle2 },
  caution: { bar: "bg-sun-400", badge: "bg-sun-200 text-cocoa-700", icon: AlertTriangle },
  avoid: { bar: "bg-berry-500", badge: "bg-berry-100 text-berry-600", icon: XCircle },
  info: { bar: "bg-coral-500", badge: "bg-coral-100 text-coral-700", icon: Lightbulb },
};

let msgId = 1;

export default function AiPage() {
  const [activeId, setActiveId] = useActiveChildId();
  const [kids, setKids] = useState<ChildItem[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [sugg, setSugg] = useState<SuggestionBuckets | null>(null);
  const [babyName, setBabyName] = useState("Baby");
  const bottomRef = useRef<HTMLDivElement>(null);

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
    if (!activeId) {
      setSugg(null);
      return;
    }
    fetch(`/api/ai/suggestions?childId=${activeId}`)
      .then((r) => r.json())
      .then((d) => {
        setSugg(d);
        setBabyName(d.baby?.name ?? "Baby");
      })
      .catch(() => {});
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || !activeId || asking) return;
    setInput("");
    setMessages((m) => [...m, { id: msgId++, role: "user", text: q }]);
    setAsking(true);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: activeId, question: q, lastKey }),
      });
      const d = await res.json();
      if (d.answer) {
        setMessages((m) => [...m, { id: msgId++, role: "ai", answer: d.answer }]);
        setLastKey(d.answer.matchedKey ?? null);
      }
    } finally {
      setAsking(false);
    }
  }

  function AnswerCard({ a }: { a: AiAnswerMsg }) {
    const v = VERDICT_STYLE[a.verdict];
    const Icon = v.icon;
    return (
      <div className="card-shadow overflow-hidden rounded-3xl bg-white">
        <div className={`h-1.5 ${v.bar}`} />
        <div className="p-4">
          <div className="flex items-start gap-2">
            <Icon size={20} className={`mt-0.5 shrink-0 ${a.verdict === "safe" ? "text-leaf-600" : a.verdict === "caution" ? "text-sun-500" : a.verdict === "avoid" ? "text-berry-600" : "text-coral-600"}`} />
            <p className="text-[15px] leading-snug font-black text-cocoa-900">{a.title}</p>
          </div>
          <p className="mt-2 text-[14px] leading-relaxed font-semibold text-cocoa-700">{a.summary}</p>
          {a.triedNote && (
            <p className="mt-2 rounded-2xl bg-cream-100 p-2.5 text-[13px] font-bold text-cocoa-700">
              📓 {a.triedNote}
            </p>
          )}
          <ul className="mt-2 space-y-1.5">
            {a.bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed font-semibold text-cocoa-700">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-coral-500" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          {a.allergenNote && (
            <p className="mt-2.5 flex items-start gap-1.5 rounded-2xl bg-coral-50 p-2.5 text-[13px] font-bold text-coral-700">
              <ShieldAlert size={15} className="mt-0.5 shrink-0" /> {a.allergenNote}
            </p>
          )}
          {a.prep && (
            <div className="mt-2.5 rounded-2xl bg-leaf-50 p-3">
              <p className="flex items-center gap-1 text-xs font-black text-leaf-700">
                <UtensilsCrossed size={13} /> HOW TO PREPARE
              </p>
              <p className="mt-1 text-[13px] leading-relaxed font-semibold text-cocoa-700">{a.prep}</p>
            </div>
          )}
          {a.doctorBox !== "none" && (
            <div className={`mt-2.5 rounded-2xl p-3 ${a.doctorBox === "urgent" ? "bg-berry-500 text-white" : "bg-sun-200"}`}>
              <p className={`text-[13px] leading-relaxed font-extrabold ${a.doctorBox === "urgent" ? "" : "text-cocoa-700"}`}>
                {a.doctorBox === "urgent"
                  ? "🚨 Call emergency services NOW for breathing trouble, facial swelling, widespread hives, or choking. This app cannot help in an emergency."
                  : "⚕️ When in doubt, call your pediatrician. This guidance is educational — it never replaces professional medical advice."}
              </p>
            </div>
          )}
          {a.links.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {a.links.map((l) => (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  className="pressable rounded-full bg-cocoa-900 px-3 py-1.5 text-[11px] font-black text-white"
                >
                  {l.label} →
                </Link>
              ))}
            </div>
          )}
          {a.followUps.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {a.followUps.map((f) => (
                <button
                  key={f}
                  onClick={() => ask(f)}
                  className="pressable rounded-full border border-cream-200 bg-cream-50 px-3 py-1.5 text-[11px] font-extrabold text-cocoa-700"
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function PickRow({ p }: { p: Pick }) {
    return (
      <Link href={p.href} className="pressable card-shadow flex items-center gap-3 rounded-3xl bg-white p-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-2xl">
          {p.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-extrabold text-cocoa-900">{p.name}</span>
          <span className="block truncate text-[11px] font-bold text-cocoa-500">
            {p.reason} · {p.ageText}
          </span>
        </span>
        <ChevronRight size={16} className="shrink-0 text-cocoa-400" />
      </Link>
    );
  }

  return (
    <AppShell>
      <div className="px-4 pt-6">
        <h1 className="flex items-center gap-1.5 text-[22px] font-black text-cocoa-900">
          AI Food Guide <Sparkles size={20} className="text-coral-500" />
        </h1>
        <p className="text-xs font-bold text-cocoa-500">
          Personalized safety answers from {babyName}&apos;s age, tastes & history
        </p>

        <div className="mt-3">
          <ChildPicker children={kids} activeId={activeId} onSelect={setActiveId} />
        </div>

        {!activeId ? (
          <div className="card-shadow mt-6 rounded-3xl bg-white p-8 text-center">
            <p className="text-4xl">✨</p>
            <p className="mt-2 text-sm font-black text-cocoa-900">Add your little one to unlock the AI Guide</p>
            <Link
              href="/kids"
              className="pressable mt-3 inline-block rounded-2xl bg-coral-500 px-6 py-3 text-sm font-black text-white"
            >
              Add a child
            </Link>
          </div>
        ) : (
          <>
            {/* Chat */}
            <div className="mt-4 space-y-3">
              {messages.length === 0 && (
                <div className="rounded-3xl bg-cocoa-900 p-4 text-white">
                  <p className="text-sm font-black">👋 Hi! I&apos;m your AI feeding assistant.</p>
                  <p className="mt-1 text-[13px] leading-relaxed font-semibold text-white/80">
                    Ask about ANY food — I&apos;ll check {babyName}&apos;s age, what&apos;s been tried,
                    preferences, reactions & allergens, then give a clear verdict:
                  </p>
                  <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center text-[11px] font-black">
                    <span className="rounded-xl bg-leaf-500/25 px-2 py-2 text-leaf-100">✅ Safe to introduce</span>
                    <span className="rounded-xl bg-sun-400/25 px-2 py-2 text-sun-200">⚠️ With caution</span>
                    <span className="rounded-xl bg-berry-500/30 px-2 py-2 text-berry-100">❌ Avoid for now</span>
                  </div>
                </div>
              )}
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <p className="max-w-[85%] rounded-3xl rounded-br-lg bg-coral-500 px-4 py-2.5 text-[14px] font-bold text-white">
                      {m.text}
                    </p>
                  </div>
                ) : (
                  m.answer && <AnswerCard key={m.id} a={m.answer} />
                )
              )}
              {asking && (
                <div className="card-shadow flex items-center gap-2 rounded-3xl bg-white p-4">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-coral-500" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-coral-500 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-coral-500 [animation-delay:300ms]" />
                  </span>
                  <p className="text-[13px] font-extrabold text-cocoa-500">Checking {babyName}&apos;s history…</p>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
              {QUICK.map((qk) => (
                <button
                  key={qk}
                  onClick={() => ask(qk)}
                  className="pressable card-shadow shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-extrabold text-cocoa-700"
                >
                  {qk}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="sticky bottom-20 z-10 mt-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask(input)}
                placeholder={`Can ${babyName} eat…?`}
                className="card-shadow min-w-0 flex-1 rounded-2xl border-2 border-transparent bg-white px-4 py-3.5 text-[15px] font-bold text-cocoa-900 outline-none placeholder:text-cocoa-400 focus:border-coral-500"
              />
              <button
                onClick={() => ask(input)}
                disabled={!input.trim() || asking}
                aria-label="Ask AI"
                className="pressable flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-coral-500 text-white disabled:opacity-40"
              >
                <Send size={20} />
              </button>
            </div>

            {/* Personalized suggestions */}
            {sugg && (
              <div className="mt-6 pb-4">
                <h2 className="text-base font-black text-cocoa-900">✨ Just for {babyName}</h2>

                {sugg.tryNext.length > 0 && (
                  <>
                    <p className="mt-3 mb-2 text-xs font-black tracking-widest text-cocoa-500 uppercase">🌟 Foods to try next</p>
                    <div className="space-y-2">{sugg.tryNext.map((p) => <PickRow key={p.key} p={p} />)}</div>
                  </>
                )}

                {sugg.newIndian.length > 0 && (
                  <>
                    <p className="mt-4 mb-2 text-xs font-black tracking-widest text-cocoa-500 uppercase">🇮🇳 New Indian foods</p>
                    <div className="space-y-2">{sugg.newIndian.map((p) => <PickRow key={p.key} p={p} />)}</div>
                  </>
                )}

                {sugg.worldCuisines && sugg.worldCuisines.length > 0 && (
                  <>
                    <p className="mt-4 mb-2 text-xs font-black tracking-widest text-cocoa-500 uppercase">🌍 World food tour</p>
                    <div className="space-y-2">
                      {sugg.worldCuisines.slice(0, 6).map((w) => (
                        <div key={w.country} className="card-shadow rounded-3xl bg-white p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[13px] font-black text-cocoa-900">
                              {w.flag} {w.country} <span className="font-bold text-cocoa-400">· {w.cuisine}</span>
                            </p>
                            <Link
                              href={`/recipes?country=${encodeURIComponent(w.country)}`}
                              className="text-[11px] font-black text-coral-600"
                            >
                              All →
                            </Link>
                          </div>
                          <div className="mt-1.5 space-y-1.5">
                            {w.picks.map((p) => (
                              <Link key={p.key} href={p.href} className="pressable flex items-center gap-2 rounded-2xl bg-cream-100 px-3 py-2">
                                <span className="text-xl">{p.emoji}</span>
                                <span className="flex-1 text-[13px] font-extrabold text-cocoa-900">{p.name}</span>
                                <span className="text-[11px] font-bold text-cocoa-500">{p.ageText}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {sugg.combos.length > 0 && (
                  <>
                    <p className="mt-4 mb-2 text-xs font-black tracking-widest text-cocoa-500 uppercase">�� Combos from tried foods</p>
                    <div className="space-y-2">
                      {sugg.combos.map((c) => (
                        <div key={c.title} className="card-shadow rounded-3xl bg-white p-3.5">
                          <p className="text-sm font-black text-cocoa-900">{c.title}</p>
                          <p className="mt-0.5 text-[13px] font-semibold text-cocoa-500">{c.detail}</p>
                          {c.href && (
                            <Link href={c.href} className="mt-1.5 inline-block text-xs font-black text-coral-600">
                              View recipe →
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {sugg.recipeIdeas.length > 0 && (
                  <>
                    <p className="mt-4 mb-2 text-xs font-black tracking-widest text-cocoa-500 uppercase">👩‍🍳 Recipe ideas (you have the ingredients!)</p>
                    <div className="space-y-2">
                      {sugg.recipeIdeas.map((r) => (
                        <Link key={r.recipe.key} href={r.recipe.href} className="pressable card-shadow flex items-center gap-3 rounded-3xl bg-white p-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-2xl">
                            {r.recipe.emoji}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-extrabold text-cocoa-900">{r.recipe.name}</span>
                            <span className="block text-[11px] font-bold text-cocoa-500">
                              {r.coverage}
                              {r.missing.length > 0 ? ` · needs: ${r.missing.join(", ")}` : ""}
                            </span>
                          </span>
                          <ChevronRight size={16} className="shrink-0 text-cocoa-400" />
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {sugg.similarToLiked.length > 0 && (
                  <>
                    <p className="mt-4 mb-2 text-xs font-black tracking-widest text-cocoa-500 uppercase">💛 Similar to liked foods</p>
                    <div className="space-y-2">{sugg.similarToLiked.slice(0, 4).map((p) => <PickRow key={p.key} p={p} />)}</div>
                  </>
                )}

                {sugg.ironRich.length > 0 && (
                  <>
                    <p className="mt-4 mb-2 text-xs font-black tracking-widest text-cocoa-500 uppercase">💪 Iron-rich to introduce</p>
                    <div className="space-y-2">{sugg.ironRich.slice(0, 4).map((p) => <PickRow key={p.key} p={p} />)}</div>
                  </>
                )}

                {sugg.unexplored.length > 0 && (
                  <>
                    <p className="mt-4 mb-2 text-xs font-black tracking-widest text-cocoa-500 uppercase">🗺️ Unexplored categories</p>
                    <div className="space-y-2">
                      {sugg.unexplored.slice(0, 3).map((u) => (
                        <div key={u.group} className="card-shadow rounded-3xl bg-white p-3">
                          <p className="text-[13px] font-black text-cocoa-900">
                            No {u.group.toLowerCase()} yet — start with:
                          </p>
                          <div className="mt-1.5 space-y-1.5">
                            {u.picks.map((p) => (
                              <Link key={p.key} href={p.href} className="pressable flex items-center gap-2 rounded-2xl bg-cream-100 px-3 py-2">
                                <span className="text-xl">{p.emoji}</span>
                                <span className="flex-1 text-[13px] font-extrabold text-cocoa-900">{p.name}</span>
                                <span className="text-[11px] font-bold text-cocoa-500">{p.ageText}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {sugg.allergensPending.length > 0 && (
                  <>
                    <p className="mt-4 mb-2 text-xs font-black tracking-widest text-cocoa-500 uppercase">🛡️ Allergens still to introduce</p>
                    <div className="space-y-2">
                      {sugg.allergensPending.map((a) => (
                        <Link key={a.allergen} href={a.href} className="pressable card-shadow flex items-center gap-3 rounded-3xl bg-white p-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-2xl">
                            {a.emoji}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-extrabold text-cocoa-900">{a.allergen}</span>
                            <span className="block truncate text-[11px] font-bold text-cocoa-500">{a.howTo}</span>
                          </span>
                          <ChevronRight size={16} className="shrink-0 text-cocoa-400" />
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Safety footer */}
            <div className="mt-2 mb-4 rounded-3xl bg-sun-200 p-4">
              <p className="text-[12px] leading-relaxed font-bold text-cocoa-700">
                ⚕️ The AI Guide offers general food information, not medical advice. For rashes,
                swelling, breathing trouble, vomiting, choking, or any worrying symptom, contact
                your pediatrician or emergency services immediately.
              </p>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
