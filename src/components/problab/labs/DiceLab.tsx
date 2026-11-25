/* PROBLAB Nº03 — The Dice: sample space atlas & sum distribution */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fitCanvas, monoText } from "@/lib/problab/canvas";
import { BLUE, INK, PAPER, RED, SUN, fmtInt, pct } from "@/lib/problab/core";
import { Btn, Readout } from "../kit";

const THEORY = [0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]; // index = sum, /36

function Die({ v, tumbling }: { v: number; tumbling: boolean }) {
  const pips: Record<number, [number, number][]> = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };
  return (
    <div
      className={`w-16 h-16 md:w-20 md:h-20 border-[2.5px] border-ink bg-paper shadow-[3px_3px_0_0_var(--ink)] grid grid-cols-3 grid-rows-3 p-2 ${tumbling ? "tumbling" : ""}`}
    >
      {Array.from({ length: 9 }).map((_, i) => {
        const r = Math.floor(i / 3), c = i % 3;
        const on = (pips[v] || []).some(([pr, pc]) => pr === r && pc === c);
        return (
          <div key={i} className="flex items-center justify-center">
            {on && <div className="w-2.5 h-2.5 rounded-full" style={{ background: INK }} />}
          </div>
        );
      })}
    </div>
  );
}

export default function DiceLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const box = useRef({ w: 700, h: 260 });
  const sumCounts = useRef<number[]>(new Array(13).fill(0));
  const nRef = useRef(0);
  const queue = useRef(0);

  const [dice, setDice] = useState<[number, number]>([3, 4]);
  const [tumbling, setTumbling] = useState(false);
  const [flashCell, setFlashCell] = useState<number | null>(null);
  const [hoverSum, setHoverSum] = useState<number | null>(null);
  const [stats, setStats] = useState({ n: 0, top: 0, p7: 0, last: 0 });

  const diceRef = useRef<[number, number]>([3, 4]);
  useEffect(() => {
    diceRef.current = dice;
  }, [dice]);

  const publish = useCallback(() => {
    const arr = sumCounts.current;
    let top = 2;
    for (let s = 2; s <= 12; s++) if (arr[s] > arr[top]) top = s;
    setStats({
      n: nRef.current,
      top,
      p7: nRef.current ? arr[7] / nRef.current : 0,
      last: diceRef.current[0] + diceRef.current[1],
    });
  }, []);

  const roll = useCallback((n: number) => {
    if (n === 1) {
      const a = 1 + Math.floor(Math.random() * 6);
      const b = 1 + Math.floor(Math.random() * 6);
      sumCounts.current[a + b]++;
      nRef.current++;
      setDice([a, b]);
      setFlashCell((a - 1) * 6 + (b - 1));
      setTumbling(true);
      setTimeout(() => setTumbling(false), 520);
      publish();
    } else {
      queue.current += n;
      setTumbling(true);
      setTimeout(() => setTumbling(false), 700);
    }
  }, [publish]);

  /* batch processor */
  useEffect(() => {
    const iv = setInterval(() => {
      if (queue.current <= 0) return;
      const chunk = Math.min(queue.current, 200);
      queue.current -= chunk;
      for (let i = 0; i < chunk; i++) {
        const s = 2 + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6);
        sumCounts.current[s]++;
      }
      nRef.current += chunk;
      // show one random recent cell flash
      const a = 1 + Math.floor(Math.random() * 6);
      const b = 1 + Math.floor(Math.random() * 6);
      setFlashCell((a - 1) * 6 + (b - 1));
      setDice([a, b]);
      publish();
    }, 80);
    return () => clearInterval(iv);
  }, [publish]);

  /* histogram canvas */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const draw = () => {
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const { w, h } = box.current;
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, w, h);
      const mL = 40, mR = 14, mT = 18, mB = 30;
      const iw = w - mL - mR, ih = h - mT - mB;
      const n = nRef.current;
      const maxTh = 6 / 36;
      const maxEmp = Math.max(1e-9, ...sumCounts.current.map((v) => (n ? v / n : 0)));
      const yMax = Math.max(maxTh * 1.15, maxEmp * 1.1);

      // axis
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mL, mT);
      ctx.lineTo(mL, h - mB);
      ctx.lineTo(w - mR, h - mB);
      ctx.stroke();

      const bw = iw / 11;
      for (let s = 2; s <= 12; s++) {
        const x = mL + (s - 2) * bw;
        const emp = n ? sumCounts.current[s] / n : 0;
        const bh = (emp / yMax) * ih;
        if (n > 0) {
          ctx.fillStyle = BLUE;
          ctx.globalAlpha = 0.92;
          ctx.fillRect(x + bw * 0.14, h - mB - bh, bw * 0.72, bh);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = INK;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + bw * 0.14, h - mB - bh, bw * 0.72, bh);
        }
        // theoretical outline
        const th = (THEORY[s] / 36 / yMax) * ih;
        ctx.strokeStyle = RED;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(x + bw * 0.14, h - mB - th, bw * 0.72, Math.max(0, th));
        ctx.setLineDash([]);
        monoText(ctx, String(s), x + bw / 2, h - mB + 14, { size: 9.5, align: "center", color: "rgba(27,22,17,0.75)" });
      }
      monoText(ctx, "JUMLAH DUA DADU", mL, mT - 6, { size: 9, color: "rgba(27,22,17,0.6)" });
      monoText(ctx, "BINGKAI MERAH = TEORI PERSIS", w - mR, mT - 6, { size: 9, align: "right", color: RED });
    };
    const cleanup = fitCanvas(c, (w2, h2) => {
      box.current = { w: w2, h: h2 };
      draw();
    });
    const iv = setInterval(draw, 160);
    return () => {
      cleanup();
      clearInterval(iv);
    };
  }, []);

  const gridCells = useMemo(() => {
    const cells: { i: number; j: number; sum: number }[] = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) cells.push({ i, j, sum: i + j + 2 });
    return cells;
  }, []);

  const cellColor = (sum: number) => {
    if (hoverSum === null) {
      if (sum === 7) return { background: SUN };
      if (sum === 2 || sum === 12) return { background: "var(--paper-2)" };
      return {};
    }
    if (sum === hoverSum) return { background: BLUE, color: "#f6f1e6" };
    return { opacity: 0.35 };
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
      {/* dice + control */}
      <div className="xl:w-[280px] shrink-0 flex flex-col gap-4">
        <div className="panel-flat dotgrid p-6 flex flex-col items-center gap-4">
          <div className="flex gap-5">
            <Die v={dice[0]} tumbling={tumbling} />
            <Die v={dice[1]} tumbling={tumbling} />
          </div>
          <div className="mono-label">
            JUMLAH TERAKHIR = <span className="mono-data font-semibold">{dice[0] + dice[1]}</span>
          </div>
        </div>
        <div className="panel-flat p-4 flex flex-col gap-3">
          <div className="mono-label border-b border-ink-faint pb-2">KONTROL LEMPARAN</div>
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="red" onClick={() => roll(1)}>Lempar ×1</Btn>
            <Btn onClick={() => roll(36)}>×36</Btn>
            <Btn onClick={() => roll(100)}>×100</Btn>
            <Btn variant="ink" onClick={() => roll(1000)}>×1000</Btn>
          </div>
          <Btn
            onClick={() => {
              sumCounts.current = new Array(13).fill(0);
              nRef.current = 0;
              queue.current = 0;
              publish();
            }}
          >
            Reset hitungan
          </Btn>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Readout k="Lemparan" v={fmtInt(stats.n)} />
          <Readout k="Jumlah favorit" v={stats.n ? String(stats.top) : "—"} color="red" />
          <Readout k="P(7) teramati" v={pct(stats.p7)} color="blue" />
          <Readout k="Teori P(7)" v="16.7%" />
        </div>
      </div>

      {/* sample space grid */}
      <div className="xl:flex-1 min-w-0 flex flex-col gap-4">
        <div className="panel-flat p-4">
          <div className="mono-label mb-3 flex justify-between gap-3 flex-wrap">
            <span>ATLAS RUANG SAMPEL — 36 DUNIA</span>
            <span className="opacity-60 normal-case">
              {hoverSum !== null
                ? `JUMLAH ${hoverSum}: ${(THEORY[hoverSum] as number)}/36 = ${pct(THEORY[hoverSum] / 36)}`
                : "arahkan kursor ke satu kotak — seluruh peristiwanya menyala"}
            </span>
          </div>
          <div className="max-w-[560px] mx-auto">
            <div className="grid" style={{ gridTemplateColumns: "2rem repeat(6, 1fr)", gridTemplateRows: "2rem repeat(6, 1fr)" }}>
              <div />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`h${i}`} className="flex items-center justify-center mono-data text-[11px] font-semibold opacity-70">
                  {i + 1}
                </div>
              ))}
              {Array.from({ length: 6 }).map((_, j) => (
                <React.Fragment key={`r${j}`}>
                  <div className="flex items-center justify-center mono-data text-[11px] font-semibold opacity-70">{j + 1}</div>
                  {gridCells.slice(j * 6, j * 6 + 6).map((cell) => (
                    <button
                      key={`${cell.i}-${cell.j}`}
                      data-hot
                      onMouseEnter={() => setHoverSum(cell.sum)}
                      onMouseLeave={() => setHoverSum(null)}
                      onFocus={() => setHoverSum(cell.sum)}
                      onBlur={() => setHoverSum(null)}
                      className={`aspect-square border border-ink/70 text-[11px] md:text-[13px] mono-data font-semibold relative transition-all duration-100 ${flashCell === j * 6 + cell.i ? "flash-cell" : ""}`}
                      style={cellColor(cell.sum)}
                      aria-label={`Dadu ${cell.i + 1} dan dadu ${cell.j + 1}: jumlah ${cell.sum}`}
                    >
                      {cell.sum}
                    </button>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          <p className="marginal normal-case mt-3">
            Satu kotak = satu hasil atomik (dadu A, dadu B). Semuanya sama mungkinnya — itu yang dimaksud "dadu
            adil". Sebuah peristiwa ya cuma pagar di sekitar beberapa dunia ini.
          </p>
        </div>

        <div className="panel-flat overflow-hidden">
          <div className="mono-label border-b-[1.5px] border-ink px-4 py-2">SEBARAN JUMLAH HASIL NYATA</div>
          <canvas ref={canvasRef} className="block w-full h-[240px]" aria-label="Histogram jumlah dadu" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="panel-sun p-4">
            <div className="mono-label mb-2">PERTANYAAN KASINO</div>
            <p className="text-[13.5px] leading-relaxed">
              Kok angka 7 yang bayar dan 12 hampir nggak pernah muncul? Jumlah 7 punya{" "}
              <span className="mono-data font-semibold">6</span> dari 36 dunia; jumlah 12 cuma punya{" "}
              <span className="mono-data font-semibold">1</span>. Permainan dihargai sesuai banyaknya dunia yang bisa dia menangkan.
            </p>
          </div>
          <div className="panel-flat p-4">
            <div className="mono-label mb-2">CATATAN LAPANGAN</div>
            <p className="text-[13.5px] leading-relaxed text-ink/85">
              1000 lemparan belum cukup bikin batang biru <em>identik</em> sama bingkai merah — dan nggak apa-apa
              kok. Bingkai merah itu janji buat jangka panjang, bukan buat malam ini. Coba perhatikan jumlah mana
              yang tetap aja kelebihan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
