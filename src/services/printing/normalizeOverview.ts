export type PrintOverviewCollections<Device = unknown, Printer = unknown, Destination = unknown> = {
  devices?: Device[] | null;
  printers?: Printer[] | null;
  destinations?: Destination[] | null;
};

export type NormalizedPrintOverview<Device = unknown, Printer = unknown, Destination = unknown> = {
  devices: Device[];
  printers: Printer[];
  destinations: Destination[];
};

export function normalizePrintOverview<Device, Printer, Destination>(
  overview: PrintOverviewCollections<Device, Printer, Destination> | null | undefined,
): NormalizedPrintOverview<Device, Printer, Destination> {
  return {
    devices: Array.isArray(overview?.devices) ? overview.devices : [],
    printers: Array.isArray(overview?.printers) ? overview.printers : [],
    destinations: Array.isArray(overview?.destinations) ? overview.destinations : [],
  };
}
