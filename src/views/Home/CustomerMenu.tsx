"use client";

import { useMemo, useState } from "react";
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
import { cx } from "@/utils/classNames";
import { money } from "@/utils/format";
import type { CustomerMenuProps } from "./types";
import type {
  OrderResponse,
  Product,
  ProductOptionGroup,
  ProductOptionItem,
} from "@/types/api";
import styles from "./styles.module.css";

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

export function CustomerMenu({ restaurantConfig, menu }: CustomerMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState(menu.categories[0]?.id ?? "all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ProductOptionItem[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryType: "DELIVERY",
    },
  });

  const visibleProducts = useMemo(() => {
    if (selectedCategory === "all") {
      return menu.products;
    }
    return menu.products.filter((product) => product.categoryId === selectedCategory);
  }, [menu.products, selectedCategory]);

  const subtotalCents = cart.reduce((sum, item) => sum + item.totalCents, 0);
  const deliveryType = useWatch({
    control: form.control,
    name: "deliveryType",
  });
  const estimatedDeliveryFeeCents = deliveryType === "DELIVERY" ? 500 : 0;

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
    <PageShell className={styles.pageShellPad}>
      <header className={styles.hero}>
        <div
          className={styles.heroBanner}
          style={{
            backgroundImage: restaurantConfig?.bannerUrl
              ? `url(${restaurantConfig.bannerUrl})`
              : "linear-gradient(135deg, var(--tenant-primary), var(--tenant-secondary))",
          }}
        />
        <div className={styles.heroBody}>
          <p className={styles.eyebrow}>Cardapio</p>
          <h1 className={styles.heroTitle}>
            {restaurantConfig?.name ?? "Delivery"}
          </h1>
          <p className={styles.heroText}>
            Escolha seus itens, revise o carrinho e envie o pedido.
          </p>
        </div>
      </header>

      <div className={styles.categoryBar}>
        <div className={styles.categoryList}>
          <button
            className={cx(
              styles.categoryButton,
              selectedCategory === "all"
                ? styles.categoryButtonActive
                : styles.categoryButtonIdle,
            )}
            onClick={() => setSelectedCategory("all")}
          >
            Todos
          </button>
          {menu.categories.map((category) => (
            <button
              key={category.id}
              className={cx(
                styles.categoryButton,
                selectedCategory === category.id
                  ? styles.categoryButtonActive
                  : styles.categoryButtonIdle,
              )}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <section className={styles.contentGrid}>
        <div className={styles.productList}>
          {visibleProducts.length === 0 ? (
            <div className={styles.empty}>
              Nenhum produto cadastrado para este tenant.
            </div>
          ) : null}

          {visibleProducts.map((product) => (
            <button
              key={product.id}
              className={styles.productCard}
              onClick={() => openProduct(product)}
            >
              <span className={styles.productInfo}>
                <span className={styles.productName}>{product.name}</span>
                <span className={styles.productDescription}>
                  {product.description || "Sem descricao."}
                </span>
                <span className={styles.productPrice}>
                  {money(product.priceCents)}
                </span>
              </span>
              <span
                className={styles.productImage}
                style={{
                  backgroundImage: product.imageUrl
                    ? `url(${product.imageUrl})`
                    : "linear-gradient(135deg, #edf2f7, #dbe4ee)",
                }}
              />
            </button>
          ))}
        </div>

        <aside className={styles.desktopCart}>
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
        </aside>
      </section>

      <div className={styles.mobileCart}>
        <details>
          <summary className={styles.mobileSummary}>
            <span className={styles.mobileSummaryLabel}>
              <ShoppingCart size={18} />
              Carrinho ({cart.length})
            </span>
            <span className={styles.mobileTotal}>{money(subtotalCents)}</span>
          </summary>
          <div className={styles.mobileCartBody}>
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
          </div>
        </details>
      </div>

      {selectedProduct ? (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>{selectedProduct.name}</h2>
                <p className={styles.modalText}>{selectedProduct.description}</p>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedProduct(null)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              {selectedProduct.optionGroups
                .filter((group) => !group.deleted)
                .map((group) => (
                <div key={group.id ?? group.name} className={styles.optionGroup}>
                  <div>
                    <h3 className={styles.optionGroupTitle}>{group.name}</h3>
                    <p className={styles.muted}>
                      {group.required ? "Obrigatorio" : "Opcional"} · selecione ate{" "}
                      {group.maxSelections || 1}
                    </p>
                  </div>
                  {group.items
                    .filter((item) => item.active && !item.deleted)
                    .map((item) => {
                    const groupId = group.id ?? group.name;
                    const selected = (selectedOptions[groupId] ?? []).some(
                      (option) => option.id === item.id,
                    );

                    return (
                      <button
                        key={item.id ?? item.name}
                        className={cx(
                          styles.optionButton,
                          selected ? styles.optionButtonSelected : styles.optionButtonIdle,
                        )}
                        onClick={() => toggleOption(group, item)}
                      >
                        <span>{item.name}</span>
                        <span className={styles.optionPrice}>
                          {money(item.priceCents)}
                          {selected ? <Check size={16} /> : null}
                        </span>
                      </button>
                    );
                    })}
                </div>
                ))}

              <Field label="Observacao">
                <Textarea
                  value={observations}
                  onChange={(event) => setObservations(event.target.value)}
                  placeholder="Ex: sem cebola, ponto da carne..."
                />
              </Field>

              <div className={styles.quantityRow}>
                <div className={styles.quantityControl}>
                  <button
                    className={styles.quantityButton}
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    aria-label="Diminuir"
                  >
                    <Minus size={16} />
                  </button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <button
                    className={styles.quantityButton}
                    onClick={() => setQuantity((value) => value + 1)}
                    aria-label="Aumentar"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <Button onClick={addSelectedProduct}>
                  <ShoppingCart size={16} />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </div>
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
    <div className={styles.cartCard}>
      <div className={styles.cartHeader}>
        <h2 className={styles.cartTitle}>
          <ReceiptText size={18} />
          Seu pedido
        </h2>
        <span className={styles.cartCount}>{cart.length} item(ns)</span>
      </div>

      <div className={styles.cartList}>
        {cart.length === 0 ? (
          <p className={styles.emptyCart}>
            Carrinho vazio.
          </p>
        ) : null}
        {cart.map((item) => (
          <div key={item.lineId} className={styles.cartItem}>
            <div className={styles.cartItemHeader}>
              <div>
                <p className={styles.cartItemName}>
                  {item.quantity}x {item.name}
                </p>
                {item.options.map((option) => (
                  <p key={`${option.groupId}-${option.itemId}`} className={styles.muted}>
                    + {option.groupName}: {option.itemName}
                  </p>
                ))}
                {item.observations ? (
                  <p className={styles.muted}>Obs: {item.observations}</p>
                ) : null}
              </div>
              <button
                className={styles.removeButton}
                onClick={() => removeItem(item.lineId)}
                aria-label="Remover item"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p className={styles.cartItemTotal}>{money(item.totalCents)}</p>
          </div>
        ))}
      </div>

      <form className={styles.checkoutForm} onSubmit={form.handleSubmit(onSubmit)}>
        <div className={styles.deliveryToggleGrid}>
          <button
            type="button"
            className={cx(
              styles.deliveryButton,
              deliveryType === "DELIVERY"
                ? styles.deliveryButtonSelected
                : styles.deliveryButtonIdle,
            )}
            onClick={() => form.setValue("deliveryType", "DELIVERY")}
          >
            <Bike size={16} />
            Entrega
          </button>
          <button
            type="button"
            className={cx(
              styles.deliveryButton,
              deliveryType === "PICKUP"
                ? styles.deliveryButtonSelected
                : styles.deliveryButtonIdle,
            )}
            onClick={() => form.setValue("deliveryType", "PICKUP")}
          >
            <Store size={16} />
            Retirada
          </button>
        </div>

        <Field label="Nome" error={form.formState.errors.customerName?.message}>
          <Input {...form.register("customerName")} />
        </Field>
        <Field label="WhatsApp" error={form.formState.errors.customerPhone?.message}>
          <Input {...form.register("customerPhone")} />
        </Field>

        {deliveryType === "DELIVERY" ? (
          <div className={styles.deliveryFields}>
            <Field label="Rua">
              <Input {...form.register("street")} />
            </Field>
            <div className={styles.addressGrid}>
              <Field label="Numero">
                <Input {...form.register("number")} />
              </Field>
              <Field label="Bairro">
                <Input {...form.register("neighborhood")} />
              </Field>
            </div>
            <Field label="Cidade">
              <Input {...form.register("city")} />
            </Field>
          </div>
        ) : null}

        <Field label="Observacoes do pedido">
          <Textarea {...form.register("notes")} />
        </Field>

        <div className={styles.totalsBox}>
          <span className={styles.totalRow}>
            Subtotal <strong>{money(subtotalCents)}</strong>
          </span>
          <span className={styles.totalRow}>
            Frete <strong>{money(deliveryFeeCents)}</strong>
          </span>
          <span className={styles.totalGrand}>
            Total <strong className={styles.totalStrong}>{money(totalCents)}</strong>
          </span>
        </div>

        {checkoutError ? <p className={styles.checkoutError}>{checkoutError}</p> : null}
        {createdOrder ? (
          <div className={styles.successBox}>
            Pedido enviado. Status: {createdOrder.status}
          </div>
        ) : null}

        <Button type="submit" disabled={cart.length === 0}>
          Enviar pedido
        </Button>
      </form>
    </div>
  );
}
