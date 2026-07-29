"use client";

import {
  Minus,
  Plus,
  ShoppingCart,
  X,
  ZoomIn,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import { type CartOption, useCart } from "@/components/CartProvider";
import { Field, Textarea } from "@/components/Field";
import { PageShell } from "@/components/PageShell";
import type { ProductOptionGroup, ProductOptionItem } from "@/types/api";
import { money } from "@/utils/format";
import { activeProductFlags } from "@/utils/productFlags";
import {
  ExpandedImage,
  FlagBadge,
  FlagBadges,
  ImageArea,
  ImageOverlay,
  ImageOverlayContent,
  ImageOverlayDescription,
  ImageOverlayHeader,
  ImageOverlayTitle,
  Muted,
  OptionControl,
  OptionGroupError,
  OptionLabel,
  OptionGroup,
  OptionGroupTitle,
  OptionPrice,
  OverlayCloseButton,
  ProductContent,
  ProductBackButton,
  ProductDescription,
  ProductHeader,
  ProductImage,
  ProductLayout,
  ProductPrice,
  ProductTitle,
  QuantityButton,
  QuantityControl,
  QuantityRow,
  QuantityValue,
  ZoomButton,
} from "./styles";
import type { ProductDetailsProps } from "./types";

const PRODUCT_FOCUS_STORAGE_KEY = "delivery:return-focus-product-id";
const CART_FEEDBACK_STORAGE_KEY = "delivery:show-cart-feedback";

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, ProductOptionItem[]>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState("");
  const [imageExpanded, setImageExpanded] = useState(false);
  const [invalidGroupIds, setInvalidGroupIds] = useState<string[]>([]);
  const flags = activeProductFlags(product);

  useEffect(() => {
    if (!imageExpanded) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setImageExpanded(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [imageExpanded]);

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

  function addProduct() {
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

    addItem({
      lineId: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      quantity,
      unitPriceCents: product.priceCents,
      observations,
      options,
      totalCents: (product.priceCents + optionsTotalCents) * quantity,
    });
    sessionStorage.setItem(CART_FEEDBACK_STORAGE_KEY, "true");
    returnToMenu();
  }

  return (
    <PageShell>
      <ProductLayout>
        <ImageArea>
          <ProductImage
            role="img"
            aria-label={`Foto de ${product.name}`}
            style={{
              backgroundImage: product.imageUrl
                ? `url(${product.imageUrl})`
                : "linear-gradient(135deg, #edf2f7, #dbe4ee)",
            }}
          />
          <ProductBackButton>
            <BackButton onClick={returnToMenu} />
          </ProductBackButton>
          {product.imageUrl ? (
            <ZoomButton
              type="button"
              onClick={() => setImageExpanded(true)}
              aria-label="Ampliar foto do produto"
            >
              <ZoomIn size={20} />
            </ZoomButton>
          ) : null}
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
            <ProductPrice>{money(product.priceCents)}</ProductPrice>
          </ProductHeader>

          {product.optionGroups
            .filter((group) => !group.deleted)
            .map((group) => {
              const groupId = group.id ?? group.name;
              const isInvalid = invalidGroupIds.includes(groupId);
              const minimumSelections = Math.max(1, group.minSelections);

              return (
                <OptionGroup key={groupId} aria-invalid={isInvalid}>
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
            <Button type="button" onClick={addProduct}>
              <ShoppingCart size={16} />
              Adicionar
            </Button>
          </QuantityRow>
        </ProductContent>
      </ProductLayout>

      {imageExpanded && product.imageUrl ? (
        <ImageOverlay role="dialog" aria-modal="true" aria-label="Foto ampliada">
          <OverlayCloseButton
            type="button"
            onClick={() => setImageExpanded(false)}
            aria-label="Fechar foto ampliada"
            autoFocus
          >
            <X size={20} />
          </OverlayCloseButton>
          <ImageOverlayContent>
            <ExpandedImage src={product.imageUrl} alt={product.name} />
            <ImageOverlayHeader>
              <ImageOverlayTitle>{product.name}</ImageOverlayTitle>
              <ImageOverlayDescription>
                {product.description || "Sem descrição."}
              </ImageOverlayDescription>
            </ImageOverlayHeader>
          </ImageOverlayContent>
        </ImageOverlay>
      ) : null}
    </PageShell>
  );
}
