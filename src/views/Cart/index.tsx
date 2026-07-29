"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Banknote,
  Bike,
  ChevronLeft,
  CreditCard,
  Minus,
  Plus,
  QrCode,
  Store,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import {
  type CartItem,
  type CheckoutDraft,
  useCart,
} from "@/components/CartProvider";
import { Field, Input, Textarea } from "@/components/Field";
import { PageShell } from "@/components/PageShell";
import { clientApi } from "@/services/api/client";
import type { OrderResponse, RestaurantConfigResponse } from "@/types/api";
import { money } from "@/utils/format";
import { formatClosedStoreMessage } from "@/utils/storeAvailability";
import {
  AddressGrid,
  CartCard,
  CartCount,
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
import { AddressAutocomplete, type AddressSelection } from "./AddressAutocomplete";
import { UpsellBlock } from "./UpsellBlock";
import {
  CartPageContent,
  CartPageHeader,
  CartPageText,
  CartPageTitle,
  CartPageTitleRow,
  CartStepAction,
  CheckoutConfirmation,
  CheckoutConfirmationText,
  CheckoutSection,
  CheckoutSectionTitle,
  PaymentGrid,
  StepIndicator,
  StepItem,
  StepNumber,
} from "./styles";

const paymentMethods = [
  { value: "PIX", label: "PIX", icon: QrCode },
  { value: "CREDIT_CARD", label: "Crédito", icon: CreditCard },
  { value: "DEBIT_CARD", label: "Débito", icon: CreditCard },
  { value: "CASH", label: "Dinheiro", icon: Banknote },
] as const;

const checkoutSchema = z
  .object({
    customerName: z.string().min(2, "Informe seu nome."),
    customerPhone: z.string().min(8, "Informe seu telefone."),
    deliveryType: z.enum(["DELIVERY", "PICKUP"]),
    street: z.string(),
    number: z.string(),
    complement: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    paymentMethod: z
      .enum(["", "PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH"])
      .refine((value) => value !== "", "Selecione a forma de pagamento."),
    notes: z.string(),
  })
  .superRefine((values, context) => {
    if (values.deliveryType !== "DELIVERY") {
      return;
    }

    const requiredAddressFields = [
      ["street", values.street, "Informe a rua."],
      ["number", values.number, "Informe o número."],
      ["neighborhood", values.neighborhood, "Informe o bairro."],
      ["city", values.city, "Informe a cidade."],
      ["state", values.state, "Informe o estado."],
    ] as const;

    requiredAddressFields.forEach(([path, value, message]) => {
      if (!value.trim()) {
        context.addIssue({
          code: "custom",
          path: [path],
          message,
        });
      }
    });
  });

type CartViewProps = {
  restaurantConfig: RestaurantConfigResponse | null;
};

export function CartView({ restaurantConfig }: CartViewProps) {
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
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [itemPendingRemoval, setItemPendingRemoval] = useState<CartItem | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  const form = useForm<CheckoutDraft>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: checkout,
    values: checkout,
  });
  const deliveryType = useWatch({
    control: form.control,
    name: "deliveryType",
  });
  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  });
  const estimatedDeliveryFeeCents = deliveryType === "DELIVERY" ? 500 : 0;
  const totalCents = subtotalCents + estimatedDeliveryFeeCents;
  const restaurantOpen = restaurantConfig?.open !== false;
  const closedStoreMessage = restaurantOpen
    ? ""
    : formatClosedStoreMessage(restaurantConfig?.nextOpeningAt);

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

  function fillAddress(address: AddressSelection) {
    const addressFields = {
      street: address.street,
      number: address.number,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    } as const;

    Object.entries(addressFields).forEach(([field, value]) => {
      form.setValue(field as keyof typeof addressFields, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });

    updateCheckout({
      ...form.getValues(),
      ...addressFields,
    });
  }

  function persistRegisteredField(event: ChangeEvent<HTMLFormElement>) {
    const field = event.target;

    if (
      (field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement) &&
      field.name
    ) {
      updateCheckout(form.getValues());
    }
  }

  async function submitOrder(values: CheckoutDraft) {
    setCheckoutError("");

    if (!restaurantOpen || !confirmed) {
      if (!confirmed) {
        setCheckoutError("Confirme os dados antes de enviar.");
      }
      return;
    }

    setSubmitting(true);

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
                  complement: values.complement,
                  neighborhood: values.neighborhood,
                  city: values.city,
                  state: values.state,
                  zipCode: values.zipCode,
                }
              : undefined,
          paymentMethod: values.paymentMethod,
          notes: values.notes,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            upsellCampaignId: item.upsellCampaignId,
            observations: item.observations,
            options: item.options.map((option) => ({
              groupId: option.groupId,
              itemId: option.itemId,
            })),
          })),
        }),
      });

      completeOrder(order);
      setConfirmed(false);
      setStep(1);
      form.reset({
        customerName: "",
        customerPhone: "",
        deliveryType: "DELIVERY",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        paymentMethod: "",
        notes: "",
      });
    } catch {
      setCheckoutError("Não foi possível enviar o pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <CartPageContent>
        <CartPageHeader>
          <CartPageTitleRow>
            <BackButton
              onClick={() => (step === 2 ? setStep(1) : router.push("/"))}
            />
            <CartPageTitle>Seu pedido</CartPageTitle>
            <CartCount>{items.length} item(ns)</CartCount>
          </CartPageTitleRow>
          <CartPageText>
            {step === 1
              ? "Revise os produtos antes de continuar."
              : "Informe entrega, pagamento e confirme o pedido."}
          </CartPageText>
        </CartPageHeader>

        <StepIndicator aria-label="Etapas do pedido">
          <StepItem active={step === 1}>
            <StepNumber active={step === 1}>1</StepNumber>
            Produtos
          </StepItem>
          <StepItem active={step === 2}>
            <StepNumber active={step === 2}>2</StepNumber>
            Conclusão
          </StepItem>
        </StepIndicator>

        {items.length === 0 && lastOrder ? (
          <SuccessBox>
            Pedido confirmado. Status: {lastOrder.status}. Pagamento:{" "}
            {paymentMethods.find((method) => method.value === lastOrder.paymentMethod)
              ?.label ?? lastOrder.paymentMethod}
          </SuccessBox>
        ) : null}

        <CartCard>
          {step === 1 ? (
            <>
              <ContinueShoppingButton type="button" onClick={() => router.push("/")}>
                <Plus size={16} />
                Adicionar mais itens
              </ContinueShoppingButton>

              <CartList>
                {items.length === 0 ? <EmptyCart>Pedido vazio.</EmptyCart> : null}
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
                          <CartItemQuantity
                            aria-label={`Quantidade: ${item.quantity}`}
                          >
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

              <UpsellBlock />

              <TotalsBox>
                <TotalGrand>
                  Subtotal <TotalStrong>{money(subtotalCents)}</TotalStrong>
                </TotalGrand>
              </TotalsBox>

              <CartStepAction>
                <Button
                  type="button"
                  disabled={items.length === 0}
                  onClick={() => setStep(2)}
                >
                  Continuar
                </Button>
              </CartStepAction>
            </>
          ) : (
            <CheckoutForm
              onSubmit={form.handleSubmit(submitOrder)}
              onChange={persistRegisteredField}
            >
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft size={16} />
                Voltar para produtos
              </Button>

              <CheckoutSection>
                <CheckoutSectionTitle>Como deseja receber?</CheckoutSectionTitle>
                <DeliveryToggleGrid>
                  <DeliveryButton
                    type="button"
                    selected={deliveryType === "DELIVERY"}
                    onClick={() => {
                      form.setValue("deliveryType", "DELIVERY", {
                        shouldDirty: true,
                      });
                      updateCheckout({
                        ...form.getValues(),
                        deliveryType: "DELIVERY",
                      });
                    }}
                  >
                    <Bike size={16} />
                    Entrega
                  </DeliveryButton>
                  <DeliveryButton
                    type="button"
                    selected={deliveryType === "PICKUP"}
                    onClick={() => {
                      form.setValue("deliveryType", "PICKUP", {
                        shouldDirty: true,
                      });
                      updateCheckout({
                        ...form.getValues(),
                        deliveryType: "PICKUP",
                      });
                    }}
                  >
                    <Store size={16} />
                    Retirada
                  </DeliveryButton>
                </DeliveryToggleGrid>
              </CheckoutSection>

              <CheckoutSection>
                <CheckoutSectionTitle>Seus dados</CheckoutSectionTitle>
                <Field
                  label="Nome"
                  error={form.formState.errors.customerName?.message}
                >
                  <Input autoComplete="name" {...form.register("customerName")} />
                </Field>
                <Field
                  label="WhatsApp"
                  error={form.formState.errors.customerPhone?.message}
                >
                  <Input
                    type="tel"
                    autoComplete="tel"
                    {...form.register("customerPhone")}
                  />
                </Field>
              </CheckoutSection>

              {deliveryType === "DELIVERY" ? (
                <CheckoutSection>
                  <CheckoutSectionTitle>Endereço de entrega</CheckoutSectionTitle>
                  <DeliveryFields>
                    <AddressAutocomplete onSelect={fillAddress} />
                    <Field
                      label="Rua"
                      error={form.formState.errors.street?.message}
                    >
                      <Input autoComplete="address-line1" {...form.register("street")} />
                    </Field>
                    <AddressGrid>
                      <Field
                        label="Número"
                        error={form.formState.errors.number?.message}
                      >
                        <Input {...form.register("number")} />
                      </Field>
                      <Field
                        label="Bairro"
                        error={form.formState.errors.neighborhood?.message}
                      >
                        <Input {...form.register("neighborhood")} />
                      </Field>
                    </AddressGrid>
                    <Field label="Complemento">
                      <Input autoComplete="address-line2" {...form.register("complement")} />
                    </Field>
                    <AddressGrid>
                      <Field
                        label="Cidade"
                        error={form.formState.errors.city?.message}
                      >
                        <Input autoComplete="address-level2" {...form.register("city")} />
                      </Field>
                      <Field
                        label="Estado"
                        error={form.formState.errors.state?.message}
                      >
                        <Input
                          maxLength={2}
                          autoComplete="address-level1"
                          {...form.register("state")}
                        />
                      </Field>
                    </AddressGrid>
                    <Field label="CEP">
                      <Input
                        inputMode="numeric"
                        autoComplete="postal-code"
                        {...form.register("zipCode")}
                      />
                    </Field>
                  </DeliveryFields>
                </CheckoutSection>
              ) : null}

              <CheckoutSection>
                <CheckoutSectionTitle>Forma de pagamento</CheckoutSectionTitle>
                <PaymentGrid>
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;

                    return (
                      <DeliveryButton
                        key={method.value}
                        type="button"
                        selected={paymentMethod === method.value}
                        onClick={() => {
                          form.setValue("paymentMethod", method.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                          updateCheckout({
                            ...form.getValues(),
                            paymentMethod: method.value,
                          });
                        }}
                      >
                        <Icon size={16} />
                        {method.label}
                      </DeliveryButton>
                    );
                  })}
                </PaymentGrid>
                {form.formState.errors.paymentMethod ? (
                  <CheckoutError>
                    {form.formState.errors.paymentMethod.message}
                  </CheckoutError>
                ) : null}
              </CheckoutSection>

              <Field label="Observações do pedido">
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

              <CheckoutConfirmation>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                />
                <CheckoutConfirmationText>
                  Revisei produtos, dados de entrega e pagamento. Confirmo o
                  envio deste pedido.
                </CheckoutConfirmationText>
              </CheckoutConfirmation>

              {checkoutError ? (
                <CheckoutError role="alert">{checkoutError}</CheckoutError>
              ) : null}
              {!restaurantOpen ? (
                <CheckoutError role="status">{closedStoreMessage}</CheckoutError>
              ) : null}

              <Button
                type="submit"
                disabled={
                  items.length === 0 ||
                  !restaurantOpen ||
                  !confirmed ||
                  submitting
                }
              >
                {submitting ? "Enviando..." : "Confirmar pedido"}
              </Button>
            </CheckoutForm>
          )}
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
            aria-label="Confirmar remoção de item"
            aria-describedby="cart-removal-message"
            onClick={(event) => event.stopPropagation()}
          >
            <CartRemovalMessage id="cart-removal-message">
              Deseja remover <strong>{itemPendingRemoval.name}</strong> do seu
              pedido?
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
