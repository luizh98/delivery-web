import { notFound } from "next/navigation";
import { getMenu } from "@/services/api/server";
import { ProductDetails } from "@/views/ProductDetails";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const menu = await getMenu();
  const product = menu.products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
