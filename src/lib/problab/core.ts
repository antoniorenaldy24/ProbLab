/* PROBLAB — specimen registry & shared types */

export type ExpMeta = {
  slug: string;
  no: string;
  title: string;
  short: string; // index row one-liner
  disciplines: string[];
  apparatus: string; // what you physically manipulate
  glyph: "galton" | "coin" | "dice" | "wheel" | "urn" | "doors" | "days" | "field";
  prompt: string; // journal prompt
};

export const EXPERIMENTS: ExpMeta[] = [
  {
    slug: "galton",
    no: "01",
    title: "Papan Galton",
    short: "Seribu bola jatuh dan kurva lonceng lahir sendiri.",
    disciplines: ["Binomial", "Aproksimasi Normal"],
    apparatus: "lepas bola · jumlah baris · bias peg",
    glyph: "galton",
    prompt: "Sebelum melepas 500 bola: di mana tumpukan bakal terbentuk, kira-kira seberapa lebar?",
  },
  {
    slug: "coin",
    no: "02",
    title: "Si Koin",
    short: "Runtunan panjang terasa curang — pantengin terus, muncul kok.",
    disciplines: ["Hukum Bilangan Besar", "Runtunan"],
    apparatus: "lempar ×1/×10/×100/×1000 · dial bias",
    glyph: "coin",
    prompt: "Prediksi runtunan gambar terpanjang di 200 lemparan berikutnya. Lalu pergi buktikan.",
  },
  {
    slug: "dice",
    no: "03",
    title: "Si Dadu",
    short: "Tiga puluh enam dunia tersembunyi di dalam dua kubus.",
    disciplines: ["Ruang Sampel", "Distribusi Jumlah"],
    apparatus: "lempar · peta ruang sampel · atlas jumlah",
    glyph: "dice",
    prompt: "Jumlah berapa yang paling sering muncul di 1000 lemparan — dan selisihnya berapa dari peringkat dua?",
  },
  {
    slug: "wheel",
    no: "04",
    title: "Roda Putar",
    short: "Potong-potong sampai peluangnya mengaku.",
    disciplines: ["Peluang Berbobot", "Ekspektasi"],
    apparatus: "segmen · bobot · jarum penunjuk",
    glyph: "wheel",
    prompt: "Bengkokkan roda supaya jarum mendarat di SURYA sekitar separuh waktu. Buktikan.",
  },
  {
    slug: "urn",
    no: "05",
    title: "Toples Kelereng",
    short: "Setiap tarikan menulis ulang tarikan berikutnya.",
    disciplines: ["Peluang Bersyarat", "Dengan / Tanpa Pengembalian"],
    apparatus: "komposisi · saklar pengembalian · tarikan",
    glyph: "urn",
    prompt: "Dengan 5 merah dan 5 biru, tanpa pengembalian: tarikan kedua mana yang lebih mungkin setelah keluar merah?",
  },
  {
    slug: "doors",
    no: "06",
    title: "Tiga Pintu",
    short: "Satu mobil, dua kambing, dan 1/3 yang keras kepala.",
    disciplines: ["Monty Hall", "Informasi Bersyarat"],
    apparatus: "pilih · tetap / ganti · jalankan otomatis",
    glyph: "doors",
    prompt: "Belakan kedua sisi, masing-masing satu kalimat. Lalu jalankan 1000 ronde dan akui hasilnya.",
  },
  {
    slug: "birthdays",
    no: "07",
    title: "Ulang Tahun",
    short: "Dua puluh tiga orang asing, satu lilin yang bertemu.",
    disciplines: ["Tabrakan Tanggal", "Melawan Intuisi"],
    apparatus: "jumlah orang · strip satu tahun · mesin kelas",
    glyph: "days",
    prompt: "Seberapa besar ruangan supaya peluang ulang tahun bareng mencapai 50%? Tebak dulu — meleset maksimal 5.",
  },
  {
    slug: "field",
    no: "08",
    title: "Ladang Himpunan",
    short: "Geser lingkarannya, aljabarnya langsung nurut.",
    disciplines: ["Himpunan", "Inklusi–Eksklusi"],
    apparatus: "peristiwa A · B yang bisa digeser · saklar wilayah",
    glyph: "field",
    prompt: "Tumpangkan dua lingkaran sampai P(A∪B) tepat 0,9. Berapa kali geser sampai berhasil?",
  },
];

export function getExp(slug: string): ExpMeta | undefined {
  return EXPERIMENTS.find((e) => e.slug === slug);
}

export function neighbors(slug: string): { prev: ExpMeta; next: ExpMeta } {
  const i = EXPERIMENTS.findIndex((e) => e.slug === slug);
  return {
    prev: i > 0 ? EXPERIMENTS[i - 1] : EXPERIMENTS[EXPERIMENTS.length - 1],
    next: i >= 0 && i < EXPERIMENTS.length - 1 ? EXPERIMENTS[i + 1] : EXPERIMENTS[0],
  };
}

/* ---------- shared helpers ---------- */

export const fmt = (x: number, d = 2) => {
  if (!isFinite(x)) return "—";
  return x.toFixed(d);
};

export const pct = (x: number, d = 1) => `${fmt(x * 100, d)}%`;

export const fmtInt = (x: number) => x.toLocaleString("en-US");

export function clamp(x: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, x));
}

/** Mulberry32 seeded PRNG */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const INK = "#1b1611";
export const PAPER = "#fcfbff";
export const PAPER2 = "#f0edfb";
export const BLUE = "#2438d8";
export const RED = "#e23d28";
export const SUN = "#f0b41c";

/* pastel wash family — used by canvas engines + the chance cloud */
export const PASTELS = {
  rose: "#ffc2d1",
  roseDeep: "#f78cab",
  peach: "#ffcfae",
  peachDeep: "#ff9e6e",
  butter: "#ffe59c",
  butterDeep: "#ffc94d",
  mint: "#bcecc9",
  mintDeep: "#7fd9a6",
  sky: "#b9d4ff",
  skyDeep: "#8fb5ff",
  lilac: "#d3c0ff",
  lilacDeep: "#a88bff",
  aqua: "#bceee4",
  aquaDeep: "#7fd8c9",
} as const;

export const PASTEL_LIST = [
  PASTELS.roseDeep,
  PASTELS.peachDeep,
  PASTELS.butterDeep,
  PASTELS.mintDeep,
  PASTELS.skyDeep,
  PASTELS.lilacDeep,
  PASTELS.aquaDeep,
];

export const BALL_COLORS = [BLUE, RED, SUN, PASTELS.roseDeep, PASTELS.skyDeep, PASTELS.mintDeep];

export function goHash(h: string) {
  if (typeof window === "undefined") return;
  const target = `#/${h}`.replace(/\/+$/, "");
  if (window.location.hash === target) {
    // force view scroll top even for same-view clicks
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.location.hash = target;
  }
}
