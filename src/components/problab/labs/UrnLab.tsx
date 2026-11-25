/* PROBLAB Nº05 — The Urn: every draw rewrites the next.
   The jar keeps its contents a SECRET: opaque body, mystery sticker — no
   peeking at the marbles inside. Every draw pops a marble out of the mouth
   (it falls back in with replacement, it flies away without), and each
   batch gets a morphing results card. */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { BLUE, INK, SUN, RED, fmtInt, pct } from "@/lib/problab/core";
import { Btn, Seg } from "../kit";

type Mode = "with" | "without";
type ColorKey = "red" | "blue" | "sun";
type Counts = { red: number; blue: number; sun: number };
type Marb = { id: number; color: ColorKey };
type Fly = { key: number; color: ColorKey; returns: boolean; jx: number; delay: number };
type Batch = { n: number; got: Counts; at: number };

const COLORS = [
  { key: "red" as const, label: "MERAH BATA", hex: RED },
  { key: "blue" as const, label: "ULTRA", hex: BLUE },
  { key: "sun" as const, label: "SURYA", hex: SUN },
];
const HEX: Record<ColorKey, string> = { red: RED, blue: BLUE, sun: SUN };

const INIT: Counts = { red: 5, blue: 4, sun: 3 };

/* Marble ids are sequential. The starting jar claims 1..N (pure, no refs), and
   the id counter picks up right after it. */
function initialJar(): Marb[] {
  const out: Marb[] = [];
  let id = 1;
  for (const { key } of COLORS) for (let i = 0; i < INIT[key]; i++) out.push({ id: id++, color: key });
  return out;
}

/* ---------- the jar: contents stay a SECRET — opaque body, mystery sticker ---------- */

/* whisper of texture inside the belly: "there IS something in here, but
   you're not allowed to see it" — no colours, no counts, no peeking */
const MYSTERY_DOTS = Array.from({ length: 26 }, (_, i) => ({
  cx: 21 + (i % 6) * 12.4 + ((i * 17) % 5) - 2,
  cy: 27 + Math.floor(i / 6) * 11.5 + ((i * 29) % 5) - 2,
}));

const UrnSVG = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 104 118" className="w-[195px] h-[222px]" aria-label="Guci tertutup — isinya dirahasiakan">
    <path
      d="M32 6 h40 l-4 12 c9 6.5 14 17 14 27 0 17.5-13 28.5-30 28.5S22 62.5 22 45 c0-10 5-20.5 14-27 Z"
      fill="#f6f1e6"
      stroke={INK}
      strokeWidth="3"
    />
    <clipPath id="urnclip">
      <path d="M32 6 h40 l-4 12 c9 6.5 14 17 14 27 0 17.5-13 28.5-30 28.5S22 62.5 22 45 c0-10 5-20.5 14-27 Z" />
    </clipPath>
    <g clipPath="url(#urnclip)">
      {filled &&
        MYSTERY_DOTS.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r="1.6" fill={INK} opacity="0.16" />
        ))}
    </g>
    <path d="M30 4 h44" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    {/* stiker misteri: "?" pas guci masih berisi, "!" pas udah kosong */}
    <motion.g
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      animate={filled ? { rotate: [-7, -3, -7] } : { rotate: -7 }}
      transition={filled ? { duration: 3.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
    >
      <circle cx="52" cy="45" r="14.5" style={{ fill: "var(--butter)" }} stroke={INK} strokeWidth="2.4" />
      <text
        x="52"
        y="46.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="17"
        fontWeight="800"
        fill={INK}
        style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
      >
        {filled ? "?" : "!"}
      </text>
    </motion.g>
  </svg>
);

/* ---------- results card — pops after every batch, morphs in, reverse-morphs out ---------- */

function BatchCard({ batch, mode, remaining, totalInit, draws, onClose }: {
  batch: Batch;
  mode: Mode;
  remaining: Counts;
  totalInit: number;
  draws: number;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="absolute z-30 w-[min(320px,94%)] right-1 top-[calc(100%-10px)] xl:left-[calc(100%+16px)] xl:right-auto xl:top-0 xl:w-[292px]"
      style={{ boxShadow: "8px 9px 0 0 rgba(27,22,17,0.85)", transformOrigin: "24px 0px" }}
      initial={{ opacity: 0, scale: 0.4, y: -12, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: 0, transition: { type: "spring", stiffness: 260, damping: 19 } }}
      exit={{ opacity: 0, scale: 0.4, y: -8, rotate: 3, transition: { duration: 0.18, ease: "easeIn" } }}
      role="dialog"
      aria-label="Hasil batch penarikan"
    >
      <div className="relative rounded-[16px] border-[2px] border-ink bg-paper">
        {/* content re-pops (mini morph) every time a new batch lands */}
        <motion.div
          key={batch.at}
          initial={{ opacity: 0.4, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1, transition: { type: "spring", stiffness: 320, damping: 20 } }}
        >
          {/* header tape */}
          <div
            className="flex items-center justify-between gap-2 rounded-t-[13px] border-b-[2px] border-ink px-3.5 py-2.5"
            style={{ background: "linear-gradient(135deg, var(--lilac), var(--sky))" }}
          >
            <div>
              <div className="mono-label text-[10px]">HASIL NARIK ×{batch.n}</div>
              <div className="mono-label text-[8.5px] normal-case opacity-60">batch terakhir · total {fmtInt(draws)} narik</div>
            </div>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--rose-deep)" }} />
              <span className="mono-label text-[8.5px]">BARU</span>
            </span>
          </div>

          {/* one row per colour — what THIS batch pulled out */}
          <div className="relative px-3.5 py-3">
            <div className="dotgrid absolute inset-0 opacity-20" aria-hidden="true" />
            <div className="relative space-y-[7px]">
              {COLORS.map(({ key, label, hex }) => {
                const n = batch.got[key];
                const share = batch.n > 0 ? n / batch.n : 0;
                return (
                  <div key={key} className={`flex items-center gap-2 ${n === 0 ? "opacity-40" : ""}`}>
                    <span
                      className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border-[1.5px] border-ink"
                      style={{ background: hex }}
                    />
                    <span className="mono-label w-[72px] shrink-0 text-[9px]">{label}</span>
                    <div className="h-[9px] flex-1 overflow-hidden rounded-full border-[1.2px] border-ink/60 bg-white/55">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: hex }}
                        initial={{ width: 0 }}
                        animate={{ width: `${share * 100}%` }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      />
                    </div>
                    <span className="mono-data w-[54px] shrink-0 text-right text-[9.5px]">
                      {n} <span className="opacity-55">· {pct(share)}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* footer — what the jar looks like NOW */}
          <div className="flex items-center justify-between gap-2 rounded-b-[13px] border-t-[1.5px] border-ink/70 bg-paper/80 px-3.5 py-2">
            <span className="mono-data text-[9px] leading-snug">
              {mode === "without"
                ? `SISA GUCI — ${remaining.red} MERAH · ${remaining.blue} ULTRA · ${remaining.sun} SURYA`
                : `BOLA DIKEMBALIKAN — ISI GUCI TETAP ${totalInit}`}
            </span>
          </div>
        </motion.div>

        {/* close — pops in after the morph, leaves with the reverse morph */}
        <motion.button
          className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-ink text-[13px] leading-none shadow-[2.5px_2.5px_0_0_var(--ink)]"
          style={{ background: "var(--butter)" }}
          initial={{ scale: 0, rotate: -120 }}
          animate={{ scale: 1, rotate: 0, transition: { delay: 0.22, type: "spring", stiffness: 320, damping: 15 } }}
          exit={{ scale: 0, rotate: 120, transition: { duration: 0.14, ease: "easeIn" } }}
          whileHover={{ scale: 1.12, rotate: 6 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          aria-label="Tutup card hasil"
        >
          ✕
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ---------- the lab ---------- */

export default function UrnLab() {
  const [comp, setComp] = useState<Counts>(INIT);
  const [mode, setMode] = useState<Mode>("without");

  /* the jar is a list of physical marbles with stable ids */
  const [jar, setJar] = useState<Marb[]>(initialJar);
  const jarRef = useRef<Marb[]>(jar);
  const idRef = useRef(jar.length + 1);
  const buildJar = useCallback((c: Counts): Marb[] => {
    const out: Marb[] = [];
    for (const { key } of COLORS) for (let i = 0; i < c[key]; i++) out.push({ id: idRef.current++, color: key });
    return out;
  }, []);

  const [ribbon, setRibbon] = useState<ColorKey[]>([]);
  const [tally, setTally] = useState<Counts>({ red: 0, blue: 0, sun: 0 });
  const [draws, setDraws] = useState(0);
  const [lastBatch, setLastBatch] = useState<Batch | null>(null);
  const [flying, setFlying] = useState<Fly[]>([]);
  const queue = useRef(0);
  const flyId = useRef(0);
  const wiggle = useAnimation();

  const compRef = useRef<Counts>(INIT);
  const modeRef = useRef<Mode>("without");
  useEffect(() => {
    compRef.current = comp;
  }, [comp]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const totalInit = comp.red + comp.blue + comp.sun;

  /* remaining marbles = whatever is physically still inside the jar */
  const remaining: Counts = useMemo(() => {
    if (mode === "with") return { ...comp };
    const r: Counts = { red: 0, blue: 0, sun: 0 };
    for (const m of jar) r[m.color] += 1;
    return r;
  }, [jar, mode, comp]);
  const totalRem = remaining.red + remaining.blue + remaining.sun;

  const resetUrn = useCallback(() => {
    jarRef.current = buildJar(compRef.current);
    setJar(jarRef.current);
    setRibbon([]);
    setTally({ red: 0, blue: 0, sun: 0 });
    setDraws(0);
    queue.current = 0;
    setLastBatch(null);
    setFlying([]);
  }, [buildJar]);

  /* one draw: pops a real marble id out of the jar (without), or samples the
     composition (with) — the marble comes straight back */
  const drawOnce = useCallback((): { key: ColorKey; id: number } | null => {
    if (modeRef.current === "without") {
      const j = jarRef.current;
      if (!j.length) return null;
      const m = j[Math.floor(Math.random() * j.length)];
      jarRef.current = j.filter((x) => x.id !== m.id);
      setJar(jarRef.current);
      return { key: m.color, id: m.id };
    }
    const c = compRef.current;
    const pool: ColorKey[] = [];
    for (const { key } of COLORS) for (let i = 0; i < c[key]; i++) pool.push(key);
    if (!pool.length) return null;
    return { key: pool[Math.floor(Math.random() * pool.length)], id: -1 };
  }, []);

  const draw = useCallback((n: number) => {
    if (modeRef.current === "without") {
      /* never queue more draws than there are marbles left in the jar */
      const room = jarRef.current.length - queue.current;
      if (room <= 0) return;
      queue.current += Math.min(n, room);
    } else {
      queue.current += n;
    }
  }, []);

  /* batch processor */
  useEffect(() => {
    const iv = setInterval(() => {
      if (queue.current <= 0) return;
      const chunk = Math.min(queue.current, 30);
      queue.current -= chunk;
      const got: { key: ColorKey; id: number }[] = [];
      for (let i = 0; i < chunk; i++) {
        const p = drawOnce();
        if (p) got.push(p);
        else break;
      }
      if (!got.length) return;

      const bc: Counts = { red: 0, blue: 0, sun: 0 };
      for (const g of got) bc[g.key] += 1;

      setRibbon((r) => [...got.map((g) => g.key), ...r].slice(0, 60));
      setTally((t) => {
        const nt = { ...t };
        for (const g of got) nt[g.key] += 1;
        return nt;
      });
      setDraws((d) => d + got.length);

      /* the jar reacts — a little shake, marbles hop out of the mouth */
      wiggle.start({ rotate: [0, -2.4, 1.8, 0], transition: { duration: 0.38, ease: "easeOut" } });
      const step = Math.max(1, Math.ceil(got.length / 5));
      const spawns: Fly[] = got
        .filter((_, i) => i % step === 0)
        .slice(0, 5)
        .map((g, i) => ({
          key: flyId.current++,
          color: g.key,
          returns: modeRef.current === "with",
          jx: 14 + ((flyId.current * 23) % 26),
          delay: i * 0.06,
        }));
      setFlying((f) => [...f, ...spawns].slice(-14));

      setLastBatch({ n: got.length, got: bc, at: Date.now() });

      /* urn exhausted? */
      if (modeRef.current === "without" && jarRef.current.length === 0) queue.current = 0;
    }, 90);
    return () => clearInterval(iv);
  }, [drawOnce, wiggle]);

  /* the results card dismisses itself after a quiet moment */
  useEffect(() => {
    if (!lastBatch) return;
    const t = setTimeout(() => setLastBatch(null), 4600);
    return () => clearTimeout(t);
  }, [lastBatch]);

  const changeComp = (key: keyof Counts, delta: number) => {
    const c = compRef.current;
    const v = Math.min(14, Math.max(0, c[key] + delta));
    const nc = { ...c, [key]: v };
    compRef.current = nc;
    setComp(nc);
    jarRef.current = buildJar(nc);
    setJar(jarRef.current);
    setRibbon([]);
    setTally({ red: 0, blue: 0, sun: 0 });
    setDraws(0);
    queue.current = 0;
    setLastBatch(null);
    setFlying([]);
  };

  /* conditional readout: probability that the NEXT draw is each colour */
  const nextP = (key: keyof Counts) => (totalRem > 0 ? remaining[key] / totalRem : 0);

  /* two-draw multiplication rule example for 'red' */
  const pFirstRed = totalInit > 0 ? comp.red / totalInit : 0;
  const pSecondRedGivenRed =
    mode === "with" ? pFirstRed : totalInit > 1 ? (comp.red - 1) / (totalInit - 1) : 0;
  const pBoth = pFirstRed * pSecondRedGivenRed;

  /* TANPA pengembalian: a draw button may never promise more marbles than the jar holds */
  const canDraw = (n: number) => (mode === "with" ? totalInit > 0 : totalRem >= n);

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
      {/* urn + draw */}
      <div className="xl:w-[300px] shrink-0 flex flex-col gap-4">
        <div className="relative">
          <div className="panel-flat dotgrid p-6 flex flex-col items-center gap-3">
            <motion.div animate={wiggle}>
              <UrnSVG filled={totalRem > 0} />
            </motion.div>

            {/* marbles popping out of the mouth — gravity arc, spinning */}
            <div className="pointer-events-none absolute inset-0 z-20 overflow-visible" aria-hidden="true">
              <AnimatePresence>
                {flying.map((f) => (
                  <motion.span
                    key={f.key}
                    className="absolute rounded-full border-[1.5px]"
                    style={{
                      width: 16,
                      height: 16,
                      left: "50%",
                      top: 34,
                      marginLeft: -8,
                      background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.75), ${HEX[f.color]} 65%)`,
                      borderColor: INK,
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.5, rotate: 0 }}
                    animate={
                      f.returns
                        ? { x: [0, f.jx * 0.4, f.jx * 0.15], y: [0, -56, 4, -2], opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.6], rotate: [0, 150, 300, 380] }
                        : { x: [0, f.jx * 0.55, f.jx, f.jx * 1.4], y: [0, -50, 30, 92], opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.9], rotate: [0, 180, 380, 540] }
                    }
                    transition={{
                      duration: f.returns ? 0.85 : 1.05,
                      times: f.returns ? [0, 0.42, 0.78, 1] : [0, 0.4, 0.72, 1],
                      ease: ["easeOut", "easeIn", "easeIn"],
                      delay: f.delay,
                    }}
                    onAnimationComplete={() => setFlying((cur) => cur.filter((x) => x.key !== f.key))}
                  />
                ))}
              </AnimatePresence>
            </div>

            <div className="mono-label text-center">
              {mode === "without" && totalRem === 0 ? (
                <span style={{ color: RED }}>GUCI KOSONG — RESET DULU BUAT LANJUT</span>
              ) : (
                <>
                  ISI GUCI: {remaining.red} MERAH BATA · {remaining.blue} ULTRA · {remaining.sun} SURYA
                </>
              )}
            </div>
          </div>

          {/* the batch results card — morphs out of the jar panel */}
          <AnimatePresence>
            {lastBatch && (
              <BatchCard
                key="batch-card"
                batch={lastBatch}
                mode={mode}
                remaining={remaining}
                totalInit={totalInit}
                draws={draws}
                onClose={() => setLastBatch(null)}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="panel-flat p-4 flex flex-col gap-3">
          <div className="mono-label border-b border-ink-faint pb-2">PROTOKOL NARIK</div>
          <Seg
            options={[
              { label: "DENGAN pengembalian", value: "with" },
              { label: "TANPA", value: "without" },
            ]}
            value={mode}
            onChange={(v) => {
              setMode(v as Mode);
              modeRef.current = v as Mode;
              resetUrn();
            }}
          />
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="red" disabled={!canDraw(1)} onClick={() => draw(1)}>Narik ×1</Btn>
            <Btn disabled={!canDraw(10)} onClick={() => draw(10)}>×10</Btn>
            <Btn disabled={!canDraw(100)} onClick={() => draw(100)}>×100</Btn>
            <Btn variant="ink" disabled={!canDraw(500)} onClick={() => draw(500)}>×500</Btn>
          </div>
          {mode === "without" && (
            <p className="marginal normal-case tracking-normal opacity-70">
              {totalRem > 0
                ? `Sisa guci ${totalRem} bola — tombol yang jumlahnya lebih dari itu mati sendiri, bola yang udah keluar nggak bisa dicabut ulang.`
                : "Gucinya kosong — isi ulang dulu buat narik lagi."}
            </p>
          )}
          <Btn onClick={resetUrn}>Isi ulang gucinya</Btn>
        </div>

        <div className="readout">
          <div className="k">P(NARIK BERIKUT = MERAH BATA)</div>
          <div className="v" style={{ color: RED }}>
            {remaining.red}<span className="opacity-60">/{totalRem}</span> = {pct(nextP("red"))}
          </div>
          <div className="marginal normal-case mt-1">
            {mode === "without" && draws > 0
              ? "pecahan ini berubah tiap kali narik — nah itu ya peluang bersyarat"
              : "tetap konstan kalau bolanya dikembalikan"}
          </div>
        </div>
      </div>

      {/* composition + results */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="panel-flat p-4">
          <div className="mono-label mb-3">MEJA KOMPOSISI — UBAH ANGKANYA, GUCINYA NURUT</div>
          <div className="flex flex-col gap-3">
            {COLORS.map(({ key, label, hex }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full border-[1.5px] border-ink shrink-0" style={{ background: hex }} />
                <span className="mono-label w-24">{label}</span>
                <button data-hot className="btn btn-sm" onClick={() => changeComp(key, -1)} aria-label={`kurangi satu ${label}`}>−</button>
                <span className="mono-data text-lg font-semibold w-8 text-center">{comp[key]}</span>
                <button data-hot className="btn btn-sm" onClick={() => changeComp(key, 1)} aria-label={`tambah satu ${label}`}>+</button>
                <span className="mono-data text-[11px] opacity-70 ml-2">
                  {totalInit > 0 ? pct(comp[key] / totalInit) : "—"} dari guci
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-flat p-4">
          <div className="mono-label mb-3 flex justify-between gap-3 flex-wrap">
            <span>PITA HASIL NARIK — 60 TERAKHIR, TERBARU DI DEPAN</span>
            <span className="opacity-60">{fmtInt(draws)} KALI NARIK</span>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[30px]">
            {ribbon.length === 0 && <span className="marginal normal-case">belum ada yang ditarik — gas tuasnya</span>}
            {ribbon.map((c, i) => (
              <span
                key={`${i}-${c}`}
                className="w-5 h-5 rounded-full border-[1.5px] border-ink inline-block"
                style={{ background: HEX[c], opacity: 1 - i * 0.012 }}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className="panel-flat p-4">
          <div className="mono-label mb-3">PANGSA HASIL NARIK NYATA</div>
          <div className="flex flex-col gap-2.5">
            {COLORS.map(({ key, label, hex }) => {
              const emp = draws ? tally[key] / draws : 0;
              const ref = totalInit ? comp[key] / totalInit : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between mono-data text-[11px] mb-1">
                    <span className="font-semibold">{label}</span>
                    <span className="opacity-70">teramati {pct(emp)} · isi guci {pct(ref)}</span>
                  </div>
                  <div className="relative h-4 border-[1.5px] border-ink bg-paper-2 overflow-hidden">
                    <div className="absolute inset-y-0 left-0" style={{ width: `${emp * 100}%`, background: hex }} />
                    <div
                      className="absolute inset-y-0 w-[2.5px]"
                      style={{ left: `calc(${ref * 100}% - 1px)`, background: INK }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="marginal normal-case mt-3">
            {mode === "without"
              ? "tanpa pengembalian gucinya jebol: proporsinya jalan-jalan begitu bola-bolanya keluar, lalu rapi lagi pas diisi ulang"
              : "dengan pengembalian komposisinya nggak pernah berubah — garis hitam diam di tempat, batangnya yang nurut"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="panel-flat p-4">
            <div className="mono-label mb-2">DUA KALI NARIK, DIKALI</div>
            <p className="text-[13.5px] leading-relaxed text-ink/85">
              P(merah bata pertama) = {comp.red}/{totalInit} = {pct(pFirstRed)}. Untuk narikan kedua,{" "}
              {mode === "with" ? (
                <>gucinya diisi ulang, jadi P(merah bata lagi) tetap {pct(pSecondRedGivenRed)}.</>
              ) : (
                <>
                  satu merah bata udah kabur: P(merah bata lagi) = {Math.max(0, comp.red - 1)}/{Math.max(0, totalInit - 1)}{" "}
                  = {pct(pSecondRedGivenRed)}.
                </>
              )}
            </p>
            <div className="formula mt-3">
              P(dua-duanya merah bata) = {pct(pFirstRed)} × {pct(pSecondRedGivenRed)} = <strong>{pct(pBoth)}</strong>
            </div>
          </div>
          <div className="panel-sun p-4">
            <div className="mono-label mb-2">COBA INI</div>
            <p className="text-[13.5px] leading-relaxed">
              Setel 1 merah bata dan 9 ultra. Narik ×1, tanpa pengembalian, ulang-ulang (isi ulang di
              antaranya). Seberapa sering si merah bata tunggal itu keluar duluan? Sekarang bandingin sama larian
              ×100 — peristiwa langka butuh banyak guci sebelum dia nunjukin wajah aslinya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
