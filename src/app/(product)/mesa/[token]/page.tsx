import { notFound } from "next/navigation";
import { getPublicTable, getRestaurantConfig } from "@/services/api/server";
import { CartView } from "@/views/Cart";

type TableMenuPageProps = { params: Promise<{ token: string }> };

export default async function TableMenuPage({ params }: TableMenuPageProps) {
  const { token } = await params;
  const [restaurantConfig, table] = await Promise.all([
    getRestaurantConfig(),
    getPublicTable(token),
  ]);

  if (!table) notFound();

  return (
    <CartView
      restaurantConfig={restaurantConfig}
      initialStep={1}
      table={{ number: table.number, token }}
    />
  );
}
