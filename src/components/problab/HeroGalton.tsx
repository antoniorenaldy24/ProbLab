/* PROBLAB — MESIN PELUANG: the hero's 2D paper-diorama machine.
   A living Galton board drawn flat on canvas — pastel trials rain through the pegs,
   bins fill into a bell — wrapped in a rectangular laboratory window on a pedestal,
   with layered paper plates and sticker companions around it.
   No WebGL: depth comes from offset shadows, candy shading and parallax layers.
   Click the glass = pour trials from there. It always converges. */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PASTELS, clamp } from "@/lib/problab/core";
import { FloatObj, Parallax } from "./motionkit";

/* ---------- geometry (logical canvas units, aspect-locked) ---------- */

const ROWS = 9; // peg rows → ROWS+1 bins
const DX = 50; // peg horizontal spacing
const DY = 34; // row vertical spacing
const LOGICAL_W = 640;
const LOGICAL_H = 520;
const PEG_TOP_Y = 92;
const BALL_R = 6.5;
const FLOOR_Y = 464;
const STACK_MAX_H = 118;
const BIN_COUNT = ROWS + 1;
const MAX_FLYING = 90;
const SEG_MS = 165; // per row at speed 1

const INK = "rgba(27,22,17,1)";
const pegY = (row: number) => PEG_TOP_Y + row * DY;
const binX = (k: number) => (k - ROWS / 2) * DX;

const BALL_COLORS = [
  PASTELS.roseDeep,
  PASTELS.peachDeep,
  PASTELS.butterDeep,
  PASTELS.mintDeep,
  PASTELS.skyDeep,
  PASTELS.lilacDeep,
  PASTELS.aquaDeep,
];
const BIN_SWEEP = [PASTELS.skyDeep, PASTELS.lilacDeep, PASTELS.roseDeep, PASTELS.peachDeep];

/* ---------- color + math helpers ---------- */

function hexToRgb(color: string): [number, number, number] {
  const c = color.trim();
  /* accept both "#rrggbb" and "rgb(r, g, b)" (sweep() output feeds back in) */
  if (c.startsWith("rgb")) {
    const m = c.match(/[\d.]+/g) ?? ["0", "0", "0"];
    return [Number(m[0]), Number(m[1]), Number(m[2])];
  }
  const h = c.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)}, ${Math.round(g1 + (g2 - g1) * t)}, ${Math.round(b1 + (b2 - b1) * t)})`;
}
function tint(hex: string, t: number): string {
  return mixHex(hex, "#ffffff", t);
}
function shade(hex: string, t: number): string {
  return mixHex(hex, "#1b1611", t);
}
function sweep(stops: string[], p: number): string {
  const x = clamp(p, 0, 1) * (stops.length - 1);
  const i = Math.floor(x);
  return mixHex(stops[i], stops[Math.min(stops.length - 1, i + 1)], x - i);
}
function binomPMF(rows: number, p: number): number[] {
  const pmf: number[] = new Array(rows + 1).fill(0);
  let c = 1;
  for (let k = 0; k <= rows; k++) {
    pmf[k] = c * Math.pow(p, k) * Math.pow(1 - p, rows - k);
    c = (c * (rows - k)) / (k + 1);
  }
  return pmf;
}

/* ---------- simulation (lives outside react) ---------- */

type Ball = { x0: number; seg: number; t: number; path: number[]; colorIx: number; speed: number };
type Sim = { balls: Ball[]; counts: number[]; barH: number[]; total: number; colorIx: number };

function makeBall(sim: Sim, bias = 0) {
  if (sim.balls.length >= MAX_FLYING) return;
  const path: number[] = [];
  for (let r = 0; r < ROWS; r++) path.push(Math.random() < 0.5 ? 1 : -1);
  sim.balls.push({
    x0: bias * 13 + (Math.random() - 0.5) * 9,
    seg: 0,
    t: 0,
    path,
    colorIx: sim.colorIx++ % BALL_COLORS.length,
    speed: 0.85 + Math.random() * 0.4,
  });
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 2.4);
const easeIn = (t: number) => t * t;

/* position after r completed transitions: P(0)=funnel, P(1..ROWS)=pegs, P(ROWS+1)=bin */
function pointAt(sim: Sim, b: Ball, r: number): [number, number] {
  const cx = LOGICAL_W / 2;
  if (r <= 0) return [cx + b.x0, 36];
  const rightsFull = b.path.reduce((a, v) => a + (v === 1 ? 1 : 0), 0);
  if (r >= ROWS + 1) {
    return [cx + binX(rightsFull), FLOOR_Y - 10 - Math.min(sim.barH[rightsFull], STACK_MAX_H) * 0.42];
  }
  let rights = 0;
  for (let i = 0; i < r - 1; i++) rights += b.path[i] === 1 ? 1 : 0;
  return [cx + (rights - (r - 1) / 2) * DX, pegY(r - 1)];
}

function step(sim: Sim, dt: number, reduced: boolean, spawnAcc: { v: number }, auto: boolean) {
  /* gentle trickle keeps the machine alive — until the visitor switches it off */
  if (!reduced && auto) {
    spawnAcc.v += dt;
    if (spawnAcc.v > 0.5 && sim.balls.length < MAX_FLYING - 10) {
      spawnAcc.v = 0;
      makeBall(sim);
      makeBall(sim);
    }
  }

  /* advance balls */
  const landed: number[] = [];
  for (const b of sim.balls) {
    b.t += (dt * 1000) / (SEG_MS / b.speed);
    while (b.t >= 1) {
      b.t -= 1;
      b.seg += 1;
      if (b.seg > ROWS + 1) {
        let rights = 0;
        for (const v of b.path) rights += v === 1 ? 1 : 0;
        landed.push(rights);
        break;
      }
    }
  }
  if (landed.length) {
    sim.balls = sim.balls.filter((b) => b.seg <= ROWS + 1);
    for (const k of landed) {
      sim.counts[k] += 1;
      sim.total += 1;
    }
  }

  /* piles ease toward their normalised height */
  const maxC = Math.max(1, ...sim.counts);
  for (let k = 0; k < BIN_COUNT; k++) {
    const target = (sim.counts[k] / maxC) * STACK_MAX_H;
    sim.barH[k] += (target - sim.barH[k]) * Math.min(1, dt * 3.4);
  }
}

/* ---------- 2D render — flat shapes, candy depth ---------- */

function render(ctx: CanvasRenderingContext2D, s: number, sim: Sim, pmf: number[], pmfMax: number) {
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
  const cx = LOGICAL_W / 2;

  /* pile ground shadows */
  for (let k = 0; k < BIN_COUNT; k++) {
    if (sim.barH[k] < 2) continue;
    ctx.fillStyle = "rgba(27,22,17,0.13)";
    ctx.beginPath();
    ctx.ellipse(cx + binX(k) + 3, FLOOR_Y + 3, DX * 0.33, 4.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /* bin piles — candy cylinders with side shading */
  for (let k = 0; k < BIN_COUNT; k++) {
    const h = sim.barH[k];
    if (h < 2) continue;
    const col = sweep(BIN_SWEEP, k / (BIN_COUNT - 1));
    const w = DX * 0.62;
    const x = cx + binX(k) - w / 2;
    const y = FLOOR_Y - h;
    const r = 4;

    const body = () => {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR_Y);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, FLOOR_Y);
      ctx.closePath();
    };

    const g = ctx.createLinearGradient(0, y, 0, FLOOR_Y);
    g.addColorStop(0, tint(col, 0.4));
    g.addColorStop(1, col);
    ctx.fillStyle = g;
    body();
    ctx.fill();

    /* cylinder feel: left highlight, right shade */
    ctx.fillStyle = "rgba(255,255,255,0.34)";
    ctx.fillRect(x + 3, y + 4, 3.2, Math.max(0, h - 8));
    ctx.fillStyle = "rgba(27,22,17,0.13)";
    ctx.fillRect(x + w - 6.4, y + 4, 3.2, Math.max(0, h - 8));

    ctx.strokeStyle = "rgba(27,22,17,0.9)";
    ctx.lineWidth = 1.5;
    body();
    ctx.stroke();
  }

  /* bin dividers with pin finials */
  for (let i = 0; i <= BIN_COUNT; i++) {
    const x = cx + binX(i) - DX / 2;
    ctx.strokeStyle = "rgba(27,22,17,0.85)";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, FLOOR_Y - 88);
    ctx.lineTo(x, FLOOR_Y);
    ctx.stroke();
    ctx.fillStyle = "rgba(27,22,17,0.85)";
    ctx.beginPath();
    ctx.arc(x, FLOOR_Y - 88, 2.1, 0, Math.PI * 2);
    ctx.fill();
  }

  /* floor strip */
  ctx.fillStyle = INK;
  ctx.fillRect(cx - 262, FLOOR_Y, 524, 11);

  /* the exact promise — dashed binomial bell */
  ctx.strokeStyle = "#e23d28";
  ctx.lineWidth = 2.4;
  ctx.setLineDash([9, 6]);
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let k = 0; k < BIN_COUNT; k++) {
    const px = cx + binX(k);
    const py = FLOOR_Y - (pmf[k] / pmfMax) * STACK_MAX_H * 0.96;
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  /* funnel rails + butter mouth */
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 60, 26);
  ctx.lineTo(cx - 13, 58);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 60, 26);
  ctx.lineTo(cx + 13, 58);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, 62, 16, 6.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = PASTELS.butter;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = INK;
  ctx.stroke();

  /* pegs — ink pins with paper shadows + highlights */
  for (let r = 0; r < ROWS; r++) {
    for (let k = 0; k <= r; k++) {
      const px = cx + (k - r / 2) * DX;
      const py = pegY(r);
      ctx.fillStyle = "rgba(27,22,17,0.14)";
      ctx.beginPath();
      ctx.ellipse(px + 2.4, py + 3.2, 4.4, 2.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2b231c";
      ctx.beginPath();
      ctx.arc(px, py, 4.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.beginPath();
      ctx.arc(px - 1.4, py - 1.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* flying trials — candy spheres */
  for (const b of sim.balls) {
    const [ax, ay] = pointAt(sim, b, b.seg);
    const [bx2, by2] = pointAt(sim, b, b.seg + 1);
    const x = ax + (bx2 - ax) * easeOut(b.t);
    const y = ay + (by2 - ay) * easeIn(b.t);
    const col = BALL_COLORS[b.colorIx];

    ctx.fillStyle = "rgba(27,22,17,0.13)";
    ctx.beginPath();
    ctx.ellipse(x + 2.2, y + 4.6, BALL_R * 0.92, BALL_R * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    const g = ctx.createRadialGradient(x - BALL_R * 0.35, y - BALL_R * 0.45, BALL_R * 0.12, x, y, BALL_R * 1.02);
    g.addColorStop(0, tint(col, 0.55));
    g.addColorStop(0.62, col);
    g.addColorStop(1, shade(col, 0.18));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(27,22,17,0.8)";
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }
}

/* ---------- 2D sticker companions ---------- */

function DieSticker() {
  return (
    <svg width="74" height="74" viewBox="0 0 64 64" aria-hidden="true" style={{ filter: "drop-shadow(5px 6px 0 rgba(27,22,17,0.82))" }}>
      <rect x="6" y="6" width="52" height="52" rx="13" fill="var(--rose)" stroke="#1b1611" strokeWidth="2.6" />
      {[
        [20, 20], [44, 20], [32, 32], [20, 44], [44, 44],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.6" fill="#1b1611" />
      ))}
      <rect x="11" y="11" width="14" height="8" rx="4" fill="rgba(255,255,255,0.45)" />
    </svg>
  );
}

function CoinSticker() {
  return (
    <svg width="66" height="66" viewBox="0 0 64 64" aria-hidden="true" style={{ filter: "drop-shadow(4px 5px 0 rgba(27,22,17,0.82))" }}>
      <circle cx="32" cy="32" r="26" fill="var(--butter)" stroke="#1b1611" strokeWidth="2.6" />
      <circle cx="32" cy="32" r="19" fill="none" stroke="#1b1611" strokeWidth="1.6" strokeDasharray="4 3" />
      <text x="32" y="39" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1b1611" fontFamily="var(--font-plex-mono), monospace">
        ½
      </text>
    </svg>
  );
}

function RingSticker() {
  return (
    <svg width="58" height="58" viewBox="0 0 64 64" aria-hidden="true" style={{ filter: "drop-shadow(4px 5px 0 rgba(27,22,17,0.78))" }}>
      <circle cx="32" cy="32" r="22" fill="none" stroke="var(--aqua)" strokeWidth="13" />
      <circle cx="32" cy="32" r="28.5" fill="none" stroke="#1b1611" strokeWidth="1.8" />
      <circle cx="32" cy="32" r="15.5" fill="none" stroke="#1b1611" strokeWidth="1.8" />
    </svg>
  );
}

function BallSticker() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true" style={{ filter: "drop-shadow(3px 4px 0 rgba(27,22,17,0.78))" }}>
      <circle cx="23" cy="23" r="17" fill="var(--mint-deep)" stroke="#1b1611" strokeWidth="2" />
      <circle cx="18" cy="18" r="5" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}

/* ---------- results card — the machine's measurement readout ---------- */

type Hud = { n: number; peak: string; counts: number[] };

function ResultsCard({ hud, onClose }: { hud: Hud; onClose: () => void }) {
  const maxC = Math.max(1, ...hud.counts);
  let peakIx = 0;
  for (let k = 1; k < BIN_COUNT; k++) if (hud.counts[k] > hud.counts[peakIx]) peakIx = k;
  const pct = (v: number) => (Math.round((v / Math.max(1, hud.n)) * 1000) / 10).toString().replace(".", ",");

  return (
    <motion.div
      className="relative w-[min(84vw,344px)] rounded-[18px] border-[2px] border-ink bg-paper"
      style={{ boxShadow: "8px 9px 0 0 rgba(27,22,17,0.85)", transformOrigin: "100% 42%" }}
      initial={{ opacity: 0, scale: 0.32, x: 30, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, x: 0, rotate: 0, transition: { type: "spring", stiffness: 230, damping: 20 } }}
      exit={{ opacity: 0, scale: 0.32, x: 30, rotate: 5, transition: { duration: 0.24, ease: [0.5, 0, 0.75, 0.4] } }}
      role="dialog"
      aria-label="Card hasil pembagian bola per kotak"
    >
      {/* header tape */}
      <div
        className="flex items-center justify-between gap-2 rounded-t-[15px] border-b-[2px] border-ink px-3.5 py-2.5"
        style={{ background: "linear-gradient(135deg, var(--lilac), var(--sky))" }}
      >
        <div>
          <div className="mono-label text-[10px]">HASIL PENGUKURAN</div>
          <div className="mono-label text-[8.5px] normal-case opacity-60">urut kiri → kanan · kotak 1 → 10</div>
        </div>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--rose-deep)" }} />
          <span className="mono-label text-[8.5px]">LIVE</span>
        </span>
      </div>

      {/* one row per bin — exactly the piles on the board, left to right */}
      <div className="relative px-3.5 py-3">
        <div className="dotgrid absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="relative space-y-[7px]">
          {hud.counts.map((c, k) => (
            <div key={k} className="flex items-center gap-2">
              <span className="mono-label w-[46px] shrink-0 text-[9px]">KOTAK {String(k + 1).padStart(2, "0")}</span>
              <div className="h-[9px] flex-1 overflow-hidden rounded-full border-[1.2px] border-ink/60 bg-white/55">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: sweep(BIN_SWEEP, k / (BIN_COUNT - 1)) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(c / maxC) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
              <span className="mono-data w-[64px] shrink-0 text-right text-[9.5px]">
                {c} <span className="opacity-55">· {pct(c)}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* footer — total + peak */}
      <div className="flex items-center justify-between gap-2 rounded-b-[15px] border-t-[1.5px] border-ink/70 bg-paper/80 px-3.5 py-2">
        <span className="mono-data text-[9.5px]">n = {hud.n.toLocaleString("id-ID")}</span>
        <span className="mono-data text-[9.5px] opacity-70">
          {hud.n > 0 ? `PUNCAK KOTAK ${String(peakIx + 1).padStart(2, "0")} · ${hud.peak}` : "PUNCAK: —"}
        </span>
      </div>

      {/* close — pops in after the morph, leaves with the reverse morph */}
      <motion.button
        className="absolute -right-3.5 -top-3.5 flex h-9 w-9 items-center justify-center rounded-full border-[2px] border-ink text-[15px] leading-none shadow-[2.5px_2.5px_0_0_var(--ink)]"
        style={{ background: "var(--butter)" }}
        initial={{ scale: 0, rotate: -140 }}
        animate={{ scale: 1, rotate: 0, transition: { delay: 0.26, type: "spring", stiffness: 320, damping: 15 } }}
        exit={{ scale: 0, rotate: 140, transition: { duration: 0.16, ease: "easeIn" } }}
        whileHover={{ scale: 1.12, rotate: 6 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        aria-label="Tutup card hasil"
      >
        ✕
      </motion.button>
    </motion.div>
  );
}

/* ---------- public component ---------- */

export default function HeroGalton() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scaleRef = useRef(1);
  const ctlRef = useRef<{ drop: (n: number, bias?: number) => void; reset: () => void } | null>(null);
  const stats = useRef<Hud>({ n: 0, peak: "+0,00σ", counts: new Array(BIN_COUNT).fill(0) });
  const [hud, setHud] = useState<Hud>({ n: 0, peak: "+0,00σ", counts: new Array(BIN_COUNT).fill(0) });
  const [open, setOpen] = useState(false);
  const [autoOn, setAutoOn] = useState(true);
  const autoRef = useRef(true);
  const [wide, setWide] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* track breakpoint so the slide-left distance stays sane on every screen */
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => setWide(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);

    /* fit the backing store to the rendered size, keep drawing in logical coords */
    const fit = () => {
      const cssW = canvas.clientWidth || LOGICAL_W;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cssH = (cssW * LOGICAL_H) / LOGICAL_W;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      scaleRef.current = (cssW / LOGICAL_W) * dpr;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    /* pre-seed the bell so the first paint already tells the story */
    const pmf = binomPMF(ROWS, 0.5);
    const pmfMax = Math.max(...pmf);
    const sim: Sim = {
      balls: [],
      counts: new Array(BIN_COUNT).fill(0),
      barH: new Array(BIN_COUNT).fill(0),
      total: 0,
      colorIx: 0,
    };
    for (let k = 0; k < BIN_COUNT; k++) {
      sim.counts[k] = Math.round(pmf[k] * 320);
      sim.total += sim.counts[k];
    }

    /* expose pour/reset controls to the HTML side */
    ctlRef.current = {
      drop: (n: number, bias = 0) => {
        for (let i = 0; i < n; i++) makeBall(sim, bias);
      },
      reset: () => {
        sim.balls = [];
        sim.counts = new Array(BIN_COUNT).fill(0);
        sim.barH = new Array(BIN_COUNT).fill(0);
        sim.total = 0;
      },
    };

    const spawnAcc = { v: 0 };
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(sim, dt, reduced, spawnAcc, autoRef.current);
      render(ctx, scaleRef.current, sim, pmf, pmfMax);

      /* publish counters + the full count row for the HUD chip and the results card */
      let mi = 0;
      for (let k = 1; k < BIN_COUNT; k++) if (sim.counts[k] > sim.counts[mi]) mi = k;
      const z = (mi - ROWS * 0.5) / Math.sqrt(ROWS * 0.25);
      stats.current = {
        n: sim.total,
        peak: `${z >= 0 ? "+" : "−"}${Math.abs(z).toFixed(2).replace(".", ",")}σ`,
        counts: sim.counts.slice(),
      };

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const iv = setInterval(() => setHud({ ...stats.current }), 220);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(iv);
      ro.disconnect();
      mq.removeEventListener("change", onMq);
      ctlRef.current = null;
    };
  }, []);

  const pourFromClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c || !ctlRef.current) return;
    const rect = c.getBoundingClientRect();
    const lx = ((e.clientX - rect.left) / rect.width) * LOGICAL_W;
    const bias = clamp((lx - LOGICAL_W / 2) / 190, -1, 1);
    ctlRef.current.drop(6, bias);
  };

  const toggleAuto = () => {
    autoRef.current = !autoRef.current;
    setAutoOn(autoRef.current);
  };

  const shift = wide ? -150 : -34;

  return (
    <div className="relative select-none">
      {/* everything on the machine stage slides left together while the results card is open */}
      <motion.div
        className="will-change-transform"
        style={{ perspective: "1300px" }}
        animate={{ x: open ? shift : 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 23 }}
      >
        <div className="relative mx-auto w-fit" style={{ transformStyle: "preserve-3d", transform: "rotateX(2.2deg)" }}>
          {/* deepest paper layer — the plate the machine hangs on */}
          <Parallax depth={8} className="absolute -left-8 -right-8 -top-6 -bottom-14 -z-10 hidden md:block">
            <div
              className="absolute inset-0 rotate-[2deg] rounded-[36px] border-[2px] border-ink"
              style={{
                background: "linear-gradient(165deg, var(--rose) 0%, var(--lilac) 52%, var(--sky) 100%)",
                boxShadow: "12px 14px 0 0 rgba(27,22,17,0.16)",
              }}
            />
          </Parallax>

          {/* THE MACHINE — a rectangular laboratory window */}
          <Parallax depth={15}>
            <div
              className="relative w-[min(92vw,656px)] rounded-[26px] border-[2.5px] border-ink bg-paper p-[9px]"
              style={{ boxShadow: "10px 12px 0 0 rgba(27,22,17,0.85)" }}
            >
              {/* glass interior */}
              <div className="relative overflow-hidden rounded-[20px] border-[1.5px] border-ink">
                <div className="machine-glass absolute inset-0" aria-hidden="true" />
                <div className="dotgrid absolute inset-0 opacity-30" aria-hidden="true" />
                <canvas
                  ref={canvasRef}
                  onClick={pourFromClick}
                  role="img"
                  aria-label="Papan Galton hidup — klik untuk menjatuhkan bola"
                  className="relative block w-full cursor-pointer"
                  style={{ aspectRatio: `${LOGICAL_W} / ${LOGICAL_H}` }}
                />
                <div className="machine-sheen pointer-events-none absolute inset-0" aria-hidden="true" />

                {/* live counter — bottom-right, clear of the nameplate on the frame */}
                <div className="pointer-events-none absolute bottom-2.5 right-2.5 z-10 hidden sm:block">
                  <span
                    className="mono-data border-[1.5px] border-ink bg-paper/85 px-2 py-1 text-[10.5px] shadow-[2px_2px_0_0_var(--ink)]"
                    style={{ letterSpacing: "0.06em" }}
                  >
                    n = {hud.n.toLocaleString("id-ID")} PERCOBAAN · PUNCAK {hud.peak}
                  </span>
                </div>
              </div>

              {/* nameplate pinned on the frame */}
              <div className="pointer-events-none absolute left-1/2 top-[9px] z-10 -translate-x-1/2">
                <span className="mono-label border-[1.5px] border-ink bg-paper px-2.5 py-[3px] shadow-[2px_2px_0_0_var(--ink)]">
                  MESIN PELUANG — SPESIMEN Nº00
                </span>
              </div>

              {/* rivets */}
              <span className="rivet left-[5px] top-[40%]" aria-hidden="true" />
              <span className="rivet right-[5px] top-[40%]" aria-hidden="true" />
              <span className="rivet bottom-[12px] left-[13px]" aria-hidden="true" />
              <span className="rivet bottom-[12px] right-[13px]" aria-hidden="true" />
            </div>
          </Parallax>

          {/* pedestal + feet + ground shadow */}
          <div className="relative mx-auto -mt-[2px] w-[min(103vw,700px)]">
            <div
              className="gpanel g-butter flex h-10 items-center justify-center rounded-[16px] border-[2px] border-ink"
              style={{ boxShadow: "7px 8px 0 0 rgba(27,22,17,0.85)" }}
            >
              <span className="mono-label text-ink/80">PAPAN GALTON — UNIT Nº00 · DIJAMIN KONVERGEN</span>
            </div>
            <div className="flex justify-between px-[8%]">
              <div className="h-[13px] w-[36px] rounded-b-[7px] border-x-[2px] border-b-[2px] border-ink bg-ink" />
              <div className="h-[13px] w-[36px] rounded-b-[7px] border-x-[2px] border-b-[2px] border-ink bg-ink" />
            </div>
            <div
              className="mx-auto mt-1.5 h-[18px] w-[62%] rounded-[100%]"
              style={{ background: "radial-gradient(closest-side, rgba(27,22,17,0.17), transparent)" }}
            />
          </div>

          {/* floating companions — 2D stickers with paper shadows */}
          <FloatObj depth={30} amp={9} dur={6} className="-left-24 top-[12%] hidden md:block">
            <div className="-rotate-[8deg]">
              <DieSticker />
            </div>
          </FloatObj>
          <FloatObj depth={24} amp={8} dur={5.2} delay={0.6} className="-right-20 top-[46%] hidden md:block">
            <div className="rotate-[6deg]">
              <CoinSticker />
            </div>
          </FloatObj>
          <FloatObj depth={20} amp={7} dur={5.6} delay={0.9} className="-right-12 top-[3%] hidden lg:block">
            <RingSticker />
          </FloatObj>
          <FloatObj depth={26} amp={8} dur={4.8} delay={0.3} className="-left-14 bottom-[9%] hidden lg:block">
            <BallSticker />
          </FloatObj>
        </div>

        {/* pour controls — the machine obeys (auto drip included) */}
        <div className="relative flex flex-wrap items-center justify-center gap-2.5 pt-6">
          <button data-hot className="btn btn-red" onClick={() => ctlRef.current?.drop(10)}>
            Jatuhkan 10 bola
          </button>
          <button data-hot className="btn btn-grad" onClick={() => ctlRef.current?.drop(60)}>
            Hujani 60 bola
          </button>
          <button
            data-hot
            className={`btn ${autoOn ? "btn-grad" : ""}`}
            onClick={toggleAuto}
            aria-pressed={!autoOn}
            title="Bola jatuh otomatis terus-menerus — matikan kalau mau kendali penuh"
          >
            {autoOn ? "Auto bola: ON" : "Auto bola: OFF"}
          </button>
          <button data-hot className="btn" onClick={() => ctlRef.current?.reset()}>
            Kosongkan
          </button>
        </div>

        {/* legend — what the eye is looking at */}
        <div className="relative flex flex-wrap items-center justify-center gap-2 pt-3">
          <span className="float-tag inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-[3px] border-[1.2px] border-ink"
              style={{ background: "linear-gradient(90deg,#8fb5ff,#a88bff,#f78cab,#ff9e6e)" }}
            />
            TUMPUKAN HASIL — TEMPAT BOLA MENDARAT
          </span>
          <span className="float-tag inline-flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-[2px] border-dashed" style={{ borderColor: "#e23d28" }} />
            TEORI — BINOMIAL, TEPAT
          </span>
          <span className="float-tag hidden items-center gap-1.5 sm:inline-flex">KLIK KACANYA = JATUHKAN BOLA</span>
        </div>
      </motion.div>

      {/* right rail — the galton-flavored toggle that morphs into the results card */}
      <div className="absolute right-1 top-1/2 z-20 flex -translate-y-1/2 justify-end md:right-2">
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <ResultsCard key="results" hud={hud} onClose={() => setOpen(false)} />
          ) : (
            <motion.button
              key="toggle"
              className="flex flex-col items-center gap-2 rounded-[18px] border-[2px] border-ink bg-paper px-5 py-4"
              style={{ boxShadow: "7px 8px 0 0 rgba(27,22,17,0.85)", transformOrigin: "100% 50%" }}
              initial={{ opacity: 0, scale: 0.3, x: 24, rotate: -7 }}
              animate={{ opacity: 1, scale: 1, x: 0, rotate: 2, transition: { type: "spring", stiffness: 240, damping: 18 } }}
              exit={{ opacity: 0, scale: 0.3, x: 24, rotate: 7, transition: { duration: 0.18, ease: "easeIn" } }}
              whileHover={{ scale: 1.05, rotate: 0, y: -3 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              data-hot
            >
              {/* a tiny galton of its own — the ball never stops bouncing */}
              <span className="hrt-track" aria-hidden="true">
                <span className="hrt-peg" style={{ left: "12px" }} />
                <span className="hrt-peg" style={{ right: "12px" }} />
                <span className="hrt-ball" />
              </span>
              <span className="mono-label text-[10.5px]">HASIL PER KOTAK</span>
              <span className="mono-data text-[9px] opacity-60">
                n = {hud.n.toLocaleString("id-ID")} · KLIK → BUKA
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
