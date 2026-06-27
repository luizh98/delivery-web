import { getRestaurantConfig } from "@/services/api/server";
import { SettingsForm } from "./SettingsForm";

export async function AdminSettingsView() {
  const config = await getRestaurantConfig();

  return <SettingsForm initialConfig={config} />;
}
