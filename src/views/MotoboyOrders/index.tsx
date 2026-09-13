import { getMotoboyDeliveryRoutes } from "@/services/api/server";
import { MotoboyOrdersBoard } from "./MotoboyOrdersBoard";

export async function MotoboyOrdersView() {
  const routes = await getMotoboyDeliveryRoutes();
  return <MotoboyOrdersBoard initialRoutes={routes} />;
}
