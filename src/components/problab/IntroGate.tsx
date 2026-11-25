/* PROBLAB intro gate — the playful riso preloader.
   Real loading signals (document fonts + window load) drive the counter; a
   paper sticker card holds the wordmark while marbles bounce; then a SIAP!
   stamp slams in and the pastel paper curtain splits to reveal the lab. */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { BLUE, RED, SUN } from "@/lib/problab/core";
import { Wordmark } from "./motionkit";

const MIN_SHOW = 1500; // jangan kedip-kedip: intro tampil minimal selama ini
const MAX_WAIT = 6000; // failsafe: ada asset ngehang? jangan tahan pengunjung selamanya

const LINES = [
  "nyalain mesin galtonnya…",
  "ngumpulin koin & dadunya…",
  "ngasuh bola-bola di guci…",
  "ngeresin pintu nomer tiga…",
  "ngitung semua peluangnya…",
];

const MARBLE_COLORS = [RED, BLUE, SUN];

export default function IntroGate() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const [line, setLine] = useState(0);
  const [reduced, setReduced] = useState(false);

  const progress = useMotionValue(0);
  const barWidth = useTransform(progress, (v) => `${v}%`);
  const progressText = useTransform(progress, (v) => `${Math.round(v)}%`);

  const flags = useRef({ fonts: false, load: false, min: false, leaving: false });
  const t0 = useRef(0);
  const reducedRef = useRef(false);

  useEffect(() => {
    t0.current = performance.now();
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reducedRef.current);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const li = window.setInterval(() => setLine((i) => (i + 1) % LINES.length), 780);

    const bump = (target: number) => {
      if (flags.current.leaving) return;
      animate(progress, target, { duration: 0.5, ease: "easeOut" });
    };

    const tryLeave = () => {
      const f = flags.current;
      if (f.leaving || !f.min) return;
      /* tunggu asset beneran beres — TAPI nggak lebih dari MAX_WAIT */
      if (!f.load && performance.now() - t0.current < MAX_WAIT) return;
      f.leaving = true;
      window.clearInterval(li);
      animate(progress, 100, { duration: 0.3, ease: "easeOut" });
      window.setTimeout(() => setLeaving(true), 260);
    };

    bump(34);
    const minT = window.setTimeout(
      () => {
        flags.current.min = true;
        tryLeave();
      },
      reducedRef.current ? 600 : MIN_SHOW
    );

    document.fonts?.ready.then(() => {
      flags.current.fonts = true;
      bump(74);
    });
    if (document.readyState === "complete") {
      flags.current.load = true;
      tryLeave();
    } else {
      const onLoad = () => {
        flags.current.load = true;
        tryLeave();
      };
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      window.clearInterval(li);
      window.clearTimeout(minT);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [progress]);

  /* tirai udah pada pergi → unmount + buka scroll lagi */
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(
      () => {
        setGone(true);
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      },
      reduced ? 450 : 1250
    );
    return () => window.clearTimeout(t);
  }, [leaving, reduced]);

  if (gone) return null;

  const split = [0.76, 0, 0.24, 1] as const;

  return (
    <div id="intro-gate" className="fixed inset-0 z-[9999]" role="status" aria-label="Memuat PROBLAB">
      {/* tirai kertas: dua panel pastel yang mbelah pas SIAP */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[50.2%] dotgrid"
        style={{
          background: "linear-gradient(135deg, var(--lilac) 0%, var(--sky) 100%)",
          borderBottom: "2.5px solid var(--ink)",
        }}
        initial={{ y: 0 }}
        animate={leaving ? { y: "-103%" } : { y: 0 }}
        transition={{ duration: reduced ? 0.28 : 0.85, ease: split, delay: reduced ? 0 : 0.34 }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[50.2%] dotgrid"
        style={{
          background: "linear-gradient(315deg, var(--butter) 0%, var(--rose) 100%)",
          borderTop: "2.5px solid var(--ink)",
        }}
        initial={{ y: 0 }}
        animate={leaving ? { y: "103%" } : { y: 0 }}
        transition={{ duration: reduced ? 0.28 : 0.85, ease: split, delay: reduced ? 0 : 0.34 }}
      />

      {/* kartu stiker berisi loader */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center px-5"
        animate={leaving ? { opacity: 0, scale: 0.93, y: -16 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: reduced ? 0.18 : 0.3, ease: "easeIn" }}
      >
        <motion.div
          className="relative w-[min(440px,94vw)] rounded-[22px] border-[2px] border-ink bg-paper px-7 pb-6 pt-7 text-center"
          style={{ boxShadow: "8px 9px 0 0 rgba(27,22,17,0.85)" }}
          initial={{ opacity: 0, y: 30, rotate: -5, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, rotate: -1.4, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 17 }}
        >
          <div className="mono-label text-[9.5px] opacity-65">MEMUAT SEMUA ASET LAB…</div>
          <div className="mt-3">
            <Wordmark className="text-[54px] leading-none font-black tracking-tight md:text-[64px]" delay={0.15} stagger={0.05} />
          </div>

          {/* kelereng nitip absen sambil nunggu asset */}
          <div className="mt-5 flex items-center justify-center gap-2.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                className="inline-block h-[15px] w-[15px] rounded-full border-[1.8px] border-ink"
                style={{ background: MARBLE_COLORS[i % 3] }}
                animate={{ y: [0, -11, 0] }}
                transition={{ duration: 0.62, repeat: Infinity, ease: "easeInOut", delay: i * 0.095 }}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="relative h-[13px] flex-1 overflow-hidden rounded-full border-[1.6px] border-ink bg-white/60">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: barWidth,
                  background: "linear-gradient(90deg, var(--rose-deep), var(--lilac-deep), var(--sky-deep))",
                }}
              />
            </div>
            <motion.span className="mono-data w-[46px] shrink-0 text-right text-[13px] font-semibold">
              {progressText}
            </motion.span>
          </div>

          <motion.p
            key={line}
            className="mono-label mt-3.5 min-h-[14px] text-[10px] normal-case opacity-75"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 0.75, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {LINES[line]}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* stiker SIAP! — nembok sebentar, baru tirainya dibuka */}
      {leaving && (
        <motion.div
          className="absolute left-1/2 top-1/2 z-30"
          style={{ marginLeft: -47, marginTop: -47 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 0.78, duration: 0.32 }}
        >
          <motion.div
            className="flex h-[94px] w-[94px] items-center justify-center rounded-full border-[2.5px] border-ink"
            style={{ background: "var(--butter)", boxShadow: "5px 6px 0 0 rgba(27,22,17,0.85)" }}
            initial={{ scale: 2.9, opacity: 0, rotate: -24 }}
            animate={{ scale: [2.9, 0.9, 1], opacity: [0, 1, 1], rotate: [-24, -12, -8] }}
            transition={{ duration: 0.45, times: [0, 0.6, 1], ease: "easeOut" }}
          >
            <span className="text-[20px] font-black tracking-tight" style={{ fontFamily: "var(--font-bricolage), sans-serif" }}>
              SIAP!
            </span>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
