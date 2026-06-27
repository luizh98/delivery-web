"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Field, Input, Select, Textarea } from "@/components/Field";
import { clientApi } from "@/services/api/client";
import { money } from "@/utils/format";
import type { Product } from "@/types/api";
import type { ProductManagerProps } from "./types";

const productSchema = z.object({
  categoryId: z.string().min(1, "Selecione uma categoria."),
  name: z.string().min(2, "Informe o nome."),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  priceCents: z.number().min(0),
  sortOrder: z.number(),
  active: z.boolean(),
  optionGroupsJson: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export function ProductManager({
  initialCategories,
  initialProducts,
}: ProductManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [error, setError] = useState("");
  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      categoryId: initialCategories[0]?.id ?? "",
      active: true,
      sortOrder: 0,
      priceCents: 0,
      optionGroupsJson: "[]",
    },
  });

  async function submit(values: ProductForm) {
    setError("");
    try {
      const product = await clientApi<Product>("admin/products", {
        method: "POST",
        body: JSON.stringify({
          categoryId: values.categoryId,
          name: values.name,
          description: values.description,
          imageUrl: values.imageUrl,
          priceCents: values.priceCents,
          sortOrder: values.sortOrder,
          active: values.active,
          optionGroups: values.optionGroupsJson ? JSON.parse(values.optionGroupsJson) : [],
        }),
      });
      setProducts((items) => [...items, product]);
      form.reset({
        categoryId: values.categoryId,
        active: true,
        sortOrder: 0,
        priceCents: 0,
        optionGroupsJson: "[]",
      });
    } catch {
      setError("Nao foi possivel criar produto.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-sm text-muted">Itens, precos e opcionais.</p>
        </div>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-semibold hover:bg-surface-muted"
          href="/admin/catalog/categories"
        >
          Categorias
        </Link>
      </div>

      <form className="grid gap-3 rounded-md border border-border bg-surface p-4" onSubmit={form.handleSubmit(submit)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Categoria" error={form.formState.errors.categoryId?.message}>
            <Select {...form.register("categoryId")}>
              {initialCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nome" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="Preco em centavos">
            <Input type="number" {...form.register("priceCents", { valueAsNumber: true })} />
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
        </div>
        <Field label="Opcionais">
          <Textarea className="font-mono" rows={6} {...form.register("optionGroupsJson")} />
        </Field>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={initialCategories.length === 0}>
          <Plus size={16} />
          Criar produto
        </Button>
      </form>

      <section className="grid gap-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="grid gap-2 rounded-md border border-border bg-surface p-3 sm:grid-cols-[1fr_auto]"
          >
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-muted">{product.description}</p>
              <p className="text-xs text-muted">{product.optionGroups.length} grupo(s) de opcionais</p>
            </div>
            <p className="font-bold text-primary">{money(product.priceCents)}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
