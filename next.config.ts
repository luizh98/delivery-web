import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  experimental: {
    turbopackServerFastRefresh: true,
    // Match the API's multipart cap, including video, image and form fields.
    proxyClientMaxBodySize: "28mb",
  },
  turbopack: {
    root: appRoot,
  },
  async headers() {
    return [{
      source: "/integrations/whatsapp",
      headers: [
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      ],
    }, {
      source: "/landing-pages/:slug/:asset([^/]+\\.v[0-9]+\\.(?:webp|avif|png))",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }];
  },
};

export default nextConfig;
