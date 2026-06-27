import type { Product, ProductCategory } from "@/types/api";

export type ProductManagerProps = {
  initialCategories: ProductCategory[];
  initialProducts: Product[];
};
