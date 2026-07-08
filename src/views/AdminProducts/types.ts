import type {
  Product,
  ProductCategory,
  ProductOptionGroupTemplate,
} from "@/types/api";

export type ProductManagerProps = {
  initialCategories: ProductCategory[];
  initialProducts: Product[];
  initialOptionGroupTemplates: ProductOptionGroupTemplate[];
};
