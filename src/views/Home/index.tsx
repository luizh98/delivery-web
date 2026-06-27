import { getMenu, getRestaurantConfig } from "@/services/api/server";
import { CustomerMenu } from "./CustomerMenu";

export async function HomeView() {
  const [config, menu] = await Promise.all([getRestaurantConfig(), getMenu()]);

  return <CustomerMenu restaurantConfig={config} menu={menu} />;
}
