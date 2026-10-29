import type { CartItem } from "@/components/CartProvider";
import type { CustomerOrderHistoryResponse, MenuResponse, OrderItem } from "@/types/api";

export async function buildRepeatOrderCartItems(
  order: CustomerOrderHistoryResponse,
  loadMenu: () => Promise<MenuResponse>,
  createLineId = () => crypto.randomUUID(),
): Promise<CartItem[]> {
  // A menu outage must not prevent repeating an order.
  const products = await loadMenu().then((menu) => menu.products).catch(() => []);

  return order.items.map((item: OrderItem & { imageUrl?: string }) => ({
    lineId: createLineId(),
    productId: item.productId,
    name: item.name,
    imageUrl: products.find((product) => product.id === item.productId)?.imageUrl ?? item.imageUrl,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    observations: item.observations,
    options: item.options,
    totalCents: item.totalCents,
  }));
}
