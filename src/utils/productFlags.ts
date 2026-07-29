import type { Product } from "@/types/api";

type ProductFlagField =
  | "adultOnly"
  | "glutenFree"
  | "lactoseFree"
  | "vegetarian";

export type ProductFlagTone = "adult" | "gluten" | "lactose" | "vegetarian";

const PRODUCT_FLAGS: {
  field: ProductFlagField;
  label: string;
  tone: ProductFlagTone;
}[] = [
  { field: "adultOnly", label: "+18", tone: "adult" },
  { field: "glutenFree", label: "Sem gluten", tone: "gluten" },
  { field: "lactoseFree", label: "Sem lactose", tone: "lactose" },
  { field: "vegetarian", label: "Vegetariano", tone: "vegetarian" },
];

export function activeProductFlags(product: Product) {
  return PRODUCT_FLAGS.filter(({ field }) => product[field] ?? false);
}
