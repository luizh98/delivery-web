import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const appDirectory = path.resolve("src/app");
const baselinePath = path.resolve(".specs/features/tenant-links-lp/route-baseline.json");
const origin = process.env.SMOKE_ORIGIN ?? "http://127.0.0.1:3100";
const serverPort = new URL(origin).port;
const hosts = (process.env.SMOKE_HOSTS ?? "demo.localhost,segundo.localhost")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

async function routeInventory(directory = appDirectory, segments = []) {
  const routes = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(...await routeInventory(path.join(directory, entry.name), [...segments, entry.name]));
    } else if (/^(page|route)\.(tsx?|jsx?)$/.test(entry.name)) {
      const urlSegments = segments.filter((segment) => !/^\(.*\)$/.test(segment));
      routes.push(`/${urlSegments.join("/")}`.replace(/\/$/, "") || "/");
    }
  }
  return routes.sort();
}

const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
assert.deepEqual((await routeInventory()).filter((route) => route !== "/links"), baseline.routes, "Existing route inventory changed");
const homeSource = await readFile(path.join(appDirectory, "(product)", "page.tsx"), "utf8")
  .catch(() => readFile(path.join(appDirectory, "page.tsx"), "utf8"));
assert.match(homeSource, /HomeView/, "/ must remain the menu route");

let failures = 0;
for (const host of hosts) {
  for (const probe of baseline.probes) {
    try {
      const response = await fetch(`http://${host}:${serverPort}${probe.path}`, {
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
      });
      const body = await response.text();
      const contentType = response.headers.get("content-type") ?? "";
      const valid = probe.statuses.includes(response.status)
        && (!probe.contentType || contentType.includes(probe.contentType))
        && (!probe.contains || body.includes(probe.contains));
      if (!valid) failures++;
      console.log(`${valid ? "PASS" : "FAIL"} ${host} ${probe.path}: ${response.status} ${contentType}`);
    } catch (error) {
      failures++;
      console.error(`FAIL ${host} ${probe.path}: ${error.message}`);
    }
  }
}
if (failures) process.exitCode = 1;
