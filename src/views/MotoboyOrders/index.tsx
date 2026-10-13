import { getMotoboyDeliveryRoutes, getMotoboyPickupOrders } from "@/services/api/server";
import { MotoboyOrdersBoard } from "./MotoboyOrdersBoard";

export async function MotoboyOrdersView() {
  const [routes, pickup] = await Promise.all([getMotoboyDeliveryRoutes(), getMotoboyPickupOrders()]);
  return <MotoboyOrdersBoard initialRoutes={routes} initialPickup={pickup} />;
}
