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
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { PageShell } from "@/components/ui/page-shell";
import { clientApi } from "@/lib/api/client";
import { money } from "@/lib/format";
import type {
  MenuResponse,
  OrderResponse,
  Product,
  ProductOptionGroup,
  ProductOptionItem,
  RestaurantConfigResponse,
} from "@/types/api";

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

type CustomerMenuProps = {
  restaurantConfig: RestaurantConfigResponse | null;
  menu: MenuResponse;
};

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

    const options = selectedProduct.optionGroups.flatMap((group) => {
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
    <PageShell className="pb-28">
      <header className="overflow-hidden rounded-md border border-border bg-surface">
        <div
          className="h-32 bg-surface-muted bg-cover bg-center"
          style={{
            backgroundImage: restaurantConfig?.bannerUrl
              ? `url(${restaurantConfig.bannerUrl})`
              : "linear-gradient(135deg, var(--tenant-primary), var(--tenant-secondary))",
          }}
        />
        <div className="grid gap-2 p-4">
          <p className="text-xs font-semibold uppercase text-muted">Cardapio</p>
          <h1 className="text-2xl font-bold">
            {restaurantConfig?.name ?? "Delivery"}
          </h1>
          <p className="text-sm text-muted">
            Escolha seus itens, revise o carrinho e envie o pedido.
          </p>
        </div>
      </header>

      <div className="sticky top-0 z-10 -mx-4 mt-4 overflow-x-auto border-y border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-md sm:border">
        <div className="flex min-w-max gap-2">
          <button
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              selectedCategory === "all"
                ? "bg-primary text-white"
                : "bg-surface text-foreground"
            }`}
            onClick={() => setSelectedCategory("all")}
          >
            Todos
          </button>
          {menu.categories.map((category) => (
            <button
              key={category.id}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                selectedCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-surface text-foreground"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-4 grid gap-3 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3">
          {visibleProducts.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-surface p-6 text-sm text-muted">
              Nenhum produto cadastrado para este tenant.
            </div>
          ) : null}

          {visibleProducts.map((product) => (
            <button
              key={product.id}
              className="grid grid-cols-[1fr_96px] gap-3 rounded-md border border-border bg-surface p-3 text-left transition hover:border-primary"
              onClick={() => openProduct(product)}
            >
              <span className="grid content-start gap-1">
                <span className="text-base font-semibold">{product.name}</span>
                <span className="line-clamp-2 text-sm text-muted">
                  {product.description || "Sem descricao."}
                </span>
                <span className="pt-1 text-sm font-bold text-primary">
                  {money(product.priceCents)}
                </span>
              </span>
              <span
                className="h-24 rounded-md bg-surface-muted bg-cover bg-center"
                style={{
                  backgroundImage: product.imageUrl
                    ? `url(${product.imageUrl})`
                    : "linear-gradient(135deg, #edf2f7, #dbe4ee)",
                }}
              />
            </button>
          ))}
        </div>

        <aside className="hidden lg:block">
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

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface p-3 shadow-2xl lg:hidden">
        <details>
          <summary className="flex list-none items-center justify-between">
            <span className="inline-flex items-center gap-2 font-semibold">
              <ShoppingCart size={18} />
              Carrinho ({cart.length})
            </span>
            <span className="font-bold text-primary">{money(subtotalCents)}</span>
          </summary>
          <div className="mt-3 max-h-[70vh] overflow-y-auto">
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
        <div className="fixed inset-0 z-30 grid place-items-end bg-black/40 p-0 sm:place-items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-md bg-surface p-4 shadow-xl sm:max-w-xl sm:rounded-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
                <p className="text-sm text-muted">{selectedProduct.description}</p>
              </div>
              <button
                className="rounded-md p-2 hover:bg-surface-muted"
                onClick={() => setSelectedProduct(null)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              {selectedProduct.optionGroups.map((group) => (
                <div key={group.id ?? group.name} className="grid gap-2">
                  <div>
                    <h3 className="font-semibold">{group.name}</h3>
                    <p className="text-xs text-muted">
                      {group.required ? "Obrigatorio" : "Opcional"} · selecione ate{" "}
                      {group.maxSelections || 1}
                    </p>
                  </div>
                  {group.items.map((item) => {
                    const groupId = group.id ?? group.name;
                    const selected = (selectedOptions[groupId] ?? []).some(
                      (option) => option.id === item.id,
                    );

                    return (
                      <button
                        key={item.id ?? item.name}
                        className={`flex items-center justify-between rounded-md border p-3 text-sm ${
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-surface"
                        }`}
                        onClick={() => toggleOption(group, item)}
                      >
                        <span>{item.name}</span>
                        <span className="inline-flex items-center gap-2 font-semibold">
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

              <div className="flex items-center justify-between">
                <div className="inline-flex items-center rounded-md border border-border">
                  <button
                    className="p-3"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    aria-label="Diminuir"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-semibold">{quantity}</span>
                  <button
                    className="p-3"
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
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-lg font-bold">
          <ReceiptText size={18} />
          Seu pedido
        </h2>
        <span className="text-sm text-muted">{cart.length} item(ns)</span>
      </div>

      <div className="mt-3 grid gap-3">
        {cart.length === 0 ? (
          <p className="rounded-md bg-surface-muted p-3 text-sm text-muted">
            Carrinho vazio.
          </p>
        ) : null}
        {cart.map((item) => (
          <div key={item.lineId} className="grid gap-1 border-b border-border pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {item.quantity}x {item.name}
                </p>
                {item.options.map((option) => (
                  <p key={`${option.groupId}-${option.itemId}`} className="text-xs text-muted">
                    + {option.groupName}: {option.itemName}
                  </p>
                ))}
                {item.observations ? (
                  <p className="text-xs text-muted">Obs: {item.observations}</p>
                ) : null}
              </div>
              <button
                className="rounded-md p-2 text-red-600 hover:bg-red-50"
                onClick={() => removeItem(item.lineId)}
                aria-label="Remover item"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p className="text-sm font-bold text-primary">{money(item.totalCents)}</p>
          </div>
        ))}
      </div>

      <form className="mt-4 grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-md border text-sm font-semibold ${
              deliveryType === "DELIVERY"
                ? "border-primary bg-primary/10"
                : "border-border"
            }`}
            onClick={() => form.setValue("deliveryType", "DELIVERY")}
          >
            <Bike size={16} />
            Entrega
          </button>
          <button
            type="button"
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-md border text-sm font-semibold ${
              deliveryType === "PICKUP"
                ? "border-primary bg-primary/10"
                : "border-border"
            }`}
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
          <div className="grid gap-2">
            <Field label="Rua">
              <Input {...form.register("street")} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
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

        <div className="grid gap-1 rounded-md bg-surface-muted p-3 text-sm">
          <span className="flex justify-between">
            Subtotal <strong>{money(subtotalCents)}</strong>
          </span>
          <span className="flex justify-between">
            Frete <strong>{money(deliveryFeeCents)}</strong>
          </span>
          <span className="flex justify-between text-base">
            Total <strong className="text-primary">{money(totalCents)}</strong>
          </span>
        </div>

        {checkoutError ? <p className="text-sm text-red-600">{checkoutError}</p> : null}
        {createdOrder ? (
          <div className="rounded-md border border-primary bg-primary/10 p-3 text-sm">
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
