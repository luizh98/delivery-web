import type { StaffTable } from "@/types/api";

export const tableState = (table: StaffTable) => table.session?.status === "CLOSING" ? "closing" : table.session ? "occupied" : "free";
export const tableStatus = (table: StaffTable) => table.session?.status === "CLOSING" ? "Fechamento" : table.session ? "Ocupado" : "Livre";
export const tableGuests = (count?: number) => count && count > 0 ? `${count} ${count === 1 ? "pessoa" : "pessoas"}` : "Pessoas não informadas";

export function tableElapsed(createdAt?: string, now = Date.now()) {
  const openedAt = Date.parse(createdAt ?? "");
  if (!Number.isFinite(openedAt)) return "Tempo não informado";
  const minutes = Math.max(0, Math.floor((now - openedAt) / 60000));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}min`;
}
