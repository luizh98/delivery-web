import { getAdminPromotionCombos, getAdminProducts } from "@/services/api/server";
import { PromotionComboManager } from "./PromotionComboManager";

export async function AdminPromotionsView() {
  const [combos, products] = await Promise.all([
    getAdminPromotionCombos(),
    getAdminProducts(),
  ]);

  return <PromotionComboManager initialCombos={combos} products={products} />;
}
