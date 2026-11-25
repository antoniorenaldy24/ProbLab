/* PROBLAB — global chrome: nav, specimen index overlay, journal drawer, footer, cursor */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EXPERIMENTS } from "@/lib/problab/core";
import { jdate, useJournal, type JournalKind } from "@/lib/problab/journal";
import { Glyph, LabLink } from "./kit";
import { Btn } from "./kit";
import { Float, RisingLetters, ScrollProgress } from "./motionkit";

/* ---------------- NAV ---------------- */

export function Nav({ route }: { route: string }) {
  const [idxOpen, setIdxOpen] = useState(false);
  const j = useJournal();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIdxOpen(false);
      if (e.key.toLowerCase() === "i" && !j.drawerOpen && (e.target as HTMLElement)?.tagName !== "INPUT" && (e.target as HTMLElement)?.tagName !== "TEXTAREA") {
        setIdxOpen((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [j.drawerOpen]);

  return (
    <>
      <ScrollProgress />
      <header className="sticky top-0 z-50 bg-paper border-b-[1.5px] border-ink">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3 px-4 md:px-8 h-14">
          <LabLink to="" className="flex items-center gap-3 min-w-0 group">
            <motion.span
              className="font-extrabold tracking-tight text-[1.3rem] leading-none"
              style={{
                background: "linear-gradient(100deg, #8fb5ff, #a88bff 45%, #f78cab)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
              whileHover={{ scale: 1.06, rotate: -1.5 }}
              transition={{ type: "spring", stiffness: 320, damping: 12 }}
            >
              PROBLAB
            </motion.span>
            <span className="mono-label opacity-60 hidden sm:inline truncate">
              LAB LAPANGAN KEACAKAN{route !== "" ? ` / ${route.toUpperCase()}` : ""}
            </span>
          </LabLink>
          <nav className="flex items-center gap-2" aria-label="Navigasi utama">
            <button data-hot className="btn btn-sm" onClick={() => setIdxOpen(true)}>
              INDEKS <span className="hidden sm:inline opacity-60">[I]</span>
            </button>
            <Btn size="sm" variant="sun" onClick={() => j.openDrawer()}>
              Jurnal {j.count > 0 && <span className="mono-data">({j.count})</span>}
            </Btn>
          </nav>
        </div>
      </header>
      <IndexOverlay open={idxOpen} onClose={() => setIdxOpen(false)} />
    </>
  );
}

/* ---------------- SPECIMEN INDEX (full-screen) ---------------- */

export function IndexOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[80] overflow-y-auto"
      style={{ background: "var(--ink)", color: "var(--paper)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Indeks spesimen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8 min-h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="mono-label opacity-60 mb-2">PROBLAB — KATALOG SPESIMEN</div>
            <h2 className="font-extrabold tracking-tight leading-none text-[clamp(2.4rem,7vw,5rem)]">
              <span className="serif-accent" style={{ color: "var(--butter)" }}>Indeks</span>-
              <span>nya.</span>
            </h2>
          </div>
          <button data-hot className="btn btn-sun btn-sm shrink-0" onClick={onClose} aria-label="Tutup indeks">
            TUTUP ✕
          </button>
        </div>

        <div style={{ color: "var(--paper)" }}>
          {EXPERIMENTS.map((e, i) => (
            <motion.a
              key={e.slug}
              href={`#/${e.slug}`}
              data-hot
              onClick={onClose}
              className="idx-row group"
              style={{ borderColor: "rgba(252,251,255,0.35)" }}
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.35, ease: [0.22, 0.8, 0.3, 1] }}
              whileHover={{ x: 8 }}
            >
              <span className="mono-data text-[13px] opacity-60">Nº{e.no}</span>
              <span className="hidden md:block opacity-80 group-hover:opacity-100">
                <Glyph kind={e.glyph} w={54} />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-[clamp(1.4rem,3.6vw,2.6rem)] leading-none tracking-tight">
                  {e.title}
                </span>
                <span className="block mono-label opacity-60 mt-1.5 normal-case">
                  {e.short} · {e.disciplines.join(" / ")}
                </span>
              </span>
              <span className="idx-arrow mono-data text-xl self-center">↗</span>
            </motion.a>
          ))}
          <div style={{ borderTop: "1.5px solid rgba(252,251,255,0.35)" }} />
        </div>

        <div className="mt-auto pt-10 flex flex-wrap gap-x-8 gap-y-3 items-center">
          <LabLink to="journal" className="mono-label hover:opacity-100 opacity-70 underline underline-offset-4" onClick={onClose}>
            ✎ Jurnal eksplorasi
          </LabLink>
          <LabLink to="about" className="mono-label hover:opacity-100 opacity-70 underline underline-offset-4" onClick={onClose}>
            ⓘ Manifes & kolofon
          </LabLink>
          <span className="mono-label opacity-40 ml-auto">TEKAN [I] ATAU [ESC] UNTUK BUKA/TUTUP</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- JOURNAL DRAWER ---------------- */

const KINDS: { label: string; value: JournalKind }[] = [
  { label: "Prediksi", value: "prediction" },
  { label: "Temuan", value: "finding" },
  { label: "Catatan", value: "note" },
];

export function JournalDrawer() {
  const j = useJournal();
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") j.closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [j]);

  useEffect(() => {
    if (j.drawerOpen) {
      const t = setTimeout(() => taRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [j.drawerOpen]);

  if (!j.drawerOpen) return null;

  const submit = () => {
    if (!j.draft.text.trim()) return;
    j.add({ exp: j.draft.exp || null, kind: j.draft.kind, text: j.draft.text });
    j.setDraft({ exp: "", kind: "prediction", text: "" });
    j.closeDrawer();
  };

  return (
    <div className="fixed inset-0 z-[85]" role="dialog" aria-modal="true" aria-label="Jurnal eksplorasi">
      <motion.button
        className="absolute inset-0"
        style={{ background: "rgba(27,22,17,0.4)" }}
        onClick={j.closeDrawer}
        aria-label="Tutup jurnal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="absolute right-0 top-0 h-full w-full sm:w-[440px] bg-paper border-l-[2px] border-ink flex flex-col"
        style={{ boxShadow: "-8px 0 0 0 rgba(27,22,17,0.15)" }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b-[1.5px] border-ink shrink-0">
          <div className="mono-label">✎ JURNAL EKSPLORASI</div>
          <button data-hot className="btn btn-sm btn-ghost" onClick={j.closeDrawer} aria-label="Tutup">
            ✕
          </button>
        </div>

        <div className="p-5 border-b-[1.5px] border-ink flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {KINDS.map((k) => (
              <button
                key={k.value}
                data-hot
                onClick={() => j.setDraft({ ...j.draft, kind: k.value })}
                className={`chip transition-colors ${j.draft.kind === k.value ? "" : "opacity-60"}`}
                style={
                  j.draft.kind === k.value
                    ? {
                        background:
                          j.draft.kind === "prediction"
                            ? "linear-gradient(120deg, var(--butter), var(--butter-deep))"
                            : j.draft.kind === "finding"
                              ? "linear-gradient(120deg, var(--sky), var(--sky-deep))"
                              : "linear-gradient(120deg, var(--rose), var(--rose-deep))",
                        color: j.draft.kind === "finding" ? "var(--paper)" : "var(--ink)",
                      }
                    : undefined
                }
              >
                {k.label}
              </button>
            ))}
          </div>
          <label className="mono-label opacity-70">
            SPESIMEN DITANDAI
            <select
              value={j.draft.exp}
              onChange={(e) => j.setDraft({ ...j.draft, exp: e.target.value })}
              className="mt-1 w-full mono-data text-[12px] border-[1.5px] border-ink bg-paper px-2 py-1.5 outline-none"
            >
              <option value="">— pengamatan umum —</option>
              {EXPERIMENTS.map((e) => (
                <option key={e.slug} value={e.slug}>
                  Nº{e.no} · {e.title}
                </option>
              ))}
            </select>
          </label>
          <textarea
            ref={taRef}
            value={j.draft.text}
            onChange={(e) => j.setDraft({ ...j.draft, text: e.target.value })}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            placeholder="Apa yang kamu harapkan? Apa yang sebenarnya terjadi? Hal apa yang bikin kamu penasaran?"
            rows={5}
            className="w-full border-[1.5px] border-ink bg-paper-2/40 p-3 text-[14px] leading-relaxed outline-none resize-none focus:border-red"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="mono-label opacity-50">⌘/CTRL + ⏎ UNTUK SIMPAN</span>
            <Btn variant="red" size="sm" onClick={submit} disabled={!j.draft.text.trim()}>
              Simpan ke jurnal
            </Btn>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto thin-scroll">
          {j.entries.length === 0 ? (
            <div className="p-6 marginal normal-case leading-relaxed">
              Halaman masih kosong. Jalankan satu alat, perhatikan sesuatu, lalu tulis sebelum rasa penasarannya
              hilang. Catatan tersimpan di browser ini (localStorage) — privat dari desainnya.
            </div>
          ) : (
            j.entries.map((en, i) => {
              const meta = EXPERIMENTS.find((e) => e.slug === en.exp);
              return (
                <motion.div
                  key={en.id}
                  className="border-b border-ink-faint px-5 py-4 group"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * Math.min(i, 6), duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className="chip"
                      style={{
                        background:
                          en.kind === "prediction"
                            ? "linear-gradient(120deg, var(--butter), var(--butter-deep))"
                            : en.kind === "finding"
                              ? "linear-gradient(120deg, var(--sky), var(--sky-deep))"
                              : "linear-gradient(120deg, var(--rose), var(--rose-deep))",
                        color: en.kind === "finding" ? "var(--paper)" : "var(--ink)",
                      }}
                    >
                      {en.kind === "prediction" ? "prediksi" : en.kind === "finding" ? "temuan" : "catatan"}
                    </span>
                    {meta && <span className="mono-label opacity-60">Nº{meta.no} {meta.title}</span>}
                    <span className="mono-data text-[10px] opacity-50 ml-auto">{jdate(en.ts)}</span>
                    <button
                      data-hot
                      className="mono-data text-[10px] opacity-0 group-hover:opacity-60 hover:!opacity-100 underline"
                      onClick={() => j.remove(en.id)}
                      aria-label="Hapus catatan"
                    >
                      hapus
                    </button>
                  </div>
                  <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{en.text}</p>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- FOOTER ---------------- */

const ODDS = [
  "GANTI PINTU ITU BAYAR 2/3. KERAS KEPALA BAYAR 1/3.",
  "DADU YANG JUJUR INGATNYA NGGAK ADA. NOL, BENERAN.",
  "P(≥1 GAMBAR DI 10 LEMPARAN) ≈ 99,9% — DAN 0,1% ITU KENA SAMA seseorang.",
  "DUA DADU, 36 DUNIA, SATU JUARA: ANGKA 7.",
  "ACAK BUKAN BERARTI SERAGAM. ACAK BERARTI TAK BISA DITEBAK.",
  "1.000 PERCOBAAN LALU KAMU YAKIN INI 50/50.",
  "HOUSE EDGE CUMA PELUANG YANG PAKAI JAS.",
  "NILAI HARAPAN: SEMUA KEMUNGKINAN MASA DEPAN, DIRATA-RATAKAN SEKALI.",
  "23 ORANG → 50,7% RUANGAN PUNYA ULANG TAHUN BERSAMA.",
  "JANGKA PANJANG ITU SABAR. KAMU JUGA SEHARUSNYA.",
];

const MARQUEE_LINES = EXPERIMENTS.map((e) => `Nº${e.no} ${e.title.toUpperCase()} — ${e.short.toUpperCase()}`);

export function Footer() {
  const [factIx, setFactIx] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    window.setTimeout(() => {
      setFactIx((cur) => {
        let n = Math.floor(Math.random() * ODDS.length);
        if (n === cur) n = (n + 1) % ODDS.length;
        return n;
      });
      setRolling(false);
    }, 520);
  };

  return (
    <footer className="relative mt-auto bg-ink text-paper overflow-hidden">
      {/* pastel floaters */}
      <Float amp={14} dur={7} className="absolute top-10 right-[8%] opacity-70 hidden md:block pointer-events-none">
        <span className="block w-9 h-9 rounded-full" style={{ background: "linear-gradient(140deg, var(--rose), var(--rose-deep))" }} />
      </Float>
      <Float amp={12} dur={6} delay={0.7} className="absolute top-32 left-[6%] opacity-70 hidden md:block pointer-events-none">
        <span className="block w-6 h-6 rotate-12" style={{ background: "linear-gradient(140deg, var(--mint), var(--mint-deep))" }} />
      </Float>
      <Float amp={16} dur={8} delay={1.2} className="absolute bottom-40 right-[24%] opacity-60 hidden lg:block pointer-events-none">
        <span className="block w-7 h-7 rounded-full" style={{ background: "linear-gradient(140deg, var(--sky), var(--sky-deep))" }} />
      </Float>

      {/* specimen marquee on a rainbow band */}
      <div className="marquee-grad text-ink border-b-[1.5px] border-ink overflow-hidden py-2.5" aria-hidden="true">
        <div className="marquee-track" style={{ animationDuration: "60s" }}>
          {[0, 1].map((rep) => (
            <div key={rep} className="flex shrink-0">
              {MARQUEE_LINES.map((l, i) => (
                <span key={`${rep}-${i}`} className="mono-data text-[11px] tracking-wide whitespace-nowrap px-5 flex items-center gap-5 font-semibold">
                  {l} <span className="font-black">✳</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 grid md:grid-cols-12 gap-10 relative">
        {/* identity + odds machine */}
        <div className="md:col-span-5">
          <div className="font-extrabold tracking-tight text-[2rem] leading-none mb-3">
            <span
              style={{
                background: "linear-gradient(100deg, var(--butter), var(--rose) 45%, var(--sky))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              PROBLAB®
            </span>
          </div>
          <p className="text-[13px] leading-relaxed opacity-75 max-w-[38ch]">
            Laboratorium lapangan interaktif untuk keacakan. Belajar dengan menjelajah; paham dengan mencoba;
            simpan buktinya di jurnal kamu.
          </p>

          {/* the odds machine — a tiny interactive die that deals probability facts */}
          <div
            className="mt-6 relative overflow-hidden"
            style={{ background: "rgba(252,251,255,0.08)", border: "1.5px solid rgba(252,251,255,0.4)" }}
          >
            <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-paper/20">
              <span className="mono-label opacity-70">MESIN ODDS</span>
              <span className="mono-data text-[10px] opacity-50">BEBAS DIMAINKAN · NGGAK ADA HADIAH</span>
            </div>
            <div className="p-4 flex items-start gap-4 min-h-[110px]">
              <motion.button
                onClick={roll}
                data-hot
                aria-label="Lempar untuk satu fakta peluang"
                className="shrink-0 w-14 h-14 rounded-lg border-[2px] border-paper bg-paper text-ink grid grid-cols-3 grid-rows-3 gap-[3px] p-2.5"
                animate={rolling ? { rotate: [0, -14, 14, -10, 0], scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 0.52, ease: "easeInOut" }}
                whileHover={{ scale: 1.08, rotate: -4 }}
                whileTap={{ scale: 0.92 }}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((d) => {
                  const on = [0, 2, 4, 6, 8].includes(d);
                  return (
                    <span
                      key={d}
                      className="block rounded-full"
                      style={{
                        background: on
                          ? d === 4
                            ? "linear-gradient(140deg, var(--rose-deep), var(--peach-deep))"
                            : "var(--ink)"
                          : "transparent",
                      }}
                    />
                  );
                })}
              </motion.button>
              <div className="min-w-0 flex-1">
                <AnimatePresence mode="wait">
                  {factIx === null ? (
                    <motion.p
                      key="idle"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mono-label opacity-60 leading-relaxed !normal-case"
                    >
                      tekan lempar — mesin ini membayar satu fakta jujur tiap lemparan. odds buat belajar sesuatu:
                      tinggi.
                    </motion.p>
                  ) : (
                    <motion.p
                      key={factIx}
                      initial={{ opacity: 0, y: 14, rotate: -1 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      exit={{ opacity: 0, y: -14, rotate: 1 }}
                      transition={{ type: "spring", stiffness: 240, damping: 20 }}
                      className="mono-data text-[12.5px] leading-relaxed"
                      style={{ color: "var(--butter)" }}
                    >
                      {ODDS[factIx]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="px-4 pb-3 flex items-center justify-between">
              <button data-hot className="btn btn-sm btn-grad" onClick={roll} disabled={rolling}>
                {rolling ? "LEMPAR…" : "LEMPAR ODDS"}
              </button>
              <span className="mono-data text-[10px] opacity-40">{factIx === null ? "0/∞ LEMPARAN" : `LEMPARAN Nº${factIx + 1}`}</span>
            </div>
          </div>
        </div>

        {/* specimens */}
        <div className="md:col-span-4">
          <div className="mono-label opacity-60 mb-3">SPESIMEN</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {EXPERIMENTS.map((e, i) => (
              <motion.a
                key={e.slug}
                href={`#/${e.slug}`}
                data-hot
                className="mono-data text-[12px] opacity-80 hover:opacity-100 hover:underline underline-offset-4 group"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 0.8, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.04 * i, duration: 0.3 }}
              >
                <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle group-hover:scale-125 transition-transform" style={{ background: ["#f78cab", "#ff9e6e", "#ffc94d", "#7fd9a6", "#8fb5ff", "#a88bff", "#7fd8c9", "#f78cab"][i] }} />
                Nº{e.no} · {e.title}
              </motion.a>
            ))}
          </div>
        </div>

        {/* marginalia */}
        <div className="flex flex-col gap-1.5 md:col-span-3">
          <div className="mono-label opacity-60 mb-3">CATATAN PINGGIR</div>
          <a href="#/journal" data-hot className="mono-data text-[12px] opacity-80 hover:opacity-100 hover:underline underline-offset-4">✎ Jurnal eksplorasi</a>
          <a href="#/about" data-hot className="mono-data text-[12px] opacity-80 hover:opacity-100 hover:underline underline-offset-4">ⓘ Manifes & kolofon</a>
          <span className="mono-data text-[10.5px] opacity-40 mt-4 leading-relaxed">
            SIMULASI JALAN LOKAL DI BROWSER KAMU · NGGAK ADA AKUN · NGGAK ADA SKOR · CATATAN DISIMPAN DI LOCALSTORAGE
          </span>
        </div>
      </div>

      {/* giant cropped wordmark */}
      <div className="relative select-none" aria-hidden="true">
        <RisingLetters text="PROBLAB" />
      </div>

      <div className="relative border-t border-paper/20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-10 flex items-center justify-between">
          <span className="mono-label opacity-50">DICETAK PAKAI WASH PASTEL · ULTRAMARINE · VERMILION · SUN</span>
          <span className="mono-label opacity-50 hidden sm:inline">Nggak ada dadu yang dizalimi di sini</span>
          <span className="mono-label opacity-50">© {new Date().getFullYear()} PROBLAB</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- CURSOR + GRAIN ---------------- */

export function Atmosphere() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let x = -100, y = -100, rx = -100, ry = -100;
    let hot = false;
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement;
      hot = !!t.closest("[data-hot], a, button, input, select, textarea, canvas");
      if (ringRef.current) {
        ringRef.current.classList.toggle("hot", hot);
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    let raf = 0;
    const loop = () => {
      rx += (x - rx) * 0.22;
      ry += (y - ry) * 0.22;
      if (dotRef.current) dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
