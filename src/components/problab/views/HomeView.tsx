/* PROBLAB — HOME: the iconic landing. Identity first, instruments second. */
"use client";

import React from "react";
import { EXPERIMENTS } from "@/lib/problab/core";
import { Glyph, LabLink, SectionHead, Stamp } from "../kit";
import { Float, FloatObj, Reveal, Stagger, StaggerItem, Tilt, Wordmark } from "../motionkit";
import HeroGalton from "../HeroGalton";

const FACTS = [
  "P(GAMBAR) = 0,5 — PADA AKHIRNYA",
  "23 ORANG → 50,7% RUANGAN PUNYA ULANG TAHUN BERSAMA",
  "GANTI PINTU, MENANG 2/3",
  "ANGKA 7 MENGUASAI 6 DARI 36 DUNIA DADU",
  "RUNTUNAN 10 GAMBAR: 1 DALAM 1024",
  "KURVA LONCENG DIHITUNG SEBELUM DIGAMBAR",
  "P(A∪B) = P(A) + P(B) − P(A∩B)",
  "KEACAKAN BUKAN RENCANA — DIA BENTUK",
  "MENGAMBIL TANPA PENGEMBALIAN MENGUBAH PELUANG",
];

/* ---------- small icons for definition / reason cards ---------- */

function IcoFlask() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <path d="M14 4 h6 v8 l7 14 a3 3 0 0 1 -3 4 h-14 a3 3 0 0 1 -3 -4 l7 -14 Z" fill="var(--sky)" stroke="#1b1611" strokeWidth="2" />
      <circle cx="14" cy="24" r="2.4" fill="var(--rose-deep)" />
      <circle cx="20" cy="26" r="2" fill="var(--butter-deep)" />
    </svg>
  );
}
function IcoLoop() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <path d="M6 22 a8 8 0 1 1 4 7" fill="none" stroke="#1b1611" strokeWidth="2.4" />
      <path d="M28 12 a8 8 0 1 1 -4 -7" fill="none" stroke="var(--mint-deep)" strokeWidth="2.4" />
      <path d="M10 29 l0 -0.01" stroke="#1b1611" strokeWidth="2.4" />
      <path d="M6 22 l-3 1 M10 29 l1 -3" stroke="#1b1611" strokeWidth="2.4" />
    </svg>
  );
}
function IcoBook() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <rect x="5" y="4" width="24" height="26" fill="var(--peach)" stroke="#1b1611" strokeWidth="2" />
      <line x1="5" y1="4" x2="5" y2="30" stroke="#1b1611" strokeWidth="3" />
      <line x1="10" y1="11" x2="24" y2="11" stroke="#1b1611" strokeWidth="1.6" />
      <line x1="10" y1="17" x2="24" y2="17" stroke="#1b1611" strokeWidth="1.6" />
      <line x1="10" y1="23" x2="19" y2="23" stroke="var(--rose-deep)" strokeWidth="1.8" />
    </svg>
  );
}
function IcoHand() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <path d="M12 30 V14 a2.4 2.4 0 0 1 4.8 0 V20 M16.8 20 V11 a2.4 2.4 0 0 1 4.8 0 V20 M21.6 20 V13 a2.4 2.4 0 0 1 4.8 0 V21 c0 6-3 9-8 9s-7-2-8.6-6l-2.4-6 a2.3 2.3 0 0 1 4 -2 l1.6 3" fill="none" stroke="#1b1611" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
function IcoCompass() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <circle cx="17" cy="17" r="13" fill="var(--butter)" stroke="#1b1611" strokeWidth="2" />
      <path d="M17 8 L21 22 L17 19 L13 22 Z" fill="var(--rose-deep)" stroke="#1b1611" strokeWidth="1.4" />
    </svg>
  );
}
function IcoSigma() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <path d="M25 7 H10 L19 17 L10 27 H25" fill="none" stroke="#1b1611" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="28" cy="17" r="2.6" fill="var(--sky-deep)" stroke="#1b1611" strokeWidth="1.4" />
    </svg>
  );
}

/* ---------- main ---------- */

export default function HomeView() {
  return (
    <div className="view-in">
      {/* ================= HERO ================= */}
      <section className="relative border-b-[1.5px] border-ink overflow-hidden">
        <div className="absolute inset-0 wash-hero" aria-hidden="true" />
        <div className="absolute inset-0 dotgrid opacity-30" aria-hidden="true" />

        {/* drifting pastel blobs — atmosphere, not weather */}
        <div
          className="blob blob-a w-[440px] h-[440px] -top-28 -left-20"
          style={{ background: "radial-gradient(circle, rgba(211,192,255,0.95), transparent 70%)" }}
          aria-hidden="true"
        />
        <div
          className="blob blob-b w-[400px] h-[400px] top-[18%] right-[4%]"
          style={{ background: "radial-gradient(circle, rgba(255,194,209,0.9), transparent 70%)" }}
          aria-hidden="true"
        />
        <div
          className="blob blob-a w-[320px] h-[320px] top-[44%] left-[4%]"
          style={{ background: "radial-gradient(circle, rgba(188,236,201,0.85), transparent 70%)" }}
          aria-hidden="true"
        />

        {/* little probability tags pinned around the stage */}
        <FloatObj depth={26} amp={11} dur={5.6} className="top-[62%] left-[1%] hidden xl:block">
          <span className="float-tag">P(6) = 1/6 — TANYA SI DADU</span>
        </FloatObj>
        <FloatObj depth={22} amp={9} dur={6.3} delay={0.5} className="top-[30%] right-[1.5%] hidden xl:block">
          <span className="float-tag">P(GAMBAR) = 1/2</span>
        </FloatObj>
        <FloatObj depth={18} amp={8} dur={5} delay={0.9} className="top-[54%] left-[3%] hidden lg:block">
          <span className="float-tag">μ & σ MUNCUL SENDIRI</span>
        </FloatObj>

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 pt-12 md:pt-16 pb-4">
          <Stagger className="flex items-center gap-3 flex-wrap mb-6">
            <StaggerItem>
              <span className="chip chip-ocean">LABORATORIUM LAPANGAN INTERAKTIF</span>
            </StaggerItem>
            <StaggerItem>
              <span className="chip chip-rose">8 SPESIMEN HIDUP</span>
            </StaggerItem>
            <StaggerItem>
              <span className="chip chip-sky">0 JALUR BAKU</span>
            </StaggerItem>
            <StaggerItem className="hidden md:block">
              <span className="chip chip-mint">DIBUAT UNTUK TANGAN YANG PENASARAN</span>
            </StaggerItem>
          </Stagger>

          <h1 className="font-extrabold tracking-tighter leading-[0.86] text-[clamp(3.6rem,14vw,13rem)] select-none">
            <Wordmark text="PROBLAB" />
          </h1>

          <div className="flex flex-wrap items-end justify-between gap-6 mt-5 md:mt-7">
            <div className="max-w-[58ch]">
              {/* the dictionary entry — what this lab studies, in one word */}
              <Reveal>
                <div className="dictionary p-4 md:p-5 md:-rotate-[0.5deg] max-w-[46ch]">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="serif-accent text-[clamp(1.9rem,3.6vw,2.6rem)] leading-none">peluang</span>
                    <span className="mono-label opacity-70">/pə·lu·ang/ — KATA BENDA</span>
                  </div>
                  <ol className="mt-2.5 space-y-1.5 text-[13.5px] leading-relaxed text-ink/90 list-decimal list-inside">
                    <li>
                      matematika tentang <em className="font-medium">mungkin</em> — bentuk yang diambil keacakan kalau
                      kamu hitung cukup lama.
                    </li>
                    <li>
                      satu-satunya hal yang diukur semua alat di laboratorium ini.
                    </li>
                  </ol>
                  <div className="mono-label mt-2.5 opacity-60">
                    SIN. KESempatan · ODDS · KECENDERUNGAN — LIHAT JUGA: JANGKA PANJANG
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <p className="serif-accent text-[clamp(1.5rem,3vw,2.3rem)] leading-tight mt-6">
                  belajar dengan menjelajah. paham dengan{" "}
                  <span className="grad-text" style={{ "--grad": "linear-gradient(120deg, var(--rose-deep), var(--lilac-deep))" } as React.CSSProperties}>
                    mencoba
                  </span>
                  .
                </p>
              </Reveal>
              <Reveal delay={0.14}>
                <p className="mt-3.5 text-[clamp(1rem,1.7vw,1.2rem)] leading-relaxed text-ink/85">
                  PROBLAB itu <strong>laboratorium lapangan untuk keacakan</strong> — delapan alat hidup yang bisa
                  kamu colok, tekunin, dan interogasi sampai dia ngaku bentuknya. Nggak perlu hafal rumus dulu.
                  Cukup alat, bukti, dan rasa penasaran kamu.
                </p>
              </Reveal>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:block">
                <Stamp text="PERCAYA SAMA JANGKA PANJANG · PROBLAB ·" size={116} />
              </div>
              <div className="flex flex-col gap-2.5">
                <button
                  data-hot
                  className="btn btn-grad"
                  onClick={() => document.getElementById("what-is")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Apa itu PROBLAB? ↓
                </button>
                <button
                  data-hot
                  className="btn btn-ink"
                  onClick={() => document.getElementById("specimens")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Buka indeks spesimen →
                </button>
                <LabLink to="galton" className="mono-label underline underline-offset-4 opacity-70 hover:opacity-100 text-center">
                  atau langsung nyelam ke spesimen Nº01
                </LabLink>
              </div>
            </div>
          </div>
        </div>

        {/* THE HERO MODEL — Mesin Peluang as a living 2D paper diorama. Click it, pour it. */}
        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 pb-2 pt-2">
          <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
            <span className="mono-label">
              DIORAMA 2D — <span style={{ color: "var(--lilac-deep)" }}>PAPAN GALTON, HIDUP DI DEPAN MATA</span>
            </span>
            <span className="mono-label opacity-60 hidden sm:inline">SETIAP BOLA SATU PERCOBAAN · SETIAP TUMPUKAN SATU PELUANG</span>
          </div>
          <HeroGalton />
        </div>

        <div className="relative pb-6 flex justify-center">
          <Float amp={7} dur={2.2}>
            <span className="mono-label opacity-60">GULIR ↓</span>
          </Float>
        </div>
      </section>

      {/* ================= FACT MARQUEE ================= */}
      <div className="marquee-grad text-ink border-b-[1.5px] border-ink overflow-hidden py-3" aria-hidden="true">
        <div className="marquee-track" style={{ animationDuration: "44s" }}>
          {[0, 1].map((rep) => (
            <div key={rep} className="flex shrink-0">
              {FACTS.map((f, i) => (
                <span key={`${rep}-${i}`} className="mono-data text-[12px] tracking-wide whitespace-nowrap px-6 flex items-center gap-6 font-semibold">
                  {f} <span className="font-black">✳</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ================= §01 APA ITU PROBLAB ================= */}
      <section id="what-is" className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-14 md:py-20 border-b-[1.5px] border-ink">
        <div className="absolute inset-0 wash-mist opacity-70 pointer-events-none" aria-hidden="true" />
        <div className="relative">
          <SectionHead no="§ 01" title="Apa itu PROBLAB" right={<span className="mono-label opacity-60 hidden md:inline">JAWABAN SATU PARAGRAF</span>} />
          <Reveal>
            <p className="text-[clamp(1.7rem,3.6vw,2.9rem)] font-medium leading-[1.22] tracking-tight max-w-[30ch] md:max-w-none">
              PROBLAB itu{" "}
              <span className="grad-text font-bold" style={{ "--grad": "linear-gradient(120deg, var(--sky-deep), var(--lilac-deep))" } as React.CSSProperties}>
                laboratorium keacakan
              </span>{" "}
              — peluang yang diangkat dari halaman buku dan dikembalikan{" "}
              <span className="grad-text font-bold" style={{ "--grad": "linear-gradient(120deg, var(--peach-deep), var(--rose-deep))" } as React.CSSProperties}>
                ke tangan kamu
              </span>
              , tempat yang memang jadi rumahnya.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 text-[clamp(1.05rem,1.9vw,1.35rem)] leading-relaxed text-ink/85 max-w-[70ch]">
              Kebanyakan orang kenal peluang sebagai tumpukan rumus yang dihafal sambil merem. Padahal dia pantas
              diperlakukan seperti benda hidup: koin yang berputar, dunia dadu yang menyala, toples yang melonggar,
              roda yang bisa dibohongi, pintu yang bisa ngambek. Jalankan seratus percobaan, dan jangka panjang
              mulai ngobrol sama kamu. Teorinya tidak pernah dibagikan — dia <strong>muncul sendiri</strong>,
              persis seperti kurva lonceng yang lahir dari seribu bola yang jatuh.
            </p>
          </Reveal>

          <Stagger className="mt-10 grid md:grid-cols-3 gap-5">
            {[
              {
                g: "g-sky",
                icon: <IcoFlask />,
                t: "Labnya.",
                d: "Delapan alat, tanpa silabus. Setiap alat menjalankan ribuan percobaan per menit dan menjawab apa pun yang kamu lakukan ke dia — biasin, rusakin, dorong sampai batasnya.",
              },
              {
                g: "g-mint",
                icon: <IcoLoop />,
                t: "Metodenya.",
                d: "Prediksi → jalankan → bandingin → melangkah lebih jauh. Putaran yang sama dengan yang dipakai ilmuwan, dimampatkan ke satu tab browser dan dipercepat seribu kali.",
              },
              {
                g: "g-rose",
                icon: <IcoBook />,
                t: "Buku catatannya.",
                d: "Jurnal menyimpan prediksi, temuan, dan tebakan salahmu yang paling berani — catatan pribadi tentang intuisi kamu yang dikalibrasi ulang oleh bukti.",
              },
            ].map((c) => (
              <StaggerItem key={c.t}>
                <Tilt className="h-full">
                  <div className={`gpanel ${c.g} p-6 h-full flex flex-col gap-3`}>
                    <div className="flex items-center justify-between">
                      {c.icon}
                      <span className="mono-label opacity-60">BAGIAN DARI LAB</span>
                    </div>
                    <h3 className="serif-accent text-[1.7rem] leading-none">{c.t}</h3>
                    <p className="text-[13.5px] leading-relaxed text-ink/85">{c.d}</p>
                  </div>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ================= §02 KENAPA PROBLAB ================= */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-14 md:py-20 border-b-[1.5px] border-ink">
        <SectionHead no="§ 02" title="Kenapa PROBLAB" right={<span className="mono-label opacity-60 hidden md:inline">EMPAT ALASAN JUJUR</span>} />
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              g: "g-butter",
              icon: <IcoHand />,
              no: "01",
              t: "Rumus cepat hilang. Jari yang ingat.",
              d: "Baca “P = 0,5” cuma mengajari sedikit. Biasin koin ke 0,95 dan lihat 950 gambar menyapu bersih — itu mengajar untuk selamanya.",
            },
            {
              g: "g-peach",
              icon: <IcoLoop />,
              no: "02",
              t: "Tebak salah? Silakan.",
              d: "Setiap alat minta prediksi sebelum jalan. Salah di sini itu murah, privat, dan guru tercepat yang pernah kamu sewa.",
            },
            {
              g: "g-sky",
              icon: <IcoCompass />,
              no: "03",
              t: "Nggak ada skor. Nggak ada level.",
              d: "Nggak ada yang perlu dibuka, nggak ada yang bisa hilang, nggak ada hadiah kartun. Rasa penasaran satu-satunya sistem progres — spesimen nggak peduli urutan.",
            },
            {
              g: "g-lilac",
              icon: <IcoSigma />,
              no: "04",
              t: "Matematisnya beneran.",
              d: "Setiap bingkai putus-putus dihitung, bukan sekadar digambar: pmf binomial, inklusi–eksklusi, perkalian ulang tahun — langsung, di depan mata kamu.",
            },
          ].map((c) => (
            <StaggerItem key={c.no} className="h-full">
              <Tilt className="h-full">
                <div className={`gpanel ${c.g} p-6 h-full flex flex-col gap-3 relative overflow-hidden`}>
                  <span className="absolute -top-3 -right-1 mono-data text-[4.6rem] font-bold opacity-15 leading-none select-none">
                    {c.no}
                  </span>
                  <span className="w-11 h-11 rounded-full border-[2px] border-ink bg-paper/70 flex items-center justify-center">
                    {c.icon}
                  </span>
                  <h3 className="font-bold text-[1.15rem] leading-snug tracking-tight">{c.t}</h3>
                  <p className="text-[13px] leading-relaxed text-ink/85">{c.d}</p>
                  <span className="mono-label mt-auto pt-2 opacity-55">ALASAN {c.no} / 04</span>
                </div>
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ================= §03 KOLEKSI SPESIMEN ================= */}
      <section id="specimens" className="max-w-[1400px] mx-auto px-4 md:px-8 py-14 md:py-20 border-b-[1.5px] border-ink">
        <SectionHead
          no="§ 03"
          title="Koleksi spesimen"
          right={<span className="mono-label opacity-60 hidden md:inline">{EXPERIMENTS.length} ALAT · KLIK UNTUK MENYALAKANNYA</span>}
        />
        <Stagger>
          {EXPERIMENTS.map((e, i) => {
            const w = ROW_WASHES[i % ROW_WASHES.length];
            return (
              <StaggerItem key={e.slug}>
                <a
                  href={`#/${e.slug}`}
                  data-hot
                  className="spec-row group"
                  style={{ "--row-wash": w.wash, "--row-edge": w.edge } as React.CSSProperties}
                >
                  <span className="mono-data text-[13px] opacity-70">Nº{e.no}</span>
                  <span className="hidden md:block transition-transform duration-200 group-hover:-translate-y-0.5">
                    <Glyph kind={e.glyph} w={54} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-[clamp(1.4rem,3.6vw,2.4rem)] leading-none tracking-tight">
                      {e.title}
                    </span>
                    <span className="block mono-label opacity-60 mt-1.5 normal-case">{e.short}</span>
                  </span>
                  <span className="hidden lg:flex flex-col items-end gap-1">
                    {e.disciplines.map((d) => (
                      <span key={d} className="chip opacity-80">{d}</span>
                    ))}
                  </span>
                  <span className="idx-arrow mono-data text-xl self-center">↗</span>
                </a>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* ================= §04 CATATAN LAPANGAN ================= */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-14 md:py-20">
        <SectionHead no="§ 04" title="Catatan lapangan buat yang mau kelana" right={<span className="mono-label opacity-60 hidden md:inline">PANDUAN 60 DETIK</span>} />
        <div className="grid md:grid-cols-3 gap-5">
          <Reveal>
            <div className="gpanel g-mint p-5 md:-rotate-[0.6deg] h-full">
              <div className="mono-label mb-3" style={{ color: "var(--sky-deep)" }}>PREDIKSI → JALANKAN → BANDINGKAN</div>
              <p className="text-[14px] leading-relaxed text-ink/85">
                Sebelum tiap run besar, ucapkan angkanya dalam hati. “Kira-kira 50%.” “Mungkin 7 kali menang.” Lalu
                jalankan, dan lihat prediksimu dinegosiasi ulang oleh kenyataan. Simpan yang paling tajam di jurnal.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="gpanel g-peach p-5 md:mt-6 md:rotate-[0.5deg] h-full">
              <div className="mono-label mb-3" style={{ color: "var(--rose-deep)" }}>RUSAKIN ALATNYA</div>
              <p className="text-[14px] leading-relaxed text-ink/85">
                Biasin koin ke 0,95. Tambahkan segmen roda kedua belas berbobot 12. Bikin dua peristiwa tumpang
                tindih total. Di wilayah ekstrem, matematika menunjukkan kerangkanya.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="gpanel g-lilac p-5 md:-rotate-[0.4deg] h-full">
              <div className="mono-label mb-3" style={{ color: "var(--lilac-deep)" }}>HITUNG DI PINGGIRAN</div>
              <p className="text-[14px] leading-relaxed text-ink/85">
                Bingkai merah putus-putus, tanda ✕, tick hitam — teori tinggal di tepi setiap alat. Kalau bar
                empiris yang liar mulai hormat sama bingkainya, kamu sedang belajar.
              </p>
            </div>
          </Reveal>
        </div>

        {/* closing strip */}
        <Reveal delay={0.1}>
          <div className="mt-12 gpanel g-soft p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5">
            <p className="serif-accent text-[clamp(1.4rem,2.6vw,2rem)] leading-snug flex-1">
              alat-alatnya hangat, jurnalnya terbuka, dan tidak ada nilai di sini. satu-satunya langkah salah:
              nggak nyentuh apa-apa.
            </p>
            <div className="flex flex-wrap gap-3">
              <LabLink to="journal" className="btn btn-sun">✎ Buka jurnal</LabLink>
              <LabLink to="about" className="btn">Baca manifesnya</LabLink>
              <LabLink to="dice" className="btn btn-ink">Mampir ke Nº03 →</LabLink>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/* pastel washes cycling across specimen rows */
const ROW_WASHES: { wash: string; edge: string }[] = [
  { wash: "linear-gradient(90deg, rgba(255,194,209,0.55), rgba(255,194,209,0.12) 55%, transparent)", edge: "var(--rose-deep)" },
  { wash: "linear-gradient(90deg, rgba(255,229,156,0.6), rgba(255,229,156,0.14) 55%, transparent)", edge: "var(--butter-deep)" },
  { wash: "linear-gradient(90deg, rgba(188,236,201,0.55), rgba(188,236,201,0.12) 55%, transparent)", edge: "var(--mint-deep)" },
  { wash: "linear-gradient(90deg, rgba(185,212,255,0.55), rgba(185,212,255,0.12) 55%, transparent)", edge: "var(--sky-deep)" },
  { wash: "linear-gradient(90deg, rgba(211,192,255,0.55), rgba(211,192,255,0.12) 55%, transparent)", edge: "var(--lilac-deep)" },
  { wash: "linear-gradient(90deg, rgba(255,207,174,0.55), rgba(255,207,174,0.12) 55%, transparent)", edge: "var(--peach-deep)" },
  { wash: "linear-gradient(90deg, rgba(188,238,228,0.55), rgba(188,238,228,0.12) 55%, transparent)", edge: "var(--aqua-deep)" },
  { wash: "linear-gradient(90deg, rgba(255,194,209,0.4), rgba(185,212,255,0.28) 60%, transparent)", edge: "var(--lilac-deep)" },
];

