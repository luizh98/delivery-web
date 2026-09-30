import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { validateLandingConfig, type LandingImage } from "../src/landing/config/schema";

const root = path.resolve(process.env.LANDING_PAGES_ROOT ?? "public/landing-pages");
const kilobyte = 1024;

async function validateImage(directory: string, image: LandingImage, limit: number) {
  const filename = path.join(directory, image.file);
  const info = await lstat(filename);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error(`${image.file}: arquivo regular obrigatório`);
  if (info.size > limit) throw new Error(`${image.file}: ${info.size} bytes excedem ${limit}`);
  const metadata = await sharp(filename).metadata();
  const expectedFormat = path.extname(image.file).slice(1);
  if (metadata.format !== expectedFormat) throw new Error(`${image.file}: formato real ${metadata.format} difere de ${expectedFormat}`);
  if (metadata.width !== image.width || metadata.height !== image.height) {
    throw new Error(`${image.file}: dimensões reais ${metadata.width}x${metadata.height} diferem de ${image.width}x${image.height}`);
  }
  return info.size;
}

async function validateDirectory(slug: string) {
  const directory = path.join(root, slug);
  const configFile = path.join(directory, "config.json");
  if (!(await lstat(configFile)).isFile()) throw new Error("config.json deve ser arquivo regular");
  const config = validateLandingConfig(JSON.parse(await readFile(configFile, "utf8")), slug);
  const sizes = await Promise.all([
    validateImage(directory, config.logo, 100 * kilobyte),
    validateImage(directory, config.heroMobile, 150 * kilobyte),
    validateImage(directory, config.heroDesktop, 500 * kilobyte),
    ...(config.seo.image ? [validateImage(directory, config.seo.image, 250 * kilobyte)] : []),
  ]);
  if (sizes[0] + sizes[1] > 250 * kilobyte) {
    throw new Error("logo + hero mobile excedem 250 KB");
  }
  return config;
}

async function main() {
  let folders;
  try {
    folders = (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory());
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      console.log("Nenhuma pasta de landing page configurada.");
      return;
    }
    throw error;
  }

  let failed = false;
  for (const folder of folders) {
    try {
      await validateDirectory(folder.name);
      console.log(`OK ${folder.name}`);
    } catch (error) {
      failed = true;
      console.error(`ERRO ${folder.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (failed) process.exitCode = 1;
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
