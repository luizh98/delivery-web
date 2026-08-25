"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Banknote,
  Bike,
  ChevronLeft,
  CreditCard,
  MapPin,
  Minus,
  Pencil,
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
import { useCustomerAuth } from "@/components/CustomerAuthProvider";
import {
  type CartItem,
  type CheckoutDraft,
  useCart,
} from "@/components/CartProvider";
import { Field, Input } from "@/components/Field";
import { PageShell } from "@/components/PageShell";
import { clientApi } from "@/services/api/client";
import type {
  Address,
  DeliveryQuoteResponse,
  OrderResponse,
  RestaurantConfigResponse,
} from "@/types/api";
import {
  formatBrazilianMobileInput,
  isValidBrazilianMobile,
  normalizeBrazilianMobile,
} from "@/utils/customerInput";
import { money, reaisToCents } from "@/utils/format";
import { formatClosedStoreMessage } from "@/utils/storeAvailability";
import {
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
  DeliveryToggleGrid,
  EmptyCart,
  Muted,
  TotalGrand,
  TotalRow,
  TotalStrong,
  TotalsBox,
} from "@/views/Home/styles";
import { UpsellBlock } from "./UpsellBlock";
import {
  AddressSelectAction,
  AddressSummaryCard,
  AddressSummaryContent,
  AddressSummaryEditButton,
  AddressSummaryIcon,
  AddressSummaryText,
  AddressSummaryTitle,
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
    customerPhone: z.string().refine(
      isValidBrazilianMobile,
      "Informe um celular válido com DDD.",
    ),
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
    changeForReais: z
      .number({ message: "Informe um valor válido." })
      .min(0, "O valor do troco não pode ser negativo."),
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
  initialStep?: 1 | 2;
};

function formatAddressLines(address?: Address | null) {
  const street = [address?.street?.trim(), address?.number?.trim()]
    .filter(Boolean)
    .join(", ");
  const cityState = [address?.city?.trim(), address?.state?.trim()]
    .filter(Boolean)
    .join(" - ");
  const neighborhood = [address?.neighborhood?.trim(), cityState]
    .filter(Boolean)
    .join(", ");

  return [street, address?.complement?.trim(), neighborhood, address?.zipCode?.trim()]
    .filter((line): line is string => Boolean(line));
}

export function CartView({ restaurantConfig, initialStep = 1 }: CartViewProps) {
  const router = useRouter();
  const { customer, loading: customerLoading } = useCustomerAuth();
  const appliedCustomerId = useRef<string | null>(null);
  const {
    items,
    checkout,
    subtotalCents,
    updateItemQuantity,
    removeItem,
    updateCheckout,
    completeOrder,
  } = useCart();
  const [step, setStep] = useState<1 | 2>(initialStep);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [itemPendingRemoval, setItemPendingRemoval] = useState<CartItem | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuoteResponse | null>(null);
  const [deliveryQuoteKey, setDeliveryQuoteKey] = useState("");
  const [deliveryQuoteLoading, setDeliveryQuoteLoading] = useState(false);
  const [deliveryQuoteError, setDeliveryQuoteError] = useState("");

  const form = useForm<CheckoutDraft>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      ...checkout,
      customerPhone: formatBrazilianMobileInput(checkout.customerPhone),
    },
    values: {
      ...checkout,
      customerPhone: formatBrazilianMobileInput(checkout.customerPhone),
    },
  });
  const deliveryType = useWatch({
    control: form.control,
    name: "deliveryType",
  });
  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  });
  const minimumOrderCents = restaurantConfig?.minimumOrderCents ?? 0;
  const belowMinimumOrder = minimumOrderCents > 0 && subtotalCents < minimumOrderCents;
  const discountCents = items.reduce(
    (sum, item) => sum + (item.discountAmountCents ?? 0),
    0,
  );
  const originalSubtotalCents = subtotalCents + discountCents;
  const restaurantOpen = restaurantConfig?.open !== false;
  const closedStoreMessage = restaurantOpen
    ? ""
    : formatClosedStoreMessage(restaurantConfig?.nextOpeningAt);
  const hasSavedDeliveryAddress = Boolean(
    checkout.street.trim() &&
      checkout.number.trim() &&
      checkout.neighborhood.trim() &&
      checkout.city.trim() &&
      checkout.state.trim(),
  );
  const savedDeliveryAddress: Address | null = hasSavedDeliveryAddress
    ? {
        street: checkout.street,
        number: checkout.number,
        complement: checkout.complement,
        neighborhood: checkout.neighborhood,
        city: checkout.city,
        state: checkout.state,
        zipCode: checkout.zipCode,
      }
    : null;
  const pickupAddressLines = formatAddressLines(restaurantConfig?.address);
  const currentDeliveryQuoteKey = JSON.stringify([
    checkout.street,
    checkout.number,
    checkout.complement,
    checkout.neighborhood,
    checkout.city,
    checkout.state,
    checkout.zipCode,
    subtotalCents,
  ]);
  const currentDeliveryQuote = deliveryType === "DELIVERY" &&
    deliveryQuoteKey === currentDeliveryQuoteKey
    ? deliveryQuote
    : null;
  const currentDeliveryQuoteError = deliveryType === "DELIVERY" &&
    deliveryQuoteKey === currentDeliveryQuoteKey
    ? deliveryQuoteError
    : "";
  const currentDeliveryQuoteLoading = deliveryType === "DELIVERY" &&
    deliveryQuoteKey === currentDeliveryQuoteKey && deliveryQuoteLoading;
  const estimatedDeliveryFeeCents = currentDeliveryQuote?.deliveryFeeCents ?? 0;
  const totalCents = subtotalCents + estimatedDeliveryFeeCents;

  useEffect(() => {
    if (customerLoading || !customer || appliedCustomerId.current === customer.id) {
      return;
    }

    const current = form.getValues();
    const address = customer.savedAddress;
    const populated: CheckoutDraft = {
      ...current,
      customerName: customer.name,
      customerPhone: formatBrazilianMobileInput(customer.phone),
      street: address?.street ?? current.street,
      number: address?.number ?? current.number,
      complement: address?.complement ?? current.complement,
      neighborhood: address?.neighborhood ?? current.neighborhood,
      city: address?.city ?? current.city,
      state: address?.state ?? current.state,
      zipCode: address?.zipCode ?? current.zipCode,
    };
    appliedCustomerId.current = customer.id;
    form.reset(populated);
    updateCheckout(populated);
  }, [customer, customerLoading, form, updateCheckout]);

  useEffect(() => {
    if (step !== 2 || deliveryType !== "DELIVERY" || !hasSavedDeliveryAddress) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setDeliveryQuoteKey(currentDeliveryQuoteKey);
      setDeliveryQuote(null);
      setDeliveryQuoteError("");
      setDeliveryQuoteLoading(true);

      try {
        const quote = await clientApi<DeliveryQuoteResponse>(
          "public/delivery/quote",
          {
            method: "POST",
            signal: controller.signal,
            body: JSON.stringify({
              subtotalCents,
              deliveryAddress: {
                street: checkout.street,
                number: checkout.number,
                complement: checkout.complement,
                neighborhood: checkout.neighborhood,
                city: checkout.city,
                state: checkout.state,
                zipCode: checkout.zipCode,
              },
            }),
          },
        );
        setDeliveryQuote(quote);
      } catch {
        if (!controller.signal.aborted) {
          setDeliveryQuoteError(
            "Não foi possível calcular o frete. Verifique se o endereço está na área de entrega.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setDeliveryQuoteLoading(false);
        }
      }
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [
    checkout.city,
    checkout.complement,
    checkout.neighborhood,
    checkout.number,
    checkout.state,
    checkout.street,
    checkout.zipCode,
    currentDeliveryQuoteKey,
    deliveryType,
    hasSavedDeliveryAddress,
    step,
    subtotalCents,
  ]);

  const deliveryQuotePending = deliveryType === "DELIVERY" &&
    hasSavedDeliveryAddress &&
    (currentDeliveryQuoteLoading || !currentDeliveryQuote);

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

    if (!restaurantOpen || !confirmed || belowMinimumOrder) {
      if (!confirmed) {
        setCheckoutError("Confirme os dados antes de enviar.");
      } else if (belowMinimumOrder) {
        setCheckoutError(`O pedido mínimo é ${money(minimumOrderCents)}.`);
      }
      return;
    }

    setSubmitting(true);

    try {
      const order = await clientApi<OrderResponse>("public/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: values.customerName,
          customerPhone: normalizeBrazilianMobile(values.customerPhone),
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
          changeForCents:
            values.paymentMethod === "CASH"
              ? reaisToCents(values.changeForReais)
              : 0,
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

      if (!order.trackingCode) {
        throw new Error("Order tracking code was not returned.");
      }

      completeOrder(order);
      router.replace(`/orders/${encodeURIComponent(order.trackingCode)}`);
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
                  Subtotal <TotalStrong>{money(originalSubtotalCents)}</TotalStrong>
                </TotalGrand>
                {discountCents > 0 ? (
                  <TotalRow>
                    Desconto <strong>- {money(discountCents)}</strong>
                  </TotalRow>
                ) : null}
                {belowMinimumOrder ? (
                  <CheckoutError role="status">
                    Pedido mínimo: {money(minimumOrderCents)}.
                  </CheckoutError>
                ) : null}
              </TotalsBox>

              <CartStepAction>
                <Button
                  type="button"
                  disabled={items.length === 0 || belowMinimumOrder}
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

              {deliveryType === "DELIVERY" ? (
                <CheckoutSection>
                  <CheckoutSectionTitle>Endereço de entrega</CheckoutSectionTitle>
                  {savedDeliveryAddress ? (
                    <AddressSummaryCard>
                      <AddressSummaryIcon>
                        <MapPin size={16} />
                      </AddressSummaryIcon>
                      <AddressSummaryContent>
                        <AddressSummaryTitle>
                          Endereço selecionado
                        </AddressSummaryTitle>
                        {formatAddressLines(savedDeliveryAddress).map(
                          (line, index) => (
                            <AddressSummaryText key={`${line}-${index}`}>
                              {line}
                            </AddressSummaryText>
                          ),
                        )}
                      </AddressSummaryContent>
                      <AddressSummaryEditButton
                        type="button"
                        aria-label="Alterar endereço de entrega"
                        onClick={() => router.push("/cart/address")}
                      >
                        <Pencil size={16} />
                      </AddressSummaryEditButton>
                    </AddressSummaryCard>
                  ) : (
                    <AddressSelectAction>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/cart/address")}
                      >
                        <MapPin size={16} />
                        Selecionar endereço
                      </Button>
                    </AddressSelectAction>
                  )}
                </CheckoutSection>
              ) : (
                <CheckoutSection>
                  <CheckoutSectionTitle>Endereço de retirada</CheckoutSectionTitle>
                  <AddressSummaryCard>
                    <AddressSummaryIcon>
                      <Store size={16} />
                    </AddressSummaryIcon>
                    <AddressSummaryContent>
                      <AddressSummaryTitle>
                        Retire no restaurante
                      </AddressSummaryTitle>
                      {pickupAddressLines.length > 0 ? (
                        pickupAddressLines.map((line, index) => (
                          <AddressSummaryText key={`${line}-${index}`}>
                            {line}
                          </AddressSummaryText>
                        ))
                      ) : (
                        <AddressSummaryText>
                          Endereço de retirada não configurado.
                        </AddressSummaryText>
                      )}
                    </AddressSummaryContent>
                  </AddressSummaryCard>
                </CheckoutSection>
              )}

              <CheckoutSection>
                <CheckoutSectionTitle>Seus dados</CheckoutSectionTitle>
                <Field
                  label="Nome"
                  error={form.formState.errors.customerName?.message}
                >
                  <Input autoComplete="name" {...form.register("customerName")} />
                </Field>
                <Field
                  label="Celular"
                  error={form.formState.errors.customerPhone?.message}
                >
                  <Input
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={17}
                    {...form.register("customerPhone")}
                    onInput={(event) => {
                      event.currentTarget.value = formatBrazilianMobileInput(
                        event.currentTarget.value,
                      );
                    }}
                  />
                </Field>
              </CheckoutSection>

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
                          const changeForReais =
                            method.value === "CASH"
                              ? form.getValues("changeForReais")
                              : 0;
                          form.setValue("paymentMethod", method.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                          form.setValue("changeForReais", changeForReais, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                          updateCheckout({
                            ...form.getValues(),
                            paymentMethod: method.value,
                            changeForReais,
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
                {paymentMethod === "CASH" ? (
                  <Field
                    label="Troco para quanto? (R$)"
                    error={form.formState.errors.changeForReais?.message}
                  >
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      {...form.register("changeForReais", {
                        valueAsNumber: true,
                      })}
                    />
                  </Field>
                ) : null}
              </CheckoutSection>

              <TotalsBox>
                <TotalRow>
                  Subtotal <strong>{money(originalSubtotalCents)}</strong>
                </TotalRow>
                {discountCents > 0 ? (
                  <TotalRow>
                    Desconto <strong>- {money(discountCents)}</strong>
                  </TotalRow>
                ) : null}
                <TotalRow>
                  Frete{" "}
                  <strong>
                    {currentDeliveryQuoteLoading
                      ? "Calculando..."
                      : currentDeliveryQuote?.freeDelivery
                        ? "Grátis"
                        : money(estimatedDeliveryFeeCents)}
                  </strong>
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
              {currentDeliveryQuoteError ? (
                <CheckoutError role="alert">{currentDeliveryQuoteError}</CheckoutError>
              ) : null}
              {!restaurantOpen ? (
                <CheckoutError role="status">{closedStoreMessage}</CheckoutError>
              ) : null}
              {belowMinimumOrder ? (
                <CheckoutError role="status">
                  Adicione mais itens para atingir o pedido mínimo de {money(minimumOrderCents)}.
                </CheckoutError>
              ) : null}

              <Button
                type="submit"
                disabled={
                  items.length === 0 ||
                  belowMinimumOrder ||
                  !restaurantOpen ||
                  deliveryQuotePending ||
                  Boolean(currentDeliveryQuoteError) ||
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
