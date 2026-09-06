import type { CartItem } from "@/components/CartProvider";
import type { PromotionComboPublicResponse } from "@/types/api";

export function buildPromotionComboCartItems(
  combo: PromotionComboPublicResponse,
  createLineId = () => crypto.randomUUID(),
): CartItem[] {
  return combo.items.map(({ product, quantity }) => ({
    lineId: createLineId(),
    productId: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    quantity,
    unitOriginalPriceCents: product.priceCents,
    unitPriceCents: product.priceCents,
    discountAmountCents: 0,
    options: [],
    totalCents: product.priceCents * quantity,
  }));
}
