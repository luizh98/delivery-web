"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { clientApi } from "@/lib/api/client";
import type { ProductCategory } from "@/types/api";

const categorySchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  description: z.string().optional(),
  sortOrder: z.number(),
  active: z.boolean(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export function CategoryManager({
  initialCategories,
}: {
  initialCategories: ProductCategory[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      active: true,
      sortOrder: 0,
    },
  });

  async function submit(values: CategoryForm) {
    const category = await clientApi<ProductCategory>("admin/product-categories", {
      method: "POST",
      body: JSON.stringify(values),
    });
    setCategories((items) => [...items, category]);
    form.reset({ active: true, sortOrder: 0 });
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">Categorias</h1>
        <p className="text-sm text-muted">Organizacao do cardapio.</p>
      </div>

      <form
        className="grid gap-3 rounded-md border border-border bg-surface p-4 sm:grid-cols-[1fr_1fr_120px_auto]"
        onSubmit={form.handleSubmit(submit)}
      >
        <Field label="Nome" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} />
        </Field>
        <Field label="Descricao">
          <Input {...form.register("description")} />
        </Field>
        <Field label="Ordem">
          <Input type="number" {...form.register("sortOrder", { valueAsNumber: true })} />
        </Field>
        <Button className="self-end" type="submit">
          <Plus size={16} />
          Criar
        </Button>
      </form>

      <section className="grid gap-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between rounded-md border border-border bg-surface p-3"
          >
            <div>
              <p className="font-semibold">{category.name}</p>
              <p className="text-sm text-muted">{category.description}</p>
            </div>
            <span className="text-sm text-muted">#{category.sortOrder}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
