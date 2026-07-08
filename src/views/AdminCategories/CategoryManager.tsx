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
import styles from "./styles.module.css";

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
    <div className={styles.root}>
      {showHeader ? (
        <div>
          <h1 className={styles.title}>Categorias</h1>
          <p className={styles.subtitle}>Organizacao do cardapio.</p>
        </div>
      ) : null}

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.paneGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>
                {isEditing ? "Alterar categoria" : "Adicionar categoria"}
              </h3>
              <p className={styles.sectionHelp}>
                Uma categoria por vez deixa o cadastro mais claro.
              </p>
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
          </div>

          <form className={styles.form} onSubmit={form.handleSubmit(submit)}>
            <div className={styles.gridTwo}>
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
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  {...form.register("active")}
                />
                Categoria ativa
              </label>
            </div>
            <div className={styles.actions}>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save size={16} />
                {isEditing ? "Salvar categoria" : "Criar categoria"}
              </Button>
            </div>
          </form>
        </section>

        <section className={styles.section}>
          <div>
            <h3 className={styles.sectionTitle}>Categorias cadastradas</h3>
            <p className={styles.sectionHelp}>
              {categories.length} categoria(s) disponivel(is)
            </p>
          </div>

          <label className={styles.searchLabel}>
            <span>Pesquisar</span>
            <span className={styles.searchWrap}>
              <Search
                className={styles.searchIcon}
                size={16}
              />
              <Input
                className={styles.searchInput}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nome da categoria"
              />
            </span>
          </label>

          {categories.length === 0 ? (
            <div className={styles.empty}>
              Nenhuma categoria salva.
            </div>
          ) : null}

          {categories.length > 0 && filteredCategories.length === 0 ? (
            <div className={styles.empty}>
              Nenhuma categoria encontrada.
            </div>
          ) : null}

          <div className={styles.list}>
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className={styles.card}
              >
                <div>
                  <p className={styles.cardTitle}>{category.name}</p>
                  {category.description ? (
                    <p className={styles.muted}>{category.description}</p>
                  ) : null}
                  <p className={styles.muted}>
                    #{category.sortOrder} - {category.active ? "ativa" : "inativa"}
                  </p>
                </div>
                <div className={styles.cardActions}>
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
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
