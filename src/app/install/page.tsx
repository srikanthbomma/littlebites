"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import {
  ArrowLeft,
  BellPlus,
  Camera,
  Check,
  Copy,
  Globe,
  Link2,
  MonitorSmartphone,
  Share,
  Trash2,
  WifiOff,
  Store,
  RefreshCw,
  Database,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";

export default function InstallPage() {
  const [appUrl, setAppUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [installEvt, setInstallEvt] = useState<Event | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setAppUrl(window.location.origin + "/");
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(appUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = appUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareLink() {
    try {
      await navigator.share({ title: "LittleBites", text: "Install LittleBites on your phone:", url: appUrl });
    } catch {
      /* user cancelled */
    }
  }

  async function installNow() {
    if (!installEvt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (installEvt as any).prompt();
    setInstallEvt(null);
  }

  return (
    <AppShell>
      <div className="px-4 pt-6">
        <Link
          href="/kids"
          className="pressable inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-extrabold text-cocoa-700 card-shadow"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <h1 className="mt-3 text-[24px] font-black text-cocoa-900">Install LittleBites 📲</h1>
        <p className="text-xs font-bold text-cocoa-500">
          Free · No App Store needed · Works on iPhone & Android · ~30 seconds
        </p>

        {/* Status / one-tap */}
        {installed ? (
          <div className="card-shadow mt-4 rounded-3xl bg-leaf-600 p-4 text-white">
            <p className="flex items-center gap-2 text-sm font-black">
              <Check size={18} /> You&apos;re running the installed app!
            </p>
            <p className="mt-1 text-xs font-bold text-white/85">
              Full-screen mode is active. To install on another phone, scan the QR code below with it.
            </p>
          </div>
        ) : installEvt ? (
          <div className="card-shadow mt-4 rounded-3xl bg-cocoa-900 p-4 text-white">
            <p className="flex items-center gap-2 text-sm font-black">
              <BellPlus size={18} /> One-tap install available
            </p>
            <p className="mt-1 text-xs font-bold text-white/70">
              Your browser supports direct installation on this device.
            </p>
            <button
              onClick={installNow}
              className="pressable mt-3 w-full rounded-2xl bg-coral-500 py-3.5 text-sm font-black text-white"
            >
              ⬇️ Install LittleBites now
            </button>
          </div>
        ) : null}

        {/* Step 0: get link on phone */}
        <div className="card-shadow mt-4 rounded-3xl bg-white p-4">
          <p className="flex items-center gap-1.5 text-sm font-black text-cocoa-900">
            <MonitorSmartphone size={17} className="text-coral-500" /> Step 0 — Open this app on your phone
          </p>
          <p className="mt-1 text-[13px] font-semibold text-cocoa-500">
            On your computer now? Point your phone&apos;s camera at the QR code. On your phone already? Skip to Step 1 below.
          </p>
          <div className="mt-3 flex items-center gap-4">
            <div className="rounded-2xl border-2 border-cream-200 bg-white p-2.5">
              {appUrl ? (
                <QRCode value={appUrl} size={120} fgColor="#33241a" />
              ) : (
                <div className="flex h-[120px] w-[120px] items-center justify-center text-3xl">📷</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-[11px] font-black tracking-widest text-cocoa-400 uppercase">
                <Camera size={12} /> Scan with phone camera
              </p>
              <p className="mt-1 truncate text-[12px] font-bold text-cocoa-500">{appUrl || "Loading link…"}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={copyLink}
                  disabled={!appUrl}
                  className="pressable flex flex-1 items-center justify-center gap-1 rounded-2xl bg-cream-100 py-2.5 text-xs font-black text-cocoa-700 disabled:opacity-40"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
                {canShare && (
                  <button
                    onClick={shareLink}
                    className="pressable flex flex-1 items-center justify-center gap-1 rounded-2xl bg-cocoa-900 py-2.5 text-xs font-black text-white"
                  >
                    <Share size={14} /> Send to phone
                  </button>
                )}
              </div>
            </div>
          </div>
          <p className="mt-2.5 rounded-2xl bg-cream-100 p-2.5 text-[12px] font-semibold text-cocoa-500">
            💡 Other ways to transfer: AirDrop / Nearby Share the link to yourself, email or WhatsApp it to yourself, or just type the address into your phone&apos;s browser.
          </p>
        </div>

        {/* iPhone */}
        <div className="card-shadow mt-4 overflow-hidden rounded-3xl bg-white">
          <div className="bg-gradient-to-r from-cocoa-900 to-cocoa-700 p-4 text-white">
            <p className="text-[15px] font-black">🍎 Install on iPhone (Safari)</p>
            <p className="mt-0.5 text-xs font-bold text-white/70">Must be done in Safari — not Chrome or in-app browsers</p>
          </div>
          <ol className="space-y-3 p-4">
            {[
              { icon: <Globe size={18} />, title: "Open the link in Safari", text: "Tap the QR code link or paste the address into Safari (the blue compass app). Wait for LittleBites to fully load." },
              { icon: <Share size={18} />, title: "Tap the Share button", text: "Tap the Share icon — the square with an arrow pointing up — at the bottom (iPhone) or top (iPad) of Safari." },
              { icon: <span className="text-lg">➕</span>, title: 'Tap "Add to Home Screen"', text: "Scroll down the share menu if needed, then tap Add to Home Screen. You can rename it to “LittleBites”." },
              { icon: <Check size={18} />, title: 'Tap "Add" (top-right)', text: "The LittleBites icon appears on your home screen. Tap it — the app opens full-screen, just like a store app!" },
            ].map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-coral-100 text-coral-600">
                  {s.icon}
                </span>
                <span>
                  <span className="block text-sm font-black text-cocoa-900">
                    {i + 1}. {s.title}
                  </span>
                  <span className="block text-[13px] leading-relaxed font-semibold text-cocoa-500">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Android */}
        <div className="card-shadow mt-4 overflow-hidden rounded-3xl bg-white">
          <div className="bg-gradient-to-r from-leaf-600 to-leaf-700 p-4 text-white">
            <p className="text-[15px] font-black">🤖 Install on Android (Chrome)</p>
            <p className="mt-0.5 text-xs font-bold text-white/70">Use Google Chrome for the smoothest install</p>
          </div>
          <ol className="space-y-3 p-4">
            {[
              { icon: <Globe size={18} />, title: "Open the link in Chrome", text: "Tap the QR code link or paste the address into Chrome. Wait for LittleBites to fully load." },
              { icon: <span className="text-lg font-black">⋮</span>, title: "Tap the ⋮ menu", text: "Tap the three-dot menu in the top-right corner of Chrome." },
              { icon: <BellPlus size={18} />, title: 'Tap "Install app" or "Add to Home screen"', text: "On newer Chrome choose Install app → Install. On older versions choose Add to Home screen → Add." },
              { icon: <Check size={18} />, title: "Find it on your home screen", text: "The LittleBites icon appears alongside your other apps and in the app drawer. It launches full-screen!" },
            ].map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-700">
                  {s.icon}
                </span>
                <span>
                  <span className="block text-sm font-black text-cocoa-900">
                    {i + 1}. {s.title}
                  </span>
                  <span className="block text-[13px] leading-relaxed font-semibold text-cocoa-500">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* FAQ */}
        <h2 className="mt-6 text-base font-black text-cocoa-900">Questions & fixes 🔧</h2>
        <div className="mt-2.5 space-y-2.5 pb-4">
          {[
            { icon: <Store size={17} />, q: "Is it in the App Store / Play Store?", a: "No need! LittleBites is a web app (PWA) that installs straight from the browser. No store, no download size, no account — and updates happen automatically." },
            { icon: <Share size={17} />, q: "“Add to Home Screen” is missing on iPhone", a: "You must use Safari (not Chrome, WhatsApp, or Facebook browser). Open the link in Safari, tap Share, then scroll down — it's there. On older iOS, tap “Edit Actions…” at the bottom and enable it." },
            { icon: <BellPlus size={17} />, q: "No “Install app” option on Android", a: "Use Chrome (not Samsung Internet or Firefox), make sure the page fully loaded over https, then look for “Add to Home screen” in the ⋮ menu instead — it does the same thing." },
            { icon: <Database size={17} />, q: "Will my kids & logs appear on my phone?", a: "Yes — profiles, meal logs, tracker data and allergen progress live in the app's database, so everything shows up on any device opening the same app link." },
            { icon: <RefreshCw size={17} />, q: "How do updates work?", a: "Automatically. Just open the app with internet and you always have the newest version — nothing to download ever." },
            { icon: <WifiOff size={17} />, q: "Does it work offline?", a: "The app shell opens offline, but foods, recipes and the AI need internet since they come from the live database. Your logged data syncs when you're back online." },
            { icon: <Trash2 size={17} />, q: "How do I uninstall?", a: "Exactly like any app: long-press the LittleBites icon → Remove App (iPhone) or Uninstall (Android)." },
            { icon: <Link2 size={17} />, q: "Can I install on both phones / tablets?", a: "Absolutely — repeat the same steps on each device. Everyone in the family can use it; just open the same link." },
          ].map((f, i) => (
            <div key={i} className="card-shadow rounded-3xl bg-white p-4">
              <p className="flex items-center gap-2 text-[13px] font-black text-cocoa-900">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-cocoa-700">
                  {f.icon}
                </span>
                {f.q}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed font-semibold text-cocoa-500">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
