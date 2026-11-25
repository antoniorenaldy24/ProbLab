import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Animasi canvas di PROBLAB memakai requestAnimationFrame + state internal.
  // Strict mode memicu double-invoke effect di dev yang membuat animasi dobel,
  // jadi sengaja dimatikan (tidak berpengaruh ke build produksi).
  reactStrictMode: false,
};

export default nextConfig;
