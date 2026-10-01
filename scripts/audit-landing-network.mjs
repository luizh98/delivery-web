import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

if (process.argv.length < 3) {
  throw new Error("Informe um ou mais relatórios JSON do Lighthouse");
}

for (const file of process.argv.slice(2)) {
  const report = JSON.parse(await readFile(file, "utf8"));
  const requests = report.audits["network-requests"]?.details?.items;
  assert.ok(Array.isArray(requests), `${file}: auditoria de rede ausente`);
  const api = requests.filter((request) => request.url?.includes("/api/"));
  assert.deepEqual(api, [], `${file}: LP fez chamada de API`);
  const thirdParty = requests.filter((request) => {
    const url = new URL(request.url);
    return url.origin !== new URL(report.finalDisplayedUrl).origin;
  });
  assert.deepEqual(thirdParty, [], `${file}: recurso externo carregado`);
  console.log(JSON.stringify({
    file,
    requests: requests.length,
    scripts: requests.filter((request) => request.resourceType === "Script").length,
    transferBytes: requests.reduce((sum, request) => sum + (request.transferSize ?? 0), 0),
    apiCalls: api.length,
    thirdPartyResources: thirdParty.length,
  }));
}
