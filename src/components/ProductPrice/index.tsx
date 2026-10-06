import { Tag } from "lucide-react";
import { money } from "@/utils/format";
import { productSalePrice, type ProductPricing } from "@/utils/productPricing";
import { DiscountBadge, OriginalPrice, PriceRow, SalePrice } from "./styles";

export function ProductPrice({ product }: { product: ProductPricing }) {
  const salePrice = productSalePrice(product);
  const discounted = salePrice < product.priceCents;

  return (
    <PriceRow data-discounted={discounted || undefined}>
      {discounted ? (
        <OriginalPrice aria-label={`Preço original: ${money(product.priceCents)}`}>
          {money(product.priceCents)}
        </OriginalPrice>
      ) : null}
      {discounted ? (
        <DiscountBadge aria-label={`Preço com desconto: ${money(salePrice)}`}>
          <Tag size={12} aria-hidden="true" />
          {money(salePrice)}
        </DiscountBadge>
      ) : <SalePrice>{money(salePrice)}</SalePrice>}
    </PriceRow>
  );
}
