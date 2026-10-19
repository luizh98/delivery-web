"use client";

import {
  Minus,
  Plus,
  Share2,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import {
  PENDING_UPSELL_STORAGE_KEY,
  type CartOption,
  type PendingUpsellOffer,
  useCart,
} from "@/components/CartProvider";
import { Field, Textarea } from "@/components/Field";
import { PageShell } from "@/components/PageShell";
import { ProductPrice as DiscountPrice } from "@/components/ProductPrice";
import { useTracking } from "@/components/TrackingProvider";
import { clientApi } from "@/services/api/client";
import type {
  ProductOptionGroup,
  ProductOptionItem,
  UpsellOfferValidationResponse,
} from "@/types/api";
import { money } from "@/utils/format";
import { productSalePrice } from "@/utils/productPricing";
import { activeProductFlags } from "@/utils/productFlags";
import {
  FlagBadge,
  FlagBadges,
  ImageArea,
  Muted,
  OptionControl,
  OptionGroupError,
  OptionLabel,
  OptionGroup,
  OptionGroupTitle,
  OptionPrice,
  ProductContent,
  ProductBackButton,
  ProductDescription,
  ProductHeader,
  ProductLayout,
  ProductPrice,
  ProductTitle,
  QuantityButton,
  QuantityControl,
  QuantityRow,
  QuantityValue,
  ShareButton,
} from "./styles";
import type { ProductDetailsProps } from "./types";
import { ProductMedia } from "./ProductMedia";

const PRODUCT_FOCUS_STORAGE_KEY = "delivery:return-focus-product-id";
const CART_FEEDBACK_STORAGE_KEY = "delivery:show-cart-feedback";

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const tracking = useTracking();
  const viewedProductId = useRef<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, ProductOptionItem[]>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState("");
  const [invalidGroupIds, setInvalidGroupIds] = useState<string[]>([]);
  const [pendingUpsell] = useState<PendingUpsellOffer | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const raw = sessionStorage.getItem(PENDING_UPSELL_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      const pending = JSON.parse(raw) as PendingUpsellOffer;
      return pending.productId === product.id && pending.campaignId
        ? pending
        : null;
    } catch {
      sessionStorage.removeItem(PENDING_UPSELL_STORAGE_KEY);
      return null;
    }
  });
  const [upsellError, setUpsellError] = useState("");
  const [adding, setAdding] = useState(false);
  const flags = activeProductFlags(product);

  useEffect(() => {
    if (viewedProductId.current === product.id) {
      return;
    }

    viewedProductId.current = product.id;
    tracking.viewContent(product);
  }, [product, tracking]);

  function shareProduct() {
    const url = new URL(
      `/products/${encodeURIComponent(product.id)}`,
      window.location.origin,
    );
    const text = `${product.name}\n${url.href}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function returnToMenu() {
    sessionStorage.setItem(PRODUCT_FOCUS_STORAGE_KEY, product.id);
    router.push("/");
  }

  function toggleOption(group: ProductOptionGroup, option: ProductOptionItem) {
    const groupId = group.id ?? group.name;
    const selected = selectedOptions[groupId] ?? [];
    const exists = selected.some((item) => item.id === option.id);
    const maxSelections = group.maxSelections > 0 ? group.maxSelections : 1;
    const nextItems = exists
      ? selected.filter((item) => item.id !== option.id)
      : [
          ...selected.slice(
            Math.max(0, selected.length + 1 - maxSelections),
          ),
          option,
        ];

    setSelectedOptions({
      ...selectedOptions,
      [groupId]: nextItems,
    });

    const minimumSelections = Math.max(1, group.minSelections);

    if (group.required && nextItems.length >= minimumSelections) {
      setInvalidGroupIds((current) =>
        current.filter((invalidGroupId) => invalidGroupId !== groupId),
      );
    }
  }

  async function addProduct() {
    const invalidRequiredGroupIds = product.optionGroups
      .filter((group) => !group.deleted && group.required)
      .filter((group) => {
        const groupId = group.id ?? group.name;
        const minimumSelections = Math.max(1, group.minSelections);

        return (selectedOptions[groupId] ?? []).length < minimumSelections;
      })
      .map((group) => group.id ?? group.name);

    setInvalidGroupIds(invalidRequiredGroupIds);

    if (invalidRequiredGroupIds.length > 0) {
      window.requestAnimationFrame(() => {
        const group = document.getElementById(`option-${invalidRequiredGroupIds[0]}`);
        group?.focus({ preventScroll: true });
        group?.scrollIntoView({ block: "center", behavior: "instant" });
      });
      return;
    }

    const options = product.optionGroups
      .filter((group) => !group.deleted)
      .flatMap((group) => {
        const groupId = group.id ?? group.name;

        return (selectedOptions[groupId] ?? []).map<CartOption>((item) => ({
          groupId,
          groupName: group.name,
          itemId: item.id ?? item.name,
          itemName: item.name,
          priceCents: item.priceCents,
        }));
      });
    const optionsTotalCents = options.reduce(
      (sum, option) => sum + option.priceCents,
      0,
    );

    setUpsellError("");
    setAdding(true);
    try {
      let originalPriceCents = product.priceCents;
      let offerPriceCents = productSalePrice(product);
      let maximumPromotionalQuantity: number | undefined;

      if (pendingUpsell) {
        const validation = await clientApi<UpsellOfferValidationResponse>(
          "public/cart/upsell-offers/validate",
          {
            method: "POST",
            body: JSON.stringify({
              campaignId: pendingUpsell.campaignId,
              productId: product.id,
              quantity,
              options: options.map((option) => ({
                groupId: option.groupId,
                itemId: option.itemId,
              })),
              items: items.map((item) => ({
                lineId: item.lineId,
                productId: item.productId,
                quantity: item.quantity,
                upsellCampaignId: item.upsellCampaignId,
                options: item.options.map((option) => ({
                  groupId: option.groupId,
                  itemId: option.itemId,
                })),
              })),
            }),
          },
        );
        originalPriceCents = validation.originalPriceCents;
        offerPriceCents = validation.offerPriceCents;
        maximumPromotionalQuantity = validation.maximumQuantity;
      }

      addItem({
        lineId: crypto.randomUUID(),
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        quantity,
        unitOriginalPriceCents: originalPriceCents,
        unitPriceCents: offerPriceCents,
        discountAmountCents:
          (originalPriceCents - offerPriceCents) * quantity,
        upsellCampaignId: pendingUpsell?.campaignId,
        maximumPromotionalQuantity,
        observations,
        options,
        totalCents: (offerPriceCents + optionsTotalCents) * quantity,
      });
      tracking.addToCart({
        id: product.id,
        name: product.name,
        quantity,
        valueCents: (offerPriceCents + optionsTotalCents) * quantity,
      });
      if (pendingUpsell) {
        sessionStorage.removeItem(PENDING_UPSELL_STORAGE_KEY);
        void clientApi<void>("public/cart/upsell-events", {
          method: "POST",
          body: JSON.stringify({
            campaignId: pendingUpsell.campaignId,
            productId: product.id,
            type: "ADDED",
          }),
        }).catch(() => undefined);
      }
      sessionStorage.setItem(CART_FEEDBACK_STORAGE_KEY, "true");
      returnToMenu();
    } catch {
      setUpsellError("A oferta não está mais disponível. Revise o carrinho.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <PageShell>
      <ProductLayout>
        <ImageArea>
          <ProductMedia key={product.id} product={product} />
          <ProductBackButton>
            <BackButton onClick={returnToMenu} />
          </ProductBackButton>
          <ShareButton
            type="button"
            onClick={shareProduct}
            aria-label="Compartilhar produto no WhatsApp"
            title="Compartilhar no WhatsApp"
          >
            <Share2 size={20} aria-hidden="true" />
          </ShareButton>
        </ImageArea>

        <ProductContent>
          <ProductHeader>
            <ProductTitle>{product.name}</ProductTitle>
            {product.description ? (
              <ProductDescription>{product.description}</ProductDescription>
            ) : null}
            {flags.length > 0 ? (
              <FlagBadges>
                {flags.map((flag) => (
                  <FlagBadge key={flag.field} tone={flag.tone}>
                    {flag.label}
                  </FlagBadge>
                ))}
              </FlagBadges>
            ) : null}
            <ProductPrice><DiscountPrice product={product} /></ProductPrice>
          </ProductHeader>

          {product.optionGroups
            .filter((group) => !group.deleted)
            .map((group) => {
              const groupId = group.id ?? group.name;
              const isInvalid = invalidGroupIds.includes(groupId);
              const minimumSelections = Math.max(1, group.minSelections);

              return (
                <OptionGroup key={groupId} id={`option-${groupId}`} tabIndex={-1} aria-invalid={isInvalid}>
                  <div>
                    <OptionGroupTitle>{group.name}</OptionGroupTitle>
                    <Muted>
                      {group.required ? (
                        <strong>Obrigatório</strong>
                      ) : (
                        "Opcional"
                      )}{" "}
                      - selecione até {group.maxSelections || 1}
                    </Muted>
                    {isInvalid ? (
                      <OptionGroupError role="alert">
                        Selecione pelo menos {minimumSelections}{" "}
                        {minimumSelections === 1 ? "opção" : "opções"}.
                      </OptionGroupError>
                    ) : null}
                  </div>
                  {group.items
                    .filter((item) => item.active && !item.deleted)
                    .map((item) => {
                      const allowsMultipleSelections =
                        group.maxSelections > 1;
                      const selected = (selectedOptions[groupId] ?? []).some(
                        (option) => option.id === item.id,
                      );

                      return (
                        <OptionLabel
                          key={item.id ?? item.name}
                          selected={selected}
                        >
                          <span>
                            <OptionControl
                              type={
                                allowsMultipleSelections ? "checkbox" : "radio"
                              }
                              name={`option-group-${groupId}`}
                              checked={selected}
                              onChange={() => toggleOption(group, item)}
                              onClick={() => {
                                if (!allowsMultipleSelections && selected) {
                                  toggleOption(group, item);
                                }
                              }}
                            />
                            {item.name}
                          </span>
                          {item.priceCents > 0 ? (
                            <OptionPrice>{money(item.priceCents)}</OptionPrice>
                          ) : null}
                        </OptionLabel>
                      );
                    })}
                </OptionGroup>
              );
            })}

          <Field label="Observação">
            <Textarea
              value={observations}
              onChange={(event) => setObservations(event.target.value)}
              placeholder="Ex: sem cebola, ponto da carne..."
            />
          </Field>

          {upsellError ? (
            <OptionGroupError role="alert">{upsellError}</OptionGroupError>
          ) : null}
          <QuantityRow>
            <QuantityControl>
              <QuantityButton
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                aria-label="Diminuir"
              >
                <Minus size={16} />
              </QuantityButton>
              <QuantityValue>{quantity}</QuantityValue>
              <QuantityButton
                type="button"
                onClick={() => setQuantity((value) => value + 1)}
                aria-label="Aumentar"
              >
                <Plus size={16} />
              </QuantityButton>
            </QuantityControl>
            <Button type="button" onClick={addProduct} disabled={adding}>
              <ShoppingCart size={16} />
              {adding ? "Validando..." : "Adicionar"}
            </Button>
          </QuantityRow>
        </ProductContent>
      </ProductLayout>
    </PageShell>
  );
}
