import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { resolveTenantFromHost } from "../../utils/tenant.ts";
import { type LandingConfig, tenantSlugSchema, validateLandingConfig } from "./schema.ts";

const landingRoot = path.resolve(process.cwd(), "public/landing-pages");
const productionCache = new Map<string, LandingConfig>();

export function landingSlugFromHost(host: string | null): string | null {
  if (!host) return null;
  try {
    const parsed = new URL(`http://${host}`);
    if (parsed.username || parsed.password || parsed.pathname !== "/") return null;
    const hostname = parsed.hostname.toLowerCase();
    const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "flyfoods.com.br")
      .trim().toLowerCase();
    const suffix = hostname.endsWith(".localhost")
      ? ".localhost"
      : hostname.endsWith(`.${rootDomain}`)
        ? `.${rootDomain}`
        : null;
    if (!suffix) return null;
    const label = hostname.slice(0, -suffix.length);
    if (!tenantSlugSchema.safeParse(label).success) return null;
    return resolveTenantFromHost(host) === label ? label : null;
  } catch {
    return null;
  }
}

export async function loadLandingConfig(
  slug: string,
  rootDirectory = landingRoot,
): Promise<LandingConfig | null> {
  if (!tenantSlugSchema.safeParse(slug).success) return null;
  if (rootDirectory === landingRoot && process.env.NODE_ENV === "production") {
    const cached = productionCache.get(slug);
    if (cached) return cached;
  }
  const directory = path.join(rootDirectory, slug);
  try {
    const raw = JSON.parse(await readFile(path.join(directory, "config.json"), "utf8"));
    const config = validateLandingConfig(raw, slug);
    const images = [config.logo, config.heroMobile, config.heroDesktop, config.seo.image]
      .filter((image) => image !== undefined);
    await Promise.all(images.map(async (image) => {
      const info = await stat(path.join(directory, image.file));
      if (!info.isFile()) throw new Error(`Imagem inválida: ${image.file}`);
    }));
    if (rootDirectory === landingRoot && process.env.NODE_ENV === "production") {
      productionCache.set(slug, config);
    }
    return config;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    console.error(`Landing config inválida para ${slug}:`, error);
    return null;
  }
}

export async function loadLandingConfigForHost(host: string | null) {
  const slug = landingSlugFromHost(host);
  return slug ? loadLandingConfig(slug) : null;
}
