import { z } from "zod";
import type { UpsellPriceType } from "@/types/api";

const defaultPriceSchema = z.discriminatedUnion("priceType", [
  z.object({
    priceType: z.literal("FIXED"),
    value: z.number().min(0, "Informe um preço maior ou igual a zero."),
  }),
  z.object({
    priceType: z.literal("PERCENTAGE"),
    value: z.number().int("Use uma porcentagem inteira.").min(0).max(100, "O desconto máximo é 100%."),
  }),
]);

type OfferPrice = {
  priceType: UpsellPriceType;
  fixedOfferPriceReais?: number;
  discountPercentage?: number;
};

export function applyDefaultOfferPrice<T extends OfferPrice>(offers: T[], input: unknown): T[] {
  const price = defaultPriceSchema.parse(input);
  return offers.map((offer) => ({
    ...offer,
    priceType: price.priceType,
    fixedOfferPriceReais: price.priceType === "FIXED" ? price.value : undefined,
    discountPercentage: price.priceType === "PERCENTAGE" ? price.value : undefined,
  }));
}
