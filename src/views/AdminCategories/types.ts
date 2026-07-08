import type { ProductCategory } from "@/types/api";

export type CategoryManagerProps = {
  initialCategories: ProductCategory[];
  onCategoriesChange?: (categories: ProductCategory[]) => void;
  showHeader?: boolean;
};
