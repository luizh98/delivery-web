"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, CopyPlus, Pencil, Save, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  AvailableTemplateCard,
  BuilderTitle,
  CardTitle,
  CheckboxBackground,
  Description,
  DetailsBody,
  DetailsCard,
  DetailsIcon,
  DetailsSummary,
  Empty,
  EmptySurface,
  ErrorTextLarge,
  FlagBadge,
  FlagBadges,
  FlagFieldset,
  FlagGrid,
  FlagLegend,
  FormTitle,
  GridTwo,
  ItemTitle,
  Muted,
  NestedBody,
  NestedDetails,
  NestedSummary,
  OptionsSection,
  PageHeader,
  PageSubtitle,
  PageTitle,
  Price,
  ProductActions,
  ProductCard,
  ProductCategory as ProductCategoryText,
  ProductCategoryFilterLabel,
  ProductCount,
  ProductForm,
  ProductList,
  ProductMeta,
  ProductSearchLabel,
  ProductSection,
  ProductToolbar,
  Root,
  ScrollList,
  SearchIcon,
  SearchLabel,
  SearchWrap,
  SectionHeader,
  SectionTitle,
  SelectedGroupCard,
  SelectedGroups,
  StatusBadge,
  SummaryMeta,
  SummaryMetaPlain,
  SummaryTitle,
} from "./styles";

const productSchema = z.object({
  categoryId: z.string().min(1, "Selecione uma categoria."),
  name: z.string().min(2, "Informe o nome."),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  priceReais: z.number().min(0),
  sortOrder: z.number(),
  active: z.boolean(),
  adultOnly: z.boolean(),
  glutenFree: z.boolean(),
  lactoseFree: z.boolean(),
  vegetarian: z.boolean(),
});

type ProductForm = z.infer<typeof productSchema>;
type ProductFlagField = "adultOnly" | "glutenFree" | "lactoseFree" | "vegetarian";
type ProductFlagStyle = "flagAdult" | "flagGluten" | "flagLactose" | "flagVegetarian";
type ProductFlagTone = "adult" | "gluten" | "lactose" | "vegetarian";

const PRODUCT_FLAGS: {
  field: ProductFlagField;
  label: string;
  badge: string;
  styleClass: ProductFlagStyle;
}[] = [
    {
      field: "adultOnly",
      label: "Maiores de 18 anos",
      badge: "+18",
      styleClass: "flagAdult",
    },
    {
      field: "glutenFree",
      label: "Nao contem gluten",
      badge: "Sem gluten",
      styleClass: "flagGluten",
    },
    {
      field: "lactoseFree",
      label: "Nao contem lactose",
      badge: "Sem lactose",
      styleClass: "flagLactose",
    },
    {
      field: "vegetarian",
      label: "Vegetariano",
      badge: "Vegetariano",
      styleClass: "flagVegetarian",
    },
  ];

const flagTones: Record<ProductFlagStyle, ProductFlagTone> = {
  flagAdult: "adult",
  flagGluten: "gluten",
  flagLactose: "lactose",
  flagVegetarian: "vegetarian",
};

const defaultProductForm = (categoryId = ""): ProductForm => ({
  categoryId,
  name: "",
  description: "",
  imageUrl: "",
  priceReais: 0,
  sortOrder: 0,
  active: true,
  adultOnly: false,
  glutenFree: false,
  lactoseFree: false,
  vegetarian: false,
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
    adultOnly: product.adultOnly ?? false,
    glutenFree: product.glutenFree ?? false,
    lactoseFree: product.lactoseFree ?? false,
    vegetarian: product.vegetarian ?? false,
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

function activeProductFlags(product: Product) {
  return PRODUCT_FLAGS.filter(({ field }) => product[field] ?? false);
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
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
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
    if (
      productCategoryFilter &&
      !nextCategories.some((category) => category.id === productCategoryFilter)
    ) {
      setProductCategoryFilter("");
    }
  }

  function resetForm(categoryId = form.getValues("categoryId")) {
    form.reset(defaultProductForm(categoryId));
    setEditingProduct(null);
    setOptionGroups([]);
    setError("");
  }

  function cancelProductEdit() {
    resetForm();
    setProductFormOpen(false);
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
        adultOnly: values.adultOnly,
        glutenFree: values.glutenFree,
        lactoseFree: values.lactoseFree,
        vegetarian: values.vegetarian,
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
  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (left, right) =>
          left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
      ),
    [categories],
  );
  const categoryById = useMemo(
    () => new Map(sortedCategories.map((category) => [category.id, category])),
    [sortedCategories],
  );
  const sortedProducts = useMemo(
    () =>
      [...products].sort((left, right) => {
        const leftCategory = categoryById.get(left.categoryId);
        const rightCategory = categoryById.get(right.categoryId);
        const leftCategoryOrder = leftCategory?.sortOrder ?? Number.MAX_SAFE_INTEGER;
        const rightCategoryOrder = rightCategory?.sortOrder ?? Number.MAX_SAFE_INTEGER;

        return (
          leftCategoryOrder - rightCategoryOrder ||
          (leftCategory?.name ?? "").localeCompare(rightCategory?.name ?? "") ||
          left.sortOrder - right.sortOrder ||
          left.name.localeCompare(right.name)
        );
      }),
    [categoryById, products],
  );
  const normalizedProductSearch = productSearch.trim().toLowerCase();
  const filteredProducts = sortedProducts.filter((product) => {
    const matchesSearch =
      !normalizedProductSearch ||
      product.name.toLowerCase().includes(normalizedProductSearch);
    const matchesCategory =
      !productCategoryFilter || product.categoryId === productCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <Root>
      <PageHeader>
        <div>
          <PageTitle>Produtos</PageTitle>
          <PageSubtitle>Itens, precos e opcionais.</PageSubtitle>
        </div>
      </PageHeader>

      <DetailsCard>
        <DetailsSummary>
          <SummaryTitle>Categorias</SummaryTitle>
          <SummaryMeta>
            <span>{categories.length} cadastrada(s)</span>
            <DetailsIcon data-details-icon>
              <ChevronDown size={18} aria-hidden="true" />
            </DetailsIcon>
          </SummaryMeta>
        </DetailsSummary>
        <DetailsBody>
          <CategoryManager
            initialCategories={categories}
            onCategoriesChange={updateCategories}
            showHeader={false}
          />
        </DetailsBody>
      </DetailsCard>

      <DetailsCard>
        <DetailsSummary>
          <SummaryTitle>Grupos salvos</SummaryTitle>
          <SummaryMeta>
            <span>{optionGroupTemplates.length} cadastrado(s)</span>
            <DetailsIcon data-details-icon>
              <ChevronDown size={18} aria-hidden="true" />
            </DetailsIcon>
          </SummaryMeta>
        </DetailsSummary>
        <DetailsBody>
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
        </DetailsBody>
      </DetailsCard>

      <DetailsCard
        open={productFormOpen}
        onToggle={(event) => setProductFormOpen(event.currentTarget.open)}
      >
        <DetailsSummary>
          <SummaryTitle>
            {editingProduct ? "Editar produto" : "Cadastro de produto"}
          </SummaryTitle>
          <DetailsIcon data-details-icon>
            <ChevronDown size={18} aria-hidden="true" />
          </DetailsIcon>
        </DetailsSummary>

        <ProductForm onSubmit={form.handleSubmit(submit)}>
          <SectionHeader>
            <div>
              <FormTitle>
                {editingProduct ? "Editar produto" : "Novo produto"}
              </FormTitle>
              {editingProduct ? (
                <Muted>
                  Alterando produto e opcionais ja cadastrados.
                </Muted>
              ) : null}
            </div>
            {editingProduct ? (
              <Button type="button" variant="ghost" onClick={cancelProductEdit}>
                <X size={16} />
                Cancelar edicao
              </Button>
            ) : null}
          </SectionHeader>

          <GridTwo>
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
            <CheckboxBackground>
              <input type="checkbox" {...form.register("active")} />
              Produto ativo
            </CheckboxBackground>
          </GridTwo>

          <FlagFieldset>
            <FlagLegend>Flags do produto</FlagLegend>
            <FlagGrid>
              {PRODUCT_FLAGS.map((flag) => (
                <CheckboxBackground key={flag.field}>
                  <input type="checkbox" {...form.register(flag.field)} />
                  {flag.label}
                </CheckboxBackground>
              ))}
            </FlagGrid>
          </FlagFieldset>

          <OptionsSection>
            <div>
              <BuilderTitle>Opcionais</BuilderTitle>
              <Muted>Use grupos salvos no cadastro acima.</Muted>
            </div>

            <NestedDetails>
              <NestedSummary>
                <SummaryTitle>Grupos disponiveis</SummaryTitle>
                <SummaryMetaPlain>
                  <span>
                    {filteredProductTemplates.length} de {optionGroupTemplates.length}
                  </span>
                  <DetailsIcon data-details-icon>
                    <ChevronDown size={18} aria-hidden="true" />
                  </DetailsIcon>
                </SummaryMetaPlain>
              </NestedSummary>

              <NestedBody>
                <SearchLabel>
                  <span>Pesquisar</span>
                  <SearchWrap>
                    <SearchIcon>
                      <Search size={16} />
                    </SearchIcon>
                    <Input
                      value={productGroupSearch}
                      onChange={(event) => setProductGroupSearch(event.target.value)}
                      placeholder="Nome do grupo ou item"
                    />
                  </SearchWrap>
                </SearchLabel>

                {optionGroupTemplates.length === 0 ? (
                  <EmptySurface>
                    Nenhum grupo salvo para usar neste produto.
                  </EmptySurface>
                ) : null}

                {optionGroupTemplates.length > 0 && filteredProductTemplates.length === 0 ? (
                  <EmptySurface>
                    Nenhum grupo encontrado.
                  </EmptySurface>
                ) : null}

                <ScrollList>
                  {filteredProductTemplates.map((template) => {
                    const selected = selectedGroupSignatures.has(
                      optionGroupSignature(template),
                    );

                    return (
                      <AvailableTemplateCard key={template.id}>
                        <div>
                          <CardTitle>{template.name}</CardTitle>
                          <Muted>{groupSummary(template)}</Muted>
                          <Muted>{itemsSummary(template.items)}</Muted>
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
                      </AvailableTemplateCard>
                    );
                  })}
                </ScrollList>
              </NestedBody>
            </NestedDetails>

            <SelectedGroups>
              <SectionTitle>Grupos no produto</SectionTitle>
              {visibleSelectedGroups.length === 0 ? (
                <Empty>
                  Nenhum grupo selecionado.
                </Empty>
              ) : null}
              {visibleSelectedGroups.map(({ group, groupIndex }) => (
                <SelectedGroupCard key={group.id ?? `${group.name}-${groupIndex}`}>
                  <div>
                    <ItemTitle>{group.name}</ItemTitle>
                    <Muted>{groupSummary(group)}</Muted>
                  </div>
                  <Button
                    type="button"
                    variant="dangerText"
                    onClick={() => removeOptionGroup(groupIndex)}
                  >
                    <Trash2 size={16} />
                    Remover
                  </Button>
                </SelectedGroupCard>
              ))}
            </SelectedGroups>
          </OptionsSection>

          {error ? <ErrorTextLarge>{error}</ErrorTextLarge> : null}
          <Button type="submit" disabled={categories.length === 0}>
            <Save size={16} />
            Salvar produto
          </Button>
        </ProductForm>
      </DetailsCard>

      <ProductSection>
        <ProductToolbar>
          <ProductSearchLabel>
            <span>Pesquisar produto</span>
            <SearchWrap>
              <SearchIcon>
                <Search size={16} />
              </SearchIcon>
              <Input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Nome do produto"
              />
            </SearchWrap>
          </ProductSearchLabel>
          <ProductCategoryFilterLabel>
            <span>Filtrar categoria</span>
            <Select
              value={productCategoryFilter}
              onChange={(event) => setProductCategoryFilter(event.target.value)}
            >
              <option value="">Todas as categorias</option>
              {sortedCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </ProductCategoryFilterLabel>
        </ProductToolbar>
        <ProductCount>
          {filteredProducts.length} de {products.length} produto(s)
        </ProductCount>

        {products.length === 0 ? (
          <EmptySurface>
            Nenhum produto cadastrado.
          </EmptySurface>
        ) : null}

        {products.length > 0 && filteredProducts.length === 0 ? (
          <EmptySurface>
            Nenhum produto encontrado.
          </EmptySurface>
        ) : null}

        <ProductList>
          {filteredProducts.map((product) => {
            const flags = activeProductFlags(product);
            const category = categoryById.get(product.categoryId);

            return (
              <ProductCard key={product.id}>
                <div>
                  <CardTitle>{product.name}</CardTitle>
                  <ProductCategoryText>
                    {category?.name ?? "Categoria indisponivel"}
                  </ProductCategoryText>
                  <Description>{product.description}</Description>
                  <ProductMeta>
                    <span>{visibleOptionGroupsCount(product)} grupo(s) de opcionais</span>
                    <StatusBadge active={product.active}>
                      {product.active ? "Ativo" : "Inativo"}
                    </StatusBadge>
                  </ProductMeta>
                  {flags.length > 0 ? (
                    <FlagBadges>
                      {flags.map((flag) => (
                        <FlagBadge
                          key={flag.field}
                          tone={flagTones[flag.styleClass]}
                        >
                          {flag.badge}
                        </FlagBadge>
                      ))}
                    </FlagBadges>
                  ) : null}
                </div>
                <ProductActions>
                  <Price>{money(product.priceCents)}</Price>
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
                </ProductActions>
              </ProductCard>
            );
          })}
        </ProductList>
      </ProductSection>
    </Root>
  );
}
