import {
  getAdminCategories,
  getAdminProductOptionGroups,
  getAdminProducts,
} from "@/services/api/server";
import { ProductManager } from "./ProductManager";

export async function AdminProductsView() {
  const [categories, products, optionGroupTemplates] = await Promise.all([
    getAdminCategories(),
    getAdminProducts(),
    getAdminProductOptionGroups(),
  ]);

  return (
    <ProductManager
      initialCategories={categories}
      initialProducts={products}
      initialOptionGroupTemplates={optionGroupTemplates}
    />
  );
}
