/* PROBLAB — application shell: hash-routed views inside the single visible route */
"use client";

import React, { useEffect, useState } from "react";
import { getExp } from "@/lib/problab/core";
import { JournalProvider } from "@/lib/problab/journal";
import { Atmosphere, Footer, JournalDrawer, Nav } from "./Chrome";
import LabShell from "./LabShell";
import GaltonEngine from "./GaltonEngine";
import CoinLab from "./labs/CoinLab";
import DiceLab from "./labs/DiceLab";
import WheelLab from "./labs/WheelLab";
import UrnLab from "./labs/UrnLab";
import DoorsLab from "./labs/DoorsLab";
import BirthdaysLab from "./labs/BirthdaysLab";
import FieldLab from "./labs/FieldLab";
import HomeView from "./views/HomeView";
import JournalView from "./views/JournalView";
import AboutView from "./views/AboutView";

function LabFor({ slug, children }: { slug: string; children: React.ReactNode }) {
  const meta = getExp(slug);
  if (!meta) return null;
  return <LabShell meta={meta}>{children}</LabShell>;
}

function renderRoute(route: string) {
  switch (route) {
    case "":
      return <HomeView />;
    case "galton":
      return (
        <LabFor slug="galton">
          <GaltonEngine variant="full" />
        </LabFor>
      );
    case "coin":
      return (
        <LabFor slug="coin">
          <CoinLab />
        </LabFor>
      );
    case "dice":
      return (
        <LabFor slug="dice">
          <DiceLab />
        </LabFor>
      );
    case "wheel":
      return (
        <LabFor slug="wheel">
          <WheelLab />
        </LabFor>
      );
    case "urn":
      return (
        <LabFor slug="urn">
          <UrnLab />
        </LabFor>
      );
    case "doors":
      return (
        <LabFor slug="doors">
          <DoorsLab />
        </LabFor>
      );
    case "birthdays":
      return (
        <LabFor slug="birthdays">
          <BirthdaysLab />
        </LabFor>
      );
    case "field":
      return (
        <LabFor slug="field">
          <FieldLab />
        </LabFor>
      );
    case "journal":
      return <JournalView />;
    case "about":
      return <AboutView />;
    default:
      return (
        <div className="view-in max-w-[800px] mx-auto px-6 py-24 text-center">
          <div className="mono-label mb-4 opacity-60">SPESIMEN NGGAK ADA DI KATALOG</div>
          <h1 className="riso font-extrabold text-[clamp(3rem,10vw,7rem)] leading-none">404<span className="serif-accent">an</span></h1>
          <p className="serif-accent text-[1.5rem] mt-4">halaman ini keguling jatuh dari meja.</p>
          <a href="#/" className="btn btn-red mt-8 inline-block">Kembali ke lab</a>
        </div>
      );
  }
}

export default function App() {
  const [route, setRoute] = useState("");
  const [wipeKey, setWipeKey] = useState(0);

  useEffect(() => {
    const read = () => {
      const h = window.location.hash.replace(/^#\/?/, "").replace(/\/+$/, "");
      setRoute(h);
      window.scrollTo({ top: 0 });
      setWipeKey((k) => k + 1);
      const meta = getExp(h);
      document.title = meta
        ? `Nº${meta.no} ${meta.title} — PROBLAB`
        : h === "journal"
          ? "Jurnal Eksplorasi — PROBLAB"
          : h === "about"
            ? "Manifes & Kolofon — PROBLAB"
            : "PROBLAB — Laboratorium Lapangan Interaktif untuk Keacakan";
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  return (
    <JournalProvider>
      <div className="problab-root">
        {/* ink wipe on route change */}
        {wipeKey > 0 && (
          <div key={wipeKey} className="fixed inset-0 z-[95] pointer-events-none wipe wipe-grad" aria-hidden="true" />
        )}
        <Nav route={route} />
        <main>{renderRoute(route)}</main>
        <Footer />
        <JournalDrawer />
        <Atmosphere />
      </div>
    </JournalProvider>
  );
}
