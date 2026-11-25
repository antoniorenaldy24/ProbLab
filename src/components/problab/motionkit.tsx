/* PROBLAB — motion kit: shared framer-motion primitives (parallax, reveals, wordmark, tilt) */
"use client";

import React, { useEffect } from "react";
import {
  motion,
  MotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";

const EASE = [0.22, 0.8, 0.3, 1] as const;

/* ---------------- scroll progress bar ---------------- */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3.5px] z-[70] origin-left marquee-grad pointer-events-none"
      style={{ scaleX }}
    />
  );
}

/* ---------------- shared mouse parallax ---------------- */

const sharedMX = new MotionValue(0);
const sharedMY = new MotionValue(0);
let mouseWired = false;

function wireMouse() {
  if (mouseWired || typeof window === "undefined") return;
  mouseWired = true;
  window.addEventListener(
    "mousemove",
    (e) => {
      sharedMX.set((e.clientX / window.innerWidth) * 2 - 1);
      sharedMY.set((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true }
  );
}

export function useParallax(depth = 22) {
  useEffect(wireMouse, []);
  const sx = useSpring(sharedMX, { stiffness: 44, damping: 18, mass: 0.5 });
  const sy = useSpring(sharedMY, { stiffness: 44, damping: 18, mass: 0.5 });
  const x = useTransform(sx, (v: number) => v * depth);
  const y = useTransform(sy, (v: number) => v * depth);
  return { x, y };
}

export function Parallax({
  depth = 22,
  className,
  style,
  children,
}: {
  depth?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const { x, y } = useParallax(depth);
  return (
    <motion.div className={className} style={{ x, y, ...style }}>
      {children}
    </motion.div>
  );
}

/* ---------------- idle float ---------------- */

export function Float({
  children,
  amp = 9,
  dur = 5.5,
  delay = 0,
  rot = 3,
  className,
  style,
}: {
  children?: React.ReactNode;
  amp?: number;
  dur?: number;
  delay?: number;
  rot?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      animate={{ y: [0, -amp, 0], rotate: [0, rot, 0, -rot, 0] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- scroll reveal ---------------- */

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  style,
}: {
  children?: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- stagger group ---------------- */

export const staggerGroup: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export function Stagger({
  children,
  className,
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={staggerGroup}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div className={className} style={style} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

/* ---------------- hover tilt ---------------- */

export function Tilt({
  children,
  className,
  style,
  max = 6,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  max?: number;
}) {
  const rx = useSpring(0, { stiffness: 240, damping: 18 });
  const ry = useSpring(0, { stiffness: 240, damping: 18 });

  return (
    <motion.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 800, ...style }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * max * 2);
        rx.set(-py * max * 2);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- gradient wordmark (per-letter springs) ---------------- */

/* smooth multi-stop sweep — adjacent letters connect into ONE continuous pastel gradient */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function mixHex(a: string, c2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function sampleSweep(stops: string[], p: number): string {
  const x = Math.min(1, Math.max(0, p));
  const seg = x * (stops.length - 1);
  const i = Math.floor(seg);
  return mixHex(stops[i], stops[Math.min(stops.length - 1, i + 1)], seg - i);
}

function sweepPairs(stops: string[], n: number): [string, string][] {
  return Array.from({ length: n }, (_, i) => [
    sampleSweep(stops, i / n),
    sampleSweep(stops, (i + 1) / n),
  ]);
}

/* hero: DEEP riso inks — ultramarine → violet → raspberry → vermilion.
   Max contrast on the pastel wash; paired with the white-rim sticker pop in CSS. */
const WM_SWEEP = ["#2438d8", "#7c2ae8", "#e0246e", "#f04a12"];
/* footer on ink: butter → rose → lilac → sky */
const FOOTER_SWEEP = ["#ffe59c", "#ffc2d1", "#d3c0ff", "#b9d4ff"];

export function Wordmark({
  text = "PROBLAB",
  className = "",
  delay = 0.1,
  stagger = 0.055,
}: {
  text?: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const chars = text.split("");
  const pairs = sweepPairs(WM_SWEEP, chars.length);
  return (
    <span className={`inline-block wordmark-pop ${className}`} aria-label={text}>
      {chars.map((ch, i) => {
        const [a, b] = pairs[i];
        return (
          <motion.span
            key={`${ch}-${i}`}
            aria-hidden="true"
            className="inline-block will-change-transform cursor-default"
            initial={{ y: "55%", opacity: 0, rotate: i % 2 ? 6 : -6 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24, delay: delay + i * stagger }}
            whileHover={{
              y: -14,
              rotate: i % 2 ? 4 : -4,
              transition: { type: "spring", stiffness: 420, damping: 11 },
            }}
            style={{
              background: `linear-gradient(165deg, ${a} 20%, ${b} 95%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {ch}
          </motion.span>
        );
      })}
    </span>
  );
}

/* ---------------- scroll-linked rise for footer wordmark ---------------- */

export function RisingLetters({
  text = "PROBLAB",
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  const chars = text.split("");
  const pairs = sweepPairs(FOOTER_SWEEP, chars.length);
  return (
    <motion.div
      className={`footer-wordmark ${className}`}
      aria-hidden="true"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {chars.map((ch, i) => {
        const [a, b] = pairs[i];
        return (
          <motion.span
            key={`${ch}-${i}`}
            variants={{
              hidden: { y: "104%", rotate: 0 },
              show: { y: "18%", rotate: 0, transition: { type: "spring", stiffness: 110, damping: 19 } },
            }}
            whileHover={{ y: "6%", rotate: i % 2 ? 2.5 : -2.5, transition: { type: "spring", stiffness: 300, damping: 12 } }}
            style={{
              background: `linear-gradient(180deg, ${a} 5%, ${b} 90%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {ch}
          </motion.span>
        );
      })}
    </motion.div>
  );
}

/* ---------------- floating decorative icon object ---------------- */

export function FloatObj({
  depth = 20,
  amp = 10,
  dur = 5,
  delay = 0,
  rot = 4,
  className,
  style,
  children,
}: {
  depth?: number;
  amp?: number;
  dur?: number;
  delay?: number;
  rot?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const { x, y } = useParallax(depth);
  return (
    <motion.div className={`absolute pointer-events-none ${className ?? ""}`} style={{ x, y, ...style }}>
      <Float amp={amp} dur={dur} delay={delay} rot={rot}>
        {children}
      </Float>
    </motion.div>
  );
}
