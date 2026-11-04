import { notFound } from "next/navigation";
import { getMenu, getPublicTable } from "@/services/api/server";
import { ProductDetails } from "@/views/ProductDetails";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mesa?: string }>;
}) {
  const { id } = await params;
  const { mesa } = await searchParams;
  if (mesa && !await getPublicTable(mesa)) notFound();
  const menu = await getMenu(mesa ? "TABLE" : "DELIVERY");
  const product = menu.products.find((item) => item.id === id && item.active);
  const category = menu.categories.find((item) => item.id === product?.categoryId);

  if (!product || !category?.active) {
    notFound();
  }

  return <ProductDetails product={product} tableToken={mesa} />;
}
