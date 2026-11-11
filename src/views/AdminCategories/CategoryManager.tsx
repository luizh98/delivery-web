"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Pencil, Save, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { Field, Input, Select } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import { catalogOrderChanges, sortCatalogItems } from "@/utils/catalogOrder";
import type { ProductCategory } from "@/types/api";
import type { CategoryManagerProps } from "./types";
import {
  Actions,
  Card,
  CardActions,
  CardTitle,
  CheckboxLabel,
  Empty,
  ErrorText,
  Form,
  GridTwo,
  List,
  Muted,
  PaneGrid,
  Root,
  SearchIcon,
  SearchLabel,
  SearchWrap,
  Section,
  SectionHeader,
  SectionHelp,
  SectionTitle,
  Subtitle,
  Title,
} from "./styles";

const categorySchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  description: z.string().optional(),
  sortOrder: z.number(),
  active: z.boolean(),
});

type CategoryForm = z.infer<typeof categorySchema>;

const defaultCategoryForm = (): CategoryForm => ({
  name: "",
  description: "",
  sortOrder: 0,
  active: true,
});

function categoryToForm(category: ProductCategory): CategoryForm {
  return {
    name: category.name,
    description: category.description ?? "",
    sortOrder: category.sortOrder,
    active: category.active,
  };
}

function categoryMatchesSearch(
  category: ProductCategory,
  normalizedSearch: string,
) {
  if (!normalizedSearch) {
    return true;
  }

  return category.name.toLowerCase().includes(normalizedSearch);
}

export function CategoryManager({
  initialCategories,
  onCategoriesChange,
  showHeader = true,
}: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [reordering, setReordering] = useState(false);
  const { requestConfirmation } = useConfirmation();
  const { showToast } = useToast();
  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultCategoryForm(),
  });
  const isEditing = Boolean(editingCategoryId);
  const orderedCategories = sortCatalogItems(categories);
  const canReorder = !reordering && !isEditing && !form.formState.isSubmitting
    && !deletingCategoryId && !search.trim() && !statusFilter;
  const filteredCategories = orderedCategories.filter((category) =>
    categoryMatchesSearch(category, search.trim().toLowerCase()) &&
    (!statusFilter || category.active === (statusFilter === "active")),
  );

  function commitCategories(nextCategories: ProductCategory[]) {
    setCategories(nextCategories);
    onCategoriesChange?.(nextCategories);
  }

  async function moveCategory(id: string, direction: -1 | 1) {
    if (!canReorder) return;
    setReordering(true);
    setError("");
    try {
      const current = await clientApi<ProductCategory[]>("admin/product-categories");
      for (const category of catalogOrderChanges(current, id, direction)) {
        await clientApi<ProductCategory>(`admin/product-categories/${category.id}`, {
          method: "PUT", body: JSON.stringify(category),
        });
      }
      commitCategories(await clientApi<ProductCategory[]>("admin/product-categories"));
      showToast("Ordem das categorias salva.");
    } catch {
      try { commitCategories(await clientApi<ProductCategory[]>("admin/product-categories")); } catch { /* Keep the current list if reload also fails. */ }
      const message = "Não foi possível concluir a troca. Atualize a lista e confira a ordem.";
      setError(message);
      showToast(message, "error");
    } finally {
      setReordering(false);
    }
  }

  function resetCategoryForm() {
    setEditingCategoryId(null);
    setError("");
    form.reset(defaultCategoryForm());
  }

  function startEditCategory(category: ProductCategory) {
    setEditingCategoryId(category.id);
    setError("");
    form.reset(categoryToForm(category));
  }

  async function submit(values: CategoryForm) {
    setError("");

    try {
      const path = editingCategoryId
        ? `admin/product-categories/${editingCategoryId}`
        : "admin/product-categories";
      const category = await clientApi<ProductCategory>(path, {
        method: editingCategoryId ? "PUT" : "POST",
        body: JSON.stringify(values),
      });
      commitCategories(
        editingCategoryId
          ? categories.map((item) => (item.id === category.id ? category : item))
          : [...categories, category],
      );
      resetCategoryForm();
      showToast("Categoria salva com sucesso");
    } catch {
      const message = editingCategoryId
        ? "Não foi possível salvar categoria."
        : "Não foi possível criar categoria.";

      setError(message);
      showToast(message, "error");
    }
  }

  async function deleteCategory(category: ProductCategory) {
    const confirmed = await requestConfirmation({
      message: "Deseja excluir a categoria?",
      confirmLabel: "Excluir",
    });

    if (!confirmed) {
      return;
    }

    setError("");
    setDeletingCategoryId(category.id);

    try {
      await clientApi<void>(`admin/product-categories/${category.id}`, {
        method: "DELETE",
      });
      commitCategories(categories.filter((item) => item.id !== category.id));
      if (editingCategoryId === category.id) {
        resetCategoryForm();
      }
      showToast("Categoria excluída com sucesso");
    } catch {
      const message = "Não foi possível excluir categoria.";

      setError(message);
      showToast(message, "error");
    } finally {
      setDeletingCategoryId(null);
    }
  }

  return (
    <Root>
      {showHeader ? (
        <div>
          <Title>Categorias</Title>
          <Subtitle>Organização do cardápio.</Subtitle>
        </div>
      ) : null}

      {error ? <ErrorText>{error}</ErrorText> : null}

      <PaneGrid>
        <Section>
          <SectionHeader>
            <div>
              <SectionTitle>
                {isEditing ? "Alterar categoria" : "Adicionar categoria"}
              </SectionTitle>
              <SectionHelp>
                Uma categoria por vez deixa o cadastro mais claro.
              </SectionHelp>
            </div>
            {isEditing ? (
              <Button
                type="button"
                variant="ghost"
                onClick={resetCategoryForm}
              >
                <X size={16} />
                Cancelar
              </Button>
            ) : null}
          </SectionHeader>

          <Form onSubmit={form.handleSubmit(submit)}>
            <GridTwo>
              <Field label="Nome" error={form.formState.errors.name?.message}>
                <Input {...form.register("name")} />
              </Field>
              <Field label="Descrição">
                <Input {...form.register("description")} />
              </Field>
              <Field label="Ordem">
                <Input
                  type="number"
                  {...form.register("sortOrder", { valueAsNumber: true })}
                />
              </Field>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  {...form.register("active")}
                />
                Categoria ativa
              </CheckboxLabel>
            </GridTwo>
            <Actions>
              <Button type="submit" disabled={form.formState.isSubmitting || reordering}>
                <Save size={16} />
                {isEditing ? "Salvar categoria" : "Criar categoria"}
              </Button>
            </Actions>
          </Form>
        </Section>

        <Section>
          <div>
            <SectionTitle>Categorias cadastradas</SectionTitle>
            <SectionHelp>
              {filteredCategories.length} de {categories.length} categoria(s)
            </SectionHelp>
            <SectionHelp>Use as setas para ordenar. Limpe a pesquisa e o filtro de status para mover.</SectionHelp>
          </div>

          <SearchLabel>
            <span>Pesquisar</span>
            <SearchWrap>
              <SearchIcon>
                <Search size={16} />
              </SearchIcon>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nome da categoria"
              />
            </SearchWrap>
          </SearchLabel>

          <Field label="Filtrar status">
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Todos</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </Select>
          </Field>

          {categories.length === 0 ? (
            <Empty>
              Nenhuma categoria salva.
            </Empty>
          ) : null}

          {categories.length > 0 && filteredCategories.length === 0 ? (
            <Empty>
              Nenhuma categoria encontrada.
            </Empty>
          ) : null}

          <List aria-busy={reordering}>
            {filteredCategories.map((category) => (
              <Card
                key={category.id}
              >
                <div>
                  <CardTitle>{category.name}</CardTitle>
                  {category.description ? (
                    <Muted>{category.description}</Muted>
                  ) : null}
                  <Muted>
                    #{category.sortOrder} - {category.active ? "ativa" : "inativa"}
                  </Muted>
                </div>
                <CardActions>
                  <Button type="button" variant="outline"
                    aria-label={`Subir categoria ${category.name}`}
                    title="Subir categoria"
                    disabled={!canReorder || orderedCategories[0]?.id === category.id}
                    onClick={() => moveCategory(category.id, -1)}>
                    <ArrowUp size={16} />
                  </Button>
                  <Button type="button" variant="outline"
                    aria-label={`Descer categoria ${category.name}`}
                    title="Descer categoria"
                    disabled={!canReorder || orderedCategories.at(-1)?.id === category.id}
                    onClick={() => moveCategory(category.id, 1)}>
                    <ArrowDown size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => startEditCategory(category)}
                    disabled={reordering || editingCategoryId === category.id}
                  >
                    <Pencil size={16} />
                    {editingCategoryId === category.id ? "Editando" : "Editar"}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => deleteCategory(category)}
                    disabled={reordering || deletingCategoryId === category.id}
                  >
                    <Trash2 size={16} />
                    Excluir
                  </Button>
                </CardActions>
              </Card>
            ))}
          </List>
        </Section>
      </PaneGrid>
    </Root>
  );
}
