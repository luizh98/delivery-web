import type { StaffTable, TableServiceRequestType } from "../types/api";

export const tableServiceLabels: Record<TableServiceRequestType, string> = {
  SERVICE: "Dúvida · chamou garçom",
  CLOSURE: "Fechamento da conta",
  PAYMENT: "Pagamento da conta",
};

export function pendingTableCalls(tables: StaffTable[]) {
  return tables.filter((table) => table.active).flatMap((table) =>
    (table.requests ?? []).filter((request) => request.status === "PENDING").map((request) => ({
      id: request.id, tableId: table.id, tableNumber: table.number, label: tableServiceLabels[request.type],
    })),
  );
}
