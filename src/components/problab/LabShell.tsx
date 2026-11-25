/* PROBLAB — experiment page chrome: masthead, prompt, prev/next */
"use client";

import React from "react";
import { EXPERIMENTS, neighbors, type ExpMeta } from "@/lib/problab/core";
import { Glyph, JournalPrompt, LabLink } from "./kit";

export default function LabShell({ meta, children }: { meta: ExpMeta; children: React.ReactNode }) {
  const { prev, next } = neighbors(meta.slug);
  const ix = EXPERIMENTS.findIndex((e) => e.slug === meta.slug);

  return (
    <div className="view-in max-w-[1400px] mx-auto w-full px-4 md:px-8 pb-16">
      {/* masthead */}
      <header className="relative pt-10 md:pt-14 pb-8 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-8 -left-4 md:left-6 font-extrabold leading-none select-none pointer-events-none riso"
          style={{ fontSize: "clamp(9rem, 26vw, 20rem)", opacity: 0.1 }}
        >
          {meta.no}
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="chip bg-ink text-paper">SPESIMEN Nº{meta.no}</span>
            {meta.disciplines.map((d) => (
              <span key={d} className="chip">{d}</span>
            ))}
          </div>
          <div className="flex items-end gap-5 flex-wrap">
            <h1 className="riso font-extrabold tracking-tight leading-[0.9] text-[clamp(2.6rem,7vw,5.5rem)]">
              {meta.title}
            </h1>
            <div className="hidden md:block pb-2 opacity-80">
              <Glyph kind={meta.glyph} w={64} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="serif-accent text-[1.35rem] md:text-[1.5rem] max-w-[46ch]">{meta.short}</p>
            <span className="mono-label opacity-70">ALATNYA: {meta.apparatus}</span>
          </div>
        </div>
      </header>

      {/* instrument */}
      <main className="mb-10">{children}</main>

      {/* journal prompt */}
      <section className="mb-12">
        <JournalPrompt exp={meta.slug} prompt={meta.prompt} />
      </section>

      {/* prev / next */}
      <nav className="grid grid-cols-2 border-[1.5px] border-ink" aria-label="Navigasi spesimen">
        <LabLink to={prev.slug} className="group border-r-[1.5px] border-ink p-4 md:p-5 hover:bg-ink hover:text-paper transition-colors">
          <span className="mono-label opacity-70">← SEBELUMNYA · Nº{prev.no}</span>
          <span className="block font-bold text-[clamp(1rem,2.2vw,1.5rem)] leading-tight mt-1">{prev.title}</span>
        </LabLink>
        <LabLink to={next.slug} className="group p-4 md:p-5 text-right hover:bg-ink hover:text-paper transition-colors">
          <span className="mono-label opacity-70">BERIKUTNYA · Nº{next.no} →</span>
          <span className="block font-bold text-[clamp(1rem,2.2vw,1.5rem)] leading-tight mt-1">{next.title}</span>
        </LabLink>
      </nav>
      <div className="mt-4 mono-label opacity-60">
        SPESIMEN {ix + 1} DARI {EXPERIMENTS.length} — <LabLink to="" className="underline underline-offset-4">KEMBALI KE LAB</LabLink>
      </div>
    </div>
  );
}
