/* PROBLAB Nº04 — The Wheel: bend the odds with your own hands */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { fitCanvas, monoText, useRaf } from "@/lib/problab/canvas";
import { BLUE, INK, PAPER, PAPER2, RED, SUN, fmtInt, pct } from "@/lib/problab/core";
import { Btn, LabSlider } from "../kit";

type Seg = { id: number; label: string; weight: number; color: string };

const PALETTE = [SUN, BLUE, RED, PAPER2, "#7a9e7e", "#b76fb0"];
const TEXT_ON = (c: string) => (c === SUN || c === PAPER2 || c === "#7a9e7e" ? INK : PAPER);

let uid = 100;
const mkSeg = (label: string, weight: number, i: number): Seg => ({
  id: uid++,
  label,
  weight,
  color: PALETTE[i % PALETTE.length],
});

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

export default function WheelLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const box = useRef({ w: 420, h: 420 });
  const rotation = useRef(-Math.PI / 2); // pointer at top
  const anim = useRef<{ from: number; to: number; t: number; dur: number } | null>(null);

  const [segs, setSegs] = useState<Seg[]>([
    mkSeg("SURYA", 3, 0),
    mkSeg("ULTRA", 3, 1),
    mkSeg("MERAH BATA", 2, 2),
    mkSeg("KERTAS", 2, 3),
  ]);
  const [tally, setTally] = useState<number[]>([0, 0, 0, 0]);
  const [spinning, setSpinning] = useState(false);
  const [last, setLast] = useState<number | null>(null);
  const [spins, setSpins] = useState(0);

  const segsRef = useRef(segs);
  useEffect(() => {
    segsRef.current = segs;
  }, [segs]);

  const resetTallies = () => {
    setTally(new Array(segs.length).fill(0));
    setSpins(0);
    setLast(null);
  };

  /* layout */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    return fitCanvas(c, (w, h) => {
      box.current = { w, h };
    });
  }, []);

  /* render loop */
  useRaf((dt) => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const { w, h } = box.current;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);

    const a = anim.current;
    if (a) {
      a.t += dt / a.dur;
      if (a.t >= 1) {
        rotation.current = a.to % (Math.PI * 2);
        anim.current = null;
        setSpinning(false);
      } else {
        rotation.current = a.from + (a.to - a.from) * easeOutQuart(a.t);
      }
    }

    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) / 2 - 34;
    const S = segsRef.current;
    const totalW = S.reduce((s, x) => s + x.weight, 0) || 1;

    // arcs
    let start = rotation.current;
    for (const s of S) {
      const ang = (s.weight / totalW) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, start, start + ang);
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.stroke();
      // label at centroid
      const mid = start + ang / 2;
      if (ang > 0.22) {
        const lx = cx + Math.cos(mid) * R * 0.62;
        const ly = cy + Math.sin(mid) * R * 0.62;
        const label = s.label.length > 10 ? `${s.label.slice(0, 9)}…` : s.label;
        monoText(ctx, label, lx, ly, {
          size: Math.min(11, Math.max(7.5, ang * 11)),
          align: "center",
          baseline: "middle",
          color: TEXT_ON(s.color),
          weight: 600,
        });
        const p = s.weight / totalW;
        monoText(ctx, pct(p, 0), lx, ly + 12, { size: 8.5, align: "center", color: TEXT_ON(s.color), weight: 500 });
      }
      start += ang;
    }

    // hub
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.strokeStyle = PAPER;
    ctx.lineWidth = 2;
    ctx.stroke();

    // pointer (needle at top)
    ctx.beginPath();
    ctx.moveTo(cx - 9, 10);
    ctx.lineTo(cx + 9, 10);
    ctx.lineTo(cx, 30);
    ctx.closePath();
    ctx.fillStyle = RED;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // rim
    ctx.beginPath();
    ctx.arc(cx, cy, R + 3, 0, Math.PI * 2);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, true);

  const spin = useCallback(() => {
    const S = segsRef.current;
    if (!S.length || anim.current) return;
    const totalW = S.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * totalW;
    let k = 0;
    for (let i = 0; i < S.length; i++) {
      r -= S[i].weight;
      if (r <= 0) {
        k = i;
        break;
      }
    }
    setTally((t) => {
      const nt = [...t];
      nt[k] = (nt[k] || 0) + 1;
      return nt;
    });
    setSpins((n) => n + 1);
    setLast(k);

    // compute target rotation so arc k's middle lands at top (-90deg)
    const totalW2 = S.reduce((s, x) => s + x.weight, 0);
    let acc = 0;
    for (let i = 0; i < k; i++) acc += S[i].weight / totalW2;
    const arcMid = acc + (S[k].weight / totalW2) / 2; // in fraction of circle
    const targetPointer = -Math.PI / 2;
    // pointer angle in wheel coords = rotation + arcStart..; we need rotation + arcMidAngle = targetPointer
    const arcMidAngle = arcMid * Math.PI * 2;
    let to = targetPointer - arcMidAngle;
    // add spins forward
    const current = rotation.current;
    while (to < current + Math.PI * 2 * 3) to += Math.PI * 2;
    to += Math.random() * (S[k].weight / totalW2) * Math.PI * 2 * 0.7 - (S[k].weight / totalW2) * Math.PI * 2 * 0.35;
    anim.current = { from: current, to, t: 0, dur: 2900 + Math.random() * 700 };
    setSpinning(true);
  }, []);

  const totalW = segs.reduce((s, x) => s + x.weight, 0) || 1;

  const updateSeg = (id: number, patch: Partial<Seg>) =>
    setSegs((S) => S.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
      {/* wheel */}
      <div className="xl:w-[460px] shrink-0 flex flex-col gap-4">
        <div className="panel-flat p-4">
          <canvas ref={canvasRef} className="block w-full aspect-square max-w-[420px] mx-auto touch-none" aria-label="Roda peluang" />
        </div>
        <div className="flex gap-2 items-stretch">
          <Btn variant={spinning ? "paper" : "red"} onClick={spin} disabled={spinning} className="flex-1 text-center">
            {spinning ? "berputar…" : last !== null ? `berhenti di ${segs[last]?.label} — puter lagi` : "PUTAR RODANYA"}
          </Btn>
          <Btn onClick={resetTallies}>Reset</Btn>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="readout">
            <div className="k">Putaran</div>
            <div className="v">{fmtInt(spins)}</div>
          </div>
          <div className="readout">
            <div className="k">Terakhir berhenti</div>
            <div className="v" style={{ color: RED }}>{last !== null ? segs[last]?.label : "—"}</div>
          </div>
        </div>
      </div>

      {/* editor + tallies */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="panel-flat p-4">
          <div className="mono-label mb-3 flex justify-between gap-3 flex-wrap">
            <span>MEJA SEGMEN — BENGKOKKAN PELUANGNYA</span>
            <span className="opacity-60">UKURAN IRISAN = BOBOT ÷ TOTAL</span>
          </div>
          <div className="flex flex-col gap-3">
            {segs.map((s) => (
              <div key={s.id} className="flex items-center gap-3 flex-wrap">
                <span className="w-5 h-5 border-[1.5px] border-ink shrink-0" style={{ background: s.color }} title={s.color} />
                <input
                  value={s.label}
                  onChange={(e) => updateSeg(s.id, { label: e.target.value.slice(0, 14) })}
                  className="mono-data text-[12px] font-semibold bg-transparent border-b-[1.5px] border-ink w-[9.5rem] px-1 py-0.5 outline-none focus:border-red"
                  aria-label="Label segmen"
                  maxLength={14}
                />
                <div className="flex-1 min-w-[140px]">
                  <LabSlider
                    label={`bobot`}
                    value={s.weight}
                    min={1}
                    max={12}
                    onChange={(v) => updateSeg(s.id, { weight: v })}
                    display={`${pct(s.weight / totalW, 1)}`}
                  />
                </div>
                <button
                  data-hot
                  className="btn btn-ghost btn-sm mono-data"
                  onClick={() => {
                    if (segs.length > 2) {
                      setSegs((S) => S.filter((x) => x.id !== s.id));
                      resetTallies();
                    }
                  }}
                  disabled={segs.length <= 2}
                  aria-label={`Hapus segmen ${s.label}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Btn
              size="sm"
              onClick={() => {
                if (segs.length < 8) {
                  setSegs((S) => [...S, mkSeg(`SEGMEN ${S.length + 1}`, 2, S.length)]);
                  resetTallies();
                }
              }}
              disabled={segs.length >= 8}
            >
              + Tambah segmen
            </Btn>
            <span className="marginal normal-case self-center">
              bobot {segs.map((s) => s.weight).join(" : ")} — sudut irisannya ngikutin seketika
            </span>
          </div>
        </div>

        {/* tallies */}
        <div className="panel-flat p-4">
          <div className="mono-label mb-3 flex justify-between gap-3 flex-wrap">
            <span>HASIL NYATA vs JANJI</span>
            <span className="opacity-60">BATANG BIRU = TERAMATI · GARIS MERAH = TEORI</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {segs.map((s, i) => {
              const emp = spins ? (tally[i] || 0) / spins : 0;
              const th = s.weight / totalW;
              return (
                <div key={s.id}>
                  <div className="flex justify-between mono-data text-[11px] mb-1">
                    <span className="font-semibold">{s.label}</span>
                    <span className="opacity-70">
                      teramati {pct(emp)} · teori {pct(th)}
                    </span>
                  </div>
                  <div className="relative h-4 border-[1.5px] border-ink bg-paper-2 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0"
                      style={{ width: `${Math.min(100, emp * 100)}%`, background: BLUE, opacity: 0.92 }}
                    />
                    <div
                      className="absolute inset-y-0 w-[2.5px]"
                      style={{ left: `calc(${Math.min(100, th * 100)}% - 1px)`, background: RED }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="panel-flat p-4">
            <div className="mono-label mb-2">CATATAN LAPANGAN — DUNIA BERBOBOT</div>
            <p className="text-[13.5px] leading-relaxed text-ink/85">
              Roda yang nggak adil tetep <em>jujur</em> sebagai deskripsi dunia yang wilayahnya gak sama rata.
              P(irisan) = bobotnya ÷ semua bobot — sudut irisan itu <em>ya</em> peluangnya. Bikin satu irisan
              dominan dan lihatin garis merahnya pindah; perhitungannya butuh beberapa puluh putaran baru mau
              percaya sama kamu.
            </p>
          </div>
          <div className="panel-sun p-4">
            <div className="mono-label mb-2">COBA INI</div>
            <p className="text-[13.5px] leading-relaxed">
              Setel satu segmen ke bobot 12 dan sisanya ke 1. Tebak dulu butuh berapa putaran sampai dia menang
              3 kali. Terus jelasin ke dirimu sendiri kenapa “udah waktunya kalah” itu mitos di sini juga.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
