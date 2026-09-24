import { clientApi } from "@/services/api/client";

export type PrintDestination = "RECEIPT" | "KITCHEN" | "EXPEDITION";

export type PrintDevice = {
  id: string;
  name: string;
  version: string;
  revokedAt?: string;
  lastSeenAt?: string;
  createdAt?: string;
};

export type PrintPrinter = {
  id: string;
  deviceId: string;
  osPrinterId: string;
  name: string;
  isDefault: boolean;
  available: boolean;
  lastSeenAt?: string;
};

export type PrintDestinationConfig = {
  destination: PrintDestination;
  deviceId: string;
  printerId: string;
  automatic: boolean;
  copies: number;
  model: string;
};

export type PrintJob = {
  id: string;
  orderId?: string;
  deviceId: string;
  printerId: string;
  destination: PrintDestination;
  copies: number;
  status: string;
  reprintOf?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PrintOverview = {
  devices: PrintDevice[];
  printers: PrintPrinter[];
  destinations: PrintDestinationConfig[];
};

type PairingCode = {
  code: string;
  expiresAt: string;
};

export function getPrintOverview() {
  return clientApi<PrintOverview>("/admin/printing/overview");
}

export function createPrintPairingCode() {
  return clientApi<PairingCode>("/admin/printing/pairing-codes", { method: "POST" });
}

export function savePrintDestination(destination: PrintDestination, value: Omit<PrintDestinationConfig, "destination">) {
  return clientApi<PrintDestinationConfig>(`/admin/printing/destinations/${destination}`, {
    method: "PUT",
    body: JSON.stringify(value),
  });
}

export function createPrintTest(destination: PrintDestination) {
  return clientApi<PrintJob>(`/admin/printing/destinations/${destination}/test`, { method: "POST" });
}

export function revokePrintDevice(deviceID: string) {
  return clientApi<void>(`/admin/printing/devices/${deviceID}/revoke`, { method: "POST" });
}

export function getPrintJobs(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return clientApi<{ jobs: PrintJob[] }>(`/admin/printing/jobs${query}`);
}

export function reprintJob(jobID: string) {
  return clientApi<PrintJob>(`/admin/printing/jobs/${jobID}/reprint`, { method: "POST" });
}
