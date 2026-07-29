"use client";

import { Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import {
  PENDING_UPSELL_STORAGE_KEY,
  type PendingUpsellOffer,
  useCart,
} from "@/components/CartProvider";
import { clientApi } from "@/services/api/client";
import type {
  CartUpsellResponse,
  UpsellOfferValidationResponse,
  UpsellSuggestion,
} from "@/types/api";
import { money } from "@/utils/format";
import {
  Card,
  Content,
  Image,
  List,
  Name,
  Notice,
  OfferPrice,
  OriginalPrice,
  PriceRow,
  Root,
  Savings,
  Title,
} from "./UpsellBlock.styles";

export function UpsellBlock() {
  const router = useRouter();
  const { items, addItem, applyPromotionAdjustment } = useCart();
  const [response, setResponse] = useState<CartUpsellResponse | null>(null);
  const [notice, setNotice] = useState("");
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const cartItems = useMemo(
    () =>
      items.map((item) => ({
        lineId: item.lineId,
        productId: item.productId,
        quantity: item.quantity,
        upsellCampaignId: item.upsellCampaignId,
        options: item.options.map((option) => ({
          groupId: option.groupId,
          itemId: option.itemId,
        })),
      })),
    [items],
  );

  useEffect(() => {
    if (!items.length) {
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const result = await clientApi<CartUpsellResponse>(
          "public/cart/upsell-suggestions",
          {
            method: "POST",
            signal: controller.signal,
            body: JSON.stringify({ items: cartItems, couponId: null }),
          },
        );
        let nextNotice = "";
        result.promotionAdjustments.forEach((adjustment) => {
          const item = items.find((candidate) => candidate.lineId === adjustment.lineId);
          if (!item) return;
          const priceChanged =
            item.unitPriceCents !== adjustment.offerPriceCents ||
            (!adjustment.eligible && Boolean(item.upsellCampaignId));
          if (priceChanged) {
            applyPromotionAdjustment(
              item.lineId,
              adjustment.eligible,
              adjustment.originalPriceCents,
              adjustment.offerPriceCents,
            );
            if (adjustment.eligible) {
              nextNotice = `O preço da oferta de ${item.name} foi atualizado.`;
            }
          }
          if (!adjustment.eligible && adjustment.message) {
            nextNotice = adjustment.message;
          }
        });
        if (nextNotice) {
          setNotice(nextNotice);
        }
        setResponse(result);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResponse(null);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [applyPromotionAdjustment, cartItems, items]);

  async function addSuggestion(suggestion: UpsellSuggestion) {
    if (!response?.campaignId) return;
    if (suggestion.requiresOptions) {
      const pending: PendingUpsellOffer = {
        campaignId: response.campaignId,
        productId: suggestion.productId,
      };
      sessionStorage.setItem(PENDING_UPSELL_STORAGE_KEY, JSON.stringify(pending));
      router.push(`/products/${suggestion.productId}`);
      return;
    }

    setAddingProductId(suggestion.productId);
    try {
      const validation = await clientApi<UpsellOfferValidationResponse>(
        "public/cart/upsell-offers/validate",
        {
          method: "POST",
          body: JSON.stringify({
            campaignId: response.campaignId,
            productId: suggestion.productId,
            quantity: 1,
            options: [],
            items: cartItems,
          }),
        },
      );
      addItem({
        lineId: crypto.randomUUID(),
        productId: suggestion.productId,
        name: suggestion.name,
        imageUrl: suggestion.imageUrl,
        quantity: 1,
        unitOriginalPriceCents: validation.originalPriceCents,
        unitPriceCents: validation.offerPriceCents,
        discountAmountCents: validation.discountAmountCents,
        upsellCampaignId: validation.campaignId,
        maximumPromotionalQuantity: validation.maximumQuantity,
        options: [],
        totalCents: validation.offerPriceCents,
      });
      void clientApi<void>("public/cart/upsell-events", {
        method: "POST",
        body: JSON.stringify({
          campaignId: validation.campaignId,
          productId: suggestion.productId,
          type: "ADDED",
        }),
      }).catch(() => undefined);
    } catch {
      setNotice("A oferta não está mais disponível. O carrinho foi atualizado.");
    } finally {
      setAddingProductId(null);
    }
  }

  if (!items.length || (!notice && !response?.suggestions.length)) {
    return null;
  }

  return (
    <Root aria-live="polite">
      {notice ? <Notice role="status">{notice}</Notice> : null}
      {response?.suggestions.length ? (
        <>
          <Title>
            <Sparkles size={16} /> {response.title}
          </Title>
          <List>
            {response.suggestions.map((suggestion) => (
              <Card key={suggestion.productId}>
                <Image
                  role="img"
                  aria-label={`Foto de ${suggestion.name}`}
                  style={{
                    backgroundImage: suggestion.imageUrl
                      ? `url(${suggestion.imageUrl})`
                      : "linear-gradient(135deg, #edf2f7, #dbe4ee)",
                  }}
                />
                <Content>
                  <Name>{suggestion.name}</Name>
                  <PriceRow>
                    {suggestion.discountAmountCents > 0 ? (
                      <OriginalPrice>{money(suggestion.originalPriceCents)}</OriginalPrice>
                    ) : null}
                    <OfferPrice>{money(suggestion.offerPriceCents)}</OfferPrice>
                  </PriceRow>
                  {suggestion.showSavings && suggestion.discountAmountCents > 0 ? (
                    <Savings>Economize {money(suggestion.discountAmountCents)}</Savings>
                  ) : null}
                  <Button
                    type="button"
                    onClick={() => addSuggestion(suggestion)}
                    disabled={addingProductId === suggestion.productId}
                  >
                    <Plus size={15} />
                    {addingProductId === suggestion.productId
                      ? "Validando..."
                      : `Adicionar por ${money(suggestion.offerPriceCents)}`}
                  </Button>
                </Content>
              </Card>
            ))}
          </List>
        </>
      ) : null}
    </Root>
  );
}
