import qz from "qz-tray";

const selectedPrinterKey = "delivery:qz-default-printer";
let securityConfigured = false;
let connectionPromise: Promise<void> | null = null;

export type LocalPrinters = {
  printers: string[];
  defaultPrinter: string | null;
};

function configureSecurity() {
  if (securityConfigured) {
    return;
  }

  qz.security.setCertificatePromise(async () => {
    const response = await fetch("/api/backend/admin/printing/qz/certificate");
    if (!response.ok) {
      throw new Error("Certificado QZ não configurado no servidor.");
    }
    return response.text();
  }, { rejectOnFailure: true });
  qz.security.setSignatureAlgorithm("SHA512");
  qz.security.setSignaturePromise(async (data) => {
    const response = await fetch("/api/backend/admin/printing/qz/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    if (!response.ok) {
      throw new Error("Não foi possível assinar a requisição QZ.");
    }
    return response.text();
  });
  securityConfigured = true;
}

export async function connectQz() {
  configureSecurity();
  if (qz.websocket.isActive()) {
    return;
  }

  connectionPromise ??= qz.websocket.connect({ retries: 2, delay: 1 })
    .finally(() => {
      connectionPromise = null;
    });
  return connectionPromise;
}

export async function listLocalPrinters(): Promise<LocalPrinters> {
  await connectQz();
  const [found, systemDefault] = await Promise.all([
    qz.printers.find(),
    qz.printers.getDefault().catch(() => ""),
  ]);
  const printers = (Array.isArray(found) ? found : [found])
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "pt-BR"));

  return {
    printers,
    defaultPrinter: systemDefault || null,
  };
}

export function getSelectedPrinter() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(selectedPrinterKey) || null;
}

export function setSelectedPrinter(printer: string) {
  if (printer) {
    window.localStorage.setItem(selectedPrinterKey, printer);
  } else {
    window.localStorage.removeItem(selectedPrinterKey);
  }
}

export async function printTextWithQz(content: string, printer = getSelectedPrinter()) {
  if (!printer) {
    throw new Error("Selecione uma impressora no admin.");
  }

  await connectQz();
  const config = qz.configs.create(printer, {
    encoding: "UTF-8",
    copies: 1,
  });
  await qz.print(config, [{
    type: "raw",
    format: "plain",
    data: `${content}\n\n\n`,
  }]);
}
