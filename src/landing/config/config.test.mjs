import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import test from "node:test";
import { landingSlugFromHost, loadLandingConfig } from "./load.ts";
import { validateLandingConfig } from "./schema.ts";

const run = promisify(execFile);
const image = (file, width = 20, height = 20) => ({ file, width, height });
const config = (slug = "alpha") => ({
  schemaVersion: 1,
  tenantSlug: slug,
  name: "Restaurante teste",
  headline: "Peça aqui",
  description: "Cardápio e contato",
  logo: image("logo.png"),
  heroMobile: image("hero-mobile.webp"),
  heroDesktop: image("hero-desktop.webp"),
  heroAlt: "Prato do restaurante",
  colors: { background: "#FFFFFF", foreground: "#202124", accent: "#0F766E" },
  mapsUrl: "https://maps.example.com/store",
  seo: { title: "Restaurante teste | links", description: "Cardápio e contato" },
});

async function fixtureRoot() {
  const root = await mkdtemp(path.join(tmpdir(), "landing-config-"));
  for (const slug of ["alpha", "beta"]) {
    const directory = path.join(root, slug);
    await mkdir(directory);
    await writeFile(path.join(directory, "config.json"), JSON.stringify({ ...config(slug), name: slug }));
    for (const [name, format] of [["logo.png", "png"], ["hero-mobile.webp", "webp"], ["hero-desktop.webp", "webp"]]) {
      await sharp({ create: { width: 20, height: 20, channels: 4, background: "#0F766E" } })
        .toFormat(format).toFile(path.join(directory, name));
    }
  }
  return root;
}

test("schema aceita configuração mínima e rejeita URL, imagem e slug inseguros", () => {
  assert.equal(validateLandingConfig(config(), "alpha").menuLabel, "Ver cardápio");
  assert.throws(() => validateLandingConfig({ ...config(), mapsUrl: "http://example.com" }, "alpha"));
  assert.throws(() => validateLandingConfig({ ...config(), logo: image("../logo.png") }, "alpha"));
  assert.throws(() => validateLandingConfig({ ...config(), extraLinks: Array(4).fill({ label: "Extra", url: "https://example.com" }) }, "alpha"));
  assert.throws(() => validateLandingConfig(config(), "beta"), /tenantSlug/);
  assert.throws(() => validateLandingConfig({ ...config(), headline: "" }, "alpha"));
});

test("loader isola tenants por host e não aceita host raiz ou malformado", async () => {
  const root = await fixtureRoot();
  assert.equal(landingSlugFromHost("alpha.localhost:3100"), "alpha");
  assert.equal(landingSlugFromHost("beta.localhost:3100"), "beta");
  assert.equal(landingSlugFromHost("localhost:3100"), null);
  assert.equal(landingSlugFromHost("www.flyfoods.com.br"), null);
  assert.equal(landingSlugFromHost("alpha.evil.example"), null);
  assert.equal(landingSlugFromHost("../alpha.localhost"), null);
  assert.equal((await loadLandingConfig("alpha", root)).name, "alpha");
  assert.equal((await loadLandingConfig("beta", root)).name, "beta");
  assert.equal(await loadLandingConfig("missing", root), null);
  assert.equal(await loadLandingConfig("../alpha", root), null);
});

test("host exato da staging exige liberação explícita do tenant", () => {
  const previousRoot = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  const previousTenant = process.env.LANDING_ROOT_HOST_TENANT_SLUG;
  const previousDefault = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG;
  try {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "dev-terraco-canecao.flyfoods.com.br";
    process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG = "terraco-canecao";
    delete process.env.LANDING_ROOT_HOST_TENANT_SLUG;
    assert.equal(landingSlugFromHost("dev-terraco-canecao.flyfoods.com.br"), null);
    process.env.LANDING_ROOT_HOST_TENANT_SLUG = "terraco-canecao";
    assert.equal(landingSlugFromHost("dev-terraco-canecao.flyfoods.com.br"), "terraco-canecao");
    assert.equal(landingSlugFromHost("other.flyfoods.com.br"), null);
    process.env.LANDING_ROOT_HOST_TENANT_SLUG = "outro";
    assert.equal(landingSlugFromHost("dev-terraco-canecao.flyfoods.com.br"), null);
  } finally {
    if (previousRoot === undefined) delete process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    else process.env.NEXT_PUBLIC_ROOT_DOMAIN = previousRoot;
    if (previousTenant === undefined) delete process.env.LANDING_ROOT_HOST_TENANT_SLUG;
    else process.env.LANDING_ROOT_HOST_TENANT_SLUG = previousTenant;
    if (previousDefault === undefined) delete process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG;
    else process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG = previousDefault;
  }
});

test("validador de build aceita duas pastas e falha com imagem ausente", async () => {
  const root = await fixtureRoot();
  const command = ["--import", "tsx", "scripts/validate-landing-pages.ts"];
  const env = { ...process.env, LANDING_PAGES_ROOT: root };
  const valid = await run(process.execPath, command, { cwd: process.cwd(), env });
  assert.match(valid.stdout, /OK alpha/);
  assert.match(valid.stdout, /OK beta/);
  await writeFile(path.join(root, "beta", "config.json"), JSON.stringify({ ...config("beta"), heroMobile: image("missing.webp") }));
  await assert.rejects(run(process.execPath, command, { cwd: process.cwd(), env }), /ERRO beta/);
  assert.equal(await loadLandingConfig("beta", root), null);
});

test("validador falha com slug divergente, dimensão errada ou hero acima do orçamento", async () => {
  const root = await fixtureRoot();
  const command = ["--import", "tsx", "scripts/validate-landing-pages.ts"];
  const env = { ...process.env, LANDING_PAGES_ROOT: root };
  const configFile = path.join(root, "beta", "config.json");
  await writeFile(configFile, JSON.stringify(config("alpha")));
  await assert.rejects(run(process.execPath, command, { cwd: process.cwd(), env }), /tenantSlug/);
  await writeFile(configFile, JSON.stringify({ ...config("beta"), heroMobile: image("hero-mobile.webp", 21, 20) }));
  await assert.rejects(run(process.execPath, command, { cwd: process.cwd(), env }), /dimensões reais/);
  await writeFile(configFile, JSON.stringify(config("beta")));
  await writeFile(path.join(root, "beta", "hero-mobile.webp"), Buffer.alloc(150 * 1024 + 1));
  await assert.rejects(run(process.execPath, command, { cwd: process.cwd(), env }), /excedem/);
});
