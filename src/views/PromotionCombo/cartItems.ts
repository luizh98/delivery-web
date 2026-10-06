import type { CartItem } from "@/components/CartProvider";
import type { PromotionComboPublicResponse } from "@/types/api";
import { productSalePrice } from "../../utils/productPricing.ts";

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
    unitPriceCents: productSalePrice(product),
    discountAmountCents: (product.priceCents - productSalePrice(product)) * quantity,
    options: [],
    totalCents: productSalePrice(product) * quantity,
  }));
}
