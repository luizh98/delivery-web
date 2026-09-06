"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Pencil, Plus, Power, Save, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { Field, Input, Select } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import type { Product, PromotionCombo } from "@/types/api";
import { money } from "@/utils/format";
import {
  Actions,
  Checkbox,
  ComboCard,
  ComboItem,
  ComboList,
  ComboMeta,
  ComboName,
  Empty,
  ErrorText,
  FormActions,
  FormCard,
  Grid,
  PageHeader,
  PageSubtitle,
  PageTitle,
  ProductPicker,
  Root,
  Status,
} from "./styles";

const schema = z.object({
  name: z.string().min(2, "Informe o nome."),
  active: z.boolean(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
    }),
  ).min(1, "Adicione ao menos um produto."),
});

type ComboForm = z.infer<typeof schema>;

type Props = {
  initialCombos: PromotionCombo[];
  products: Product[];
};

const defaults: ComboForm = { name: "", active: true, items: [] };

function hasRequiredOptions(product: Product) {
  return product.optionGroups.some(
    (group) => !group.deleted && group.required,
  );
}

export function PromotionComboManager({ initialCombos, products }: Props) {
  const [combos, setCombos] = useState(initialCombos);
  const [editing, setEditing] = useState<PromotionCombo | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const { showToast } = useToast();
  const { requestConfirmation } = useConfirmation();
  const form = useForm<ComboForm>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const availableProducts = products.filter(
    (product) => product.active && !hasRequiredOptions(product),
  );
  const items = useWatch({ control: form.control, name: "items" });

  function comboUrl(code: string) {
    return `/promocoes/${encodeURIComponent(code)}`;
  }

  function openCreate() {
    setEditing(null);
    form.reset(defaults);
    setSelectedProductId("");
    setFormOpen(true);
  }

  function openEdit(combo: PromotionCombo) {
    setEditing(combo);
    form.reset({
      name: combo.name,
      active: combo.active,
      items: [...combo.items]
        .sort((first, second) => first.displayOrder - second.displayOrder)
        .map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });
    setSelectedProductId("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setSelectedProductId("");
    form.reset(defaults);
  }

  function addProduct() {
    if (!selectedProductId || items.some((item) => item.productId === selectedProductId)) {
      return;
    }
    form.setValue("items", [...items, { productId: selectedProductId, quantity: 1 }], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSelectedProductId("");
  }

  function removeProduct(productId: string) {
    form.setValue(
      "items",
      items.filter((item) => item.productId !== productId),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  async function submit(values: ComboForm) {
    const payload = {
      name: values.name,
      active: values.active,
      items: values.items.map((item, displayOrder) => ({ ...item, displayOrder })),
    };
    const path = editing
      ? `admin/promotion-combos/${editing.id}`
      : "admin/promotion-combos";

    try {
      const saved = await clientApi<PromotionCombo>(path, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setCombos((current) =>
        editing
          ? current.map((combo) => (combo.id === saved.id ? saved : combo))
          : [saved, ...current],
      );
      showToast(editing ? "Combo atualizado." : "Combo criado.");
      closeForm();
    } catch {
      showToast("Não foi possível salvar o combo.", "error");
    }
  }

  async function copyUrl(combo: PromotionCombo) {
    try {
      const url = new URL(comboUrl(combo.code), window.location.origin).toString();
      await navigator.clipboard.writeText(url);
      showToast("URL copiada.");
    } catch {
      showToast("Não foi possível copiar a URL.", "error");
    }
  }

  async function toggleStatus(combo: PromotionCombo) {
    try {
      const updated = await clientApi<PromotionCombo>(
        `admin/promotion-combos/${combo.id}/status`,
        { method: "PATCH", body: JSON.stringify({ active: !combo.active }) },
      );
      setCombos((current) => current.map((item) => item.id === updated.id ? updated : item));
      showToast(updated.active ? "Combo ativado." : "Combo desativado.");
    } catch {
      showToast("Não foi possível alterar o status.", "error");
    }
  }

  async function remove(combo: PromotionCombo) {
    if (!(await requestConfirmation({
      message: `Excluir o combo ${combo.name}?`,
      confirmLabel: "Excluir",
    }))) {
      return;
    }
    try {
      await clientApi<void>(`admin/promotion-combos/${combo.id}`, { method: "DELETE" });
      setCombos((current) => current.filter((item) => item.id !== combo.id));
      showToast("Combo excluído.");
    } catch {
      showToast("Não foi possível excluir o combo.", "error");
    }
  }

  return (
    <Root>
      <PageHeader>
        <div>
          <PageTitle>Combos promocionais</PageTitle>
          <PageSubtitle>Junte produtos em uma URL sem alterar seus preços ou campanhas.</PageSubtitle>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus size={16} /> Criar combo
        </Button>
      </PageHeader>

      {formOpen ? (
        <FormCard>
          <PageHeader>
            <ComboName>{editing ? "Editar combo" : "Novo combo"}</ComboName>
            <Button type="button" variant="ghost" onClick={closeForm}>
              <X size={16} /> Fechar
            </Button>
          </PageHeader>
          <form onSubmit={form.handleSubmit(submit)}>
            <Grid>
              <Field label="Nome" error={form.formState.errors.name?.message}>
                <Input {...form.register("name")} />
              </Field>
              <Checkbox>
                <input type="checkbox" {...form.register("active")} />
                Combo ativo
              </Checkbox>
            </Grid>
            <ProductPicker>
              <PageSubtitle>
                Os produtos usam preço e configuração atuais do cadastro. Produtos com opções obrigatórias não podem ser usados.
              </PageSubtitle>
              <Grid>
                <Select
                  value={selectedProductId}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                  aria-label="Produto do combo"
                >
                  <option value="">Selecione um produto...</option>
                  {availableProducts
                    .filter((product) => !items.some((item) => item.productId === product.id))
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {money(product.priceCents)}
                      </option>
                    ))}
                </Select>
                <Button type="button" variant="outline" onClick={addProduct} disabled={!selectedProductId}>
                  <Plus size={16} /> Adicionar produto
                </Button>
              </Grid>
              <ComboList>
                {items.map((item, index) => (
                  <ComboItem key={item.productId}>
                    <div>
                      <strong>{productById.get(item.productId)?.name ?? "Produto indisponível"}</strong>
                      <PageSubtitle>{money(productById.get(item.productId)?.priceCents ?? 0)} por unidade</PageSubtitle>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      aria-label={`Quantidade de ${productById.get(item.productId)?.name ?? "produto"}`}
                      {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                    />
                    <Button type="button" variant="dangerGhost" onClick={() => removeProduct(item.productId)} aria-label="Remover produto">
                      <Trash2 size={16} />
                    </Button>
                  </ComboItem>
                ))}
              </ComboList>
              {form.formState.errors.items?.message ? <ErrorText>{form.formState.errors.items.message}</ErrorText> : null}
            </ProductPicker>
            <FormActions>
              <span />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save size={16} /> Salvar combo
              </Button>
            </FormActions>
          </form>
        </FormCard>
      ) : null}

      <ComboList>
        {!combos.length ? <Empty>Nenhum combo cadastrado.</Empty> : null}
        {combos.map((combo) => (
          <ComboCard key={combo.id}>
            <div>
              <ComboName>
                {combo.name} <Status active={combo.active}>{combo.active ? "Ativo" : "Inativo"}</Status>
              </ComboName>
              <ComboMeta>
                <span>{combo.items.length} produto(s)</span>
                <span>{combo.items.reduce((sum, item) => sum + item.quantity, 0)} item(ns)</span>
                <span>{comboUrl(combo.code)}</span>
              </ComboMeta>
            </div>
            <Actions>
              <Button type="button" variant="outline" onClick={() => copyUrl(combo)}>
                <Copy size={15} /> Copiar URL
              </Button>
              <Button type="button" variant="outline" onClick={() => openEdit(combo)}>
                <Pencil size={15} /> Editar
              </Button>
              <Button type="button" variant="ghost" onClick={() => toggleStatus(combo)}>
                <Power size={15} /> {combo.active ? "Desativar" : "Ativar"}
              </Button>
              <Button type="button" variant="dangerGhost" onClick={() => remove(combo)}>
                <Trash2 size={15} /> Excluir
              </Button>
            </Actions>
          </ComboCard>
        ))}
      </ComboList>
    </Root>
  );
}
