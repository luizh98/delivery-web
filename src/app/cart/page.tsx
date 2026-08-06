import { getRestaurantConfig } from "@/services/api/server";
import { CartView } from "@/views/Cart";

type CartPageProps = {
  searchParams: Promise<{ step?: string | string[] }>;
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const [restaurantConfig, { step }] = await Promise.all([
    getRestaurantConfig(),
    searchParams,
  ]);
  const initialStep = step === "checkout" ? 2 : 1;

  return (
    <CartView restaurantConfig={restaurantConfig} initialStep={initialStep} />
  );
}
