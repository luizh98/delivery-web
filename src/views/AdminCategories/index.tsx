import { getAdminCategories } from "@/services/api/server";
import { CategoryManager } from "./CategoryManager";

export async function AdminCategoriesView() {
  const categories = await getAdminCategories();

  return <CategoryManager initialCategories={categories} />;
}
