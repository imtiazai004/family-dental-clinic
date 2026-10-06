import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Every page is written as a folder with its own index.html, which any static host can serve.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
