import { CategoryManager } from "@/features/admin/category-manager";
import { getAdminCategories } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getAdminCategories();

  return <CategoryManager initialCategories={categories} />;
}
