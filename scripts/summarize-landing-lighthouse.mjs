import { readFile } from "node:fs/promises";

if (process.argv.length < 3) {
  throw new Error("Informe um ou mais relatórios JSON do Lighthouse");
}

for (const file of process.argv.slice(2)) {
  const report = JSON.parse(await readFile(file, "utf8"));
  console.log(JSON.stringify({
    file,
    score: Math.round(report.categories.performance.score * 100),
    lcpMs: Math.round(report.audits["largest-contentful-paint"].numericValue),
    cls: report.audits["cumulative-layout-shift"].numericValue,
    ttfbMs: Math.round(report.audits["server-response-time"].numericValue),
  }));
}
