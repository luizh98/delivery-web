import { ApiError, clientApi } from "@/services/api/client";
import type { OrderResponse } from "@/types/api";

export type PickupResult = { success: boolean; message: string };

export function pickupOrderId(code: string) {
  const match = /^flyfoods:pickup:v1:([A-Za-z0-9_-]{1,64}):[A-Za-z0-9_-]{43}$/.exec(code);
  return match?.[0] === code ? match[1] : null;
}

export async function confirmPickup(orderId: string, qrCode: string | undefined, reload: () => Promise<boolean>): Promise<PickupResult> {
  let order: OrderResponse;
  try {
    order = await clientApi<OrderResponse>(`admin/motoboy/orders/${encodeURIComponent(orderId)}/pickup`, {
      method: "PATCH", ...(qrCode !== undefined ? { body: JSON.stringify({ qrCode }) } : {}),
    });
  } catch (error) {
    const updated = await reload();
    let notificationPending = false;
    if (error instanceof ApiError) {
      try { notificationPending = JSON.parse(error.message).code === "pickup_notification_pending"; } catch { /* A proxy/network error may have no JSON body. */ }
    }
    const message = notificationPending
      ? "Retirada registrada, mas aviso de saída pendente. Tente este código novamente para recuperar o aviso."
      : error instanceof ApiError && error.status === 409
      ? "Pedido alterado ou já retirado por outro entregador."
      : error instanceof ApiError && error.status === 400
        ? "QR Code inválido. Leia o código no cupom do pedido."
        : error instanceof ApiError && error.status === 403
          ? "Retirada indisponível. Verifique sua permissão com o restaurante."
          : "Não foi possível confirmar o resultado da retirada. Confira seus pedidos e tente novamente; repetir não duplica a saída.";
    return { success: false, message: `${message} ${updated ? "Lista atualizada." : "Lista não atualizada. Toque em Atualizar para conferir."}` };
  }
  const updated = await reload();
  const label = order.orderNumber ?? order.id.slice(-6).toUpperCase();
  return { success: true, message: `Pedido #${label}: saída confirmada.${updated ? "" : " Não foi possível atualizar a lista. Toque em Atualizar para conferir."}` };
}
