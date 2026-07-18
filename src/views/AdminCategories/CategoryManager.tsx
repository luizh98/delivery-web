"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Save, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { Field, Input } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
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
  const [error, setError] = useState("");
  const { requestConfirmation } = useConfirmation();
  const { showToast } = useToast();
  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultCategoryForm(),
  });
  const isEditing = Boolean(editingCategoryId);
  const filteredCategories = categories.filter((category) =>
    categoryMatchesSearch(category, search.trim().toLowerCase()),
  );

  function commitCategories(nextCategories: ProductCategory[]) {
    setCategories(nextCategories);
    onCategoriesChange?.(nextCategories);
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
        ? "Nao foi possivel salvar categoria."
        : "Nao foi possivel criar categoria.";

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
      showToast("Categoria excluida com sucesso");
    } catch {
      const message = "Nao foi possivel excluir categoria.";

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
          <Subtitle>Organizacao do cardapio.</Subtitle>
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
              <Field label="Descricao">
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
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
              {categories.length} categoria(s) disponivel(is)
            </SectionHelp>
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

          <List>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => startEditCategory(category)}
                    disabled={editingCategoryId === category.id}
                  >
                    <Pencil size={16} />
                    {editingCategoryId === category.id ? "Editando" : "Editar"}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => deleteCategory(category)}
                    disabled={deletingCategoryId === category.id}
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
