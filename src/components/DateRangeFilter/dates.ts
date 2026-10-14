export type DateFilterRange = { startDate: string; endDate: string };
export type DatePreset = "today" | "yesterday" | "last7" | "thisMonth" | "custom";

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dateFromKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getPresetDateRange(preset: Exclude<DatePreset, "custom">, now = new Date()): DateFilterRange {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);
  if (preset === "last7") start.setDate(start.getDate() - 6);
  else if (preset === "yesterday") { start.setDate(start.getDate() - 1); end.setDate(end.getDate() - 1); }
  else if (preset === "thisMonth") start.setDate(1);
  return { startDate: dateKey(start), endDate: dateKey(end) };
}

export function getDatePreset(range: DateFilterRange): DatePreset {
  for (const preset of ["today", "yesterday", "last7", "thisMonth"] as const) {
    const candidate = getPresetDateRange(preset);
    if (range.startDate === candidate.startDate && range.endDate === candidate.endDate) return preset;
  }
  return "custom";
}

export function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("pt-BR");
  return `${formatter.format(dateFromKey(startDate))} a ${formatter.format(dateFromKey(endDate))}`;
}

export function rangeDays(from: Date, to: Date) {
  return (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / 86400000 + 1;
}
