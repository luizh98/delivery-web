"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, CopyPlus, Pencil, Save, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { Field, Input, Select } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import { centsToReais, money, reaisToCents } from "@/utils/format";
import type {
  Product,
  ProductCategory,
  ProductOptionGroup,
  ProductOptionGroupTemplate,
  ProductOptionItem,
} from "@/types/api";
import { CategoryManager } from "../AdminCategories/CategoryManager";
import { ReusableOptionGroupsPanel } from "./ReusableOptionGroupsPanel";
import {
  emptyProductOptionsErrors,
  hasOptionErrors,
  normalizeOptionGroups,
  validateOptionGroups,
  type ProductOptionsErrors,
} from "./optionValidation";
import type { ProductManagerProps } from "./types";
import styles from "./styles.module.css";

const productSchema = z.object({
  categoryId: z.string().min(1, "Selecione uma categoria."),
  name: z.string().min(2, "Informe o nome."),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  priceReais: z.number().min(0),
  sortOrder: z.number(),
  active: z.boolean(),
});

type ProductForm = z.infer<typeof productSchema>;

const defaultProductForm = (categoryId = ""): ProductForm => ({
  categoryId,
  name: "",
  description: "",
  imageUrl: "",
  priceReais: 0,
  sortOrder: 0,
  active: true,
});

function productToForm(product: Product): ProductForm {
  return {
    categoryId: product.categoryId,
    name: product.name,
    description: product.description ?? "",
    imageUrl: product.imageUrl ?? "",
    priceReais: centsToReais(product.priceCents),
    sortOrder: product.sortOrder,
    active: product.active,
  };
}

function cloneOptionGroups(groups: ProductOptionGroup[]) {
  return groups.map((group) => ({
    ...group,
    items: (group.items ?? []).map((item) => ({ ...item })),
  }));
}

function visibleOptionGroupsCount(product: Product) {
  return product.optionGroups?.filter((group) => !group.deleted).length ?? 0;
}

function visibleItems(items: ProductOptionItem[]) {
  return items.filter((item) => !item.deleted);
}

function selectionsLabel(count: number) {
  return count === 1 ? "selecao" : "selecoes";
}

function groupSummary(group: ProductOptionGroup | ProductOptionGroupTemplate) {
  const items = visibleItems(group.items);
  const type = group.required ? "Obrigatorio" : "Opcional";
  const limit =
    group.minSelections > 0
      ? `${group.minSelections} a ${group.maxSelections} ${selectionsLabel(group.maxSelections)}`
      : `ate ${group.maxSelections} ${selectionsLabel(group.maxSelections)}`;
  const itemCount = items.length === 1 ? "1 item" : `${items.length} itens`;

  return `${type} - ${limit} - ${itemCount}`;
}

function itemsSummary(items: ProductOptionItem[]) {
  const visible = visibleItems(items);

  if (!visible.length) {
    return "Sem itens";
  }

  return visible
    .slice(0, 3)
    .map((item) => item.name)
    .join(", ");
}

function cloneTemplateItem(item: ProductOptionItem): ProductOptionItem {
  return {
    name: item.name,
    priceCents: item.priceCents,
    active: item.active,
  };
}

function templateToProductOptionGroup(
  template: ProductOptionGroupTemplate,
): ProductOptionGroup {
  return {
    name: template.name,
    required: template.required,
    minSelections: template.minSelections,
    maxSelections: template.maxSelections,
    items: template.items.filter((item) => !item.deleted).map(cloneTemplateItem),
  };
}

function optionGroupToTemplatePayload(group: ProductOptionGroup, sortOrder: number) {
  return {
    name: group.name,
    required: group.required,
    minSelections: group.minSelections,
    maxSelections: group.maxSelections,
    sortOrder,
    items: group.items.filter((item) => !item.deleted).map(cloneTemplateItem),
  };
}

function optionGroupSignature(group: ProductOptionGroup | ProductOptionGroupTemplate) {
  return JSON.stringify({
    name: group.name.trim(),
    required: group.required,
    minSelections: group.minSelections,
    maxSelections: group.maxSelections,
    items: visibleItems(group.items).map((item) => ({
      name: item.name.trim(),
      priceCents: item.priceCents,
      active: item.active,
    })),
  });
}

function templateMatchesSearch(
  template: ProductOptionGroupTemplate,
  normalizedSearch: string,
) {
  if (!normalizedSearch) {
    return true;
  }

  const searchableText = [
    template.name,
    groupSummary(template),
    ...visibleItems(template.items).map((item) => item.name),
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedSearch);
}

function deletedPatch() {
  return {
    deleted: true,
    deletedAt: new Date().toISOString(),
  };
}

export function ProductManager({
  initialCategories,
  initialProducts,
  initialOptionGroupTemplates,
}: ProductManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [optionGroupTemplates, setOptionGroupTemplates] = useState(
    initialOptionGroupTemplates,
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [savingTemplateGroupIndex, setSavingTemplateGroupIndex] = useState<number | null>(
    null,
  );
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateDraftGroups, setTemplateDraftGroups] = useState<ProductOptionGroup[]>([]);
  const [templateDraftErrors, setTemplateDraftErrors] = useState<ProductOptionsErrors>(
    emptyProductOptionsErrors,
  );
  const [optionGroups, setOptionGroups] = useState<ProductOptionGroup[]>([]);
  const [productGroupSearch, setProductGroupSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const { requestConfirmation } = useConfirmation();
  const { showToast } = useToast();
  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultProductForm(initialCategories[0]?.id ?? ""),
  });

  function updateOptionGroups(nextGroups: ProductOptionGroup[]) {
    setOptionGroups(nextGroups);
  }

  function updateTemplateDraftGroups(nextGroups: ProductOptionGroup[]) {
    setTemplateDraftGroups(nextGroups);
    if (hasOptionErrors(templateDraftErrors)) {
      setTemplateDraftErrors(validateOptionGroups(nextGroups));
    }
  }

  function updateCategories(nextCategories: ProductCategory[]) {
    setCategories(nextCategories);
    const currentCategoryId = form.getValues("categoryId");
    const currentCategoryExists = nextCategories.some(
      (category) => category.id === currentCategoryId,
    );

    if (!currentCategoryExists) {
      form.setValue("categoryId", nextCategories[0]?.id ?? "");
    }
  }

  function resetForm(categoryId = form.getValues("categoryId")) {
    form.reset(defaultProductForm(categoryId));
    setEditingProduct(null);
    setOptionGroups([]);
    setError("");
  }

  function startEdit(product: Product) {
    setEditingProduct(product);
    form.reset(productToForm(product));
    setOptionGroups(cloneOptionGroups(product.optionGroups ?? []));
    setError("");
    setProductFormOpen(true);
    window.requestAnimationFrame(() => form.setFocus("name"));
  }

  function addOptionGroupFromTemplate(template: ProductOptionGroupTemplate) {
    updateOptionGroups([...optionGroups, templateToProductOptionGroup(template)]);
    setTemplateError("");
  }

  function startEditReusableGroup(template: ProductOptionGroupTemplate) {
    setEditingTemplateId(template.id);
    setTemplateDraftGroups([templateToProductOptionGroup(template)]);
    setTemplateDraftErrors(emptyProductOptionsErrors);
    setTemplateError("");
  }

  function cancelReusableGroupEdit() {
    setEditingTemplateId(null);
    setTemplateDraftGroups([]);
    setTemplateDraftErrors(emptyProductOptionsErrors);
    setTemplateError("");
  }

  function removeOptionGroup(groupIndex: number) {
    const group = optionGroups[groupIndex];

    if (!group.id) {
      setOptionGroups((groups) => groups.filter((_, index) => index !== groupIndex));
      return;
    }

    setOptionGroups((groups) =>
      groups.map((item, index) =>
        index === groupIndex ? { ...item, ...deletedPatch() } : item,
      ),
    );
  }

  async function saveReusableGroup(groupIndex: number) {
    setTemplateError("");
    const nextOptionErrors = validateOptionGroups(templateDraftGroups);
    setTemplateDraftErrors(nextOptionErrors);

    if (nextOptionErrors.groups[groupIndex]) {
      const message = "Corrija o grupo antes de salvar na lista.";

      setTemplateError(message);
      showToast(message, "error");
      return;
    }

    const normalizedGroup = normalizeOptionGroups([templateDraftGroups[groupIndex]])[0];

    if (!normalizedGroup) {
      return;
    }

    setSavingTemplateGroupIndex(groupIndex);

    try {
      const currentTemplate = editingTemplateId
        ? optionGroupTemplates.find((template) => template.id === editingTemplateId)
        : undefined;
      const path = editingTemplateId
        ? `admin/product-option-groups/${editingTemplateId}`
        : "admin/product-option-groups";
      const template = await clientApi<ProductOptionGroupTemplate>(
        path,
        {
          method: editingTemplateId ? "PUT" : "POST",
          body: JSON.stringify(
            optionGroupToTemplatePayload(
              normalizedGroup,
              currentTemplate?.sortOrder ?? optionGroupTemplates.length,
            ),
          ),
        },
      );
      setOptionGroupTemplates((items) =>
        editingTemplateId
          ? items.map((item) => (item.id === template.id ? template : item))
          : [...items, template],
      );
      setEditingTemplateId(null);
      setTemplateDraftGroups([]);
      setTemplateDraftErrors(emptyProductOptionsErrors);
      showToast("Grupo salvo com sucesso");
    } catch {
      const message = "Nao foi possivel salvar grupo.";

      setTemplateError(message);
      showToast(message, "error");
    } finally {
      setSavingTemplateGroupIndex(null);
    }
  }

  async function deleteReusableGroup(template: ProductOptionGroupTemplate) {
    const confirmed = await requestConfirmation({
      message: "Deseja excluir o grupo salvo?",
      confirmLabel: "Excluir",
    });

    if (!confirmed) {
      return;
    }

    setTemplateError("");
    setDeletingTemplateId(template.id);

    try {
      await clientApi<void>(`admin/product-option-groups/${template.id}`, {
        method: "DELETE",
      });
      setOptionGroupTemplates((items) =>
        items.filter((item) => item.id !== template.id),
      );
      if (editingTemplateId === template.id) {
        cancelReusableGroupEdit();
      }
      showToast("Grupo excluido com sucesso");
    } catch {
      const message = "Nao foi possivel excluir grupo reutilizavel.";

      setTemplateError(message);
      showToast(message, "error");
    } finally {
      setDeletingTemplateId(null);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = await requestConfirmation({
      message: "Deseja excluir o produto?",
      confirmLabel: "Excluir",
    });

    if (!confirmed) {
      return;
    }

    setError("");
    setDeletingProductId(product.id);

    try {
      await clientApi<void>(`admin/products/${product.id}`, {
        method: "DELETE",
      });
      setProducts((items) => items.filter((item) => item.id !== product.id));
      if (editingProduct?.id === product.id) {
        resetForm();
      }
      showToast("Produto excluido com sucesso");
    } catch {
      const message = "Nao foi possivel excluir produto.";

      setError(message);
      showToast(message, "error");
    } finally {
      setDeletingProductId(null);
    }
  }

  async function submit(values: ProductForm) {
    setError("");

    try {
      const productPayload = {
        categoryId: values.categoryId,
        name: values.name,
        description: values.description,
        imageUrl: values.imageUrl,
        priceCents: reaisToCents(values.priceReais),
        sortOrder: values.sortOrder,
        active: values.active,
        optionGroups: normalizeOptionGroups(optionGroups),
      };
      const path = editingProduct
        ? `admin/products/${editingProduct.id}`
        : "admin/products";
      const product = await clientApi<Product>(path, {
        method: editingProduct ? "PUT" : "POST",
        body: JSON.stringify({
          ...productPayload,
        }),
      });
      setProducts((items) =>
        editingProduct
          ? items.map((item) => (item.id === product.id ? product : item))
          : [...items, product],
      );
      resetForm(values.categoryId);
      setProductFormOpen(false);
      showToast("Produto salvo com sucesso");
    } catch {
      const message = editingProduct
        ? "Nao foi possivel salvar produto."
        : "Nao foi possivel criar produto.";

      setError(message);
      showToast(message, "error");
    }
  }

  const visibleSelectedGroups = optionGroups
    .map((group, index) => ({ group, groupIndex: index }))
    .filter(({ group }) => !group.deleted);
  const selectedGroupSignatures = new Set(
    visibleSelectedGroups.map(({ group }) => optionGroupSignature(group)),
  );
  const filteredProductTemplates = optionGroupTemplates.filter((template) =>
    templateMatchesSearch(template, productGroupSearch.trim().toLowerCase()),
  );
  const normalizedProductSearch = productSearch.trim().toLowerCase();
  const filteredProducts = normalizedProductSearch
    ? products.filter((product) =>
        product.name.toLowerCase().includes(normalizedProductSearch),
      )
    : products;

  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Produtos</h1>
          <p className={styles.pageSubtitle}>Itens, precos e opcionais.</p>
        </div>
      </div>

      <details className={styles.detailsCard}>
        <summary className={styles.detailsSummary}>
          <span className={styles.summaryTitle}>Categorias</span>
          <span className={styles.summaryMeta}>
            <span>{categories.length} cadastrada(s)</span>
            <ChevronDown
              className={styles.detailsIcon}
              size={18}
              aria-hidden="true"
            />
          </span>
        </summary>
        <div className={styles.detailsBody}>
          <CategoryManager
            initialCategories={categories}
            onCategoriesChange={updateCategories}
            showHeader={false}
          />
        </div>
      </details>

      <details className={styles.detailsCard}>
        <summary className={styles.detailsSummary}>
          <span className={styles.summaryTitle}>Grupos salvos</span>
          <span className={styles.summaryMeta}>
            <span>{optionGroupTemplates.length} cadastrado(s)</span>
            <ChevronDown
              className={styles.detailsIcon}
              size={18}
              aria-hidden="true"
            />
          </span>
        </summary>
        <div className={styles.detailsBody}>
          <ReusableOptionGroupsPanel
            templates={optionGroupTemplates}
            draftGroups={templateDraftGroups}
            draftErrors={templateDraftErrors}
            savingGroupIndex={savingTemplateGroupIndex}
            deletingTemplateId={deletingTemplateId}
            editingTemplateId={editingTemplateId}
            error={templateError}
            showHeader={false}
            onDraftGroupsChange={updateTemplateDraftGroups}
            onSaveGroup={saveReusableGroup}
            onEditTemplate={startEditReusableGroup}
            onCancelEdit={cancelReusableGroupEdit}
            onDeleteTemplate={deleteReusableGroup}
          />
        </div>
      </details>

      <details
        open={productFormOpen}
        onToggle={(event) => setProductFormOpen(event.currentTarget.open)}
        className={styles.detailsCard}
      >
        <summary className={styles.detailsSummary}>
          <span className={styles.summaryTitle}>
            {editingProduct ? "Editar produto" : "Cadastro de produto"}
          </span>
          <ChevronDown
            className={styles.detailsIcon}
            size={18}
            aria-hidden="true"
          />
        </summary>

        <form className={styles.productForm} onSubmit={form.handleSubmit(submit)}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.formTitle}>
                {editingProduct ? "Editar produto" : "Novo produto"}
              </h2>
              {editingProduct ? (
                <p className={styles.muted}>
                  Alterando produto e opcionais ja cadastrados.
                </p>
              ) : null}
            </div>
            {editingProduct ? (
              <Button type="button" variant="ghost" onClick={() => resetForm()}>
                <X size={16} />
                Cancelar edicao
              </Button>
            ) : null}
          </div>
          <div className={styles.gridTwo}>
            <Field label="Categoria" error={form.formState.errors.categoryId?.message}>
              <Select {...form.register("categoryId")}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Nome" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} />
            </Field>
            <Field label="Preco (R$)">
              <Input
                type="number"
                min={0}
                step={0.01}
                {...form.register("priceReais", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Ordem">
              <Input type="number" {...form.register("sortOrder", { valueAsNumber: true })} />
            </Field>
            <Field label="Imagem URL">
              <Input {...form.register("imageUrl")} />
            </Field>
            <Field label="Descricao">
              <Input {...form.register("description")} />
            </Field>
            <label className={styles.checkboxBackground}>
              <input
                type="checkbox"
                className={styles.checkbox}
                {...form.register("active")}
              />
              Produto ativo
            </label>
          </div>
          <section className={styles.optionsSection}>
            <div>
              <h2 className={styles.builderTitle}>Opcionais</h2>
              <p className={styles.muted}>
                Use grupos salvos no cadastro acima.
              </p>
            </div>

            <details className={styles.nestedDetails}>
              <summary className={styles.nestedSummary}>
                <span className={styles.summaryTitle}>Grupos disponiveis</span>
                <span className={styles.summaryMetaPlain}>
                  <span>
                    {filteredProductTemplates.length} de {optionGroupTemplates.length}
                  </span>
                  <ChevronDown
                    className={styles.detailsIcon}
                    size={18}
                    aria-hidden="true"
                  />
                </span>
              </summary>

              <div className={styles.nestedBody}>
                <label className={styles.searchLabel}>
                  <span>Pesquisar</span>
                  <span className={styles.searchWrap}>
                    <Search
                      className={styles.searchIcon}
                      size={16}
                    />
                    <Input
                      className={styles.searchInput}
                      value={productGroupSearch}
                      onChange={(event) => setProductGroupSearch(event.target.value)}
                      placeholder="Nome do grupo ou item"
                    />
                  </span>
                </label>

                {optionGroupTemplates.length === 0 ? (
                  <div className={styles.emptySurface}>
                    Nenhum grupo salvo para usar neste produto.
                  </div>
                ) : null}

                {optionGroupTemplates.length > 0 && filteredProductTemplates.length === 0 ? (
                  <div className={styles.emptySurface}>
                    Nenhum grupo encontrado.
                  </div>
                ) : null}

                <div className={styles.scrollList}>
                  {filteredProductTemplates.map((template) => {
                    const selected = selectedGroupSignatures.has(
                      optionGroupSignature(template),
                    );

                    return (
                      <div
                        key={template.id}
                        className={styles.availableTemplateCard}
                      >
                        <div>
                          <p className={styles.cardTitle}>{template.name}</p>
                          <p className={styles.muted}>{groupSummary(template)}</p>
                          <p className={styles.muted}>{itemsSummary(template.items)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addOptionGroupFromTemplate(template)}
                          disabled={selected}
                        >
                          <CopyPlus size={16} />
                          {selected ? "Adicionado" : "Usar grupo"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </details>

            <div className={styles.selectedGroups}>
              <p className={styles.sectionTitle}>Grupos no produto</p>
              {visibleSelectedGroups.length === 0 ? (
                <div className={styles.empty}>
                  Nenhum grupo selecionado.
                </div>
              ) : null}
              {visibleSelectedGroups.map(({ group, groupIndex }) => (
                <div
                  key={group.id ?? `${group.name}-${groupIndex}`}
                  className={styles.selectedGroupCard}
                >
                  <div>
                    <p className={styles.itemTitle}>{group.name}</p>
                    <p className={styles.muted}>{groupSummary(group)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className={styles.dangerTextButton}
                    onClick={() => removeOptionGroup(groupIndex)}
                  >
                    <Trash2 size={16} />
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </section>
          {error ? <p className={styles.errorTextLarge}>{error}</p> : null}
          <Button type="submit" disabled={categories.length === 0}>
            <Save size={16} />
            Salvar produto
          </Button>
        </form>
      </details>

      <section className={styles.productSection}>
        <div className={styles.productToolbar}>
          <label className={styles.productSearchLabel}>
            <span>Pesquisar produto</span>
            <span className={styles.searchWrap}>
              <Search
                className={styles.searchIcon}
                size={16}
              />
              <Input
                className={styles.searchInput}
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Nome do produto"
              />
            </span>
          </label>
          <p className={styles.productCount}>
            {filteredProducts.length} de {products.length} produto(s)
          </p>
        </div>

        {products.length === 0 ? (
          <div className={styles.emptySurface}>
            Nenhum produto cadastrado.
          </div>
        ) : null}

        {products.length > 0 && filteredProducts.length === 0 ? (
          <div className={styles.emptySurface}>
            Nenhum produto encontrado.
          </div>
        ) : null}

        <div className={styles.productList}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={styles.productCard}
            >
              <div>
                <p className={styles.cardTitle}>{product.name}</p>
                <p className={styles.description}>{product.description}</p>
                <p className={styles.muted}>
                  {visibleOptionGroupsCount(product)} grupo(s) de opcionais
                  {" - "}
                  {product.active ? "ativo" : "inativo"}
                </p>
              </div>
              <div className={styles.productActions}>
                <p className={styles.price}>{money(product.priceCents)}</p>
                <Button type="button" variant="outline" onClick={() => startEdit(product)}>
                  <Pencil size={16} />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => deleteProduct(product)}
                  disabled={deletingProductId === product.id}
                >
                  <Trash2 size={16} />
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
