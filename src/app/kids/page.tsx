"use client";

import { useEffect, useState } from "react";
import { BellPlus, Check, Pencil, Plus, Share, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import type { ChildItem } from "@/components/ChildPicker";
import { ageLabel, useActiveChildId } from "@/lib/child-store";

const AVATARS = ["👶", "👧", "👦", "🧒", "👩‍🍼", "🐰", "🐻", "🦊", "🐼", "🐨"];

export default function KidsPage() {
  const [activeId, setActiveId] = useActiveChildId();
  const [kids, setKids] = useState<ChildItem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ChildItem | null>(null);
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [avatar, setAvatar] = useState("👶");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [installEvt, setInstallEvt] = useState<Event | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    fetch("/api/children").then((r) => r.json()).then(setKids).catch(() => {});
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function openAdd() {
    setEditing(null);
    setName("");
    setBirthdate("");
    setAvatar("👶");
    setFormOpen(true);
  }

  function openEdit(k: ChildItem) {
    setEditing(k);
    setName(k.name);
    setBirthdate(k.birthdate ?? "");
    setAvatar(k.avatarEmoji ?? "👶");
    setFormOpen(true);
  }

  async function save() {
    if (!name.trim()) return;
    const payload = { name: name.trim(), birthdate: birthdate || null, avatarEmoji: avatar };
    if (editing) {
      const res = await fetch(`/api/children/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setKids((s) => s.map((k) => (k.id === updated.id ? updated : k)));
      }
    } else {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setKids((s) => [...s, created]);
        setActiveId(created.id);
      }
    }
    setFormOpen(false);
  }

  async function remove(id: number) {
    await fetch(`/api/children/${id}`, { method: "DELETE" });
    setKids((s) => s.filter((k) => k.id !== id));
    if (activeId === id) {
      const rest = kids.filter((k) => k.id !== id);
      setActiveId(rest.length > 0 ? rest[0].id : null);
    }
    setConfirmDelete(null);
  }

  async function installApp() {
    if (!installEvt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (installEvt as any).prompt();
    setInstallEvt(null);
  }

  return (
    <AppShell>
      <div className="px-4 pt-6">
        <h1 className="text-[22px] font-black text-cocoa-900">Your Kids 👶</h1>
        <p className="text-xs font-bold text-cocoa-500">Profiles, app install & safety</p>

        <div className="mt-4 space-y-2.5">
          {kids.map((k) => (
            <div
              key={k.id}
              className={`card-shadow rounded-3xl bg-white p-4 ${k.id === activeId ? "ring-2 ring-coral-500" : ""}`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveId(k.id)}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cream-100 text-3xl"
                >
                  {k.avatarEmoji || "👶"}
                </button>
                <button onClick={() => setActiveId(k.id)} className="min-w-0 flex-1 text-left">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[16px] font-black text-cocoa-900">{k.name}</span>
                    {k.id === activeId && (
                      <span className="flex items-center gap-0.5 rounded-full bg-leaf-100 px-2 py-0.5 text-[10px] font-black text-leaf-700">
                        <Check size={10} /> Active
                      </span>
                    )}
                  </span>
                  <span className="block text-xs font-bold text-cocoa-500">
                    {ageLabel(k.birthdate)}
                    {k.birthdate ? ` · Born ${new Date(k.birthdate + "T12:00:00").toLocaleDateString()}` : ""}
                  </span>
                </button>
                <button
                  onClick={() => openEdit(k)}
                  aria-label="Edit child"
                  className="pressable flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-cocoa-500"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => (confirmDelete === k.id ? remove(k.id) : setConfirmDelete(k.id))}
                  aria-label="Delete child"
                  className={`pressable flex h-9 shrink-0 items-center justify-center rounded-full px-2.5 text-xs font-black ${
                    confirmDelete === k.id ? "bg-berry-500 text-white" : "bg-cream-100 text-cocoa-400"
                  }`}
                >
                  {confirmDelete === k.id ? "Sure?" : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={openAdd}
            className="pressable flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-cocoa-400/40 bg-white/60 py-4 text-sm font-black text-cocoa-700"
          >
            <Plus size={18} /> Add a child
          </button>
        </div>

        {/* Install */}
        <div className="card-shadow mt-6 overflow-hidden rounded-3xl bg-white">
          <div className="bg-gradient-to-r from-coral-500 to-coral-600 p-4 text-white">
            <p className="flex items-center gap-2 text-[15px] font-black">
              <BellPlus size={18} /> Install LittleBites on your phone
            </p>
            <p className="mt-0.5 text-xs font-bold text-white/85">
              Works on iPhone & Android · Opens full-screen like a real app
            </p>
          </div>
          <div className="space-y-3 p-4">
            {installEvt && (
              <button
                onClick={installApp}
                className="pressable w-full rounded-2xl bg-coral-500 py-3.5 text-sm font-black text-white"
              >
                ⬇️ Install now (one tap)
              </button>
            )}
            {installed && (
              <p className="rounded-2xl bg-leaf-100 p-3 text-center text-[13px] font-extrabold text-leaf-700">
                ✅ Running as an installed app — nice!
              </p>
            )}
            <div className="rounded-2xl bg-cream-100 p-3.5">
              <p className="flex items-center gap-1.5 text-[13px] font-black text-cocoa-900">
                🍎 iPhone (Safari)
              </p>
              <ol className="mt-1.5 space-y-1 text-[13px] font-semibold text-cocoa-700">
                <li>1. Tap the <Share size={12} className="inline" /> Share button in Safari</li>
                <li>2. Scroll down → tap <b>Add to Home Screen</b></li>
                <li>3. Tap <b>Add</b> — find LittleBites on your home screen!</li>
              </ol>
            </div>
            <div className="rounded-2xl bg-cream-100 p-3.5">
              <p className="text-[13px] font-black text-cocoa-900">🤖 Android (Chrome)</p>
              <ol className="mt-1.5 space-y-1 text-[13px] font-semibold text-cocoa-700">
                <li>1. Tap the <b>⋮</b> menu in Chrome</li>
                <li>2. Tap <b>Add to Home screen</b> or <b>Install app</b></li>
                <li>3. Confirm — LittleBites launches full-screen!</li>
              </ol>
            </div>
            <a
              href="/install"
              className="pressable flex items-center justify-center gap-1.5 rounded-2xl bg-cocoa-900 py-3 text-sm font-black text-white"
            >
              📲 Full install guide + QR code →
            </a>
          </div>
        </div>

        {/* Learn */}
        <a
          href="/guides"
          className="pressable card-shadow mt-4 flex items-center gap-3 rounded-3xl bg-white p-4"
        >
          <span className="text-2xl">📚</span>
          <span className="flex-1">
            <span className="block text-sm font-extrabold text-cocoa-900">Learning guides</span>
            <span className="block text-xs font-bold text-cocoa-500">
              Solids 101, choking safety, allergens, iron & more
            </span>
          </span>
          <span className="text-cocoa-400">→</span>
        </a>

        {/* Safety */}
        <div className="mt-4 rounded-3xl bg-cocoa-900 p-4">
          <p className="text-sm font-black text-white">⚕️ Safety promise</p>
          <ul className="mt-2 space-y-1.5 text-[13px] font-semibold text-white/80">
            <li>· Always supervise your baby while eating — no exceptions.</li>
            <li>· Never serve honey before 12 months (botulism risk).</li>
            <li>· No whole grapes, nuts, or popcorn before age 4.</li>
            <li>· This app educates but never replaces your pediatrician.</li>
            <li>· Take an infant CPR & choking class before starting solids.</li>
          </ul>
        </div>
        <p className="mt-4 mb-2 text-center text-[11px] font-bold text-cocoa-400">
          LittleBites v1.0 · Made with 💛 for little eaters
        </p>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-cocoa-900/50" onClick={() => setFormOpen(false)} />
          <div className="animate-pop-in relative w-full max-w-[480px] rounded-t-[28px] bg-cream-50 p-5 pb-8 sm:rounded-[28px]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-cocoa-900">
                {editing ? "Edit profile" : "Add a child"}
              </h2>
              <button
                onClick={() => setFormOpen(false)}
                aria-label="Close"
                className="pressable flex h-8 w-8 items-center justify-center rounded-full bg-cream-200 text-cocoa-700"
              >
                <X size={18} />
              </button>
            </div>
            <label className="text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">Avatar</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`pressable flex h-11 w-11 items-center justify-center rounded-2xl text-2xl ${
                    avatar === a ? "bg-cocoa-900" : "card-shadow bg-white"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mia"
              className="card-shadow mt-1.5 w-full rounded-2xl bg-white p-3.5 font-bold text-cocoa-900 outline-none placeholder:text-cocoa-400"
            />
            <label className="mt-4 block text-xs font-extrabold tracking-wide text-cocoa-500 uppercase">
              Birthdate
            </label>
            <input
              type="date"
              value={birthdate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setBirthdate(e.target.value)}
              className="card-shadow mt-1.5 w-full rounded-2xl bg-white p-3.5 font-bold text-cocoa-900 outline-none"
            />
            <button
              onClick={save}
              disabled={!name.trim()}
              className="pressable mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-coral-500 py-4 text-base font-black text-white disabled:opacity-40"
            >
              <Check size={20} /> {editing ? "Save changes" : "Add child"}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
