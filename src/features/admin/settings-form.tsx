"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { clientApi } from "@/lib/api/client";
import type { RestaurantConfigResponse } from "@/types/api";

const settingsSchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  whatsapp: z.string().min(8, "Informe o WhatsApp."),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  primaryColor: z.string().min(4),
  secondaryColor: z.string().min(4),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  businessHoursJson: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsForm({
  initialConfig,
}: {
  initialConfig: RestaurantConfigResponse | null;
}) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialConfig?.name ?? "",
      whatsapp: initialConfig?.whatsapp ?? "",
      logoUrl: initialConfig?.logoUrl ?? "",
      bannerUrl: initialConfig?.bannerUrl ?? "",
      primaryColor: initialConfig?.theme?.primaryColor ?? "#0f766e",
      secondaryColor: initialConfig?.theme?.secondaryColor ?? "#f59e0b",
      street: initialConfig?.address?.street ?? "",
      number: initialConfig?.address?.number ?? "",
      neighborhood: initialConfig?.address?.neighborhood ?? "",
      city: initialConfig?.address?.city ?? "",
      state: initialConfig?.address?.state ?? "",
      businessHoursJson: JSON.stringify(initialConfig?.businessHours ?? [], null, 2),
    },
  });

  async function submit(values: SettingsFormData) {
    setSaved(false);
    setError("");
    try {
      await clientApi<RestaurantConfigResponse>("admin/restaurant/config", {
        method: "PUT",
        body: JSON.stringify({
          name: values.name,
          whatsapp: values.whatsapp,
          logoUrl: values.logoUrl,
          bannerUrl: values.bannerUrl,
          theme: {
            primaryColor: values.primaryColor,
            secondaryColor: values.secondaryColor,
          },
          address: {
            street: values.street,
            number: values.number,
            neighborhood: values.neighborhood,
            city: values.city,
            state: values.state,
          },
          businessHours: values.businessHoursJson
            ? JSON.parse(values.businessHoursJson)
            : [],
        }),
      });
      setSaved(true);
    } catch {
      setError("Nao foi possivel salvar.");
    }
  }

  return (
    <form className="grid max-w-3xl gap-4" onSubmit={form.handleSubmit(submit)}>
      <div>
        <h1 className="text-2xl font-bold">Configuracao</h1>
        <p className="text-sm text-muted">Identidade, tema e funcionamento.</p>
      </div>

      <section className="grid gap-3 rounded-md border border-border bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="WhatsApp" error={form.formState.errors.whatsapp?.message}>
            <Input {...form.register("whatsapp")} />
          </Field>
          <Field label="Logo URL">
            <Input {...form.register("logoUrl")} />
          </Field>
          <Field label="Banner URL">
            <Input {...form.register("bannerUrl")} />
          </Field>
          <Field label="Cor primaria">
            <Input type="color" {...form.register("primaryColor")} />
          </Field>
          <Field label="Cor secundaria">
            <Input type="color" {...form.register("secondaryColor")} />
          </Field>
        </div>
      </section>

      <section className="grid gap-3 rounded-md border border-border bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Rua">
            <Input {...form.register("street")} />
          </Field>
          <Field label="Numero">
            <Input {...form.register("number")} />
          </Field>
          <Field label="Bairro">
            <Input {...form.register("neighborhood")} />
          </Field>
          <Field label="Cidade">
            <Input {...form.register("city")} />
          </Field>
          <Field label="Estado">
            <Input {...form.register("state")} />
          </Field>
        </div>
      </section>

      <Field label="Horarios">
        <Textarea className="font-mono" rows={8} {...form.register("businessHoursJson")} />
      </Field>

      {saved ? <p className="text-sm text-primary">Configuracao salva.</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        <Save size={16} />
        Salvar
      </Button>
    </form>
  );
}
