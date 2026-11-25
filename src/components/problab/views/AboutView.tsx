/* PROBLAB — About: manifesto & colophon */
"use client";

import React from "react";
import { Stamp } from "../kit";
import { LabLink } from "../kit";

const PALETTE = [
  { name: "PAPER", hex: "#fcfbff", note: "kertas tempat semua hal tercetak" },
  { name: "ULTRA", hex: "#2438d8", note: "batang empiris, peristiwa A, kebenaran yang tenang" },
  { name: "VERMILION", hex: "#e23d28", note: "bingkai teori, peristiwa B, peringatan yang berisik" },
  { name: "SUN", hex: "#f0b41c", note: "sorotan, irisan, momen klik-nya" },
  { name: "ROSE", hex: "#ffc2d1", note: "wash pastel №1 — kehangatan, hover, langit hero" },
  { name: "BUTTER", hex: "#ffe59c", note: "wash pastel №2 — prediksi, ajakan jurnal" },
  { name: "MINT", hex: "#bcecc9", note: "wash pastel №3 — metode, temuan yang tenang" },
  { name: "SKY", hex: "#b9d4ff", note: "wash pastel №4 — kedalaman, angka bacaan, jarak" },
  { name: "LILAC", hex: "#d3c0ff", note: "wash pastel №5 — rasa penasaran itu sendiri" },
  { name: "INK", hex: "#1b1611", note: "struktur, aturan, kerangkanya" },
];

export default function AboutView() {
  return (
    <div className="view-in max-w-[1200px] mx-auto w-full px-4 md:px-8 pb-16">
      <header className="pt-10 md:pt-14 pb-10 border-b-[1.5px] border-ink">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="chip bg-ink text-paper">MANIFESTO</span>
          <span className="chip">KOLOFON</span>
        </div>
        <h1 className="riso font-extrabold tracking-tight leading-[0.9] text-[clamp(2.6rem,7vw,5.5rem)]">
          Soal <span className="serif-accent riso-red">lab</span> ini
        </h1>
      </header>

      <section className="py-12 border-b-[1.5px] border-ink grid md:grid-cols-12 gap-10">
        <div className="md:col-span-8">
          <p className="text-[clamp(1.5rem,3vw,2.4rem)] font-medium leading-[1.25] tracking-tight">
            PROBLAB ada demi momen saat bola yang keseribuan mendarat pas di tempat yang dijanjikan bingkai
            putus-putusnya — dan kamu merasakannya sebelum bisa membuktikannya.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-8">
            <p className="text-[14.5px] leading-relaxed text-ink/85">
              Kami percaya peluang bukan aritmetika pakai dadu; dia fisika dari <em>ketidakpastian itu sendiri</em>.
              Buku pelajaran membekukannya jadi rumus. Sebuah laboratorium bikin dia <strong>bergerak</strong>. Tiap
              spesimen di sini menjalankan ribuan uji coba tiap menit, dan tiap garis putus-putus adalah teori yang
              lagi ngunggu buat ketahuan pas lagi membuktikan dirinya bener.
            </p>
            <p className="text-[14.5px] leading-relaxed text-ink/85">
              Nggak ada yang namanya level, lencana, atau skor di sini. Nggak ada urutan yang harus diseleseikan,
              nggak ada runtunan yang harus dijaga. Alat-alat ini nggak ngasih reward; mereka <em>ngebales</em> kamu.
              Tanya yang lebih bagus, mereka balikin kejutan yang lebih bagus.
            </p>
            <p className="text-[14.5px] leading-relaxed text-ink/85">
              Jurnal adalah satu-satunya barang yang beneran punya kamu. Prediksi, temuan, tebakan yang meleset —
              semuanya numpuk jadi catatan privat tentang intuisimu yang pelan-pelan dikalibrasi ulang sama bukti.
            </p>
            <p className="text-[14.5px] leading-relaxed text-ink/85">
              Semuanya jalan lokal, seketika, di browser kamu. Nggak ada akun, nggak ada pelacakan, nggak ada
              server di antara kamu dan jangka panjang.
            </p>
          </div>
        </div>
        <div className="md:col-span-4 flex flex-col items-center gap-6 md:border-l-[1.5px] border-ink md:pl-8 justify-center">
          <Stamp text="BELAJAR DENGAN MENJELAJAH · PAHAM DENGAN MENCOBA" size={150} />
          <p className="marginal normal-case text-center max-w-[30ch]">
            stempelnya udah ngomong semuanya. sisanya ya catatan pinggir doang.
          </p>
        </div>
      </section>

      <section className="py-12 border-b-[1.5px] border-ink">
        <h2 className="font-extrabold tracking-tight text-[clamp(1.6rem,3.5vw,2.4rem)] mb-6">
          Cara dia <span className="serif-accent">dicetak</span>
        </h2>
        <p className="text-[14.5px] leading-relaxed text-ink/85 max-w-[62ch] mb-8">
          PROBLAB didandani kayak cetakan risograph: kertas hangat, tiga tinta data plus satu keluarga wash pastel
          (rose, butter, mint, sky, lilac), bayangan tegas dan judul yang sengaja agak geser registrasinya — kayak
          manual lapangan yang ditarik panas-panas dari mesin. Tiap simulasi digambar langsung di canvas; tiap angka
          dihitung di depan mata kamu.
        </p>
        <div className="grid sm:grid-cols-5 gap-3">
          {PALETTE.map((c, i) => (
            <div key={c.name} className="panel-flat p-3">
              <div
                className="h-14 border-[1.5px] border-ink mb-3"
                style={{ background: c.hex, boxShadow: i >= 4 && i <= 8 ? `4px 4px 0 0 ${c.hex}` : undefined }}
              />
              <div className="mono-label">{c.name}</div>
              <div className="mono-data text-[10px] opacity-60">{c.hex}</div>
              <div className="text-[11.5px] text-ink/75 mt-1.5 leading-snug">{c.note}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <div className="panel-flat p-4">
            <div className="mono-label mb-2">TIPOGRAFI</div>
            <p className="text-[13px] leading-relaxed text-ink/80">
              Bricolage Grotesque buat display, Instrument Serif buat suara keraguan, IBM Plex Mono buat semua angka
              alat.
            </p>
          </div>
          <div className="panel-flat p-4">
            <div className="mono-label mb-2">MESINNYA</div>
            <p className="text-[13px] leading-relaxed text-ink/80">
              Next.js + TypeScript, Canvas 2D buat semua simulasi, jam requestAnimationFrame, localStorage buat
              jurnal. Nggak ada grafik yang dirender duluan.
            </p>
          </div>
          <div className="panel-flat p-4">
            <div className="mono-label mb-2">SUMBER KEBENARAN</div>
            <p className="text-[13px] leading-relaxed text-ink/80">
              pmf binomial, inklusi–eksklusi, hasil kali ulang tahun, dan rasio Monty Hall dihitung saat runtime —
              bingkai putus-putusnya bukan ilustrasi, mereka ya matematisnya.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <h2 className="font-extrabold tracking-tight text-[clamp(1.6rem,3.5vw,2.4rem)] mb-4">
          Sekarang gas <span className="serif-accent">pegang alatnya</span>.
        </h2>
        <div className="flex flex-wrap gap-3">
          <LabLink to="galton" className="btn btn-red">Buka spesimen Nº01</LabLink>
          <LabLink to="journal" className="btn">Tulis di jurnal</LabLink>
          <button data-hot className="btn btn-ink" onClick={() => (window.location.hash = "#/")}>
            Balik ke lab
          </button>
        </div>
      </section>
    </div>
  );
}
