"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { ageLabel } from "@/lib/child-store";

export interface ChildItem {
  id: number;
  name: string;
  birthdate: string | null;
  avatarEmoji: string | null;
}

export function ChildPicker({
  children,
  activeId,
  onSelect,
  compact,
}: {
  children: ChildItem[];
  activeId: number | null;
  onSelect: (id: number) => void;
  compact?: boolean;
}) {
  if (children.length === 0) {
    return (
      <Link
        href="/kids"
        className="pressable card-shadow flex items-center gap-3 rounded-3xl bg-white p-4"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-coral-100 text-2xl">
          👶
        </span>
        <span className="flex-1">
          <span className="block text-sm font-extrabold text-cocoa-900">Add your little one</span>
          <span className="block text-xs font-bold text-cocoa-500">
            Track foods, allergens & milestones
          </span>
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral-500 text-white">
          <Plus size={18} />
        </span>
      </Link>
    );
  }
  return (
    <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
      {children.map((c) => {
        const active = c.id === activeId;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`pressable flex shrink-0 items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 text-left ${
              active ? "bg-cocoa-900 text-white" : "card-shadow bg-white text-cocoa-900"
            }`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xl ${
                active ? "bg-white/15" : "bg-cream-100"
              }`}
            >
              {c.avatarEmoji || "👶"}
            </span>
            <span>
              <span className="block text-sm leading-tight font-extrabold">{c.name}</span>
              {!compact && (
                <span
                  className={`block text-[11px] leading-tight font-bold ${
                    active ? "text-white/70" : "text-cocoa-500"
                  }`}
                >
                  {ageLabel(c.birthdate)}
                </span>
              )}
            </span>
          </button>
        );
      })}
      <Link
        href="/kids"
        aria-label="Manage kids"
        className="pressable card-shadow flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white text-cocoa-500"
      >
        <Plus size={20} />
      </Link>
    </div>
  );
}
