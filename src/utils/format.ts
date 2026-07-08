export function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function centsToReais(cents: number) {
  return cents / 100;
}

export function reaisToCents(reais: number) {
  return Math.round(reais * 100);
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    RECEIVED: "Recebido",
    CONFIRMED: "Confirmado",
    PREPARING: "Preparando",
    READY: "Pronto",
    OUT_FOR_DELIVERY: "Saiu para entrega",
    COMPLETED: "Concluido",
    CANCELED: "Cancelado",
  };

  return labels[status] ?? status;
}
