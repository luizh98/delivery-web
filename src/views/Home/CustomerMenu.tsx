"use client";

import { useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bike,
  Check,
  Minus,
  Plus,
  ReceiptText,
  ShoppingCart,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Field, Input, Textarea } from "@/components/Field";
import { PageShell } from "@/components/PageShell";
import { clientApi } from "@/services/api/client";
import { money } from "@/utils/format";
import type { CustomerMenuProps } from "./types";
import type {
  OrderResponse,
  Product,
  ProductOptionGroup,
  ProductOptionItem,
} from "@/types/api";
import {
  AddressGrid,
  CartCard,
  CartCount,
  CartHeader,
  CartItem,
  CartItemHeader,
  CartItemName,
  CartItemTotal,
  CartList,
  CartTitle,
  CategoryBar,
  CategoryButton,
  CategoryList,
  CategoryProducts,
  CategorySection,
  CategoryTitle,
  CheckoutError,
  CheckoutForm,
  CloseButton,
  ContentGrid,
  DeliveryButton,
  DeliveryFields,
  DeliveryToggleGrid,
  DesktopCart,
  Empty,
  EmptyCart,
  Eyebrow,
  FlagBadge,
  FlagBadges,
  Hero,
  HeroBanner,
  HeroBody,
  HeroText,
  HeroTitle,
  MobileCart,
  MobileCartBody,
  MobileSummary,
  MobileSummaryLabel,
  MobileTotal,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProductImage,
  ModalText,
  ModalTitle,
  Muted,
  OptionButton,
  OptionGroup,
  OptionGroupTitle,
  OptionPrice,
  ProductCard,
  ProductDescription,
  ProductImage,
  ProductInfo,
  ProductList,
  ProductName,
  ProductPrice,
  QuantityButton,
  QuantityControl,
  QuantityRow,
  QuantityValue,
  RemoveButton,
  SuccessBox,
  TotalGrand,
  TotalRow,
  TotalStrong,
  TotalsBox,
} from "./styles";

type CartOption = {
  groupId: string;
  groupName: string;
  itemId: string;
  itemName: string;
  priceCents: number;
};

type CartItem = {
  lineId: string;
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  observations?: string;
  options: CartOption[];
  totalCents: number;
};

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Informe seu nome."),
  customerPhone: z.string().min(8, "Informe seu telefone."),
  deliveryType: z.enum(["DELIVERY", "PICKUP"]),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;
type ProductFlagField = "adultOnly" | "glutenFree" | "lactoseFree" | "vegetarian";
type ProductFlagStyle = "flagAdult" | "flagGluten" | "flagLactose" | "flagVegetarian";
type ProductFlagTone = "adult" | "gluten" | "lactose" | "vegetarian";

const PRODUCT_FLAGS: {
  field: ProductFlagField;
  label: string;
  styleClass: ProductFlagStyle;
}[] = [
  { field: "adultOnly", label: "+18", styleClass: "flagAdult" },
  { field: "glutenFree", label: "Sem gluten", styleClass: "flagGluten" },
  { field: "lactoseFree", label: "Sem lactose", styleClass: "flagLactose" },
  { field: "vegetarian", label: "Vegetariano", styleClass: "flagVegetarian" },
];

const flagTones: Record<ProductFlagStyle, ProductFlagTone> = {
  flagAdult: "adult",
  flagGluten: "gluten",
  flagLactose: "lactose",
  flagVegetarian: "vegetarian",
};

function activeProductFlags(product: Product) {
  return PRODUCT_FLAGS.filter(({ field }) => product[field] ?? false);
}

export function CustomerMenu({ restaurantConfig, menu }: CustomerMenuProps) {
  const initialCategoryId =
    menu.categories.find((category) =>
      menu.products.some((product) => product.categoryId === category.id),
    )?.id ?? "";
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ProductOptionItem[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryType: "DELIVERY",
    },
  });

  const productsByCategory = useMemo(() => {
    const groups = new Map<string, Product[]>();

    menu.categories.forEach((category) => groups.set(category.id, []));
    menu.products.forEach((product) => {
      groups.get(product.categoryId)?.push(product);
    });

    return groups;
  }, [menu.categories, menu.products]);

  const visibleCategories = useMemo(
    () =>
      menu.categories.filter(
        (category) => (productsByCategory.get(category.id)?.length ?? 0) > 0,
      ),
    [menu.categories, productsByCategory],
  );

  const subtotalCents = cart.reduce((sum, item) => sum + item.totalCents, 0);
  const deliveryType = useWatch({
    control: form.control,
    name: "deliveryType",
  });
  const estimatedDeliveryFeeCents = deliveryType === "DELIVERY" ? 500 : 0;
  const selectedProductFlags = selectedProduct ? activeProductFlags(selectedProduct) : [];

  function handleCategoryClick(categoryId: string) {
    setActiveCategoryId(categoryId);
    const section = sectionRefs.current[categoryId];

    section?.focus({ preventScroll: true });
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedOptions({});
    setQuantity(1);
    setObservations("");
  }

  function toggleOption(group: ProductOptionGroup, option: ProductOptionItem) {
    const groupId = group.id ?? group.name;
    const selected = selectedOptions[groupId] ?? [];
    const exists = selected.some((item) => item.id === option.id);
    const maxSelections = group.maxSelections > 0 ? group.maxSelections : 1;
    const nextItems = exists
      ? selected.filter((item) => item.id !== option.id)
      : [...selected.slice(Math.max(0, selected.length + 1 - maxSelections)), option];

    setSelectedOptions({
      ...selectedOptions,
      [groupId]: nextItems,
    });
  }

  function addSelectedProduct() {
    if (!selectedProduct) {
      return;
    }

    const options = selectedProduct.optionGroups
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

    const optionsTotalCents = options.reduce((sum, option) => sum + option.priceCents, 0);
    const totalCents = (selectedProduct.priceCents + optionsTotalCents) * quantity;

    setCart((items) => [
      ...items,
      {
        lineId: crypto.randomUUID(),
        productId: selectedProduct.id,
        name: selectedProduct.name,
        quantity,
        unitPriceCents: selectedProduct.priceCents,
        observations,
        options,
        totalCents,
      },
    ]);
    setSelectedProduct(null);
  }

  async function submitOrder(values: CheckoutForm) {
    setCheckoutError("");
    setCreatedOrder(null);

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
          items: cart.map((item) => ({
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

      setCreatedOrder(order);
      setCart([]);
      form.reset({ deliveryType: "DELIVERY" });
    } catch {
      setCheckoutError("Nao foi possivel enviar o pedido.");
    }
  }

  return (
    <PageShell bottomPad>
      <Hero>
        <HeroBanner
          style={{
            backgroundImage: restaurantConfig?.bannerUrl
              ? `url(${restaurantConfig.bannerUrl})`
              : "linear-gradient(135deg, var(--tenant-primary), var(--tenant-secondary))",
          }}
        />
        <HeroBody>
          <Eyebrow>Cardapio</Eyebrow>
          <HeroTitle>
            {restaurantConfig?.name ?? "Delivery"}
          </HeroTitle>
          <HeroText>
            {restaurantConfig?.menuDescription?.trim() ||
              "Escolha seus itens, revise o carrinho e envie o pedido."}
          </HeroText>
        </HeroBody>
      </Hero>

      {visibleCategories.length > 0 ? (
        <CategoryBar>
          <CategoryList>
            {visibleCategories.map((category) => (
              <CategoryButton
                key={category.id}
                active={activeCategoryId === category.id}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </CategoryButton>
            ))}
          </CategoryList>
        </CategoryBar>
      ) : null}

      <ContentGrid>
        <ProductList>
          {visibleCategories.length === 0 ? (
            <Empty>
              Nenhum produto cadastrado para este tenant.
            </Empty>
          ) : null}

          {visibleCategories.map((category) => (
            <CategorySection
              key={category.id}
              ref={(element: HTMLElement | null) => {
                sectionRefs.current[category.id] = element;
              }}
              tabIndex={-1}
              aria-labelledby={`category-${category.id}`}
            >
              <CategoryTitle id={`category-${category.id}`}>
                {category.name}
              </CategoryTitle>
              <CategoryProducts>
                {(productsByCategory.get(category.id) ?? []).map((product) => {
                  const flags = activeProductFlags(product);

                  return (
                    <ProductCard
                      key={product.id}
                      onClick={() => openProduct(product)}
                    >
                      <ProductInfo>
                        <ProductName>{product.name}</ProductName>
                        <ProductDescription>
                          {product.description || "Sem descricao."}
                        </ProductDescription>
                        {flags.length > 0 ? (
                          <FlagBadges>
                            {flags.map((flag) => (
                              <FlagBadge
                                key={flag.field}
                                tone={flagTones[flag.styleClass]}
                              >
                                {flag.label}
                              </FlagBadge>
                            ))}
                          </FlagBadges>
                        ) : null}
                        <ProductPrice>
                          {money(product.priceCents)}
                        </ProductPrice>
                      </ProductInfo>
                      <ProductImage
                        style={{
                          backgroundImage: product.imageUrl
                            ? `url(${product.imageUrl})`
                            : "linear-gradient(135deg, #edf2f7, #dbe4ee)",
                        }}
                      />
                    </ProductCard>
                  );
                })}
              </CategoryProducts>
            </CategorySection>
          ))}
        </ProductList>

        <DesktopCart>
          <CartPanel
            cart={cart}
            subtotalCents={subtotalCents}
            deliveryFeeCents={estimatedDeliveryFeeCents}
            removeItem={(lineId) =>
              setCart((items) => items.filter((item) => item.lineId !== lineId))
            }
            form={form}
            checkoutError={checkoutError}
            createdOrder={createdOrder}
            onSubmit={submitOrder}
          />
        </DesktopCart>
      </ContentGrid>

      <MobileCart>
        <details>
          <MobileSummary>
            <MobileSummaryLabel>
              <ShoppingCart size={18} />
              Carrinho ({cart.length})
            </MobileSummaryLabel>
            <MobileTotal>{money(subtotalCents)}</MobileTotal>
          </MobileSummary>
          <MobileCartBody>
            <CartPanel
              cart={cart}
              subtotalCents={subtotalCents}
              deliveryFeeCents={estimatedDeliveryFeeCents}
              removeItem={(lineId) =>
                setCart((items) => items.filter((item) => item.lineId !== lineId))
              }
              form={form}
              checkoutError={checkoutError}
              createdOrder={createdOrder}
              onSubmit={submitOrder}
            />
          </MobileCartBody>
        </details>
      </MobileCart>

      {selectedProduct ? (
        <ModalOverlay>
          <Modal>
            {selectedProduct.imageUrl ? (
              <ModalProductImage
                role="img"
                aria-label={`Foto de ${selectedProduct.name}`}
                style={{ backgroundImage: `url(${selectedProduct.imageUrl})` }}
              />
            ) : null}
            <ModalHeader>
              <div>
                <ModalTitle>{selectedProduct.name}</ModalTitle>
                <ModalText>{selectedProduct.description}</ModalText>
                {selectedProductFlags.length > 0 ? (
                  <FlagBadges>
                    {selectedProductFlags.map((flag) => (
                      <FlagBadge
                        key={flag.field}
                        tone={flagTones[flag.styleClass]}
                      >
                        {flag.label}
                      </FlagBadge>
                    ))}
                  </FlagBadges>
                ) : null}
              </div>
              <CloseButton
                onClick={() => setSelectedProduct(null)}
                aria-label="Fechar"
              >
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <ModalContent>
              {selectedProduct.optionGroups
                .filter((group) => !group.deleted)
                .map((group) => (
                <OptionGroup key={group.id ?? group.name}>
                  <div>
                    <OptionGroupTitle>{group.name}</OptionGroupTitle>
                    <Muted>
                      {group.required ? "Obrigatorio" : "Opcional"} - selecione ate{" "}
                      {group.maxSelections || 1}
                    </Muted>
                  </div>
                  {group.items
                    .filter((item) => item.active && !item.deleted)
                    .map((item) => {
                    const groupId = group.id ?? group.name;
                    const selected = (selectedOptions[groupId] ?? []).some(
                      (option) => option.id === item.id,
                    );

                    return (
                      <OptionButton
                        key={item.id ?? item.name}
                        selected={selected}
                        onClick={() => toggleOption(group, item)}
                      >
                        <span>{item.name}</span>
                        <OptionPrice>
                          {money(item.priceCents)}
                          {selected ? <Check size={16} /> : null}
                        </OptionPrice>
                      </OptionButton>
                    );
                    })}
                </OptionGroup>
                ))}

              <Field label="Observacao">
                <Textarea
                  value={observations}
                  onChange={(event) => setObservations(event.target.value)}
                  placeholder="Ex: sem cebola, ponto da carne..."
                />
              </Field>

              <QuantityRow>
                <QuantityControl>
                  <QuantityButton
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    aria-label="Diminuir"
                  >
                    <Minus size={16} />
                  </QuantityButton>
                  <QuantityValue>{quantity}</QuantityValue>
                  <QuantityButton
                    onClick={() => setQuantity((value) => value + 1)}
                    aria-label="Aumentar"
                  >
                    <Plus size={16} />
                  </QuantityButton>
                </QuantityControl>
                <Button onClick={addSelectedProduct}>
                  <ShoppingCart size={16} />
                  Adicionar
                </Button>
              </QuantityRow>
            </ModalContent>
          </Modal>
        </ModalOverlay>
      ) : null}
    </PageShell>
  );
}
type CartPanelProps = {
  cart: CartItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  removeItem: (lineId: string) => void;
  form: ReturnType<typeof useForm<CheckoutForm>>;
  checkoutError: string;
  createdOrder: OrderResponse | null;
  onSubmit: (values: CheckoutForm) => Promise<void>;
};

function CartPanel({
  cart,
  subtotalCents,
  deliveryFeeCents,
  removeItem,
  form,
  checkoutError,
  createdOrder,
  onSubmit,
}: CartPanelProps) {
  const totalCents = subtotalCents + deliveryFeeCents;
  const deliveryType = useWatch({
    control: form.control,
    name: "deliveryType",
  });

  return (
    <CartCard>
      <CartHeader>
        <CartTitle>
          <ReceiptText size={18} />
          Seu pedido
        </CartTitle>
        <CartCount>{cart.length} item(ns)</CartCount>
      </CartHeader>

      <CartList>
        {cart.length === 0 ? (
          <EmptyCart>
            Carrinho vazio.
          </EmptyCart>
        ) : null}
        {cart.map((item) => (
          <CartItem key={item.lineId}>
            <CartItemHeader>
              <div>
                <CartItemName>
                  {item.quantity}x {item.name}
                </CartItemName>
                {item.options.map((option) => (
                  <Muted key={`${option.groupId}-${option.itemId}`}>
                    + {option.groupName}: {option.itemName}
                  </Muted>
                ))}
                {item.observations ? (
                  <Muted>Obs: {item.observations}</Muted>
                ) : null}
              </div>
              <RemoveButton
                onClick={() => removeItem(item.lineId)}
                aria-label="Remover item"
              >
                <Trash2 size={16} />
              </RemoveButton>
            </CartItemHeader>
            <CartItemTotal>{money(item.totalCents)}</CartItemTotal>
          </CartItem>
        ))}
      </CartList>

      <CheckoutForm onSubmit={form.handleSubmit(onSubmit)}>
        <DeliveryToggleGrid>
          <DeliveryButton
            type="button"
            selected={deliveryType === "DELIVERY"}
            onClick={() => form.setValue("deliveryType", "DELIVERY")}
          >
            <Bike size={16} />
            Entrega
          </DeliveryButton>
          <DeliveryButton
            type="button"
            selected={deliveryType === "PICKUP"}
            onClick={() => form.setValue("deliveryType", "PICKUP")}
          >
            <Store size={16} />
            Retirada
          </DeliveryButton>
        </DeliveryToggleGrid>

        <Field label="Nome" error={form.formState.errors.customerName?.message}>
          <Input {...form.register("customerName")} />
        </Field>
        <Field label="WhatsApp" error={form.formState.errors.customerPhone?.message}>
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
            Frete <strong>{money(deliveryFeeCents)}</strong>
          </TotalRow>
          <TotalGrand>
            Total <TotalStrong>{money(totalCents)}</TotalStrong>
          </TotalGrand>
        </TotalsBox>

        {checkoutError ? <CheckoutError>{checkoutError}</CheckoutError> : null}
        {createdOrder ? (
          <SuccessBox>
            Pedido enviado. Status: {createdOrder.status}
          </SuccessBox>
        ) : null}

        <Button type="submit" disabled={cart.length === 0}>
          Enviar pedido
        </Button>
      </CheckoutForm>
    </CartCard>
  );
}
