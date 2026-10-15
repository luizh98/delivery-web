import type { Product } from "@/types/api";

function normalizeSearch(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("pt-BR");
}

export function productMatchesSearch(
  product: Pick<Product, "name" | "description">,
  query: string,
) {
  const text = normalizeSearch(`${product.name} ${product.description ?? ""}`);
  return normalizeSearch(query).trim().split(/\s+/).every((term) => text.includes(term));
}
