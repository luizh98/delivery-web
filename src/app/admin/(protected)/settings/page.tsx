import { SettingsForm } from "@/features/admin/settings-form";
import { getRestaurantConfig } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const config = await getRestaurantConfig();

  return <SettingsForm initialConfig={config} />;
}
