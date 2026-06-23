import { ProductManager } from "@/features/admin/product-manager";
import { getAdminCategories, getAdminProducts } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([
    getAdminCategories(),
    getAdminProducts(),
  ]);

  return <ProductManager initialCategories={categories} initialProducts={products} />;
}
