import type { StaffTableConsumption, TablePaymentItem } from "@/types/api";

export function paymentLines(consumption: StaffTableConsumption) {
  const payments = consumption.session?.payments ?? [];
  return consumption.orders.filter((order) => order.status !== "CANCELED").flatMap((order) => order.items.map((item, itemIndex) => {
    const paid = payments.flatMap((payment) => payment.items ?? []).filter((entry) => entry.orderId === order.id && entry.itemIndex === itemIndex).reduce((sum, entry) => sum + entry.quantity, 0);
    return { orderId: order.id, orderNumber: order.orderNumber, itemIndex, item, paid, remaining: item.quantity - paid };
  }));
}

export function paymentQuote(consumption: StaffTableConsumption, mode: "ITEMS" | "EQUAL", splitCount: number, selections: Record<string, number>) {
  const payments = consumption.session?.payments ?? [];
  const total = consumption.totals?.totalCents ?? 0;
  const paidCents = payments.reduce((sum, payment) => sum + payment.amountCents, 0);
  const balanceCents = total - paidCents;
  const items: TablePaymentItem[] = [];
  let consumptionCents = 0;
  let serviceFeeCents = 0;
  let valid = !!consumption.totals && balanceCents >= 0 && payments.length < 999;
  if (payments.length && (payments[0].mode !== mode || payments[0].splitCount !== (mode === "EQUAL" ? splitCount : 0))) valid = false;
  if (mode === "EQUAL") {
    valid &&= Number.isInteger(splitCount) && splitCount >= 1 && splitCount <= 999 && payments.length < splitCount && (total === 0 || splitCount <= total);
    const amountCents = valid ? Math.floor(total / splitCount) + (payments.length < total % splitCount ? 1 : 0) : 0;
    const previousFee = payments.reduce((sum, payment) => sum + payment.serviceFeeCents, 0);
    serviceFeeCents = total > 0 ? Math.floor((paidCents + amountCents) * (consumption.totals?.serviceFeeCents ?? 0) / total) - previousFee : 0;
    return { valid, amountCents, serviceFeeCents, consumptionCents: amountCents - serviceFeeCents, items, paidCents, balanceCents };
  }
  for (const line of paymentLines(consumption)) {
    const quantity = Number(selections[`${line.orderId}:${line.itemIndex}`] ?? 0);
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > line.remaining) { valid = false; continue; }
    if (!quantity) continue;
    items.push({ orderId: line.orderId, itemIndex: line.itemIndex, quantity });
    consumptionCents += Math.floor(line.item.totalCents * (line.paid + quantity) / line.item.quantity) - Math.floor(line.item.totalCents * line.paid / line.item.quantity);
  }
  const previousConsumption = payments.reduce((sum, payment) => sum + payment.consumptionCents, 0);
  const previousFee = payments.reduce((sum, payment) => sum + payment.serviceFeeCents, 0);
  serviceFeeCents = Math.floor(((previousConsumption + consumptionCents) * (consumption.totals?.serviceFeeBasisPoints ?? 0) + 5000) / 10000) - previousFee;
  const amountCents = consumptionCents + serviceFeeCents;
  valid &&= items.length > 0 && amountCents >= 0 && amountCents <= balanceCents;
  return { valid, amountCents, serviceFeeCents, consumptionCents, items, paidCents, balanceCents };
}

export const paymentMethodLabels = { PIX: "Pix", CASH: "Dinheiro", CREDIT_CARD: "Cartão de crédito", DEBIT_CARD: "Cartão de débito" };
