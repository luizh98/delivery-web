import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/landing-pages");
const marker = "Fixture temporária gerada por scripts/landing-fixtures.mjs";
const slugs = ["lp-test-a", "lp-test-b"];

function config(slug, full) {
  return {
    schemaVersion: 1,
    tenantSlug: slug,
    name: full ? "LP Test A" : "LP Test B",
    headline: full ? "Teste o cardápio A" : "Teste o cardápio B",
    description: "Fixture local para verificação, sem conteúdo comercial.",
    logo: { file: "logo.v1.png", width: 64, height: 64 },
    heroMobile: { file: "hero-mobile.v1.webp", width: 720, height: 900 },
    heroDesktop: { file: "hero-desktop.v1.webp", width: 1200, height: 900 },
    heroAlt: "Imagem de teste",
    colors: { background: "#FFFFFF", foreground: "#202124", accent: "#0F766E" },
    mapsUrl: full ? "https://maps.example.com/a" : undefined,
    whatsappUrl: full ? "https://wa.me/5511999999999" : undefined,
    systemUrl: full ? "https://flyfoods.com.br/" : undefined,
    extraLinks: full ? [{ label: "Outro canal", url: "https://example.com/" }] : [],
    seo: {
      title: `${full ? "LP Test A" : "LP Test B"} | links`,
      description: "Metadados de teste por tenant.",
      image: { file: "social.v1.png", width: 800, height: 400 },
    },
  };
}

async function setup() {
  await mkdir(root, { recursive: true });
  for (const slug of slugs) {
    const directory = path.join(root, slug);
    await mkdir(directory);
    await writeFile(path.join(directory, ".fixture-marker"), marker);
    await writeFile(path.join(directory, "config.json"), JSON.stringify(config(slug, slug === "lp-test-a"), null, 2));
    for (const [file, width, height, format] of [
      ["logo.v1.png", 64, 64, "png"],
      ["hero-mobile.v1.webp", 720, 900, "webp"],
      ["hero-desktop.v1.webp", 1200, 900, "webp"],
      ["social.v1.png", 800, 400, "png"],
    ]) {
      await sharp({ create: { width, height, channels: 3, background: slug === "lp-test-a" ? "#0F766E" : "#365B8C" } })
        .toFormat(format).toFile(path.join(directory, file));
    }
  }
  console.log("Fixtures temporárias criadas.");
}

async function cleanup() {
  const workspace = path.resolve(".");
  for (const slug of slugs) {
    const directory = path.join(root, slug);
    if (!directory.startsWith(workspace + path.sep)) throw new Error("Fixture fora do workspace");
    const content = await readFile(path.join(directory, ".fixture-marker"), "utf8");
    if (content !== marker) throw new Error(`Fixture ${slug} alterada; remoção cancelada`);
    await rm(directory, { recursive: true });
  }
  console.log("Fixtures temporárias removidas.");
}

if (process.argv[2] === "setup") await setup();
else if (process.argv[2] === "cleanup") await cleanup();
else throw new Error("Use setup ou cleanup");
