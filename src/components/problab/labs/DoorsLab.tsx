/* PROBLAB Nº06 — The Doors: Monty Hall, the stubborn 1/3 */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { dashedLine, fitCanvas, monoText } from "@/lib/problab/canvas";
import { BLUE, INK, PAPER, PAPER2, RED, SUN, fmtInt, pct } from "@/lib/problab/core";
import { Btn, Readout, Seg } from "../kit";

type Phase = "pick" | "host" | "decide" | "done";

const GOAT_TXT = "KAMBING";
const CAR_TXT = "MOBIL";

function Door({
  i,
  state,
  onPick,
}: {
  i: number;
  state: { closed: boolean; picked: boolean; content: "car" | "goat" | null; yours: boolean };
  onPick: () => void;
}) {
  const open = !state.closed;
  return (
    <button
      data-hot
      onClick={onPick}
      disabled={open}
      className={`relative aspect-[3/4] border-[2.5px] border-ink transition-all duration-200 min-w-0 ${
        open ? (state.content === "car" ? "" : "") : "bg-paper hover:-translate-y-1 hover:shadow-[5px_5px_0_0_var(--ink)]"
      }`}
      style={
        open
          ? state.content === "car"
            ? { background: RED, boxShadow: "4px 4px 0 0 var(--ink)" }
            : { background: SUN, boxShadow: "4px 4px 0 0 var(--ink)" }
          : { background: PAPER2, boxShadow: "3px 3px 0 0 var(--ink)" }
      }
      aria-label={`Pintu ${i + 1}${open ? `, terbuka: ${state.content === "car" ? "mobil" : "kambing"}` : ""}`}
    >
      {/* number */}
      <span
        className={`absolute top-2 left-2 w-7 h-7 border-[1.5px] border-ink flex items-center justify-center mono-data text-[13px] font-semibold ${open ? "bg-paper" : "bg-paper"}`}
      >
        {i + 1}
      </span>
      {(state.picked || state.yours) && (
        <span className="absolute top-2 right-2 mono-label text-[9px] px-1.5 py-0.5 z-10" style={{ background: INK, color: PAPER }}>
          PILIHANMU
        </span>
      )}
      {open && (
        <span
          className={`absolute inset-0 flex flex-col items-center justify-center gap-1 ${state.content === "car" ? "text-paper" : "text-ink"}`}
        >
          <span className="serif-accent text-[clamp(1.6rem,4vw,2.6rem)] leading-none">
            {state.content === "car" ? CAR_TXT : GOAT_TXT}
          </span>
          <span className="mono-label opacity-80">{state.content === "car" ? "SELAMAT NGE-DRIVE" : "MBEK: MBAA"}</span>
        </span>
      )}
      {!open && (
        <span className="absolute inset-x-4 bottom-3 top-14 border border-ink/30 border-dashed flex items-center justify-center">
          <span className="mono-label opacity-50">TERTUTUP</span>
        </span>
      )}
    </button>
  );
}

export default function DoorsLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const box = useRef({ w: 700, h: 240 });

  /* interactive game */
  const [phase, setPhase] = useState<Phase>("pick");
  const [car, setCar] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [opened, setOpened] = useState<number | null>(null);
  const [finalPick, setFinalPick] = useState<number | null>(null);
  const [msg, setMsg] = useState("Pilih satu pintu. Pintu aja. Belum ada yang jadi masalah kok… belum.");

  /* auto simulation */
  const [strategy, setStrategy] = useState<"stay" | "switch">("switch");
  const [sim, setSim] = useState({ stayW: 0, stayN: 0, swW: 0, swN: 0, running: false });
  const stayRates = useRef<number[]>([]);
  const swRates = useRef<number[]>([]);
  const dirty = useRef(true);

  const startRound = () => {
    const c = Math.floor(Math.random() * 3);
    setCar(c);
    setPicked(null);
    setOpened(null);
    setFinalPick(null);
    setPhase("pick");
    setMsg("Pilih satu pintu. Pintu aja. Belum ada yang jadi masalah kok… belum.");
  };

  useEffect(() => {
    // Mount-only: pick the car's door on the client. Kept as an effect (not a
    // useState initializer) so the random draw never happens during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startRound();
  }, []);

  const pick = (i: number) => {
    if (phase !== "pick") return;
    setPicked(i);
    setFinalPick(i);
    // host opens a goat door that is not picked
    const goats = [0, 1, 2].filter((d) => d !== i && d !== car);
    // Event handler, not render: the host genuinely picks at random.
    // eslint-disable-next-line react-hooks/purity
    setOpened(goats[Math.floor(Math.random() * goats.length)]);
    setPhase("decide");
    setMsg("Pembawa acara buka satu pintu kambing — selalu begitu. Bertahan, atau ganti ke pintu tertutup yang satu lagi?");
  };

  const resolve = (which: "stay" | "switch") => {
    if (phase !== "decide" || picked === null) return;
    let final = picked;
    if (which === "switch") {
      const others = [0, 1, 2].filter((d) => d !== picked && d !== opened);
      final = others[0];
      setFinalPick(final);
    }
    const win = final === car;
    setPhase("done");
    setMsg(
      win
        ? `Pintu ${final + 1} isinya mobil. ${which === "switch" ? "Informasi ekstra itu ternyata berbuah." : "Keras kepala juga ada untungnya."}`
        : `Pintu ${final + 1} isinya kambing. Mobilnya kebagian di pintu ${car + 1}.`
    );
  };

  /* auto-run simulation */
  const runSim = useCallback((games: number) => {
    let sw = sim.swW, sn = sim.swN, tw = sim.stayW, tn = sim.stayN;
    for (let g = 0; g < games; g++) {
      const carI = Math.floor(Math.random() * 3);
      const pickI = Math.floor(Math.random() * 3);
      const goats = [0, 1, 2].filter((d) => d !== pickI && d !== carI);
      const hostOpen = goats[Math.floor(Math.random() * goats.length)];
      // stay
      if (pickI === carI) tw++;
      tn++;
      stayRates.current.push(tw / tn);
      // switch
      const others = [0, 1, 2].filter((d) => d !== pickI && d !== hostOpen);
      if (others[0] === carI) sw++;
      sn++;
      swRates.current.push(sw / sn);
    }
    setSim({ stayW: tw, stayN: sn, swW: sw, swN: sn, running: false });
    dirty.current = true;
  }, [sim]);

  /* chart */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const draw = () => {
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const { w, h } = box.current;
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, w, h);
      const mL = 44, mR = 16, mT = 16, mB = 26;
      const iw = w - mL - mR, ih = h - mT - mB;

      for (const g of [0, 1 / 3, 2 / 3, 1]) {
        const y = mT + ih * (1 - g);
        dashedLine(ctx, mL, y, w - mR, y, g === 0 || g === 1 ? "rgba(27,22,17,0.9)" : "rgba(27,22,17,0.2)", g === 1 / 3 || g === 2 / 3 ? [6, 4] : [2, 4], g === 0 || g === 1 ? 1.5 : 1);
        monoText(ctx, g.toFixed(2).replace(/0$/, ""), mL - 8, y + 3, { size: 9, align: "right", color: "rgba(27,22,17,0.6)" });
      }
      monoText(ctx, "TETAP → 1/3", w - mR - 6, mT + ih * (1 - 1 / 3) - 8, { size: 9, align: "right", color: RED });
      monoText(ctx, "GANTI → 2/3", w - mR - 6, mT + ih * (1 - 2 / 3) - 8, { size: 9, align: "right", color: BLUE });

      const drawSeries = (arr: number[], color: string) => {
        if (arr.length < 2) return;
        const n = arr.length;
        const stride = Math.max(1, Math.floor(n / 900));
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        let drawn = 0;
        for (let i = 0; i < n; i++) {
          if (i % stride !== 0 && i !== n - 1) continue;
          const x = mL + (iw * i) / Math.max(1, n - 1);
          const y = mT + ih * (1 - arr[i]);
          if (drawn === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          drawn++;
        }
        ctx.stroke();
      };
      drawSeries(stayRates.current, RED);
      drawSeries(swRates.current, BLUE);
      monoText(ctx, "RONDE →", mL, h - 10, { size: 9, color: "rgba(27,22,17,0.6)" });
    };
    const cleanup = fitCanvas(c, (w2, h2) => {
      box.current = { w: w2, h: h2 };
      draw();
    });
    const iv = setInterval(draw, 200);
    return () => {
      cleanup();
      clearInterval(iv);
    };
  }, []);

  const resetSim = () => {
    stayRates.current = [];
    swRates.current = [];
    setSim({ stayW: 0, stayN: 0, swW: 0, swN: 0, running: false });
    dirty.current = true;
  };

  const doorState = (i: number) => {
    const revealed = opened === i || phase === "done";
    return {
      closed: !revealed,
      picked: picked === i && phase !== "done",
      content: (revealed ? (i === car ? "car" : "goat") : null) as "car" | "goat" | null,
      yours: finalPick === i,
    };
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
      {/* stage */}
      <div className="xl:w-[420px] shrink-0 flex flex-col gap-4">
        <div className="panel-flat dotgrid p-5">
          <div className="mono-label mb-4 flex justify-between">
            <span>PANGGUNG — 3 PINTU, 1 MOBIL</span>
            <span style={{ color: phase === "decide" ? RED : undefined }}>
              {phase === "pick" ? "LANGKAH 1: PILIH" : phase === "decide" ? "LANGKAH 2: TETAP / GANTI" : phase === "done" ? "HASIL" : ""}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Door key={i} i={i} onPick={() => pick(i)} state={doorState(i)} />
            ))}
          </div>
          <p className="serif-accent text-[1.1rem] leading-snug mt-4 min-h-[3.2rem]">{msg}</p>
          <div className="flex gap-2 flex-wrap">
            {phase === "decide" && (
              <>
                <Btn variant="ink" size="sm" onClick={() => resolve("stay")}>TETAP di pintu {(finalPick ?? 0) + 1}</Btn>
                <Btn variant="red" size="sm" onClick={() => resolve("switch")}>GANTI pintu</Btn>
              </>
            )}
            {phase === "done" && (
              <Btn variant="sun" size="sm" onClick={startRound}>Ronde baru — pintu di-reset</Btn>
            )}
          </div>
        </div>

        <div className="panel-flat p-4">
          <div className="mono-label mb-3">SIMULASI OTOMATIS: SAKSIKAN POLANYA</div>
          <div className="flex items-center gap-2 flex-wrap">
            <Seg
              options={[
                { label: "Selalu TETAP", value: "stay" },
                { label: "Selalu GANTI", value: "switch" },
              ]}
              value={strategy}
              onChange={(v) => setStrategy(v as "stay" | "switch")}
            />
            <Btn size="sm" onClick={() => runSim(100)} disabled={sim.running}>Jalan 100</Btn>
            <Btn size="sm" variant="ink" onClick={() => runSim(1000)} disabled={sim.running}>Jalan 1000</Btn>
            <Btn size="sm" variant="ghost" onClick={resetSim}>Reset</Btn>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Readout k="Tetap — menang / ronde" v={`${fmtInt(sim.stayW)}/${fmtInt(sim.stayN)}`} />
            <Readout k="Ganti — menang / ronde" v={`${fmtInt(sim.swW)}/${fmtInt(sim.swN)}`} />
            <Readout k="Rasio menang (tetap)" v={sim.stayN ? pct(sim.stayW / sim.stayN) : "—"} color="red" />
            <Readout k="Rasio menang (ganti)" v={sim.swN ? pct(sim.swW / sim.swN) : "—"} color="blue" />
          </div>
        </div>
      </div>

      {/* chart + notes */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="panel-flat overflow-hidden">
          <div className="mono-label border-b-[1.5px] border-ink px-4 py-2 flex justify-between gap-3">
            <span>RASIO MENANG KUMULATIF PER STRATEGI</span>
            <span className="opacity-60 hidden sm:inline">JARAK KEDUA GARIS ITU YA INTI ARGUMENNYA</span>
          </div>
          <canvas ref={canvasRef} className="block w-full h-[240px]" aria-label="Grafik rasio menang" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="panel-flat p-4">
            <div className="mono-label mb-2">KENAPA GANTI PINTU BIKIN PELUANGMU DOBEL</div>
            <p className="text-[13.5px] leading-relaxed text-ink/85">
              Pilihan pertamamu tepat cuma <span className="mono-data">1/3</span> dari waktu — dan pembawa acara{" "}
              <em>tahu</em> mobilnya di mana, jadi pintu kambing yang dia buka itu bukan kejadian acak. Ketidakpastiannya{" "}
              yang <span className="mono-data">2/3</span> ditumpuk ke satu pintu yang nggak pernah dia sentuh. Ganti pintu,
              dan kamu mewarisi 2/3 numpukan itu.
            </p>
            <div className="formula mt-3">P(menang | ganti) = 2/3 ≈ 66,7% &nbsp;·&nbsp; P(menang | tetap) = 1/3</div>
          </div>
          <div className="panel-sun p-4">
            <div className="mono-label mb-2">OBATNYA: 100 PINTU</div>
            <p className="text-[13.5px] leading-relaxed">
              Masih belum yakin? Bayangin aja ada 100 pintu. Kamu pilih satu. Terus pembawa acara membuka{" "}
              <strong>98 pintu kambing</strong>, nyisain pintumu sama satu pintu lain. Sekarang kamu mau pasang di{" "}
              pintu yang mana? Rumusnya nggak pernah berubah — yang berubah cuma imajinasimu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
