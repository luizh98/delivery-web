import { getAdminDeliveryRoutes, getAdminMotoboys } from "@/services/api/server";
import { DeliveriesBoard } from "./DeliveriesBoard";

export async function AdminDeliveriesView() {
  const [routes, motoboys] = await Promise.all([getAdminDeliveryRoutes(), getAdminMotoboys()]);
  return <DeliveriesBoard initialRoutes={routes} initialMotoboys={motoboys} />;
}
