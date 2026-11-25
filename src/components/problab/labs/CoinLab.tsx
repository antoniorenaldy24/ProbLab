/* PROBLAB Nº02 — The Coin: flips, streaks, convergence */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { dashedLine, fitCanvas, monoText, useRaf } from "@/lib/problab/canvas";
import { BLUE, INK, PAPER, PAPER2, RED, SUN, fmt, fmtInt } from "@/lib/problab/core";
import { Btn, LabSlider, Readout } from "../kit";

const CAP = 20000;

export default function CoinLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const box = useRef({ w: 800, h: 300 });
  const flips = useRef<number[]>([]); // 1 = heads
  const queue = useRef(0);
  const nRef = useRef(0);
  const headsRef = useRef(0);
  const curStreakRef = useRef(0);
  const bestRef = useRef(0);

  const [bias, setBias] = useState(0.5);
  const [showResult, setShowResult] = useState<1 | 0 | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [full, setFull] = useState(false);
  const [stats, setStats] = useState({ n: 0, heads: 0, streak: 0, best: 0, prop: 0 });
  const cfg = useRef({ bias: 0.5 });
  useEffect(() => {
    cfg.current.bias = bias;
  }, [bias]);

  const reset = useCallback(() => {
    flips.current = [];
    queue.current = 0;
    nRef.current = 0;
    headsRef.current = 0;
    curStreakRef.current = 0;
    bestRef.current = 0;
    setStats({ n: 0, heads: 0, streak: 0, best: 0, prop: 0 });
    setShowResult(null);
    setSpinning(false);
    setFull(false);
  }, []);

  const flip = useCallback((n: number) => {
    const room = CAP - nRef.current;
    if (room <= 0) {
      setFull(true);
      return;
    }
    queue.current += Math.min(n, room);
    setSpinning(true);
  }, []);

  /* layout */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    return fitCanvas(c, (w, h) => {
      box.current = { w, h };
    });
  }, []);

  /* process queue: batches land every 90ms so the coin visibly tumbles during big runs */
  useEffect(() => {
    const iv = setInterval(() => {
      if (queue.current <= 0) {
        setSpinning(false);
        return;
      }
      const chunk = Math.min(queue.current, 24);
      queue.current -= chunk;
      const p = cfg.current.bias;
      let heads = 0;
      for (let i = 0; i < chunk; i++) {
        const f = Math.random() < p ? 1 : 0;
        flips.current.push(f);
        if (f === 1) {
          heads++;
          curStreakRef.current++;
          if (curStreakRef.current > bestRef.current) bestRef.current = curStreakRef.current;
        } else {
          curStreakRef.current = 0;
        }
      }
      headsRef.current += heads;
      nRef.current += chunk;
      setShowResult(flips.current[flips.current.length - 1] === 1 ? 1 : 0);
      setStats({
        n: nRef.current,
        heads: headsRef.current,
        streak: curStreakRef.current,
        best: bestRef.current,
        prop: headsRef.current / nRef.current,
      });
      if (nRef.current >= CAP) setFull(true);
    }, 90);
    return () => clearInterval(iv);
  }, []);

  /* draw the convergence chart */
  useRaf(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const { w, h } = box.current;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);

    const mL = 46, mR = 18, mT = 16, mB = 26;
    const iw = w - mL - mR, ih = h - mT - mB;
    const n = nRef.current;

    for (const g of [0, 0.25, 0.5, 0.75, 1]) {
      const y = mT + ih * (1 - g);
      dashedLine(ctx, mL, y, w - mR, y, g === 0 || g === 1 ? "rgba(27,22,17,0.9)" : "rgba(27,22,17,0.18)", g === 0.5 ? [6, 4] : [2, 4], g === 0 || g === 1 ? 1.5 : 1);
      monoText(ctx, g.toFixed(2), mL - 8, y + 3, { size: 9, align: "right", color: "rgba(27,22,17,0.6)" });
    }

    if (n < 2) {
      monoText(ctx, "JALANIN KOINNYA — GRAFIKNYA GAMBAR SENDIRI", w / 2, h / 2, {
        size: 11,
        align: "center",
        color: "rgba(27,22,17,0.4)",
      });
      return;
    }

    const yBias = mT + ih * (1 - cfg.current.bias);
    const yFair = mT + ih * (1 - 0.5);
    dashedLine(ctx, mL, yBias, w - mR, yBias, RED, [7, 4], 1.8);
    monoText(ctx, `P(GAMBAR)=${fmt(cfg.current.bias, 2)}`, w - mR, yBias - 6, { size: 9, align: "right", color: RED });
    dashedLine(ctx, mL, yFair, w - mR, yFair, "rgba(27,22,17,0.45)", [2, 4], 1.2);
    monoText(ctx, "ADIL=0.50", mL + 4, yFair - 6, { size: 9, color: "rgba(27,22,17,0.55)" });

    const arr = flips.current;
    const maxShow = arr.length;
    const stride = Math.max(1, Math.floor(maxShow / 1200));
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let running = 0;
    let drawn = 0;
    for (let i = 0; i < maxShow; i++) {
      running += arr[i];
      if (i % stride !== 0 && i !== maxShow - 1) continue;
      const x = mL + (iw * i) / Math.max(1, maxShow - 1);
      const y = mT + ih * (1 - running / (i + 1));
      if (drawn === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      drawn++;
    }
    ctx.stroke();

    monoText(ctx, "1", mL, h - 10, { size: 9, color: "rgba(27,22,17,0.6)" });
    monoText(ctx, `${fmtInt(maxShow)} LEMPARAN`, w - mR, h - 10, { size: 9, align: "right", color: "rgba(27,22,17,0.6)" });
  }, true);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* the coin + controls */}
      <div className="lg:w-[340px] shrink-0 flex flex-col gap-4">
        <div className="panel-flat dotgrid p-6 flex flex-col items-center gap-5">
          <div style={{ perspective: 700 }}>
            <div
              className={`w-36 h-36 rounded-full border-[2.5px] border-ink flex items-center justify-center select-none ${spinning ? "coin-spinning" : ""}`}
              style={{
                background: spinning ? PAPER2 : showResult === 1 ? SUN : showResult === 0 ? PAPER : PAPER2,
                boxShadow: "4px 4px 0 0 var(--ink)",
              }}
            >
              <span className="mono-data text-4xl font-semibold" style={{ color: INK }}>
                {spinning ? "◌" : showResult === 1 ? "G" : showResult === 0 ? "A" : "·"}
              </span>
            </div>
          </div>
          <div className="mono-label">
            {spinning ? <span className="blink">Berputar…</span> : showResult === null ? "Siap" : showResult === 1 ? "Gambar" : "Angka"}
          </div>
        </div>

        <div className="panel-flat p-4 flex flex-col gap-3">
          <div className="mono-label border-b border-ink-faint pb-2">KONTROL LEMPARAN</div>
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="red" onClick={() => flip(1)}>Lempar ×1</Btn>
            <Btn onClick={() => flip(10)}>×10</Btn>
            <Btn onClick={() => flip(100)}>×100</Btn>
            <Btn variant="ink" onClick={() => flip(1000)}>×1000</Btn>
          </div>
          <div className="border-t border-ink-faint pt-3">
            <LabSlider
              label="Kemiringan koin — P(gambar)"
              value={bias}
              min={0.05}
              max={0.95}
              step={0.01}
              onChange={(v) => {
                setBias(v);
                reset();
              }}
              display={fmt(bias, 2)}
            />
          </div>
          <Btn onClick={reset}>Reset buku besar</Btn>
          {full && (
            <p className="mono-label" style={{ color: RED }}>
              Buku besar penuh di {fmtInt(CAP)} — reset dulu kalau mau lanjut melempar.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Readout k="Lemparan" v={fmtInt(stats.n)} />
          <Readout k="Gambar" v={fmtInt(stats.heads)} color="red" />
          <Readout k="P(G) teramati" v={fmt(stats.prop, 3)} color="blue" />
          <Readout k="Runtunan sekarang" v={fmtInt(stats.streak)} />
        </div>
      </div>

      {/* chart + notes */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="panel-flat overflow-hidden">
          <div className="mono-label border-b-[1.5px] border-ink px-4 py-2 flex justify-between gap-3">
            <span>P(GAMBAR) BERJALAN vs JUMLAH LEMPARAN</span>
            <span className="opacity-60 hidden sm:inline">HUKUM BILANGAN BESAR, LANGSUNG</span>
          </div>
          <canvas ref={canvasRef} className="block w-full h-[300px]" aria-label="Proporsi gambar berjalan" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="panel-flat p-4">
            <div className="mono-label mb-2">RUNTUNAN GAMBAR TERPANJANG SEJAUH INI</div>
            <div className="flex items-baseline gap-3">
              <span className="mono-data text-5xl font-semibold" style={{ color: RED }}>{stats.best}</span>
              <span className="marginal normal-case">
                {stats.best >= 2
                  ? `peluang runtunan spesifik sepanjang itu: 1 dari ${fmtInt(Math.pow(2, stats.best))}`
                  : "lempar beberapa ratus kali — runtunan itu sembunyi di tempat terang"}
              </span>
            </div>
          </div>
          <div className="panel-flat p-4">
            <div className="mono-label mb-2">CATATAN LAPANGAN — KEKELIRUAN PENJUDI</div>
            <p className="text-[13.5px] leading-relaxed text-ink/85">
              Setelah lima gambar, koin nggak berhutang apa-apa ke kamu: P(angka) tetap persis{" "}
              <span className="mono-data">{fmt(1 - bias, 2)}</span>. Tapi runtunan panjang itu <em>pasti</em> muncul —
              dalam 200 lemparan adil, runtunan tujuh atau lebih itu biasa aja. Runtunan bukan tanda koin
              dimanipulasi; itu keacakan lagi pamer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
