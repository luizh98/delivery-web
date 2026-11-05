import { notFound } from "next/navigation";
import { getPublicTable } from "@/services/api/server";
import { TableOrders } from "@/views/TableOrders";

export const metadata = { title: "Comanda" };

export default async function TableOrdersPage({ searchParams }: { searchParams: Promise<{ mesa?: string }> }) {
  const { mesa } = await searchParams;
  if (!mesa) notFound();
  const table = await getPublicTable(mesa);
  if (!table) notFound();
  return <TableOrders key={mesa} token={mesa} table={table} />;
}
