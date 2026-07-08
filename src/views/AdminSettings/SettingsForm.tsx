"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Field, Input, Textarea } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import type { RestaurantConfigResponse } from "@/types/api";
import type { SettingsFormProps } from "./types";
import styles from "./styles.module.css";

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
  businessHoursJson: z.string().optional().refine((value) => {
    if (!value?.trim()) {
      return true;
    }

    try {
      return Array.isArray(JSON.parse(value));
    } catch {
      return false;
    }
  }, "Informe uma lista JSON valida."),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsForm({
  initialConfig,
}: SettingsFormProps) {
  const [error, setError] = useState("");
  const { showToast } = useToast();
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
    setError("");
    try {
      const businessHours = values.businessHoursJson?.trim()
        ? JSON.parse(values.businessHoursJson)
        : [];
      console.log("Submitting values:", values);
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
          businessHours,
        }),
      });
      showToast("Configuracao salva com sucesso");
    } catch {
      const message = "Nao foi possivel salvar configuracao.";

      setError(message);
      showToast(message, "error");
    }
  }

  function onInvalidSubmit() {
    const message = "Corrija os campos destacados antes de salvar.";

    setError(message);
    showToast(message, "error");
  }

  return (
    <form className={styles.form} onSubmit={form.handleSubmit(submit, onInvalidSubmit)}>
      <div>
        <h1 className={styles.title}>Configuracao</h1>
        <p className={styles.subtitle}>Identidade, tema e funcionamento.</p>
      </div>

      <section className={styles.section}>
        <div className={styles.gridTwo}>
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

      <section className={styles.section}>
        <div className={styles.gridTwo}>
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

      <Field label="Horarios" error={form.formState.errors.businessHoursJson?.message}>
        <Textarea className={styles.mono} rows={8} {...form.register("businessHoursJson")} />
      </Field>

      {error ? <p className={styles.error}>{error}</p> : null}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        <Save size={16} />
        Salvar
      </Button>
    </form>
  );
}
