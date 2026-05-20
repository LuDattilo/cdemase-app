import type { NextConfig } from "next";
import path from "node:path";

// In locale (npm run dev) non serve basePath.
// Per GitHub Pages il sito è servito da /cdemase-app/.
const isGhPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGhPages ? "/cdemase-app" : "",
  assetPrefix: isGhPages ? "/cdemase-app/" : "",
  reactStrictMode: true,
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
