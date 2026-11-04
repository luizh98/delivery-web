import type { Product } from "@/types/api";
import { productSalePrice } from "../../utils/productPricing.ts";

export type DraftItem = {
  id: string;
  product: Product;
  quantity: number;
  observations: string;
  options: { groupId: string; itemId: string }[];
};

export function normalizeTablePhone(value: string) {
  let phone = value.replace(/\D/g, "");
  if (phone.startsWith("55") && (value.trim().startsWith("+") || phone.length > 11)) phone = phone.slice(2);
  return /^\d{10,11}$/.test(phone) ? phone : "";
}

export function draftItemTotal(item: DraftItem) {
  const extra = item.options.reduce((total, option) => total + (item.product.optionGroups
    ?.find((group) => group.id === option.groupId)?.items.find((entry) => entry.id === option.itemId)?.priceCents ?? 0), 0);
  return (productSalePrice(item.product) + extra) * item.quantity;
}

export function validateDraftItem(item: DraftItem) {
  if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) return "Informe uma quantidade de 1 a 999.";
  for (const group of item.product.optionGroups ?? []) {
    if (group.deleted) continue;
    const count = item.options.filter((option) => option.groupId === group.id).length;
    const min = Math.max(group.minSelections, group.required ? 1 : 0);
    const max = group.maxSelections > 0 ? group.maxSelections : 1;
    if (count < min || count > max) return `${group.name}: escolha ${min === max ? min : `de ${min} a ${max}`} opção(ões).`;
  }
  return "";
}

export function staffApiMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  try {
    const parsed = JSON.parse(error.message) as { message?: string; error?: { message?: string } };
    const message = parsed.message ?? parsed.error?.message;
    if (message && !/^[\x00-\x7F]+$/.test(message)) return message;
  } catch { /* Non-JSON errors use actionable Portuguese fallback. */ }
  return fallback;
}
