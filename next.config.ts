import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  experimental: {
    turbopackServerFastRefresh: true,
  },
  turbopack: {
    root: appRoot,
  },
  async headers() {
    return [{
      source: "/landing-pages/:slug/:asset([^/]+\\.v[0-9]+\\.(?:webp|avif|png))",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }];
  },
};

export default nextConfig;
