"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Field, Input, Select, Textarea } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import type { RestaurantConfigResponse } from "@/types/api";
import { centsToReais, reaisToCents } from "@/utils/format";
import { OperatingHoursEditor } from "./OperatingHoursEditor";
import {
  createHolidayHours,
  createWeeklyHours,
  hasOperatingHoursErrors,
  normalizeBusinessHours,
  normalizeHolidayHours,
  type OperatingHoursErrors,
  validateOperatingHours,
} from "./operatingHours";
import type { SettingsFormProps } from "./types";
import {
  ErrorText,
  Form,
  GridTwo,
  RangeActions,
  RangeList,
  RangeRow,
  Section,
  StatusToggle,
  Subtitle,
  Title,
} from "./styles";

const settingsSchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  whatsapp: z.string().min(8, "Informe o WhatsApp."),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  menuDescription: z.string().optional(),
  minimumOrderReais: z.number().min(0, "Pedido mínimo não pode ser negativo."),
  deliveryEnabled: z.boolean(),
  pricingMode: z.enum(["PER_KM", "RANGE"]),
  maxDistanceKm: z.number().min(0, "Distância não pode ser negativa."),
  pricePerKmReais: z.number().min(0, "Valor por km não pode ser negativo."),
  deliveryFeeRanges: z.array(z.object({
    fromDistanceKm: z.number().min(0, "Distância inicial não pode ser negativa."),
    toDistanceKm: z.number().min(0, "Distância final não pode ser negativa."),
    feeReais: z.number().min(0, "Valor não pode ser negativo."),
  })),
  freeDeliveryMinimumOrderReais: z.number().min(
    0,
    "Limite para frete grátis não pode ser negativo.",
  ),
  freeDeliveryDays: z.array(z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ])),
  primaryColor: z.string().min(4),
  secondaryColor: z.string().min(4),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
}).superRefine((values, context) => {
  if (!values.deliveryEnabled) {
    return;
  }

  if (values.pricingMode === "PER_KM" && values.maxDistanceKm <= 0) {
    context.addIssue({
      code: "custom",
      path: ["maxDistanceKm"],
      message: "Informe uma distância maior que zero.",
    });
  }
  if (values.pricingMode === "PER_KM" && values.pricePerKmReais <= 0) {
    context.addIssue({
      code: "custom",
      path: ["pricePerKmReais"],
      message: "Informe um valor por km maior que zero.",
    });
  }

  if (values.pricingMode === "RANGE") {
    if (values.deliveryFeeRanges.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["deliveryFeeRanges"],
        message: "Adicione pelo menos uma faixa de frete.",
      });
      return;
    }

    values.deliveryFeeRanges.forEach((range, index) => {
      if (range.toDistanceKm <= range.fromDistanceKm) {
        context.addIssue({
          code: "custom",
          path: ["deliveryFeeRanges", index, "toDistanceKm"],
          message: "O fim deve ser maior que o início.",
        });
      }

      const expectedStart = index === 0
        ? 0
        : values.deliveryFeeRanges[index - 1].toDistanceKm;
      if (range.fromDistanceKm !== expectedStart) {
        context.addIssue({
          code: "custom",
          path: ["deliveryFeeRanges", index, "fromDistanceKm"],
          message: index === 0
            ? "A primeira faixa deve começar em 0 km."
            : `A faixa deve começar em ${expectedStart} km.`,
        });
      }
    });
  }
});

const deliveryWeekDays = [
  { value: "MONDAY", label: "Segunda" },
  { value: "TUESDAY", label: "Terça" },
  { value: "WEDNESDAY", label: "Quarta" },
  { value: "THURSDAY", label: "Quinta" },
  { value: "FRIDAY", label: "Sexta" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
] as const;

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsForm({
  initialConfig,
}: SettingsFormProps) {
  const [error, setError] = useState("");
  const [businessHours, setBusinessHours] = useState(() =>
    createWeeklyHours(initialConfig?.businessHours));
  const [holidayHours, setHolidayHours] = useState(() =>
    createHolidayHours(initialConfig?.holidayHours));
  const [operatingHoursErrors, setOperatingHoursErrors] = useState<OperatingHoursErrors>({
    businessHours: {},
    holidayHours: {},
  });
  const { showToast } = useToast();
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialConfig?.name ?? "",
      whatsapp: initialConfig?.whatsapp ?? "",
      logoUrl: initialConfig?.logoUrl ?? "",
      bannerUrl: initialConfig?.bannerUrl ?? "",
      menuDescription: initialConfig?.menuDescription ??
        "Escolha seus itens, revise o pedido e envie.",
      minimumOrderReais: centsToReais(initialConfig?.minimumOrderCents ?? 0),
      deliveryEnabled: initialConfig?.deliverySettings?.enabled ?? false,
      pricingMode: initialConfig?.deliverySettings?.pricingMode ?? "PER_KM",
      maxDistanceKm: initialConfig?.deliverySettings?.maxDistanceKm ?? 0,
      pricePerKmReais: centsToReais(
        initialConfig?.deliverySettings?.pricePerKmCents ?? 0,
      ),
      deliveryFeeRanges: (initialConfig?.deliverySettings?.deliveryFeeRanges ?? []).map(
        (range) => ({
          fromDistanceKm: range.fromDistanceKm,
          toDistanceKm: range.toDistanceKm,
          feeReais: centsToReais(range.feeCents),
        }),
      ),
      freeDeliveryMinimumOrderReais: centsToReais(
        initialConfig?.deliverySettings?.freeDeliveryMinimumOrderCents ?? 0,
      ),
      freeDeliveryDays: initialConfig?.deliverySettings?.freeDeliveryDays ?? [],
      primaryColor: initialConfig?.theme?.primaryColor ?? "#0f766e",
      secondaryColor: initialConfig?.theme?.secondaryColor ?? "#f59e0b",
      street: initialConfig?.address?.street ?? "",
      number: initialConfig?.address?.number ?? "",
      neighborhood: initialConfig?.address?.neighborhood ?? "",
      city: initialConfig?.address?.city ?? "",
      state: initialConfig?.address?.state ?? "",
    },
  });
  const deliveryRanges = useFieldArray({
    control: form.control,
    name: "deliveryFeeRanges",
  });
  const pricingMode = useWatch({
    control: form.control,
    name: "pricingMode",
  });

  async function submit(values: SettingsFormData) {
    setError("");
    const hoursErrors = validateOperatingHours(businessHours, holidayHours);
    setOperatingHoursErrors(hoursErrors);

    if (hasOperatingHoursErrors(hoursErrors)) {
      const message = "Corrija os horários e feriados destacados antes de salvar.";

      setError(message);
      showToast(message, "error");
      return;
    }

    try {
      console.log("Submitting values:", values);
      await clientApi<RestaurantConfigResponse>("admin/restaurant/config", {
        method: "PUT",
        body: JSON.stringify({
          name: values.name,
          whatsapp: values.whatsapp,
          logoUrl: values.logoUrl,
          bannerUrl: values.bannerUrl,
          menuDescription: values.menuDescription,
          minimumOrderCents: reaisToCents(values.minimumOrderReais),
          deliverySettings: {
            enabled: values.deliveryEnabled,
            pricingMode: values.pricingMode,
            maxDistanceKm: values.maxDistanceKm,
            pricePerKmCents: reaisToCents(values.pricePerKmReais),
            deliveryFeeRanges: values.deliveryFeeRanges.map((range) => ({
              fromDistanceKm: range.fromDistanceKm,
              toDistanceKm: range.toDistanceKm,
              feeCents: reaisToCents(range.feeReais),
            })),
            freeDeliveryMinimumOrderCents: reaisToCents(
              values.freeDeliveryMinimumOrderReais,
            ),
            freeDeliveryDays: values.freeDeliveryDays,
          },
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
          businessHours: normalizeBusinessHours(businessHours),
          holidayHours: normalizeHolidayHours(holidayHours),
        }),
      });
      showToast("Configuração salva com sucesso");
    } catch {
      const message = "Não foi possível salvar configuração.";

      setError(message);
      showToast(message, "error");
    }
  }

  function onInvalidSubmit() {
    const message = "Corrija os campos destacados antes de salvar.";

    setError(message);
    showToast(message, "error");
  }

  function changeBusinessHours(hours: typeof businessHours) {
    setBusinessHours(hours);
    setOperatingHoursErrors({ businessHours: {}, holidayHours: {} });
  }

  function changeHolidayHours(hours: typeof holidayHours) {
    setHolidayHours(hours);
    setOperatingHoursErrors({ businessHours: {}, holidayHours: {} });
  }

  return (
    <Form onSubmit={form.handleSubmit(submit, onInvalidSubmit)}>
      <div>
        <Title>Configuração</Title>
        <Subtitle>Identidade, tema e funcionamento.</Subtitle>
      </div>

      <Section>
        <GridTwo>
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
          <Field label="Descrição do cardápio">
            <Textarea rows={3} {...form.register("menuDescription")} />
          </Field>
          <Field
            label="Pedido mínimo (R$)"
            error={form.formState.errors.minimumOrderReais?.message}
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              {...form.register("minimumOrderReais", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Cor primária">
            <Input type="color" {...form.register("primaryColor")} />
          </Field>
          <Field label="Cor secundária">
            <Input type="color" {...form.register("secondaryColor")} />
          </Field>
        </GridTwo>
      </Section>

      <Section>
        <Subtitle>Frete por distância e promoções.</Subtitle>
        <StatusToggle>
          <input type="checkbox" {...form.register("deliveryEnabled")} />
          Ativar cálculo de frete
        </StatusToggle>
        <GridTwo>
          <Field label="Modelo de cobrança">
            <Select {...form.register("pricingMode")}>
              <option value="PER_KM">Valor por km</option>
              <option value="RANGE">Valor fixo por faixa</option>
            </Select>
          </Field>
          {pricingMode === "PER_KM" ? (
            <>
              <Field
                label="Distância máxima (km)"
                error={form.formState.errors.maxDistanceKm?.message}
              >
                <Input
                  type="number"
                  min="0"
                  step="1"
                  {...form.register("maxDistanceKm", { valueAsNumber: true })}
                />
              </Field>
              <Field
                label="Valor por km (R$)"
                error={form.formState.errors.pricePerKmReais?.message}
              >
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register("pricePerKmReais", { valueAsNumber: true })}
                />
              </Field>
            </>
          ) : null}
          <Field
            label="Frete grátis acima de (R$)"
            error={form.formState.errors.freeDeliveryMinimumOrderReais?.message}
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              {...form.register("freeDeliveryMinimumOrderReais", {
                valueAsNumber: true,
              })}
            />
          </Field>
        </GridTwo>
        {pricingMode === "RANGE" ? (
          <RangeList>
            <RangeActions>
              <strong>Faixas de distância</strong>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const previous = form.getValues("deliveryFeeRanges").at(-1);
                  const fromDistanceKm = previous?.toDistanceKm ?? 0;
                  deliveryRanges.append({
                    fromDistanceKm,
                    toDistanceKm: fromDistanceKm + 3,
                    feeReais: 0,
                  });
                }}
              >
                <Plus size={16} />
                Adicionar faixa
              </Button>
            </RangeActions>
            {deliveryRanges.fields.map((range, index) => (
              <RangeRow key={range.id}>
                <Field
                  label="De (km)"
                  error={form.formState.errors.deliveryFeeRanges?.[index]
                    ?.fromDistanceKm?.message}
                >
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...form.register(`deliveryFeeRanges.${index}.fromDistanceKm`, {
                      valueAsNumber: true,
                    })}
                  />
                </Field>
                <Field
                  label="Até (km)"
                  error={form.formState.errors.deliveryFeeRanges?.[index]
                    ?.toDistanceKm?.message}
                >
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...form.register(`deliveryFeeRanges.${index}.toDistanceKm`, {
                      valueAsNumber: true,
                    })}
                  />
                </Field>
                <Field
                  label="Valor (R$)"
                  error={form.formState.errors.deliveryFeeRanges?.[index]?.feeReais?.message}
                >
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...form.register(`deliveryFeeRanges.${index}.feeReais`, {
                      valueAsNumber: true,
                    })}
                  />
                </Field>
                <Button
                  type="button"
                  variant="dangerGhost"
                  aria-label={`Remover faixa ${index + 1}`}
                  onClick={() => deliveryRanges.remove(index)}
                >
                  <Trash2 size={16} />
                </Button>
              </RangeRow>
            ))}
            {typeof form.formState.errors.deliveryFeeRanges?.message === "string" ? (
              <ErrorText>{form.formState.errors.deliveryFeeRanges.message}</ErrorText>
            ) : null}
          </RangeList>
        ) : null}
        <div>
          <strong>Dias com frete grátis</strong>
          <GridTwo>
            {deliveryWeekDays.map((day) => (
              <label key={day.value}>
                <input
                  type="checkbox"
                  value={day.value}
                  {...form.register("freeDeliveryDays")}
                />{" "}
                {day.label}
              </label>
            ))}
          </GridTwo>
        </div>
      </Section>

      <Section>
        <GridTwo>
          <Field label="Rua">
            <Input {...form.register("street")} />
          </Field>
          <Field label="Número">
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
        </GridTwo>
      </Section>

      <OperatingHoursEditor
        businessHours={businessHours}
        holidayHours={holidayHours}
        errors={operatingHoursErrors}
        onBusinessHoursChange={changeBusinessHours}
        onHolidayHoursChange={changeHolidayHours}
      />

      {error ? <ErrorText>{error}</ErrorText> : null}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        <Save size={16} />
        Salvar
      </Button>
    </Form>
  );
}
