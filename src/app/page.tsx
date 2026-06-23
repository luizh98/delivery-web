import { CustomerMenu } from "@/features/customer/customer-menu";
import { getMenu, getRestaurantConfig } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [config, menu] = await Promise.all([getRestaurantConfig(), getMenu()]);

  return <CustomerMenu restaurantConfig={config} menu={menu} />;
}
