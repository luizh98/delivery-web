import { getAdminRestaurantConfig } from "@/services/api/server";
import { SettingsForm } from "./SettingsForm";

export async function AdminSettingsView() {
  const config = await getAdminRestaurantConfig();

  return <SettingsForm initialConfig={config} />;
}
