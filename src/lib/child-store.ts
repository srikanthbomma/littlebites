"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "littlebites:activeChildId";
const EVENT = "littlebites:active-child-changed";

export function getActiveChildId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function setActiveChildId(id: number | null) {
  if (typeof window === "undefined") return;
  if (id === null) window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, String(id));
  window.dispatchEvent(new Event(EVENT));
}

export function useActiveChildId(): [number | null, (id: number | null) => void] {
  const [id, setId] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setId(getActiveChildId());
    setReady(true);
    const onChange = () => setId(getActiveChildId());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const update = useCallback((next: number | null) => {
    setActiveChildId(next);
    setId(next);
  }, []);

  return [ready ? id : null, update];
}

export function ageInMonths(birthdate: string | null | undefined): number | null {
  if (!birthdate) return null;
  const b = new Date(birthdate);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  return Math.max(0, months);
}

export function ageLabel(birthdate: string | null | undefined): string {
  const m = ageInMonths(birthdate);
  if (m === null) return "Age not set";
  if (m < 1) {
    const b = new Date(birthdate as string);
    const days = Math.max(0, Math.floor((Date.now() - b.getTime()) / 86400000));
    return `${days}d old`;
  }
  if (m < 24) return `${m} mo old`;
  const y = Math.floor(m / 12);
  const rem = m % 12;
  return rem === 0 ? `${y} yr old` : `${y}y ${rem}mo`;
}
