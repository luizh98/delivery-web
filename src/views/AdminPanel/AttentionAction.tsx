"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Power } from "lucide-react";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { useToast } from "@/components/ToastProvider";
import { ApiError, clientApi } from "@/services/api/client";
import type { Product } from "@/types/api";

type Props = { id: string; name: string; kind: "product" | "order" };

export function AttentionAction({ id, name, kind }: Props) {
  const router = useRouter();
  const { requestConfirmation } = useConfirmation();
  const { showToast } = useToast();
  const [refreshing, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const pending = saving || refreshing;
  const busy = useRef(false);
  const product = kind === "product";

  async function handleClick() {
    if (busy.current) return;
    busy.current = true;
    try {
      // Confirmation must commit immediately; awaiting it inside a transition hides its dialog.
      if (!await requestConfirmation({
        message: product
          ? `Ativar o produto "${name}" e disponibilizá-lo no cardápio?`
          : `Concluir o pedido #${name}? Confirme apenas se ele já foi finalizado.`,
        confirmLabel: product ? "Ativar produto" : "Concluir pedido",
        variant: "primary",
      })) return;

      setSaving(true);
      if (product) {
        // Read current fields before PUT so an old panel does not resend stale catalog data.
        const products = await clientApi<Product[]>("admin/products");
        const current = products.find((item) => item.id === id);
        if (!current) {
          showToast("Produto não encontrado. Atualize a página e tente novamente.", "error");
          startTransition(() => router.refresh());
          return;
        }
        if (!current.active) await clientApi(`admin/products/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: JSON.stringify({ ...current, active: true }),
        });
      } else {
        await clientApi(`admin/orders/${encodeURIComponent(id)}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "COMPLETED" }),
        });
      }
      showToast(product ? "Produto ativado com sucesso." : "Pedido concluído com sucesso.");
      startTransition(() => router.refresh());
    } catch (error) {
      let message = product
        ? "Não foi possível ativar o produto. Tente novamente."
        : "Não foi possível concluir o pedido. Atualize a página e tente novamente.";
      if (product && error instanceof ApiError && error.status === 400) {
        try {
          const response = JSON.parse(error.message);
          if (typeof response.message === "string") message = response.message;
        } catch { /* Keep the fallback for invalid API responses. */ }
      }
      showToast(message, "error");
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  const Icon = product ? Power : CheckCircle2;
  return (
    <Button type="button" variant="outline" className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-wait" disabled={pending} aria-busy={pending} aria-label={product ? `Ativar ${name}` : `Concluir pedido #${name}`} onClick={handleClick}>
      <Icon size={16} aria-hidden="true" />
      {pending ? "Salvando…" : product ? "Ativar" : "Concluir"}
    </Button>
  );
}
