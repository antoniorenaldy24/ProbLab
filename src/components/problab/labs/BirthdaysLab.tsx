/* PROBLAB Nº07 — The Birthdays: 23 strangers, one shared candle */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dashedLine, fitCanvas, monoText, useRaf } from "@/lib/problab/canvas";
import { BLUE, INK, PAPER, RED, SUN, fmtInt, pct } from "@/lib/problab/core";
import { Btn, LabSlider, Readout } from "../kit";

function theoryP(n: number): number {
  let p = 1;
  for (let k = 0; k < n; k++) p *= (365 - k) / 365;
  return 1 - p;
}

export default function BirthdaysLab() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const stripRef = useRef<HTMLCanvasElement>(null);
  const chartBox = useRef({ w: 700, h: 280 });
  const stripBox = useRef({ w: 700, h: 90 });

  const [n, setN] = useState(23);
  const [emp, setEmp] = useState({ classes: 0, hits: 0 });
  const [lastClass, setLastClass] = useState<{ days: number[]; hit: boolean } | null>(null);
  const empirical = useRef<{ n: number; p: number }[]>([]);
  const fillQueue = useRef<number[] | null>(null);
  const stripDays = useRef<Map<number, number>>(new Map()); // day -> count
  const cfg = useRef({ n: 23 });

  const nRef = useRef(n);
  useEffect(() => {
    cfg.current.n = n;
    nRef.current = n;
  }, [n]);

  const castClass = useCallback((silent: boolean): boolean => {
    const size = cfg.current.n;
    const days: number[] = [];
    const seen = new Set<number>();
    let hit = false;
    for (let i = 0; i < size; i++) {
      const d = Math.floor(Math.random() * 365);
      days.push(d);
      if (seen.has(d)) hit = true;
      seen.add(d);
    }
    empirical.current.push({ n: size, p: hit ? 1 : 0 });
    if (!silent) {
      fillQueue.current = days;
    }
    return hit;
  }, []);

  const runClasses = useCallback((k: number, silent = true) => {
    let hits = 0;
    for (let i = 0; i < k; i++) if (castClass(true)) hits++;
    setEmp((e) => ({ classes: e.classes + k, hits: e.hits + hits }));
    if (!silent) castClass(false);
  }, [castClass]);

  /* theory curve */
  useEffect(() => {
    const c = chartRef.current;
    if (!c) return;
    const draw = () => {
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const { w, h } = chartBox.current;
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, w, h);
      const mL = 46, mR = 18, mT = 18, mB = 30;
      const iw = w - mL - mR, ih = h - mT - mB;
      const nMax = 80;

      // gridlines
      for (const g of [0, 0.25, 0.5, 0.75, 1]) {
        const y = mT + ih * (1 - g);
        dashedLine(ctx, mL, y, w - mR, y, g === 0 || g === 1 ? "rgba(27,22,17,0.9)" : "rgba(27,22,17,0.18)", g === 0.5 ? [6, 4] : [2, 4], g === 0 || g === 1 ? 1.5 : 1);
        monoText(ctx, `${Math.round(g * 100)}%`, mL - 8, y + 3, { size: 9, align: "right", color: "rgba(27,22,17,0.6)" });
      }
      for (const x of [10, 23, 40, 60, 80]) {
        const px = mL + (iw * x) / nMax;
        dashedLine(ctx, px, mT, px, h - mB, "rgba(27,22,17,0.12)", [2, 4], 1);
        monoText(ctx, String(x), px, h - mB + 14, { size: 9, align: "center", color: "rgba(27,22,17,0.6)" });
      }

      // theory curve
      ctx.strokeStyle = BLUE;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let k = 1; k <= nMax; k++) {
        const px = mL + (iw * k) / nMax;
        const py = mT + ih * (1 - theoryP(k));
        if (k === 1) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // famous markers
      for (const mk of [23, 30, 50]) {
        const px = mL + (iw * mk) / nMax;
        const py = mT + ih * (1 - theoryP(mk));
        ctx.fillStyle = SUN;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        monoText(ctx, String(mk), px, py - 10, { size: 9.5, align: "center", weight: 600, color: INK });
      }

      // current marker
      const cur = cfg.current.n;
      const px = mL + (iw * cur) / nMax;
      const py = mT + ih * (1 - theoryP(cur));
      ctx.strokeStyle = RED;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px, mT);
      ctx.lineTo(px, h - mB);
      ctx.stroke();
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      monoText(ctx, `n=${cur} → ${pct(theoryP(cur))}`, px + 8, py - 8, { size: 10, color: RED, weight: 600 });

      // empirical crosses
      for (const e of empirical.current) {
        if (e.n > nMax) continue;
        const ex = mL + (iw * e.n) / nMax;
        const ey = mT + ih * (1 - e.p);
        ctx.strokeStyle = "rgba(27,22,17,0.55)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(ex - 3.5, ey);
        ctx.lineTo(ex + 3.5, ey);
        ctx.moveTo(ex, ey - 3.5);
        ctx.lineTo(ex, ey + 3.5);
        ctx.stroke();
      }
    };
    const cleanup = fitCanvas(c, (w2, h2) => {
      chartBox.current = { w: w2, h: h2 };
      draw();
    });
    const iv = setInterval(draw, 150);
    return () => {
      cleanup();
      clearInterval(iv);
    };
  }, []);

  /* year strip: 365 days, live fill animation */
  useRaf(() => {
    const c = stripRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const { w, h } = stripBox.current;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);

    // consume fill queue: 6 days per frame
    if (fillQueue.current && fillQueue.current.length) {
      for (let i = 0; i < 6 && fillQueue.current.length; i++) {
        const d = fillQueue.current.shift()!;
        stripDays.current.set(d, (stripDays.current.get(d) || 0) + 1);
      }
    } else if (!lastClass && stripDays.current.size === 0) {
      // idle placeholder
    }

    const cw = w / 365;
    for (let d = 0; d < 365; d++) {
      const cnt = stripDays.current.get(d) || 0;
      const x = d * cw;
      if (cnt === 0) {
        ctx.fillStyle = "rgba(27,22,17,0.14)";
        ctx.fillRect(x + 0.5, 14, Math.max(1, cw - 1.2), 30);
      } else if (cnt === 1) {
        ctx.fillStyle = BLUE;
        ctx.fillRect(x + 0.5, 14, Math.max(1, cw - 1.2), 30);
      } else {
        ctx.fillStyle = RED;
        ctx.fillRect(x + 0.5, 14, Math.max(1, cw - 1.2), 30);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, 14, Math.max(1, cw - 1.2), 30);
      }
    }
    // month ticks
    const months = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
    const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    monoText(ctx, months[0], 0, 8, { size: 8, color: "rgba(27,22,17,0.55)" });
    for (let m = 1; m < 12; m++) {
      const x = cum[m] * cw;
      ctx.strokeStyle = "rgba(27,22,17,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 12);
      ctx.lineTo(x, 46);
      ctx.stroke();
      if (cw * 31 > 26) monoText(ctx, months[m], x + 3, 8, { size: 8, color: "rgba(27,22,17,0.55)" });
    }
    monoText(ctx, "BIRU = DIISI SATU ORANG · MERAH = DIPAKAI BARENG (TABRAKAN)", w, 8, { size: 8, align: "right", color: "rgba(27,22,17,0.55)" });
  }, true);

  const p = useMemo(() => theoryP(n), [n]);
  const empRate = emp.classes ? emp.hits / emp.classes : 0;

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
      {/* controls */}
      <div className="xl:w-[320px] shrink-0 flex flex-col gap-4">
        <div className="panel-flat p-4 flex flex-col gap-4">
          <div className="mono-label border-b border-ink-faint pb-2">MESIN KELAS</div>
          <LabSlider
            label="Orang di dalam ruangan"
            value={n}
            min={2}
            max={80}
            onChange={(v) => {
              setN(v);
              stripDays.current = new Map();
              fillQueue.current = null;
              setLastClass(null);
            }}
            display={`${n} orang`}
          />
          <div className="grid grid-cols-2 gap-2">
            <Btn
              variant="red"
              onClick={() => {
                stripDays.current = new Map();
                castClass(false);
              }}
            >
              Jalanin 1 kelas
            </Btn>
            <Btn onClick={() => runClasses(100, true)}>Jalan 100</Btn>
            <Btn variant="ink" onClick={() => runClasses(1000, true)} className="col-span-2">
              Jalan 1000 kelas
            </Btn>
          </div>
          <p className="marginal normal-case">
            tiap kelas = {n} orang asing, masing-masing dapet satu dari 365 hari, dipilih acak rata
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Readout k="Teori P(tabrakan)" v={pct(p)} color="blue" />
          <Readout k="Rasio tabrakan nyata" v={emp.classes ? pct(empRate) : "—"} color="red" />
          <Readout k="Kelas dijalanin" v={fmtInt(emp.classes)} />
          <Readout k="Total tabrakan" v={fmtInt(emp.hits)} />
        </div>

        <div className="panel-sun p-4">
          <div className="mono-label mb-2">JAWABAN YANG UDAH TERKENAL ITU</div>
          <p className="text-[13.5px] leading-relaxed">
            Cuma butuh <strong>23 orang</strong> biar ulang tahun bareng jadi lebih mungkin daripada nggak
            (50.7%). Kalau 30 orang: 70.6%. Kalau 50: 97.0%. Intuisi biasanya bilang 183 — soalnya intuisi ngitung{" "}
            <em>orang yang cocok sama kamu</em>, bukan <em>dua orang sembarangan yang kebetulan cocok</em>:
            padahal pasangannya ada 253.
          </p>
        </div>
      </div>

      {/* charts */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="panel-flat overflow-hidden">
          <div className="mono-label border-b-[1.5px] border-ink px-4 py-2 flex justify-between gap-3 flex-wrap">
            <span>P(MINIMAL SATU ULANG TAHUN BARENG) vs JUMLAH ORANG</span>
            <span className="opacity-60 hidden sm:inline">✕ = SATU KELAS SIMULASI DI UKURAN ITU</span>
          </div>
          <canvas ref={chartRef} className="block w-full h-[280px]" aria-label="Kurva paradoks ulang tahun" />
        </div>

        <div className="panel-flat overflow-hidden">
          <div className="mono-label border-b-[1.5px] border-ink px-4 py-2">SETAHUN PENUH, 365 HARI — KELAS TERAKHIR YANG DIJALANIN</div>
          <canvas ref={stripRef} className="block w-full h-[90px]" aria-label="Pita setahun untuk ulang tahun" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="panel-flat p-4">
            <div className="mono-label mb-2">CATATAN LAPANGAN — KENAPA KURVANYA NAIK SECEPAT ITU</div>
            <p className="text-[13.5px] leading-relaxed text-ink/85">
              Tiap orang baru datang bawa <span className="mono-data">n−1</span> peluang segar buat nabrak, jadi
              peluangnya ngejit terus: P(nggak ada yang cocok) = <span className="formula">364/365 × 363/365 × … × (365−n+1)/365</span>.
              Pas di orang ke-23, hasil kali "nggak ada yang cocok" itu udah nyusut di bawah setengah. Tabrakan bukan
              hal langka — yang langka ya semua orang sepakat buat nggak ada yang cocok sama sekali.
            </p>
          </div>
          <div className="panel-flat p-4">
            <div className="mono-label mb-2">PESAN DARI TANDA ✕ ITU</div>
            <p className="text-[13.5px] leading-relaxed text-ink/85">
              Tiap ✕ itu satu kelas — hasilnya 0 atau 1, nggak pernah 0.5. Tapi coba geser slidernya, jalanin
              beberapa puluh kelas di tiap ukuran, dan tanda-tanda ✕ itu perlahan nempel rapi ke kurva biru.
              Kebenaran yang pasti, dirakit dari potongan-potongan sekecil lemparan koin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
