/* PROBLAB — exploration journal (localStorage-backed) */
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type JournalKind = "prediction" | "finding" | "note";

export type JournalEntry = {
  id: string;
  ts: number;
  exp: string | null; // slug or null = general
  kind: JournalKind;
  text: string;
};

export type JournalDraft = { exp: string; kind: JournalKind; text: string };

type JournalCtx = {
  entries: JournalEntry[];
  hydrated: boolean;
  add: (e: { exp: string | null; kind: JournalKind; text: string }) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  drawerOpen: boolean;
  openDrawer: (prefill?: { exp?: string | null; kind?: JournalKind; text?: string }) => void;
  closeDrawer: () => void;
  draft: JournalDraft;
  setDraft: React.Dispatch<React.SetStateAction<JournalDraft>>;
};

const KEY = "problab.journal.v1";

const Ctx = createContext<JournalCtx | null>(null);

function load(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e) => e && typeof e.id === "string" && typeof e.text === "string"
    ) as JournalEntry[];
  } catch {
    return [];
  }
}

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<JournalDraft>({ exp: "", kind: "prediction", text: "" });
  const uid = useRef(0);

  useEffect(() => {
    // hydrate from localStorage (external system) once on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(load());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: JournalEntry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next.slice(0, 500)));
    } catch {
      /* storage full — keep in memory */
    }
  }, []);

  const add = useCallback(
    (e: { exp: string | null; kind: JournalKind; text: string }) => {
      const text = e.text.trim();
      if (!text) return;
      const entry: JournalEntry = {
        id: `${Date.now().toString(36)}-${uid.current++}`,
        ts: Date.now(),
        exp: e.exp,
        kind: e.kind,
        text,
      };
      persist([entry, ...entries]);
    },
    [entries, persist]
  );

  const remove = useCallback(
    (id: string) => persist(entries.filter((e) => e.id !== id)),
    [entries, persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  const openDrawer = useCallback(
    (p?: { exp?: string | null; kind?: JournalKind; text?: string }) => {
      if (p) {
        setDraft({ exp: p.exp ?? "", kind: p.kind ?? "prediction", text: p.text ?? "" });
      }
      setDrawerOpen(true);
    },
    []
  );

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<JournalCtx>(
    () => ({
      entries,
      hydrated,
      add,
      remove,
      clear,
      count: entries.length,
      drawerOpen,
      openDrawer,
      closeDrawer,
      draft,
      setDraft,
    }),
    [entries, hydrated, add, remove, clear, drawerOpen, openDrawer, closeDrawer, draft]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useJournal(): JournalCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useJournal must be used inside JournalProvider");
  return ctx;
}

/* date formatting without extra deps */
export function jdate(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
