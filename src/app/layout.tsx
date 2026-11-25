import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import IntroGate from "@/components/problab/IntroGate";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const title = "PROBLAB — Lab Lapangan Peluang yang Bisa Kamu Mainkan";
const description =
  "Jelajahi peluang lewat alat yang hidup: lempar koin, lempar dadu, bengkokkan roda, kosongkan guci, buka pintu. Belajar dengan mencoba — laboratorium peluang digital bergaya risograph.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "PROBLAB",
  keywords: ["peluang", "belajar interaktif", "simulasi", "statistika", "matematika", "eksperimen"],
  authors: [{ name: "PROBLAB" }],
  creator: "PROBLAB",
  category: "education",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title,
    description: "Belajar dengan menjelajah. Paham dengan mencoba. Delapan alat peluang yang hidup.",
    siteName: "PROBLAB",
    locale: "id_ID",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary",
    title,
    description: "Belajar dengan menjelajah. Paham dengan mencoba. Delapan alat peluang yang hidup.",
  },
};

export const viewport: Viewport = {
  themeColor: "#fcfbff",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${instrument.variable} ${plexMono.variable} antialiased`}>
        {/* kalau JS mati, intro-nya dibuang — biar situs tetap kebuka */}
        <noscript>
          <style>{`#intro-gate{display:none !important}`}</style>
        </noscript>
        <IntroGate />
        {children}
      </body>
    </html>
  );
}
