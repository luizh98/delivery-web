import { getAdminCustomers } from "@/services/api/server";
import { CustomerManager } from "./CustomerManager";

export async function AdminCustomersView() {
  const customers = await getAdminCustomers();

  return <CustomerManager initialPage={customers} />;
}
