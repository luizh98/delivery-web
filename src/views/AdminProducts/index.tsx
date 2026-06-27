import { getAdminCategories, getAdminProducts } from "@/services/api/server";
import { ProductManager } from "./ProductManager";

export async function AdminProductsView() {
  const [categories, products] = await Promise.all([
    getAdminCategories(),
    getAdminProducts(),
  ]);

  return <ProductManager initialCategories={categories} initialProducts={products} />;
}
