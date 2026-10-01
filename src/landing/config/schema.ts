import { z } from "zod";

export const tenantSlugSchema = z.string().regex(
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/,
  "Use um slug minúsculo com letras, números e hífens internos",
);

const imageName = z.string().regex(
  /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:webp|avif|png)$/,
  "Use nome de arquivo WebP, AVIF ou PNG da pasta do tenant",
).refine((name) => !name.includes(".."), "Nome de imagem inválido");

const image = z.object({
  file: imageName,
  width: z.number().int().min(1).max(6000),
  height: z.number().int().min(1).max(6000),
});

const httpsUrl = z.url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password;
}, "Use URL HTTPS sem credenciais");

const text = (max: number) => z.string().trim().min(1).max(max);
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use cor hexadecimal #RRGGBB");

function luminance(hex: string) {
  const rgb = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const linear = rgb.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((left, right) => right - left);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

export const landingConfigSchema = z.object({
  schemaVersion: z.literal(1),
  tenantSlug: tenantSlugSchema,
  name: text(80),
  headline: text(100),
  description: text(200),
  logo: image,
  heroMobile: image,
  heroDesktop: image,
  heroAlt: text(140),
  colors: z.object({
    background: color,
    foreground: color,
    accent: color,
  }).strict().refine((colors) =>
    contrast(colors.background, colors.foreground) >= 4.5
      && contrast(colors.background, colors.accent) >= 4.5,
  "Cores de texto e destaque precisam de contraste mínimo 4.5:1"),
  menuLabel: text(40).default("Ver cardápio"),
  addressLabel: text(40).default("Como chegar"),
  addressText: text(120).optional(),
  mapsUrl: httpsUrl.optional(),
  whatsappUrl: httpsUrl.optional(),
  systemUrl: httpsUrl.optional(),
  extraLinks: z.array(z.object({
    label: text(40),
    url: httpsUrl,
  }).strict()).max(3).default([]),
  seo: z.object({
    title: text(80),
    description: text(160),
    image: image.optional(),
  }).strict(),
}).strict();

export type LandingConfig = z.infer<typeof landingConfigSchema>;
export type LandingImage = LandingConfig["logo"];

export function validateLandingConfig(raw: unknown, slug: string): LandingConfig {
  const expectedSlug = tenantSlugSchema.parse(slug);
  const config = landingConfigSchema.parse(raw);
  if (config.tenantSlug !== expectedSlug) {
    throw new Error(`tenantSlug deve ser ${expectedSlug}`);
  }
  return config;
}
