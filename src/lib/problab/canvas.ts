/* PROBLAB — canvas helpers: DPR sizing, RAF loop, chart primitives */
"use client";

import { useEffect, useRef } from "react";
import { INK, PAPER } from "./core";

export type CanvasBox = { w: number; h: number };

/** Setup a canvas for crisp DPR rendering; returns a cleanup. Calls `layout` on resize. */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  onLayout: (w: number, h: number) => void
): () => void {
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    onLayout(w, h);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  return () => ro.disconnect();
}

/** RAF loop hook; cb receives elapsed ms since last frame. Pauses when `active` is false. */
export function useRaf(cb: (dt: number) => void, active: boolean) {
  const ref = useRef(cb);
  useEffect(() => {
    ref.current = cb;
  });
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      ref.current(dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onVis = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [active]);
}

/* ---------- draw primitives (print-style) ---------- */

export function clearBox(ctx: CanvasRenderingContext2D, w: number, h: number, bg: string = PAPER) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
}

export function dashedLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  dash: number[] = [5, 4],
  width = 1.5
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export function monoText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: { size?: number; color?: string; align?: CanvasTextAlign; weight?: number; baseline?: CanvasTextBaseline } = {}
) {
  const { size = 10, color = INK, align = "left", weight = 500, baseline = "alphabetic" } = opts;
  ctx.save();
  ctx.font = `${weight} ${size}px "IBM Plex Mono", monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y);
  ctx.restore();
}
