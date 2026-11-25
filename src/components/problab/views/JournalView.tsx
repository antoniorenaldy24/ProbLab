/* PROBLAB — Exploration Journal: the margin where learning is kept */
"use client";

import React, { useState } from "react";
import { EXPERIMENTS } from "@/lib/problab/core";
import { jdate, useJournal } from "@/lib/problab/journal";
import { Btn, SectionHead } from "../kit";

const PROMPT_LIB = [
  { tag: "galton", q: "Di baris ke-12, gunung bola bakal numpuk di mana? 80% bola mendarat di celah mana aja?" },
  { tag: "coin", q: "Runtunan gambar berapa panjang yang bikin kamu curiga koinnya dimanipulasi? Lempar terus sampai ketemu satu." },
  { tag: "dice", q: "Kok total 7 punya enam dunia sementara 12 cuma satu? Coba jelasin ke adik kamu yang umur 12." },
  { tag: "wheel", q: "Rancang roda undian yang mau kamu terima kalau ditawarin ikut arisan. Bobot berapa yang kamu kasih?" },
  { tag: "urn", q: "Abis narik satu bola merah bata, peluang narik merah lagi naik atau turun? Kenapa?" },
  { tag: "doors", q: "Tulis satu kalimat yang ngejelasin kenapa ganti pintu bikin peluang menang jadi dobel." },
  { tag: "birthdays", q: "Sebelum jalanin simulasi: kalau ada 23 orang, kira-kira berapa % yang ulang tahunnya bareng? Tebak dulu, baru cek." },
  { tag: "field", q: "Bisa nggak dua peristiwa saling lepas tapi P(A)+P(B) > 1? Coba mainin lingkarannya." },
];

export default function JournalView() {
  const j = useJournal();
  const [filter, setFilter] = useState<string>("all");

  const filtered = j.entries.filter((e) => filter === "all" || e.exp === filter);
  const perExp = (slug: string) => j.entries.filter((e) => e.exp === slug).length;

  const copyAll = () => {
    const txt = j.entries
      .map((e) => {
        const meta = EXPERIMENTS.find((x) => x.slug === e.exp);
        return `[${jdate(e.ts)}] ${e.kind.toUpperCase()}${meta ? ` · Nº${meta.no} ${meta.title}` : " · umum"}\n${e.text}\n`;
      })
      .join("\n");
    navigator.clipboard?.writeText(txt || "— jurnal masih kosong —").catch(() => {});
  };

  return (
    <div className="view-in max-w-[1200px] mx-auto w-full px-4 md:px-8 pb-16">
      <header className="pt-10 md:pt-14 pb-8">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="chip bg-ink text-paper">CATATAN PINGGIRAN</span>
          <span className="chip">NYIMPIN DI BROWSER INI AJA</span>
        </div>
        <h1 className="riso font-extrabold tracking-tight leading-[0.9] text-[clamp(2.6rem,7vw,5.5rem)]">
          Jurnal <span className="serif-accent riso-red">eksplorasi</span>
        </h1>
        <p className="serif-accent text-[1.4rem] md:text-[1.6rem] max-w-[52ch] mt-4">
          prediksi, temuan, dan argumen yang kamu kalahin sama kenyataan — ditulis sebelum rasa penasaran kabur.
        </p>
      </header>

      <section className="mb-10">
        <SectionHead
          no="§ 01"
          title="Tulis satu catatan"
          right={
            <Btn size="sm" onClick={() => j.openDrawer()}>
              + Catatan baru
            </Btn>
          }
        />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="panel-sun p-5">
            <div className="mono-label mb-2">RITUALNYA SEDERHANA</div>
            <p className="text-[14px] leading-relaxed">
              1 · Tebak dulu sebelum jalan. 2 · Nyalain alatnya. 3 · Tulis satu kalimat soal hal yang bikin kamu
              kaget. Jarak antara langkah 1 dan 3 itu ya kurikulumnya, selesai.
            </p>
          </div>
          <div className="panel-flat p-5">
            <div className="mono-label mb-2">KUMPULAN TANTANGAN — SILAKAN PILIH LAWAN</div>
            <ul className="flex flex-col gap-2">
              {PROMPT_LIB.map((p) => (
                <li key={p.tag} className="flex items-baseline gap-3">
                  <span className="mono-data text-[10px] opacity-60 shrink-0 w-[86px]">Nº{EXPERIMENTS.find((e) => e.slug === p.tag)?.no}</span>
                  <span className="text-[13px] leading-snug flex-1">{p.q}</span>
                  <button
                    data-hot
                    className="mono-data text-[10px] underline underline-offset-2 shrink-0 hover:text-red"
                    onClick={() => j.openDrawer({ exp: p.tag, kind: "prediction", text: p.q })}
                  >
                    jawab →
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <SectionHead
          no="§ 02"
          title={`Buku besar (${j.count})`}
          right={
            <div className="flex gap-2">
              <Btn size="sm" variant="ghost" onClick={copyAll}>Salin semua</Btn>
              {j.count > 0 && (
                <Btn size="sm" variant="ghost" onClick={() => { if (confirm("Cabut semua halamannya? Ini nggak bisa dibatalkan lho.")) j.clear(); }}>
                  Bersihkan
                </Btn>
              )}
            </div>
          }
        />

        {/* filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button data-hot className={`chip ${filter === "all" ? "bg-ink text-paper" : ""}`} onClick={() => setFilter("all")}>
            ALL ({j.count})
          </button>
          {EXPERIMENTS.filter((e) => perExp(e.slug) > 0).map((e) => (
            <button
              key={e.slug}
              data-hot
              className={`chip ${filter === e.slug ? "bg-ink text-paper" : ""}`}
              onClick={() => setFilter(e.slug)}
            >
              Nº{e.no} ({perExp(e.slug)})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="panel-flat dotgrid p-10 text-center">
            <p className="serif-accent text-[1.6rem]">Halaman kosong itu halaman yang jujur.</p>
            <p className="marginal normal-case mt-2">
              mainin salah satu alat (indeksnya ada di bar atas), sadarin sesuatu, lalu tekan ✎ Jurnal
            </p>
          </div>
        ) : (
          <div className="border-t-[1.5px] border-ink">
            {filtered.map((en) => {
              const meta = EXPERIMENTS.find((e) => e.slug === en.exp);
              return (
                <article key={en.id} className="border-b-[1.5px] border-ink py-5 group grid md:grid-cols-[150px_1fr] gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span
                      className="chip w-max"
                      style={{
                        background: en.kind === "prediction" ? "var(--sun)" : en.kind === "finding" ? "var(--blue)" : "var(--red)",
                        color: en.kind === "finding" ? "var(--paper)" : "var(--ink)",
                      }}
                    >
                      {en.kind === "prediction" ? "prediksi" : en.kind === "finding" ? "temuan" : "catatan"}
                    </span>
                    {meta && <span className="mono-data text-[10.5px] opacity-60">Nº{meta.no} · {meta.title}</span>}
                    <span className="mono-data text-[10.5px] opacity-40">{jdate(en.ts)}</span>
                    <button
                      data-hot
                      className="mono-data text-[10px] opacity-0 group-hover:opacity-50 hover:!opacity-100 underline text-left w-max"
                      onClick={() => j.remove(en.id)}
                    >
                      cabut halaman
                    </button>
                  </div>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{en.text}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
