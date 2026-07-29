import {
  getAdminCategories,
  getAdminProducts,
  getAdminUpsellCampaigns,
} from "@/services/api/server";
import { UpsellCampaignManager } from "./UpsellCampaignManager";

export async function AdminUpsellView() {
  const [campaigns, products, categories] = await Promise.all([
    getAdminUpsellCampaigns(),
    getAdminProducts(),
    getAdminCategories(),
  ]);

  return (
    <UpsellCampaignManager
      initialCampaigns={campaigns}
      products={products}
      categories={categories}
    />
  );
}
