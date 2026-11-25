# PROBLAB

**Lab lapangan peluang yang bisa kamu mainkan.**
Belajar dengan menjelajah, paham dengan mencoba — delapan alat probabilitas interaktif bergaya risograph.

> Website ini sepenuhnya _client-side_: tidak ada database, tidak ada autentikasi, tidak ada API key. Cukup deploy dan jalan.

---

## Demo

| | |
|---|---|
| **Live** | _belum dideploy — tambahkan URL Vercel-mu di sini_ |
| **Repo** | _tambahkan URL GitHub-mu di sini_ |

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

---

## Deploy gratis ke Vercel

1. Push repo ini ke GitHub.
2. Buka <https://vercel.com/new>, **Import Git Repository**, pilih repo-nya.
3. Vercel otomatis mendeteksi Next.js — biarkan semua setting default
   (Framework: **Next.js**, Build Command: `npm run build`, Root Directory: `./`).
4. _(Opsional)_ Tambahkan Environment Variable `NEXT_PUBLIC_SITE_URL` dengan URL produksi
   (mis. `https://problab.vercel.app`) supaya metadata Open Graph memakai URL absolut.
5. **Deploy**. Setiap `git push` ke `main` akan otomatis redeploy.

### Alternatif lewat CLI

```bash
npm i -g vercel
vercel        # preview
vercel --prod # produksi
```

### Alternatif lain

- **Netlify** — tambahkan `netlify.toml` dengan `[build] command = "npm run build"` dan plugin `@netlify/plugin-nextjs`.
- **Cloudflare Workers / Pages** — gunakan adapter `@opennextjs/cloudflare`.

---

## Monitoring

Dua alat observability Vercel aktif dan berjalan otomatis di deployment Vercel — tanpa env var, tanpa token.

| Alat | Paket | Komponen | Yang diukur | Tab dashboard |
|------|-------|----------|-------------|---------------|
| **Vercel Analytics** | `@vercel/analytics` | `<Analytics />` | jumlah pengunjung, pageview, referrer, negara, device | **Analytics** |
| **Vercel Speed Insights** | `@vercel/speed-insights` | `<SpeedInsights />` | Core Web Vitals: LCP, INP, CLS + FCP, TTFB | **Speed Insights** |

Keduanya dipasang di [src/app/layout.tsx](src/app/layout.tsx); script disajikan platform dari
`/_vercel/insights/script.js` dan `/_vercel/speed-insights/script.js`.

Catatan operasional:

- **Aktif otomatis** di deployment Vercel: script disajikan platform, bukan dari folder `public/`.
- Kalau tab dashboard menampilkan tombol **Enable**, klik sekali untuk mengaktifkan (gratis di plan Hobby).
- Data muncul ±30 detik setelah kunjungan pertama; refresh tab **Analytics** / **Speed Insights**.
- Kuota gratis (plan Hobby): Analytics **50.000 event/bulan**, Speed Insights **10.000 event/30 hari terakhir**
  — dipakai bersama seluruh tim.
- Di lokal (`npm run dev` / `npm start`) kedua script memang 404 dan memunculkan pesan di console —
  itu normal dan tidak memengaruhi build maupun performa.

> Catatan: PROBLAB memakai hash routing (`#/galton`, `#/koin`, …), jadi seluruh eksperimen terhitung
> sebagai satu route `/`. Yang diukur adalah performa halaman itu sendiri, bukan per eksperimen.
>
> Kalau nanti ingin melacak per eksperimen, Vercel Analytics mendukung `mode="manual"` + `track()` —
> cukup beberapa baris di router [App.tsx](src/components/problab/App.tsx).

---

## Variabel lingkungan

Lihat [`.env.example`](.env.example). Hanya ada satu dan sifatnya opsional:

| Variabel | Default | Fungsi |
|----------|---------|--------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Basis URL untuk metadata & canonical |

---

## Lisensi

[MIT](LICENSE) © 2026 PROBLAB
