import type { Product } from "../types/api";

export type ProductPricing = Pick<Product, "priceCents" | "discountType" | "discountValue" | "salePriceCents">;

export function isProductDiscountValid(product: ProductPricing) {
  const value = product.discountValue ?? 0;
  if (!product.discountType) return true;
  if (!Number.isSafeInteger(value) || product.priceCents <= 0) return false;
  return product.discountType === "PERCENTAGE"
    ? value >= 1 && value <= 100
    : product.discountType === "FIXED" && value >= 0 && value < product.priceCents;
}

export function productSalePrice(product: ProductPricing) {
  if (!isProductDiscountValid(product)) return product.priceCents;
  if (product.salePriceCents !== undefined) return product.salePriceCents;
  if (product.discountType === "PERCENTAGE") {
    return Math.round(product.priceCents * (100 - product.discountValue!) / 100);
  }
  return product.discountType === "FIXED" ? product.discountValue! : product.priceCents;
}
