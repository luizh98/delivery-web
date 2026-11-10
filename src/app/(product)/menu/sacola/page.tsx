import { notFound } from "next/navigation";
import { getPublicTable, getRestaurantConfig } from "@/services/api/server";
import { CartView } from "@/views/Cart";

export const metadata = { title: "Pedido da mesa" };

export default async function TableCart({ searchParams }: { searchParams: Promise<{ mesa?: string }> }) {
  const { mesa } = await searchParams;
  if (!mesa) notFound();
  const [restaurantConfig, table] = await Promise.all([getRestaurantConfig(), getPublicTable(mesa)]);
  if (!table) notFound();
  return <CartView restaurantConfig={restaurantConfig} initialStep={1} table={{ number: table.number, kind: table.kind, token: mesa, participationId: table.session?.participationId }} />;
}
