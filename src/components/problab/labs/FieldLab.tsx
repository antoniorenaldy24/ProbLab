/* PROBLAB Nº08 — The Field: drag the events, the algebra obeys */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { fitCanvas, monoText, useRaf } from "@/lib/problab/canvas";
import { BLUE, INK, PAPER, PAPER2, RED, SUN, fmt, pct, rng } from "@/lib/problab/core";
import { LabSlider, Readout, Seg } from "../kit";

type Op = "A" | "B" | "and" | "or" | "amb" | "bma" | "not";

const OPS: { label: string; value: Op }[] = [
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "A ∩ B", value: "and" },
  { label: "A ∪ B", value: "or" },
  { label: "A − B", value: "amb" },
  { label: "B − A", value: "bma" },
  { label: "(A∪B)ᶜ", value: "not" },
];

type Dot = { x: number; y: number };

export default function FieldLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const box = useRef({ w: 760, h: 460 });
  const dots = useRef<Dot[]>([]);
  const circ = useRef({
    ax: 0.38, ay: 0.52, ar: 0.24,
    bx: 0.62, by: 0.52, br: 0.24,
  }); // normalized coords
  const dragOff = useRef({ dx: 0, dy: 0 });
  const [dragging, setDragging] = useState<"a" | "b" | null>(null);
  const [op, setOp] = useState<Op>("or");
  const [stats, setStats] = useState({ n: 240, a: 0, b: 0, ab: 0, au: 0 });
  const [radA, setRadA] = useState(0.24);
  const [radB, setRadB] = useState(0.24);

  /* seed dots once */
  useEffect(() => {
    const r = rng(20261123);
    dots.current = Array.from({ length: 240 }, () => ({ x: 0.06 + r() * 0.88, y: 0.1 + r() * 0.8 }));
  }, []);

  /* layout */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    return fitCanvas(c, (w, h) => {
      box.current = { w, h };
    });
  }, []);

  const membership = useCallback((d: Dot): { a: boolean; b: boolean } => {
    const c = circ.current;
    const { w, h } = box.current;
    const ax = c.ax * w, ay = c.ay * h, ar = c.ar * Math.min(w, h) * 1.05;
    const bx = c.bx * w, by = c.by * h, br = c.br * Math.min(w, h) * 1.05;
    const da = (d.x * w - ax) ** 2 + (d.y * h - ay) ** 2;
    const db = (d.x * w - bx) ** 2 + (d.y * h - by) ** 2;
    return { a: da <= ar * ar, b: db <= br * br };
  }, []);

  const recount = useCallback(() => {
    let a = 0, b = 0, ab = 0, au = 0;
    for (const d of dots.current) {
      const m = membership(d);
      if (m.a) a++;
      if (m.b) b++;
      if (m.a && m.b) ab++;
      if (m.a || m.b) au++;
    }
    setStats({ n: dots.current.length, a, b, ab, au });
  }, [membership]);

  useEffect(() => {
    circ.current.ar = radA;
    circ.current.br = radB;
    recount();
  }, [radA, radB, recount]);

  /* render */
  useRaf(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const { w, h } = box.current;
    const cc = circ.current;
    const ax = cc.ax * w, ay = cc.ay * h, ar = cc.ar * Math.min(w, h) * 1.05;
    const bx = cc.bx * w, by = cc.by * h, br = cc.br * Math.min(w, h) * 1.05;

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);

    const inA = (d: Dot) => ((d.x * w - ax) ** 2 + (d.y * h - ay) ** 2) <= ar * ar;
    const inB = (d: Dot) => ((d.x * w - bx) ** 2 + (d.y * h - by) ** 2) <= br * br;

    const memberColor = (d: Dot): string | null => {
      const a = inA(d), b = inB(d);
      switch (op) {
        case "A": return a ? BLUE : null;
        case "B": return b ? RED : null;
        case "and": return a && b ? SUN : null;
        case "or": return a && b ? SUN : a ? BLUE : b ? RED : null;
        case "amb": return a && !b ? BLUE : null;
        case "bma": return b && !a ? RED : null;
        case "not": return !a && !b ? INK : null;
      }
    };

    // circle tints (depth)
    ctx.beginPath();
    ctx.arc(ax, ay, ar, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(36,56,216,0.06)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(226,61,40,0.06)";
    ctx.fill();

    // dots
    for (const d of dots.current) {
      const x = d.x * w, y = d.y * h;
      const col = memberColor(d);
      ctx.beginPath();
      ctx.arc(x, y, 3.4, 0, Math.PI * 2);
      if (col) {
        ctx.fillStyle = col === INK ? PAPER2 : col;
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(27,22,17,0.13)";
        ctx.fill();
      }
    }

    // circles outlines
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = BLUE;
    ctx.beginPath();
    ctx.arc(ax, ay, ar, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = RED;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.stroke();

    // labels
    monoText(ctx, "A", ax, ay - ar + 18, { size: 15, align: "center", color: BLUE, weight: 600 });
    monoText(ctx, "B", bx, by - br + 18, { size: 15, align: "center", color: RED, weight: 600 });
    monoText(ctx, "GESER LINGKARANNYA — 240 TITIK = 240 DUNIA", 14, 20, { size: 9, color: "rgba(27,22,17,0.55)" });
  }, true);

  /* drag */
  const hit = (x: number, y: number): "a" | "b" | null => {
    const { w, h } = box.current;
    const cc = circ.current;
    const ax = cc.ax * w, ay = cc.ay * h, ar = cc.ar * Math.min(w, h) * 1.05;
    const bx = cc.bx * w, by = cc.by * h, br = cc.br * Math.min(w, h) * 1.05;
    const da = Math.hypot(x - ax, y - ay);
    const db = Math.hypot(x - bx, y - by);
    if (da <= ar && db <= br) return da < db ? "a" : "b"; // overlap: nearest wins
    if (da <= ar) return "a";
    if (db <= br) return "b";
    return null;
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const t = hit(x, y);
    if (!t) return;
    setDragging(t);
    const cc = circ.current;
    const px = t === "a" ? cc.ax * box.current.w : cc.bx * box.current.w;
    const py = t === "a" ? cc.ay * box.current.h : cc.by * box.current.h;
    dragOff.current = { dx: x - px, dy: y - py };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer may already be released (e.g. synthetic events) — drag still works via move events */
    }
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const { w, h } = box.current;
    const cc = circ.current;
    const nx = Math.min(1, Math.max(0, (x - dragOff.current.dx) / w));
    const ny = Math.min(1, Math.max(0, (y - dragOff.current.dy) / h));
    if (dragging === "a") {
      cc.ax = nx;
      cc.ay = ny;
    } else {
      cc.bx = nx;
      cc.by = ny;
    }
    recount();
  };

  const onUp = () => {
    setDragging(null);
    recount();
  };

  /* readouts */
  const { n, a, b, ab, au } = stats;
  const pa = n ? a / n : 0;
  const pb = n ? b / n : 0;
  const pab = n ? ab / n : 0;
  const pau = n ? au / n : 0;
  const pabCond = b ? ab / b : 0;

  const regionCount = (() => {
    switch (op) {
      case "A": return { c: a, label: "P(A)", col: BLUE };
      case "B": return { c: b, label: "P(B)", col: RED };
      case "and": return { c: ab, label: "P(A∩B)", col: SUN };
      case "or": return { c: au, label: "P(A∪B)", col: INK };
      case "amb": return { c: a - ab, label: "P(A−B)", col: BLUE };
      case "bma": return { c: b - ab, label: "P(B−A)", col: RED };
      case "not": return { c: n - au, label: "P((A∪B)ᶜ)", col: INK };
    }
  })();

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
      {/* field */}
      <div className="xl:flex-1 min-w-0">
        <div className="panel-flat overflow-hidden">
          <canvas
            ref={canvasRef}
            className="block w-full h-[420px] lg:h-[520px] touch-none"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{ cursor: dragging ? "grabbing" : "grab" }}
            aria-label="Lapangan Venn: geser lingkaran A dan B di atas 240 titik hasil"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="mono-label">WILAYAH YANG DISOROT:</span>
          <Seg options={OPS} value={op} onChange={(v) => setOp(v as Op)} />
        </div>
      </div>

      {/* bench */}
      <aside className="xl:w-[320px] shrink-0 flex flex-col gap-4">
        <div className="readout">
          <div className="k">WILAYAH TERPILIH — {regionCount.label}</div>
          <div className="v" style={{ color: regionCount.col }}>
            {regionCount.c}<span className="opacity-60">/{n}</span> = {pct(n ? regionCount.c / n : 0)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Readout k="P(A)" v={pct(pa)} color="blue" />
          <Readout k="P(B)" v={pct(pb)} color="red" />
          <Readout k="P(A∩B)" v={pct(pab)} />
          <Readout k="P(A∪B)" v={pct(pau)} />
        </div>

        <div className="panel-flat p-4">
          <div className="mono-label mb-2">INKLUSI–EKSKLUSI, LANGSUNG</div>
          <div className="mono-data text-[13px] leading-loose">
            P(A∪B) = P(A) + P(B) − P(A∩B)
            <br />
            <span className="opacity-80">
              {fmt(pau, 3)} = {fmt(pa, 3)} + {fmt(pb, 3)} − {fmt(pab, 3)}
            </span>
          </div>
          <p className="marginal normal-case mt-2">
            irisan kehitung dua kali, makanya aljabar nyewain balik nilainya — identitasnya tetep kebukti di posisi geser mana aja
          </p>
        </div>

        <div className="panel-flat p-4">
          <div className="mono-label mb-2">PELUANG BERSYARAT</div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="mono-data text-[13px]">P(A | B)</span>
            <span className="mono-data text-lg font-semibold" style={{ color: BLUE }}>
              {fmt(pabCond, 3)}
            </span>
          </div>
          <div className="mono-data text-[11px] opacity-70 mt-1">
            = P(A∩B) / P(B) = {ab}/{b || 0} — “dari semua dunia di dalam B, berapa yang juga nurut A”
          </div>
          <div className="mt-3 flex flex-col gap-3">
            <LabSlider label="Radius A" value={radA} min={0.1} max={0.42} step={0.005} onChange={setRadA} display={fmt(radA * Math.min(760, 520) * 1.05, 0) + "px"} />
            <LabSlider label="Radius B" value={radB} min={0.1} max={0.42} step={0.005} onChange={setRadB} display={fmt(radB * Math.min(760, 520) * 1.05, 0) + "px"} />
          </div>
        </div>

        <div className="panel-sun p-4">
          <div className="mono-label mb-2">COBA INI</div>
          <p className="text-[13.5px] leading-relaxed">
            Bikin A dan B <strong>identik</strong> (pusat sama, radius sama): P(A|B) langsung jadi 1. Sekarang dorong
            mereka menjauh sampai cuma nyentuh tipis: P(A∩B) → 0, dan A sama B jadi <em>saling lepas</em> — dua dunia
            yang nggak mungkin kejadian bareng.
          </p>
        </div>
      </aside>
    </div>
  );
}
