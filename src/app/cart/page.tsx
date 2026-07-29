import { getRestaurantConfig } from "@/services/api/server";
import { CartView } from "@/views/Cart";

export default async function CartPage() {
  const restaurantConfig = await getRestaurantConfig();

  return <CartView restaurantConfig={restaurantConfig} />;
}
