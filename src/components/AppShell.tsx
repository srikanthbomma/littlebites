"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Home, NotebookPen, Search, Sparkles, Users } from "lucide-react";
import type { ReactNode } from "react";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/foods", label: "Foods", icon: Search },
  { href: "/recipes", label: "Recipes", icon: ChefHat },
  { href: "/diary", label: "Diary", icon: NotebookPen },
  { href: "/ai", label: "AI Guide", icon: Sparkles },
  { href: "/kids", label: "Kids", icon: Users },
];

function isActive(path: string, href: string) {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(href + "/");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-dvh bg-cream-100 sm:bg-cocoa-900 sm:bg-[radial-gradient(circle_at_20%_10%,#f0562a33,transparent_50%),radial-gradient(circle_at_80%_90%,#ffc53d2e,transparent_50%)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-cream-100 sm:my-0 sm:min-h-dvh sm:shadow-[0_0_60px_rgba(0,0,0,0.45)]">
        <main className="flex-1 pb-28">{children}</main>
        <nav className="pb-safe fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-cream-200 bg-white/95 backdrop-blur-md">
          <div className="grid grid-cols-6 px-1 pt-2 pb-2">
            {TABS.map((t) => {
              const active = isActive(pathname, t.href);
              const Icon = t.icon;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`pressable flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-extrabold ${
                    active ? "text-coral-600" : "text-cocoa-400"
                  }`}
                >
                  <span
                    className={`flex h-8 w-10 items-center justify-center rounded-full ${
                      active ? "bg-coral-100" : ""
                    }`}
                  >
                    <Icon size={21} strokeWidth={active ? 2.6 : 2.2} />
                  </span>
                  {t.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
