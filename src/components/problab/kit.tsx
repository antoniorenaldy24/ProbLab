/* PROBLAB — shared UI kit */
"use client";

import React from "react";
import type { ExpMeta } from "@/lib/problab/core";
import { BLUE, INK, RED, SUN, goHash } from "@/lib/problab/core";
import { useJournal } from "@/lib/problab/journal";

/* ---------- buttons ---------- */

export function Btn({
  children,
  onClick,
  variant = "paper",
  size,
  disabled,
  title,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "paper" | "red" | "blue" | "sun" | "ink" | "ghost";
  size?: "sm";
  disabled?: boolean;
  title?: string;
  className?: string;
}) {
  const v = variant === "paper" ? "" : `btn-${variant}`;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      data-hot
      className={`btn ${v} ${size === "sm" ? "btn-sm" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export function Seg({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          data-hot
          role="tab"
          aria-selected={value === o.value}
          className={value === o.value ? "on" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Readout({
  k,
  v,
  color,
}: {
  k: string;
  v: string;
  color?: "red" | "blue" | "sun" | "ink";
}) {
  const c = color ? ` color-[var(--${color === "ink" ? "ink" : color})]` : "";
  return (
    <div className="readout flex-1">
      <div className="k">{k}</div>
      <div className={`v mono-data${c}`}>{v}</div>
    </div>
  );
}

/* ---------- slider with label ---------- */

export function LabSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  display?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="mono-label">{label}</span>
        <span className="mono-data text-[12px] font-semibold">{display ?? value}</span>
      </div>
      <input
        type="range"
        className="lab-range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/* ---------- rotating stamp ---------- */

export function Stamp({
  text,
  size = 108,
  className = "",
  color = INK,
}: {
  text: string;
  size?: number;
  className?: string;
  color?: string;
}) {
  const id = React.useId().replace(/[:]/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={`stamp-spin ${className}`}
      aria-hidden="true"
    >
      <defs>
        <path id={`c-${id}`} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      <circle cx="60" cy="60" r="57" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx="60" cy="60" r="29" fill="none" stroke={color} strokeWidth="1.5" />
      <text
        fontFamily="IBM Plex Mono, monospace"
        fontSize="10.5"
        letterSpacing="2.6"
        fill={color}
        fontWeight="600"
      >
        <textPath href={`#c-${id}`} startOffset="0">
          {text.toUpperCase()}
        </textPath>
      </text>
      <text
        x="60"
        y="64.5"
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        fontWeight="600"
        fill={color}
      >
        ✳
      </text>
    </svg>
  );
}

/* ---------- specimen glyph previews (index rows) ---------- */

export function Glyph({ kind, w = 52 }: { kind: ExpMeta["glyph"]; w?: number }) {
  const h = w * 0.72;
  const s = { strokeWidth: 2.2, fill: "none" } as const;
  switch (kind) {
    case "galton":
      return (
        <svg width={w} height={h} viewBox="0 0 52 37" aria-hidden="true">
          {[0, 1, 2, 3].map((r) =>
            (r % 2 === 0 ? [0, 1, 2, 3] : [0.5, 1.5, 2.5]).map((c) => (
              <circle key={`${r}-${c}`} cx={10 + c * 13} cy={6 + r * 6} r="1.8" fill={INK} />
            ))
          )}
          <rect x="4" y="28" width="44" height="6" {...s} stroke={INK} />
          <rect x="12" y="28" width="7" height="6" fill={BLUE} />
          <rect x="20" y="28" width="12" height="6" fill={RED} />
          <rect x="33" y="28" width="7" height="6" fill={SUN} />
        </svg>
      );
    case "coin":
      return (
        <svg width={w} height={h} viewBox="0 0 52 37" aria-hidden="true">
          <circle cx="26" cy="18.5" r="13" fill={SUN} stroke={INK} strokeWidth="2.2" />
          <circle cx="26" cy="18.5" r="9.5" fill="none" stroke={INK} strokeWidth="1.2" strokeDasharray="2 2" />
          <text x="26" y="23" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="600" fontSize="11" fill={INK}>G</text>
        </svg>
      );
    case "dice":
      return (
        <svg width={w} height={h} viewBox="0 0 52 37" aria-hidden="true">
          <rect x="7" y="6" width="17" height="17" fill="#fcfbff" stroke={INK} strokeWidth="2.2" />
          <circle cx="12" cy="11" r="1.9" fill={INK} /><circle cx="19" cy="18" r="1.9" fill={INK} />
          <rect x="28" y="14" width="17" height="17" fill={RED} stroke={INK} strokeWidth="2.2" />
          <circle cx="33" cy="19" r="1.9" fill="#fcfbff" /><circle cx="36.5" cy="22.5" r="1.9" fill="#fcfbff" /><circle cx="40" cy="26" r="1.9" fill="#fcfbff" />
        </svg>
      );
    case "wheel":
      return (
        <svg width={w} height={h} viewBox="0 0 52 37" aria-hidden="true">
          <circle cx="26" cy="20" r="13" fill={BLUE} stroke={INK} strokeWidth="2.2" />
          <path d="M26 20 L26 7 A13 13 0 0 1 37.3 26.5 Z" fill={SUN} stroke={INK} strokeWidth="1.2" />
          <path d="M26 20 L37.3 26.5 A13 13 0 0 1 26 33 Z" fill={RED} stroke={INK} strokeWidth="1.2" />
          <path d="M26 20 L14.7 26.5" stroke={INK} strokeWidth="1.2" />
          <path d="M26 4 L26 0.5" stroke={RED} strokeWidth="2.6" />
        </svg>
      );
    case "urn":
      return (
        <svg width={w} height={h} viewBox="0 0 52 37" aria-hidden="true">
          <path d="M16 4 h20 l-2.5 6 c4 3.5 5.5 8 5.5 12 0 8-6 13-13 13s-13-5-13-13c0-4 1.5-8.5 5.5-12 Z" fill="#fcfbff" stroke={INK} strokeWidth="2.2" />
          <circle cx="22" cy="20" r="3.2" fill={RED} /><circle cx="30" cy="17" r="3.2" fill={BLUE} />
          <circle cx="26" cy="26" r="3.2" fill={SUN} /><circle cx="32" cy="25" r="3.2" fill={RED} />
        </svg>
      );
    case "doors":
      return (
        <svg width={w} height={h} viewBox="0 0 52 37" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={6 + i * 15} y="6" width="13" height="27" fill={i === 1 ? SUN : "#fcfbff"} stroke={INK} strokeWidth="2.2" />
              <circle cx={10.5 + i * 15} cy="20" r="1.4" fill={INK} />
            </g>
          ))}
        </svg>
      );
    case "days":
      return (
        <svg width={w} height={h} viewBox="0 0 52 37" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, r) =>
            Array.from({ length: 8 }).map((_, c) => (
              <rect key={`${r}-${c}`} x={4 + c * 5.6} y={4 + r * 4.3} width="3.6" height="2.6"
                fill={[0, 1, 2, 3, 4, 5, 6, 7].includes(r * 8 + c) ? (r * 8 + c) % 5 === 0 ? RED : BLUE : "none"}
                stroke={INK} strokeWidth="0.7" opacity={(r * 8 + c) % 3 === 0 ? 1 : 0.35} />
            ))
          )}
        </svg>
      );
    case "field":
      return (
        <svg width={w} height={h} viewBox="0 0 52 37" aria-hidden="true">
          <circle cx="21" cy="18.5" r="11" fill="rgba(36,56,216,0.16)" stroke={BLUE} strokeWidth="2.2" />
          <circle cx="33" cy="18.5" r="11" fill="rgba(226,61,40,0.14)" stroke={RED} strokeWidth="2.2" />
        </svg>
      );
  }
}

/* ---------- section header ---------- */

export function SectionHead({
  no,
  title,
  right,
}: {
  no: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-t-[1.5px] border-ink pt-3 mb-6 md:mb-8">
      <div className="flex items-baseline gap-3 md:gap-5">
        <span className="mono-data text-[11px] font-semibold opacity-70">{no}</span>
        <h2 className="text-[clamp(1.5rem,3.4vw,2.4rem)] font-bold leading-none tracking-tight">{title}</h2>
      </div>
      {right}
    </div>
  );
}

/* ---------- field note (marginalia) ---------- */

export function FieldNote(
  {
    children,
    marker = "CATATAN LAPANGAN",
    tone,
  }: {
    children: React.ReactNode;
    marker?: string;
    tone?: "red" | "blue" | "sun";
  }
) {
  const border =
    tone === "red" ? "border-l-red" : tone === "blue" ? "border-l-blue" : tone === "sun" ? "border-l-sun" : "border-l-ink";
  return (
    <div className={`border-l-[3px] ${border} pl-4 py-1`}>
      <div className="mono-label mb-2 opacity-80">{marker}</div>
      <div className="text-[13.5px] leading-relaxed text-ink/85">{children}</div>
    </div>
  );
}

/* ---------- journal prompt strip ---------- */

export function JournalPrompt({ exp, prompt }: { exp: string; prompt: string }) {
  const j = useJournal();
  return (
    <div className="panel-sun p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
      <div className="mono-label shrink-0">✎ CATAT YA —</div>
      <p className="serif-accent text-[1.25rem] md:text-[1.4rem] leading-snug flex-1">
        “{prompt}”
      </p>
      <Btn
        variant="ink"
        size="sm"
        onClick={() => j.openDrawer({ exp, kind: "prediction", text: prompt })}
      >
        Jawab → Jurnal
      </Btn>
    </div>
  );
}

/* ---------- link ---------- */

export function LabLink({
  to,
  children,
  className = "",
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={`#/${to}`}
      data-hot
      className={`inline-flex items-center gap-2 ${className}`}
      onClick={() => {
        onClick?.();
        goHash(to);
      }}
    >
      {children}
    </a>
  );
}
