/* PROBLAB Nº00 — THE SHAPE OF CHANCE
   The lab's identity piece: pastel trials rain out of one funnel, pile into a living
   histogram, and the exact bell curve stands beside it, dashed, waiting to be matched.
   Not an instrument — the thing the instruments are all about. PELUANG, DRAWN LIVE. */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { PASTEL_LIST } from "@/lib/problab/core";

type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number; // the lane fate assigned to this trial
  r: number;
  c: string;
  wob: number;
};
type Puff = { x: number; y: number; a: number; r: number };

const INK_RGB = "27,22,17";
const NB = 45; // bins across the outcome space
const SIGMA_FRAC = 0.15; // bell width as a fraction of canvas width
const FUNNEL_HALF = 30;

export default function ShapeOfChance({ height = 420 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const balls = useRef<Ball[]>([]);
  const puffs = useRef<Puff[]>([]);
  const counts = useRef<number[]>([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const box = useRef({ w: 900, h: height });
  const drops = useRef(0);
  const spawnAcc = useRef(0);
  const [n, setN] = useState(0);
  const [poured, setPoured] = useState(0);
  const [peak, setPeak] = useState("±0.00σ");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let binW = 20;
    let floorY = height - 30;
    let maxBarH = 240;

    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      box.current = { w, h };
      binW = w / NB;
      floorY = h - 30;
      maxBarH = Math.max(90, h - 132);
      if (counts.current.length !== NB) counts.current = new Array(NB).fill(0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    /* approximately standard normal via 4 uniforms */
    const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 1.155;

    const spawnBall = (atX?: number) => {
      const { w } = box.current;
      const z = gauss();
      const target = Math.min(w - 10, Math.max(10, w / 2 + z * w * SIGMA_FRAC));
      const x = atX ?? w / 2 + (Math.random() - 0.5) * 10;
      balls.current.push({
        x,
        y: 34,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0.6 + Math.random() * 0.7,
        tx: target,
        r: 3.2 + Math.random() * 3,
        c: PASTEL_LIST[Math.floor(Math.random() * PASTEL_LIST.length)],
        wob: Math.random() * Math.PI * 2,
      });
    };

    const reportStats = () => {
      setN(drops.current);
      let mi = 0;
      for (let i = 1; i < NB; i++) if (counts.current[i] > counts.current[mi]) mi = i;
      const { w } = box.current;
      const zAtPeak = ((mi + 0.5) * binW - w / 2) / (w * SIGMA_FRAC);
      setPeak(`${zAtPeak >= 0 ? "+" : "−"}${Math.abs(zAtPeak).toFixed(2)}σ`);
    };

    /* pre-seed so the very first paint already shows a forming bell */
    for (let i = 0; i < 520; i++) {
      const { w } = box.current;
      const z = gauss();
      const x = w / 2 + z * w * SIGMA_FRAC;
      const idx = Math.min(NB - 1, Math.max(0, Math.floor(x / binW)));
      counts.current[idx] += 1;
      drops.current += 1;
    }
    reportStats();

    const land = (b: Ball) => {
      const i = Math.min(NB - 1, Math.max(0, Math.floor(b.x / binW)));
      counts.current[i] += 1;
      drops.current += 1;
      puffs.current.push({ x: b.x, y: b.y, a: 1, r: b.r });
      if (drops.current % 30 === 0) reportStats();
    };

    const draw = () => {
      const { w, h } = box.current;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;

      /* the funnel every trial falls through */
      ctx.strokeStyle = `rgba(${INK_RGB},0.9)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - FUNNEL_HALF, 4);
      ctx.lineTo(cx - 9, 30);
      ctx.lineTo(cx + 9, 30);
      ctx.lineTo(cx + FUNNEL_HALF, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - FUNNEL_HALF, 4);
      ctx.lineTo(cx + FUNNEL_HALF, 4);
      ctx.stroke();

      /* empirical bars — one continuous pastel sweep across the whole outcome space */
      const maxCount = Math.max(1, ...counts.current);
      const sweep = ctx.createLinearGradient(0, 0, w, 0);
      sweep.addColorStop(0, "#b9d4ff");
      sweep.addColorStop(0.38, "#d3c0ff");
      sweep.addColorStop(0.68, "#ffc2d1");
      sweep.addColorStop(1, "#ffcfae");
      ctx.strokeStyle = `rgba(${INK_RGB},0.85)`;
      ctx.lineWidth = 1.1;
      for (let i = 0; i < NB; i++) {
        if (counts.current[i] <= 0) continue;
        const bh = Math.max(3, (counts.current[i] / maxCount) * maxBarH);
        const bx = i * binW + 1;
        const bw = Math.max(2, binW - 2);
        ctx.fillStyle = sweep;
        ctx.fillRect(bx, floorY - bh, bw, bh);
        ctx.strokeRect(bx, floorY - bh, bw, bh);
      }

      /* the exact promise — dashed theory bell, normalized to the same scale as the bars */
      const sigma = w * SIGMA_FRAC;
      const twoSigSq = 2 * sigma * sigma;
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = `rgba(${INK_RGB},0.8)`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= NB; i++) {
        const x = i * binW;
        const rel = Math.exp(-((x - cx) * (x - cx)) / twoSigSq);
        const y = floorY - Math.min(maxBarH, rel * maxBarH * 0.94);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      /* μ marker on the axis */
      ctx.strokeStyle = `rgba(${INK_RGB},0.9)`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx, floorY);
      ctx.lineTo(cx, floorY + 7);
      ctx.stroke();

      /* falling trials */
      for (const b of balls.current) {
        ctx.fillStyle = b.c;
        ctx.strokeStyle = `rgba(${INK_RGB},0.9)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      /* landing puffs */
      for (const p of puffs.current) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + (1 - p.a) * 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${INK_RGB},${(0.3 * p.a).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      /* baseline */
      ctx.strokeStyle = `rgba(${INK_RGB},0.95)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(w, floorY);
      ctx.stroke();
    };

    const step = () => {
      const { w } = box.current;
      /* steady drip of trials — one every ~2.5 frames */
      spawnAcc.current += 1;
      if (spawnAcc.current >= 2.5 && balls.current.length < 200) {
        spawnAcc.current = 0;
        spawnBall();
      }
      for (const b of balls.current) {
        b.vy = Math.min(9.5, b.vy + 0.34);
        b.vx += (b.tx - b.x) * 0.012; // drift toward the lane fate assigned
        b.vx += Math.sin(b.wob + b.y * 0.06) * 0.04; // nervous wobble
        const dx = b.x - mouse.current.x;
        const dy = b.y - mouse.current.y;
        const d = Math.hypot(dx, dy);
        if (d < 90 && d > 0.01) {
          const f = ((90 - d) / 90) * 0.9;
          b.vx += (dx / d) * f;
          b.vy += (dy / d) * 0.35;
        }
        b.vx *= 0.94;
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.6; }
        if (b.x > w - b.r) { b.x = w - b.r; b.vx = -Math.abs(b.vx) * 0.6; }
      }
      /* trials land on the current pile top — real piling, not the floor */
      const maxCountNow = Math.max(1, ...counts.current);
      const landed: Ball[] = [];
      for (const b of balls.current) {
        const i = Math.min(NB - 1, Math.max(0, Math.floor(b.x / binW)));
        const bh = (counts.current[i] / maxCountNow) * maxBarH;
        if (b.y >= floorY - bh - b.r * 0.4) landed.push(b);
      }
      if (landed.length > 0) {
        const landedSet = new Set(landed);
        balls.current = balls.current.filter((b) => !landedSet.has(b));
        for (const b of landed) land(b);
      }
      for (const p of puffs.current) p.a -= 0.03;
      puffs.current = puffs.current.filter((p) => p.a > 0);
    };

    const toLocal = (e: { clientX: number; clientY: number }) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMove = (e: PointerEvent) => {
      mouse.current = toLocal(e);
    };
    const onLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };
    const onDown = (e: PointerEvent) => {
      const { x } = toLocal(e);
      for (let j = 0; j < 60; j++) spawnBall(x + (Math.random() - 0.5) * 56);
      setPoured((p) => p + 1);
    };

    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);

    if (reduced) {
      draw();
      return () => {
        ro.disconnect();
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerleave", onLeave);
        canvas.removeEventListener("pointerdown", onDown);
      };
    }

    let raf = requestAnimationFrame(function loop() {
      step();
      draw();
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, [height]);

  return (
    <div className="gpanel g-soft relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full cursor-crosshair touch-none"
        style={{ height }}
        aria-label="Bentuk peluang — uji coba pastel turun dari corong lalu menumpuk jadi histogram hidup, sementara kurva lonceng yang persis memantau dari garis putus-putus. Gerakkan kursor buat mengaduk uji coba yang jatuh, klik buat menuang enam puluh lagi."
        role="img"
      />
      <div className="absolute top-3 left-4 mono-label bg-paper/85 border-[1.5px] border-ink px-2 py-1">
        Nº00 — BENTUK PELUANG
      </div>
      <div className="absolute top-3 right-4 mono-data text-[10.5px] bg-paper/85 border-[1.5px] border-ink px-2 py-1 hidden sm:block" style={{ letterSpacing: "0.06em" }}>
        n = {n.toLocaleString("id-ID")} UJI COBA{poured > 0 ? ` · DITUANG ${poured}×` : ""} · PUNCAK {peak}
      </div>
      <div className="absolute bottom-3 left-4 mono-label bg-paper/85 border-[1.5px] border-ink px-2 py-1 hidden md:flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3.5 h-3.5" style={{ background: "linear-gradient(90deg,#b9d4ff,#d3c0ff,#ffc2d1,#ffcfae)", border: "1.2px solid var(--ink)" }} />
          EMPIRIS — TEMPAT UJI COBA NUMPUK
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-5 border-t-[2px] border-dashed border-ink" style={{ borderColor: "rgba(27,22,17,0.8)" }} />
          TEORI — PERSIS
        </span>
      </div>
      <div className="absolute bottom-3 right-4 mono-label bg-paper/85 border-[1.5px] border-ink px-2 py-1 hidden lg:block">
        GERAKKAN BUAT MENGADUK · KLIK BUAT MENUANG 60 · DIA SELALU BERKONVERGENSI
      </div>
    </div>
  );
}
