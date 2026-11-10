export function tableLabel(table: { number: string; kind?: string }) {
  return `${table.kind === "COMMAND" ? "Comanda" : "Mesa"} ${table.number}`;
}
