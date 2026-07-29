"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bike,
  Minus,
  Plus,
  ReceiptText,
  Store,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import {
  type CartItem,
  type CheckoutDraft,
  useCart,
} from "@/components/CartProvider";
import { Field, Input, Textarea } from "@/components/Field";
import { PageShell } from "@/components/PageShell";
import { clientApi } from "@/services/api/client";
import type { OrderResponse } from "@/types/api";
import { money } from "@/utils/format";
import {
  AddressGrid,
  CartCard,
  CartCount,
  CartHeader,
  CartItem as CartItemRow,
  CartItemContent,
  CartItemControlButton,
  CartItemControls,
  CartItemHeader,
  CartItemImage,
  CartItemName,
  CartItemQuantity,
  CartItemTotal,
  CartList,
  CartRemovalActions,
  CartRemovalDialog,
  CartRemovalMessage,
  CartRemovalOverlay,
  CartTitle,
  CheckoutError,
  CheckoutForm,
  ContinueShoppingButton,
  DeliveryButton,
  DeliveryFields,
  DeliveryToggleGrid,
  EmptyCart,
  Muted,
  SuccessBox,
  TotalGrand,
  TotalRow,
  TotalStrong,
  TotalsBox,
} from "@/views/Home/styles";
import {
  CartPageContent,
  CartPageHeader,
  CartPageText,
  CartPageTitle,
} from "./styles";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Informe seu nome."),
  customerPhone: z.string().min(8, "Informe seu telefone."),
  deliveryType: z.enum(["DELIVERY", "PICKUP"]),
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  notes: z.string(),
});

export function CartView() {
  const router = useRouter();
  const {
    items,
    checkout,
    lastOrder,
    subtotalCents,
    updateItemQuantity,
    removeItem,
    updateCheckout,
    completeOrder,
  } = useCart();
  const [itemPendingRemoval, setItemPendingRemoval] = useState<CartItem | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  const form = useForm<CheckoutDraft>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: checkout,
    values: checkout,
  });
  const watchedCheckout = useWatch({ control: form.control });
  const deliveryType = useWatch({
    control: form.control,
    name: "deliveryType",
  });
  const estimatedDeliveryFeeCents = deliveryType === "DELIVERY" ? 500 : 0;
  const totalCents = subtotalCents + estimatedDeliveryFeeCents;

  useEffect(() => {
    const nextCheckout: CheckoutDraft = {
      customerName: watchedCheckout.customerName ?? "",
      customerPhone: watchedCheckout.customerPhone ?? "",
      deliveryType: watchedCheckout.deliveryType ?? "DELIVERY",
      street: watchedCheckout.street ?? "",
      number: watchedCheckout.number ?? "",
      neighborhood: watchedCheckout.neighborhood ?? "",
      city: watchedCheckout.city ?? "",
      notes: watchedCheckout.notes ?? "",
    };

    if (JSON.stringify(nextCheckout) !== JSON.stringify(checkout)) {
      updateCheckout(nextCheckout);
    }
  }, [checkout, updateCheckout, watchedCheckout]);

  useEffect(() => {
    if (!itemPendingRemoval) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setItemPendingRemoval(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [itemPendingRemoval]);

  async function submitOrder(values: CheckoutDraft) {
    setCheckoutError("");

    try {
      const order = await clientApi<OrderResponse>("public/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          deliveryType: values.deliveryType,
          deliveryAddress:
            values.deliveryType === "DELIVERY"
              ? {
                  street: values.street,
                  number: values.number,
                  neighborhood: values.neighborhood,
                  city: values.city,
                }
              : undefined,
          notes: values.notes,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            observations: item.observations,
            options: item.options.map((option) => ({
              groupId: option.groupId,
              itemId: option.itemId,
            })),
          })),
        }),
      });

      completeOrder(order);
      form.reset({
        customerName: "",
        customerPhone: "",
        deliveryType: "DELIVERY",
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        notes: "",
      });
    } catch {
      setCheckoutError("Nao foi possivel enviar o pedido.");
    }
  }

  return (
    <PageShell>
      <CartPageContent>
        <CartPageHeader>
          <CartPageTitle>Seu carrinho</CartPageTitle>
          <CartPageText>Revise os itens e informe os dados para concluir.</CartPageText>
        </CartPageHeader>

        <CartCard>
          <CartHeader>
            <CartTitle>
              <ReceiptText size={18} />
              Seu pedido
            </CartTitle>
            <CartCount>{items.length} item(ns)</CartCount>
          </CartHeader>

          <ContinueShoppingButton type="button" onClick={() => router.push("/")}>
            <Plus size={16} />
            Adicionar mais itens
          </ContinueShoppingButton>

          <CartList>
            {items.length === 0 ? <EmptyCart>Carrinho vazio.</EmptyCart> : null}
            {items.map((item) => (
              <CartItemRow key={item.lineId}>
                <CartItemContent>
                  {item.imageUrl ? (
                    <CartItemImage
                      role="img"
                      aria-label={`Foto de ${item.name}`}
                      style={{ backgroundImage: `url(${item.imageUrl})` }}
                    />
                  ) : null}
                  <CartItemHeader>
                    <div>
                      <CartItemName>{item.name}</CartItemName>
                      {item.options.map((option) => (
                        <Muted key={`${option.groupId}-${option.itemId}`}>
                          + {option.groupName}: {option.itemName}
                        </Muted>
                      ))}
                      {item.observations ? (
                        <Muted>Obs: {item.observations}</Muted>
                      ) : null}
                    </div>
                    <CartItemControls>
                      <CartItemControlButton
                        type="button"
                        destructive={item.quantity === 1}
                        onClick={() =>
                          item.quantity === 1
                            ? setItemPendingRemoval(item)
                            : updateItemQuantity(item.lineId, -1)
                        }
                        aria-label={
                          item.quantity === 1
                            ? `Remover ${item.name}`
                            : `Diminuir quantidade de ${item.name}`
                        }
                      >
                        {item.quantity === 1 ? (
                          <Trash2 size={16} />
                        ) : (
                          <Minus size={16} />
                        )}
                      </CartItemControlButton>
                      <CartItemQuantity aria-label={`Quantidade: ${item.quantity}`}>
                        {item.quantity}
                      </CartItemQuantity>
                      <CartItemControlButton
                        type="button"
                        onClick={() => updateItemQuantity(item.lineId, 1)}
                        aria-label={`Aumentar quantidade de ${item.name}`}
                      >
                        <Plus size={16} />
                      </CartItemControlButton>
                    </CartItemControls>
                  </CartItemHeader>
                </CartItemContent>
                <CartItemTotal>{money(item.totalCents)}</CartItemTotal>
              </CartItemRow>
            ))}
          </CartList>

          <CheckoutForm onSubmit={form.handleSubmit(submitOrder)}>
            <DeliveryToggleGrid>
              <DeliveryButton
                type="button"
                selected={deliveryType === "DELIVERY"}
                onClick={() => form.setValue("deliveryType", "DELIVERY", { shouldDirty: true })}
              >
                <Bike size={16} />
                Entrega
              </DeliveryButton>
              <DeliveryButton
                type="button"
                selected={deliveryType === "PICKUP"}
                onClick={() => form.setValue("deliveryType", "PICKUP", { shouldDirty: true })}
              >
                <Store size={16} />
                Retirada
              </DeliveryButton>
            </DeliveryToggleGrid>

            <Field label="Nome" error={form.formState.errors.customerName?.message}>
              <Input {...form.register("customerName")} />
            </Field>
            <Field
              label="WhatsApp"
              error={form.formState.errors.customerPhone?.message}
            >
              <Input {...form.register("customerPhone")} />
            </Field>

            {deliveryType === "DELIVERY" ? (
              <DeliveryFields>
                <Field label="Rua">
                  <Input {...form.register("street")} />
                </Field>
                <AddressGrid>
                  <Field label="Numero">
                    <Input {...form.register("number")} />
                  </Field>
                  <Field label="Bairro">
                    <Input {...form.register("neighborhood")} />
                  </Field>
                </AddressGrid>
                <Field label="Cidade">
                  <Input {...form.register("city")} />
                </Field>
              </DeliveryFields>
            ) : null}

            <Field label="Observacoes do pedido">
              <Textarea {...form.register("notes")} />
            </Field>

            <TotalsBox>
              <TotalRow>
                Subtotal <strong>{money(subtotalCents)}</strong>
              </TotalRow>
              <TotalRow>
                Frete <strong>{money(estimatedDeliveryFeeCents)}</strong>
              </TotalRow>
              <TotalGrand>
                Total <TotalStrong>{money(totalCents)}</TotalStrong>
              </TotalGrand>
            </TotalsBox>

            {checkoutError ? <CheckoutError>{checkoutError}</CheckoutError> : null}
            {lastOrder ? (
              <SuccessBox>Pedido enviado. Status: {lastOrder.status}</SuccessBox>
            ) : null}

            <Button type="submit" disabled={items.length === 0}>
              Enviar pedido
            </Button>
          </CheckoutForm>
        </CartCard>
      </CartPageContent>

      {itemPendingRemoval ? (
        <CartRemovalOverlay
          role="presentation"
          onClick={() => setItemPendingRemoval(null)}
        >
          <CartRemovalDialog
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar remocao de item"
            aria-describedby="cart-removal-message"
            onClick={(event) => event.stopPropagation()}
          >
            <CartRemovalMessage id="cart-removal-message">
              Deseja remover <strong>{itemPendingRemoval.name}</strong> do seu
              carrinho?
            </CartRemovalMessage>
            <CartRemovalActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => setItemPendingRemoval(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  removeItem(itemPendingRemoval.lineId);
                  setItemPendingRemoval(null);
                }}
              >
                Sim, remover
              </Button>
            </CartRemovalActions>
          </CartRemovalDialog>
        </CartRemovalOverlay>
      ) : null}
    </PageShell>
  );
}
