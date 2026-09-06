"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/Button";
import { type CartItem, useCart } from "@/components/CartProvider";
import { PageShell } from "@/components/PageShell";
import { useTracking } from "@/components/TrackingProvider";
import type { PromotionComboPublicResponse } from "@/types/api";
import { buildPromotionComboCartItems } from "./cartItems";
import { Status, Text, Title } from "./styles";

export function PromotionComboView({ combo }: { combo: PromotionComboPublicResponse | null }) {
  const router = useRouter();
  const { addItems } = useCart();
  const tracking = useTracking();
  const added = useRef(false);

  useEffect(() => {
    if (!combo || added.current) {
      return;
    }

    added.current = true;
    const items: CartItem[] = buildPromotionComboCartItems(combo);

    addItems(items);
    items.forEach((item) => {
      tracking.addToCart({
        id: item.productId,
        name: item.name,
        quantity: item.quantity,
        valueCents: item.totalCents,
      });
    });
    router.replace("/cart");
  }, [addItems, combo, router, tracking]);

  if (!combo) {
    return (
      <PageShell>
        <Status>
          <Title>Combo indisponível</Title>
          <Text>Esse link não existe, foi desativado ou algum produto não está mais disponível.</Text>
          <Button type="button" onClick={() => router.push("/")}>Voltar ao cardápio</Button>
        </Status>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Status aria-live="polite">
        <Title>Adicionando {combo.name} ao pedido...</Title>
        <Text>Você será levado ao carrinho em instantes.</Text>
      </Status>
    </PageShell>
  );
}
