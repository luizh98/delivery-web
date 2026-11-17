import { notFound } from "next/navigation";
import { getPublicTable } from "@/services/api/server";
import { TableOrders } from "@/views/TableOrders";
import { TableAccessPage } from "@/components/TableAccess";

export const metadata = { title: "Comanda" };

export default async function TableOrdersPage({ searchParams }: { searchParams: Promise<{ mesa?: string }> }) {
  const { mesa } = await searchParams;
  if (!mesa) notFound();
  const table = await getPublicTable(mesa);
  if (!table) notFound();
  if (table.accessLocked) return <TableAccessPage token={mesa} table={table} />;
  return <TableOrders key={mesa} token={mesa} table={table} />;
}
