# PROBLAB

**Lab lapangan peluang yang bisa kamu mainkan.**
Belajar dengan menjelajah, paham dengan mencoba — delapan alat probabilitas interaktif bergaya risograph.

> Website ini sepenuhnya _client-side_: tidak ada database, tidak ada autentikasi, tidak ada API key. Cukup deploy dan jalan.

---

## Demo

| | |
|---|---|
| **Live** | https://prob-lab-seven.vercel.app/ |
| **Repo** | https://github.com/antoniorenaldy24/ProbLab.git |

---

## Eksperimen

| No | Eksperimen | Konsep |
|----|-----------|--------|
| 01 | Papan Galton | Distribusi binomial → aproksimasi normal |
| 02 | Si Koin | Hukum bilangan besar & runtunan |
| 03 | Si Dadu | Ruang sampel & distribusi jumlah |
| 04 | Roda Putar | Peluang berbobot & ekspektasi |
| 05 | Toples Kelereng | Peluang bersyarat, dengan/tanpa pengembalian |
| 06 | Tiga Pintu | Monty Hall & informasi bersyarat |
| 07 | Ulang Tahun | Tabrakan tanggal, melawan intuisi |
| 08 | Ladang Himpunan | Himpunan & inklusi–eksklusi |

Setiap eksperimen punya **jurnal** — catatan prediksi yang disimpan di `localStorage` browser, jadi tidak ada data yang dikirim ke mana pun.

---

## Fitur teknis

- **Canvas 2D + `requestAnimationFrame`** untuk semua simulasi (ringan, tanpa library chart).
- **Framer Motion** untuk transisi antar-view dan intro gate.
- **Hash routing** (`#/galton`, `#/koin`, …) — tanpa dependency router tambahan, tetap bisa di-*share*.
- **Tailwind CSS v4** dengan design token `@theme` (paper, ink, ultramarine, vermilion, sun, pastel wash).
- **Font self-hosted lewat `next/font`** — tidak ada request ke Google Fonts saat runtime.
- **Vercel Speed Insights** untuk memantau Core Web Vitals (lihat bagian [Monitoring](#monitoring)).
- **Aksesibel tanpa JS**: intro gate otomatis disembunyikan jika JavaScript mati.

---

## Teknologi

| Lapisan | Pilihan |
|---------|---------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI runtime | React 19 |
| Animasi | Framer Motion 12 |
| Styling | Tailwind CSS v4 |
| Bahasa | TypeScript 5 |
| Lint | ESLint 9 + `eslint-config-next` |

---

## Menjalankan di lokal

Butuh **Node.js ≥ 20.9** (atau Bun).

```bash
git clone <url-repo-kamu>
cd problab
npm install
npm run dev
```

Buka <http://localhost:3000>.

### Script lainnya

```bash
npm run build      # build produksi
npm start          # jalankan hasil build
npm run lint       # cek ESLint
npm run typecheck  # cek TypeScript (tsc --noEmit)
```

Setiap `push` ke `main` dan setiap pull request otomatis menjalankan lint + typecheck + build
lewat GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

---

## Struktur proyek

```
problab/
├── .github/workflows/ci.yml     # CI: lint + typecheck + build
├── src/
│   ├── app/
│   │   ├── globals.css          # design system (token @theme + animasi)
│   │   ├── icon.svg             # favicon
│   │   ├── layout.tsx           # font, metadata, intro gate
│   │   └── page.tsx             # entry
│   ├── components/problab/
│   │   ├── App.tsx              # router hash + provider jurnal
│   │   ├── Chrome.tsx           # header, indeks, navigasi
│   │   ├── IntroGate.tsx        # layar pembuka
│   │   ├── motionkit.tsx        # primitif gerak (parallax, reveal, tilt)
│   │   ├── GaltonEngine.tsx     # mesin simulasi papan Galton
│   │   ├── HeroGalton.tsx       # hero animasi
│   │   ├── ShapeOfChance.tsx    # visual "awan peluang"
│   │   ├── labs/                # 8 eksperimen
│   │   └── views/               # Home, About, Journal
│   └── lib/problab/
│       ├── canvas.ts            # helper canvas + RAF
│       ├── core.ts              # registry eksperimen + utilitas
│       └── journal.tsx          # state jurnal (localStorage)
├── public/robots.txt
├── next.config.ts
└── package.json
```
## Lisensi

[MIT](LICENSE) © 2026 Renaldy Antonio
