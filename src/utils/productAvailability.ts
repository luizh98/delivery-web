import type { Product, ProductAvailability } from "../types/api";

export const productAvailabilityLabels: Record<ProductAvailability, string> = {
  ALL: "Delivery e salão",
  DELIVERY: "Somente delivery",
  TABLE: "Somente salão",
};

export function productAvailability(product: Pick<Product, "availability">): ProductAvailability {
  return product.availability ?? "ALL";
}

export function productMatchesChannel(product: Pick<Product, "availability">, channel: "DELIVERY" | "TABLE") {
  const availability = productAvailability(product);
  return availability === "ALL" || availability === channel;
}

export function tableMenuPath(tableToken?: string) {
  return tableToken ? `/menu?mesa=${encodeURIComponent(tableToken)}` : "/";
}

export function productPath(id: string, tableToken?: string) {
  return `/products/${encodeURIComponent(id)}${tableToken ? `?mesa=${encodeURIComponent(tableToken)}` : ""}`;
}
