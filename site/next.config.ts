import type { NextConfig } from "next";

// Static export: the whole site is HTML and assets, served by a Cloudflare Worker.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
