import { Tag } from "lucide-react";
import { money } from "@/utils/format";
import { productSalePrice, type ProductPricing } from "@/utils/productPricing";
import { DiscountBadge, OriginalPrice, PriceRow, SalePrice } from "./styles";

export function ProductPrice({ product }: { product: ProductPricing }) {
  const salePrice = productSalePrice(product);
  const discounted = salePrice < product.priceCents;
  const percentage = product.discountType === "PERCENTAGE";

  return (
    <PriceRow data-discounted={discounted || undefined}>
      {discounted && !percentage ? (
        <OriginalPrice aria-label={`Preço original: ${money(product.priceCents)}`}>
          {money(product.priceCents)}
        </OriginalPrice>
      ) : null}
      <SalePrice aria-label={discounted ? `Preço com desconto: ${money(salePrice)}` : undefined}>
        {money(salePrice)}
      </SalePrice>
      {discounted ? (
        <DiscountBadge>
          <Tag size={12} aria-hidden="true" />
          {percentage ? `${product.discountValue}% OFF` : "OFERTA"}
        </DiscountBadge>
      ) : null}
    </PriceRow>
  );
}
