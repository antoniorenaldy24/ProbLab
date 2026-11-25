/* PROBLAB Nº01 — The Galton Board: living canvas engine.
   The board design is lifted 1:1 from the hero's MESIN PELUANG: candy balls,
   pastel pile columns, ink pegs, the dashed binomial promise — all inside the
   same rectangular laboratory window (glass, rivets, nameplate).
   Deliberately WITHOUT the mouse parallax and WITHOUT the diorama wrapper
   (backplate, pedestal, stickers): here the board itself is the instrument. */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fitCanvas, useRaf } from "@/lib/problab/canvas";
import { INK, PASTELS, RED, clamp, fmt, fmtInt } from "@/lib/problab/core";
import { Btn, LabSlider } from "./kit";

/* ---------- candy color helpers — same recipe as the hero machine ---------- */

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

const BIN_SWEEP = [PASTELS.skyDeep, PASTELS.lilacDeep, PASTELS.roseDeep, PASTELS.peachDeep];
const BALL_PALETTE = [
  PASTELS.roseDeep,
  PASTELS.peachDeep,
  PASTELS.butterDeep,
  PASTELS.mintDeep,
  PASTELS.skyDeep,
  PASTELS.lilacDeep,
  PASTELS.aquaDeep,
];

/* ---------- simulation ---------- */

type Ball = {
  x0: number; // release x
  seg: number; // completed transitions (0 = falling from funnel throat)
  t: number; // progress within current segment
  path: number[]; // +1 / -1 per row
  color: string;
};

const SEG_MS = 118; // per row at speed 1

function binomPMF(rows: number, p: number): number[] {
  const pmf: number[] = new Array(rows + 1).fill(0);
  let c = 1;
  for (let k = 0; k <= rows; k++) {
    pmf[k] = c * Math.pow(p, k) * Math.pow(1 - p, rows - k);
    c = (c * (rows - k)) / (k + 1);
  }
  return pmf;
}

export default function GaltonEngine({ variant }: { variant: "hero" | "full" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const box = useRef({ w: 800, h: 480 });
  const balls = useRef<Ball[]>([]);
  const counts = useRef<number[]>([]);
  const pending = useRef(0);
  const spawnAcc = useRef(0);
  const total = useRef(0);
  const sumX = useRef(0);
  const sumX2 = useRef(0);
  const colorIx = useRef(0);
  const cfg = useRef({ rows: 11, bias: 0.5, speed: 1.15 });

  const [rows, setRows] = useState(variant === "hero" ? 11 : 12);
  const [bias, setBias] = useState(0.5);
  const [speed, setSpeed] = useState(1.15);
  const [auto, setAuto] = useState(variant === "hero");
  const [showTheory, setShowTheory] = useState(true);
  const [stats, setStats] = useState({ landed: 0, flight: 0, mean: 0, sd: 0 });

  useEffect(() => {
    cfg.current = { rows, bias, speed };
  }, [rows, bias, speed]);

  const reset = useCallback(() => {
    balls.current = [];
    counts.current = new Array(cfg.current.rows + 1).fill(0);
    pending.current = 0;
    total.current = 0;
    sumX.current = 0;
    sumX2.current = 0;
    setStats({ landed: 0, flight: 0, mean: 0, sd: 0 });
  }, []);

  useEffect(() => {
    // Intentional: changing the row count rebuilds the whole board.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reset();
  }, [reset, rows]);

  const makeBall = useCallback((atX?: number): Ball => {
    const { rows: r, bias: p } = cfg.current;
    const path: number[] = [];
    for (let i = 0; i < r; i++) path.push(Math.random() < p ? 1 : -1);
    colorIx.current = (colorIx.current + 1) % BALL_PALETTE.length;
    return {
      x0: atX === undefined ? box.current.w / 2 : clamp(atX, 18, box.current.w - 18),
      seg: 0,
      t: 0,
      path,
      color: BALL_PALETTE[colorIx.current],
    };
  }, []);

  const drop = useCallback(
    (n: number, atX?: number) => {
      if (atX !== undefined && balls.current.length < 110) {
        balls.current.push(makeBall(atX));
        pending.current = Math.max(0, pending.current + n - 1);
      } else {
        pending.current += n;
      }
    },
    [makeBall]
  );

  /* ---------- layout ---------- */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    return fitCanvas(c, (w, h) => {
      box.current = { w, h };
    });
  }, []);

  /* ---------- stats snapshot ---------- */
  useEffect(() => {
    const iv = setInterval(() => {
      const n = total.current;
      const mean = n ? sumX.current / n : 0;
      const varr = n > 1 ? Math.max(0, sumX2.current / n - mean * mean) : 0;
      setStats({
        landed: n,
        flight: balls.current.length + pending.current,
        mean,
        sd: Math.sqrt(varr),
      });
    }, 240);
    return () => clearInterval(iv);
  }, []);

  /* idle auto trickle */
  useEffect(() => {
    if (!auto) return;
    const iv = setInterval(() => {
      if (pending.current === 0 && balls.current.length < 55) drop(1 + Math.floor(Math.random() * 3));
    }, 1050);
    return () => clearInterval(iv);
  }, [auto, drop]);

  /* ---------- simulation + render ---------- */
  const theoryMax = useMemo(() => Math.max(...binomPMF(rows, bias)), [rows, bias]);

  useRaf((dt) => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const { w, h } = box.current;
    const R = cfg.current.rows;
    const speedNow = cfg.current.speed;

    const mx = 26;
    const binH = Math.max(92, Math.min(h * 0.3, 190));
    const topY = 52;
    const d = (w - mx * 2) / (R + 1);
    const dy = Math.max(16, (h - topY - binH - 26) / R);
    const cx = w / 2;

    const pegYr = (row: number) => topY + (row - 1) * dy;
    const binX = (k: number) => cx + (k - R / 2) * d;
    const floorY = h - 28;
    const pegLast = topY + (R - 1) * dy;
    const pileMax = Math.max(46, floorY - pegLast - 18);
    const pileW = d * 0.62;
    const rb = clamp(d * 0.11, 4.2, 6.5); // ball radius
    const pr = clamp(d * 0.075, 2.4, 4.2); // peg radius
    const mouthY = topY - dy; // funnel throat level

    /* spawn from queue */
    if (pending.current > 0) {
      spawnAcc.current += dt;
      const rate = Math.max(14, Math.min(140, 1400 / pending.current));
      while (spawnAcc.current > rate && balls.current.length < 110 && pending.current > 0) {
        spawnAcc.current -= rate;
        balls.current.push(makeBall());
        pending.current--;
      }
    }

    /* advance balls */
    const segMs = SEG_MS / speedNow;
    const landed: number[] = [];
    for (const b of balls.current) {
      // simulation objects are intentionally mutable outside React's tree
      // eslint-disable-next-line react-hooks/immutability
      b.t += dt / segMs;
      while (b.t >= 1) {
        b.t -= 1;
        b.seg += 1;
        if (b.seg >= R + 1) {
          const rights = b.path.reduce((a, v) => a + (v === 1 ? 1 : 0), 0);
          landed.push(rights);
          break;
        }
      }
    }
    if (landed.length) {
      balls.current = balls.current.filter((b) => b.seg < R + 1);
      for (const k of landed) {
        counts.current[k] = (counts.current[k] || 0) + 1;
        total.current += 1;
        sumX.current += k;
        sumX2.current += k * k;
      }
    }

    /* ---------- draw — flat shapes, candy depth, hero machine style ---------- */
    /* canvas stays transparent: the machine-glass wash lives behind it in CSS */
    ctx.clearRect(0, 0, w, h);
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 2.4);
    const easeIn = (t: number) => t * t;

    /* pile ground shadows */
    const maxC = Math.max(1, ...counts.current);
    for (let k = 0; k <= R; k++) {
      const hgt = ((counts.current[k] || 0) / maxC) * pileMax * 0.94;
      if (hgt < 2) continue;
      ctx.fillStyle = "rgba(27,22,17,0.13)";
      ctx.beginPath();
      ctx.ellipse(binX(k) + 3, floorY + 3, pileW * 0.53, 4.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /* bin piles — candy cylinders with side shading */
    for (let k = 0; k <= R; k++) {
      const hgt = ((counts.current[k] || 0) / maxC) * pileMax * 0.94;
      if (hgt < 2) continue;
      const col = sweep(BIN_SWEEP, k / R);
      const x = binX(k) - pileW / 2;
      const y = floorY - hgt;
      const r = Math.min(5, pileW * 0.18);

      const body = () => {
        ctx.beginPath();
        ctx.moveTo(x, floorY);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.lineTo(x + pileW - r, y);
        ctx.quadraticCurveTo(x + pileW, y, x + pileW, y + r);
        ctx.lineTo(x + pileW, floorY);
        ctx.closePath();
      };

      const g = ctx.createLinearGradient(0, y, 0, floorY);
      g.addColorStop(0, tint(col, 0.4));
      g.addColorStop(1, col);
      ctx.fillStyle = g;
      body();
      ctx.fill();

      /* cylinder feel: left highlight, right shade */
      ctx.fillStyle = "rgba(255,255,255,0.34)";
      ctx.fillRect(x + 3, y + 4, 3.2, Math.max(0, hgt - 8));
      ctx.fillStyle = "rgba(27,22,17,0.13)";
      ctx.fillRect(x + pileW - 6.4, y + 4, 3.2, Math.max(0, hgt - 8));

      ctx.strokeStyle = "rgba(27,22,17,0.9)";
      ctx.lineWidth = 1.5;
      body();
      ctx.stroke();
    }

    /* bin dividers with pin finials */
    const divH = Math.min(88, pileMax * 0.7);
    for (let i = 0; i <= R; i++) {
      const x = binX(i) - d / 2;
      ctx.strokeStyle = "rgba(27,22,17,0.85)";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, floorY - divH);
      ctx.lineTo(x, floorY);
      ctx.stroke();
      ctx.fillStyle = "rgba(27,22,17,0.85)";
      ctx.beginPath();
      ctx.arc(x, floorY - divH, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }

    /* floor strip */
    ctx.fillStyle = INK;
    ctx.fillRect(binX(0) - d / 2 - 8, floorY, binX(R) - binX(0) + d + 16, 9);

    /* the exact promise — dashed binomial bell curve */
    if (showTheory) {
      const pmf = binomPMF(R, cfg.current.bias);
      ctx.strokeStyle = RED;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([8, 6]);
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let k = 0; k <= R; k++) {
        const px = binX(k);
        const py = floorY - (pmf[k] / theoryMax) * pileMax * 0.96;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    /* funnel rails + butter mouth */
    const spread = Math.max(d * 1.15, 30);
    const half = Math.max(11, d * 0.26);
    const railTop = Math.max(8, mouthY - 32);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - spread, railTop);
    ctx.lineTo(cx - half, mouthY - 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + spread, railTop);
    ctx.lineTo(cx + half, mouthY - 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, mouthY + 4, half * 0.62 + 4, 6.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = PASTELS.butter;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = INK;
    ctx.stroke();

    /* pegs — ink pins with paper shadows + highlights */
    for (let r = 0; r < R; r++) {
      for (let k = 0; k <= r; k++) {
        const px = cx + (k - r / 2) * d;
        const py = pegYr(r + 1);
        ctx.fillStyle = "rgba(27,22,17,0.14)";
        ctx.beginPath();
        ctx.ellipse(px + 2.4, py + 3.2, pr * 1.02, pr * 0.53, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2b231c";
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.72)";
        ctx.beginPath();
        ctx.arc(px - pr * 0.33, py - pr * 0.35, pr * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* flying trials — candy spheres */
    for (const b of balls.current) {
      const tt = Math.min(1, b.t);
      let x: number, y: number;
      if (b.seg === 0) {
        /* throat → first peg row */
        y = mouthY - 22 + (topY - (mouthY - 22)) * easeIn(tt);
        x = b.x0 + (cx - b.x0) * easeOut(tt);
      } else {
        const r = b.seg;
        const kPrev = b.path.slice(0, r - 1).reduce((a, v) => a + (v === 1 ? 1 : 0), 0) - (r - 1) / 2;
        const dir = b.path[r - 1];
        x = cx + kPrev * d + ((cx + (kPrev + dir / 2) * d) - (cx + kPrev * d)) * easeOut(tt);
        y = pegYr(r) + (pegYr(r + 1) - pegYr(r)) * easeIn(tt);
      }

      ctx.fillStyle = "rgba(27,22,17,0.13)";
      ctx.beginPath();
      ctx.ellipse(x + 2.2, y + 4.6, rb * 0.92, rb * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      const g = ctx.createRadialGradient(x - rb * 0.35, y - rb * 0.45, rb * 0.12, x, y, rb * 1.02);
      g.addColorStop(0, tint(b.color, 0.55));
      g.addColorStop(0.62, b.color);
      g.addColorStop(1, shade(b.color, 0.18));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, rb, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(27,22,17,0.8)";
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
  }, true);

  /* ---------- pointer release ---------- */
  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    drop(1, e.clientX - rect.left);
    if (!auto) setAuto(true);
  };

  const thMean = rows * bias;
  const thSd = Math.sqrt(rows * bias * (1 - bias));

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-stretch">
      {/* the board — same rectangular laboratory window as the hero machine */}
      <div className="relative flex-1 min-w-0">
        <div
          className="relative rounded-[26px] border-[2.5px] border-ink bg-paper p-[9px]"
          style={{ boxShadow: "10px 12px 0 0 rgba(27,22,17,0.85)" }}
        >
          {/* glass interior */}
          <div className="relative overflow-hidden rounded-[20px] border-[1.5px] border-ink">
            <div className="machine-glass absolute inset-0" aria-hidden="true" />
            <div className="dotgrid absolute inset-0 opacity-30" aria-hidden="true" />
            <canvas
              ref={canvasRef}
              onPointerDown={onPointer}
              className="relative block w-full h-[46vh] min-h-[340px] lg:h-[560px] cursor-crosshair touch-none"
              aria-label="Papan Galton: klik buat ngelepas bola"
            />
            <div className="machine-sheen pointer-events-none absolute inset-0" aria-hidden="true" />

            {/* instrument chips */}
            <div className="absolute right-3 top-3 z-10 flex gap-2">
              <button
                data-hot
                onClick={() => setShowTheory((s) => !s)}
                className="chip shadow-[2px_2px_0_0_var(--ink)] bg-paper"
                style={showTheory ? { background: RED, color: "#f6f1e6" } : undefined}
              >
                TEORI
              </button>
              <button
                data-hot
                onClick={() => setAuto((s) => !s)}
                className="chip shadow-[2px_2px_0_0_var(--ink)] bg-paper"
                style={auto ? { background: "var(--sun)" } : undefined}
              >
                OTOMATIS {auto ? "NYALA" : "MATI"}
              </button>
            </div>
          </div>

          {/* nameplate pinned on the frame */}
          <div className="pointer-events-none absolute left-1/2 top-[9px] z-10 hidden -translate-x-1/2 sm:block">
            <span className="mono-label border-[1.5px] border-ink bg-paper px-2.5 py-[3px] shadow-[2px_2px_0_0_var(--ink)]">
              MESIN PELUANG — SPESIMEN Nº01
            </span>
          </div>

          {/* rivets */}
          <span className="rivet left-[5px] top-[40%]" aria-hidden="true" />
          <span className="rivet right-[5px] top-[40%]" aria-hidden="true" />
          <span className="rivet bottom-[12px] left-[13px]" aria-hidden="true" />
          <span className="rivet bottom-[12px] right-[13px]" aria-hidden="true" />
        </div>
      </div>

      {/* instrument panel */}
      <aside className="lg:w-[300px] shrink-0 flex flex-col gap-4">
        <div className="panel-flat p-4 flex flex-col gap-4">
          <div className="mono-label border-b border-ink-faint pb-2">PELUNCUR BOLA</div>
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="red" onClick={() => drop(1)}>Lepas 1</Btn>
            <Btn onClick={() => drop(10)}>Lepas 10</Btn>
            <Btn onClick={() => drop(100)}>Lepas 100</Btn>
            <Btn variant="ink" onClick={() => drop(500)}>Lepas 500</Btn>
          </div>
          <p className="marginal normal-case tracking-normal opacity-70">
            Atau klik di mana aja di papan buat ngelepas bola dari titik itu. Corongnya yang urus sisanya.
          </p>
          <div className="flex flex-col gap-3 border-t border-ink-faint pt-3">
            <LabSlider label="Baris pasak" value={rows} min={6} max={15} onChange={setRows} />
            <LabSlider
              label="Kemiringan pasak — P(kanan)"
              value={bias}
              min={0.12}
              max={0.88}
              step={0.01}
              onChange={setBias}
              display={fmt(bias, 2)}
            />
            <LabSlider
              label="Tempo"
              value={speed}
              min={0.5}
              max={2.4}
              step={0.05}
              onChange={setSpeed}
              display={`×${fmt(speed, 2)}`}
            />
          </div>
          <Btn onClick={reset} className="w-full">Reset mesinnya</Btn>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="readout">
            <div className="k">Mendarat</div>
            <div className="v">{fmtInt(stats.landed)}</div>
          </div>
          <div className="readout">
            <div className="k">Di udara</div>
            <div className="v">{fmtInt(stats.flight)}</div>
          </div>
          <div className="readout">
            <div className="k">Rata-rata (obs)</div>
            <div className="v" style={{ color: "var(--sky-deep)" }}>{fmt(stats.mean, 2)}</div>
          </div>
          <div className="readout">
            <div className="k">Teori np</div>
            <div className="v" style={{ color: RED }}>{fmt(thMean, 2)}</div>
          </div>
          <div className="readout">
            <div className="k">Sebaran (obs)</div>
            <div className="v" style={{ color: "var(--sky-deep)" }}>{fmt(stats.sd, 2)}</div>
          </div>
          <div className="readout">
            <div className="k">√(np(1−p))</div>
            <div className="v" style={{ color: RED }}>{fmt(thSd, 2)}</div>
          </div>
        </div>

        <div className="hidden lg:block marginal leading-relaxed">
          Kurva merah putus-putus itu prediksi binomial buat kemiringan yang kamu pilih sekarang — tumpukan permen
          terus ngerapalin bentuknya ke arah situ, satu bola demi satu bola.
        </div>
      </aside>
    </div>
  );
}
