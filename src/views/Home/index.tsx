import { getMenu, getPublicTable, getRestaurantConfig } from "@/services/api/server";
import { notFound } from "next/navigation";
import { CustomerMenu } from "./CustomerMenu";

export async function HomeView({ tableToken }: { tableToken?: string } = {}) {
  const table = tableToken ? await getPublicTable(tableToken) : null;
  if (tableToken && !table) notFound();
  const [config, menu] = await Promise.all([getRestaurantConfig(), getMenu(table ? "TABLE" : "DELIVERY")]);

  return <CustomerMenu restaurantConfig={config} menu={menu} table={table && tableToken ? { number: table.number, token: tableToken } : undefined} />;
}
