"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useAdminOrderSound } from "@/components/AdminOrderSoundNotifier";
import { Button } from "@/components/Button";
import { Field, Input, Select, Textarea } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import type { RestaurantConfigResponse } from "@/types/api";
import {
  formatBrazilianMobileInput,
  isValidBrazilianMobile,
  normalizeBrazilianMobile,
} from "@/utils/customerInput";
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
  Accordion,
  AccordionBody,
  AccordionIcon,
  AccordionSummary,
  AccordionSummaryText,
  AppearanceControls,
  AppearanceDivider,
  AppearanceLayout,
  ColorFields,
  ErrorText,
  Form,
  GridTwo,
  MediaActions,
  MediaPreview,
  MediaUploadGrid,
  Muted,
  RangeActions,
  RangeList,
  RangeOptions,
  RangeRow,
  StatusToggle,
  Subtitle,
  ThemePreview,
  ThemePreviewBanner,
  ThemePreviewBody,
  ThemePreviewCart,
  ThemePreviewCategory,
  ThemePreviewProduct,
  ThemePreviewProductImage,
  Title,
} from "./styles";

const settingsSchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  whatsapp: z.string().refine(
    isValidBrazilianMobile,
    "Informe um celular válido com DDD.",
  ),
  menuDescription: z.string().optional(),
  minimumOrderReais: z.number().min(0, "Pedido mínimo não pode ser negativo."),
  automaticOrderConfirmation: z.boolean(),
  overdueOrderAlertEnabled: z.boolean(),
  overdueOrderAlertMinutes: z.number().int().min(1, "Informe pelo menos 1 minuto."),
  deliveryEnabled: z.boolean(),
  pricingMode: z.enum(["PER_KM", "RANGE"]),
  maxDistanceKm: z.number().min(0, "Distância não pode ser negativa."),
  pricePerKmReais: z.number().min(0, "Valor por km não pode ser negativo."),
  deliveryFeeRanges: z.array(z.object({
    fromDistanceKm: z.number().min(0, "Distância inicial não pode ser negativa."),
    toDistanceKm: z.number().min(0, "Distância final não pode ser negativa.").nullable(),
    isUnlimited: z.boolean(),
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
      if (range.toDistanceKm !== null
        && range.toDistanceKm <= range.fromDistanceKm) {
        context.addIssue({
          code: "custom",
          path: ["deliveryFeeRanges", index, "toDistanceKm"],
          message: "O fim deve ser maior que o início.",
        });
      }
      if (range.toDistanceKm === null && index < values.deliveryFeeRanges.length - 1) {
        context.addIssue({
          code: "custom",
          path: ["deliveryFeeRanges", index, "toDistanceKm"],
          message: "Somente a última faixa pode ficar sem limite.",
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
            : expectedStart === null
              ? "A faixa anterior não pode ser ilimitada."
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

const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
const MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function SettingsForm({
  initialConfig,
}: SettingsFormProps) {
  const [error, setError] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [logoError, setLogoError] = useState("");
  const [bannerError, setBannerError] = useState("");
  const [savedLogoUrl, setSavedLogoUrl] = useState(initialConfig?.logoUrl ?? "");
  const [savedBannerUrl, setSavedBannerUrl] = useState(initialConfig?.bannerUrl ?? "");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [businessHours, setBusinessHours] = useState(() =>
    createWeeklyHours(initialConfig?.businessHours));
  const [holidayHours, setHolidayHours] = useState(() =>
    createHolidayHours(initialConfig?.holidayHours));
  const [operatingHoursErrors, setOperatingHoursErrors] = useState<OperatingHoursErrors>({
    businessHours: {},
    holidayHours: {},
  });
  const { showToast } = useToast();
  const { soundEnabled, setSoundEnabled } = useAdminOrderSound();
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialConfig?.name ?? "",
      whatsapp: formatBrazilianMobileInput(initialConfig?.whatsapp ?? ""),
      menuDescription: initialConfig?.menuDescription ??
        "Escolha seus itens, revise o pedido e envie.",
      minimumOrderReais: centsToReais(initialConfig?.minimumOrderCents ?? 0),
      automaticOrderConfirmation: initialConfig?.automaticOrderConfirmation ?? false,
      overdueOrderAlertEnabled: initialConfig?.overdueOrderAlertEnabled ?? false,
      overdueOrderAlertMinutes: initialConfig?.overdueOrderAlertMinutes ?? 30,
      deliveryEnabled: initialConfig?.deliverySettings?.enabled ?? false,
      pricingMode: initialConfig?.deliverySettings?.pricingMode ?? "PER_KM",
      maxDistanceKm: initialConfig?.deliverySettings?.maxDistanceKm ?? 0,
      pricePerKmReais: centsToReais(
        initialConfig?.deliverySettings?.pricePerKmCents ?? 0,
      ),
      deliveryFeeRanges: (initialConfig?.deliverySettings?.deliveryFeeRanges ?? []).map(
        (range) => ({
          fromDistanceKm: range.fromDistanceKm,
          toDistanceKm: range.toDistanceKm ?? null,
          isUnlimited: range.toDistanceKm == null,
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
  const rangeValues = useWatch({
    control: form.control,
    name: "deliveryFeeRanges",
  });
  const primaryColor = useWatch({ control: form.control, name: "primaryColor" });
  const secondaryColor = useWatch({ control: form.control, name: "secondaryColor" });
  const restaurantName = useWatch({ control: form.control, name: "name" });
  const menuDescription = useWatch({ control: form.control, name: "menuDescription" });

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [bannerPreview, logoPreview]);

  function selectMedia(
    file: File | undefined,
    setFile: (file: File | null) => void,
    setPreview: (preview: string) => void,
    setMediaError: (message: string) => void,
  ) {
    setMediaError("");
    if (!file) {
      setFile(null);
      setPreview("");
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      setFile(null);
      setPreview("");
      setMediaError("A imagem deve ter no máximo 5 MB.");
      return;
    }
    if (!MEDIA_TYPES.has(file.type)) {
      setFile(null);
      setPreview("");
      setMediaError("Use uma imagem JPEG, PNG ou WebP.");
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

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
      const configPayload = {
        name: values.name,
        whatsapp: normalizeBrazilianMobile(values.whatsapp),
        menuDescription: values.menuDescription,
        minimumOrderCents: reaisToCents(values.minimumOrderReais),
        automaticOrderConfirmation: values.automaticOrderConfirmation,
        overdueOrderAlertEnabled: values.overdueOrderAlertEnabled,
        overdueOrderAlertMinutes: values.overdueOrderAlertMinutes,
        deliverySettings: {
          enabled: values.deliveryEnabled,
          pricingMode: values.pricingMode,
          maxDistanceKm: values.maxDistanceKm,
          pricePerKmCents: reaisToCents(values.pricePerKmReais),
          deliveryFeeRanges: values.deliveryFeeRanges.map((range) => ({
            fromDistanceKm: range.fromDistanceKm,
            toDistanceKm: range.isUnlimited ? null : range.toDistanceKm,
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
      };
      const body = new FormData();
      body.append(
        "config",
        new Blob([JSON.stringify(configPayload)], { type: "application/json" }),
      );
      if (logoFile) {
        body.append("logo", logoFile);
      }
      if (bannerFile) {
        body.append("banner", bannerFile);
      }
      const savedConfig = await clientApi<RestaurantConfigResponse>(
        "admin/restaurant/config",
        {
        method: "PUT",
          body,
        },
      );
      setSavedLogoUrl(savedConfig.logoUrl ?? "");
      setSavedBannerUrl(savedConfig.bannerUrl ?? "");
      setLogoFile(null);
      setBannerFile(null);
      setLogoPreview("");
      setBannerPreview("");
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

      <Accordion>
        <AccordionSummary>
          <AccordionSummaryText>
            <strong>Identidade do restaurante</strong>
            <span>Nome, contato, descrição, imagens e pedido mínimo.</span>
          </AccordionSummaryText>
          <AccordionIcon data-accordion-icon>
            <ChevronDown size={18} aria-hidden="true" />
          </AccordionIcon>
        </AccordionSummary>
        <AccordionBody>
          <GridTwo>
          <Field label="Nome" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="Celular" error={form.formState.errors.whatsapp?.message}>
            <Input
              inputMode="numeric"
              autoComplete="tel"
              maxLength={17}
              {...form.register("whatsapp")}
              onInput={(event) => {
                event.currentTarget.value = formatBrazilianMobileInput(
                  event.currentTarget.value,
                );
              }}
            />
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
          </GridTwo>
          <MediaUploadGrid>
            <Field label="Logo" error={logoError}>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(event) => {
                  selectMedia(
                    event.target.files?.[0],
                    setLogoFile,
                    setLogoPreview,
                    setLogoError,
                  );
                  event.target.value = "";
                }}
              />
              <MediaActions>
                <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()}>
                  <ImagePlus size={16} />
                  {logoPreview || savedLogoUrl ? "Trocar logo" : "Escolher logo"}
                </Button>
              </MediaActions>
              {logoPreview || savedLogoUrl ? (
                <MediaPreview
                  role="img"
                  aria-label="Prévia do logo"
                  compact
                  style={{ backgroundImage: `url(${logoPreview || savedLogoUrl})` }}
                />
              ) : null}
              <Muted>JPEG, PNG ou WebP. Máximo de 5 MB.</Muted>
            </Field>
            <Field label="Banner" error={bannerError}>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(event) => {
                  selectMedia(
                    event.target.files?.[0],
                    setBannerFile,
                    setBannerPreview,
                    setBannerError,
                  );
                  event.target.value = "";
                }}
              />
              <MediaActions>
                <Button type="button" variant="outline" onClick={() => bannerInputRef.current?.click()}>
                  <ImagePlus size={16} />
                  {bannerPreview || savedBannerUrl ? "Trocar banner" : "Escolher banner"}
                </Button>
              </MediaActions>
              {bannerPreview || savedBannerUrl ? (
                <MediaPreview
                  role="img"
                  aria-label="Prévia do banner"
                  style={{ backgroundImage: `url(${bannerPreview || savedBannerUrl})` }}
                />
              ) : null}
              <Muted>JPEG, PNG ou WebP. Máximo de 5 MB.</Muted>
            </Field>
          </MediaUploadGrid>
        </AccordionBody>
      </Accordion>

      <Accordion>
        <AccordionSummary>
          <AccordionSummaryText>
            <strong>Aparência do cardápio</strong>
            <span>Cores da marca e preview da home.</span>
          </AccordionSummaryText>
          <AccordionIcon data-accordion-icon>
            <ChevronDown size={18} aria-hidden="true" />
          </AccordionIcon>
        </AccordionSummary>
        <AccordionBody>
          <AppearanceLayout>
            <AppearanceControls>
              <ColorFields>
                <Field label="Cor primária">
                  <Input type="color" {...form.register("primaryColor")} />
                </Field>
                <Field label="Cor secundária">
                  <Input type="color" {...form.register("secondaryColor")} />
                </Field>
              </ColorFields>
            </AppearanceControls>
            <AppearanceDivider aria-hidden="true" />
            <ThemePreview
              style={{
                "--preview-primary": primaryColor,
                "--preview-secondary": secondaryColor,
              } as CSSProperties}
            >
              <ThemePreviewBanner
                style={{
                  backgroundImage: bannerPreview || savedBannerUrl
                    ? `url(${bannerPreview || savedBannerUrl})`
                    : "linear-gradient(135deg, var(--preview-primary), var(--preview-secondary))",
                }}
              />
              <ThemePreviewBody>
                <strong>{restaurantName || "Seu restaurante"}</strong>
                <span>{menuDescription || "Escolha seus itens, revise o pedido e envie."}</span>
                <div>
                  <ThemePreviewCategory>Mais pedidos</ThemePreviewCategory>
                  <ThemePreviewCategory>Combos</ThemePreviewCategory>
                </div>
                <ThemePreviewProduct>
                  <div>
                    <strong>Produto em destaque</strong>
                    <span>Descrição do produto na home.</span>
                    <b>R$ 24,90</b>
                  </div>
                  <ThemePreviewProductImage />
                </ThemePreviewProduct>
                <ThemePreviewCart>Ver pedido · R$ 24,90</ThemePreviewCart>
              </ThemePreviewBody>
            </ThemePreview>
          </AppearanceLayout>
        </AccordionBody>
      </Accordion>

      <Accordion>
        <AccordionSummary>
          <AccordionSummaryText>
            <strong>Pedidos e alertas</strong>
            <span>Automação e notificações deste navegador.</span>
          </AccordionSummaryText>
          <AccordionIcon data-accordion-icon>
            <ChevronDown size={18} aria-hidden="true" />
          </AccordionIcon>
        </AccordionSummary>
        <AccordionBody>
          <StatusToggle>
            <input type="checkbox" {...form.register("automaticOrderConfirmation")} />
            <span>Confirmar pedidos automaticamente e enviar para impressão</span>
          </StatusToggle>
          <StatusToggle>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(event) => {
                void setSoundEnabled(event.target.checked);
              }}
            />
            <span>Ativar alerta sonoro de novos pedidos neste navegador</span>
          </StatusToggle>
          <StatusToggle>
            <input type="checkbox" {...form.register("overdueOrderAlertEnabled")} />
            <span>Alertar pedidos atrasados na cozinha</span>
          </StatusToggle>
          <Field
            label="Atraso para alertar (minutos)"
            error={form.formState.errors.overdueOrderAlertMinutes?.message}
          >
            <Input
              type="number"
              min="1"
              step="1"
              {...form.register("overdueOrderAlertMinutes", { valueAsNumber: true })}
            />
          </Field>
        </AccordionBody>
      </Accordion>

      <Accordion>
        <AccordionSummary>
          <AccordionSummaryText>
            <strong>Entrega e frete</strong>
            <span>Distâncias, faixas de cobrança e promoções.</span>
          </AccordionSummaryText>
          <AccordionIcon data-accordion-icon>
            <ChevronDown size={18} aria-hidden="true" />
          </AccordionIcon>
        </AccordionSummary>
        <AccordionBody>
          <StatusToggle>
            <input type="checkbox" {...form.register("deliveryEnabled")} />
            <span>Ativar cálculo de frete</span>
          </StatusToggle>
        <GridTwo>
          <Field label="Modelo de cobrança">
            <Select
              {...form.register("pricingMode", {
                onChange: (event) => {
                  if (event.target.value === "RANGE"
                    && form.getValues("deliveryFeeRanges").length === 0) {
                    deliveryRanges.append({
                      fromDistanceKm: 0,
                      toDistanceKm: 1,
                      isUnlimited: false,
                      feeReais: 0,
                    });
                  }
                },
              })}
            >
              <option value="PER_KM">Valor por km</option>
              <option value="RANGE">Faixas de distância (valor fixo)</option>
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
              <div>
                <strong>Faixas de distância</strong>
                <p>
                  Cada distância usa uma única faixa. Exemplo: até 1 km = R$ 0;
                  acima de 1 até 2,5 km = R$ 6.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={rangeValues.at(-1)?.toDistanceKm === null}
                onClick={() => {
                  const previous = form.getValues("deliveryFeeRanges").at(-1);
                  if (previous?.toDistanceKm === null) {
                    return;
                  }
                  const fromDistanceKm = previous?.toDistanceKm ?? 0;
                  deliveryRanges.append({
                    fromDistanceKm,
                    toDistanceKm: fromDistanceKm + 3,
                    isUnlimited: false,
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
                    step="0.1"
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
                    step="0.1"
                    readOnly={rangeValues[index]?.isUnlimited}
                    {...form.register(`deliveryFeeRanges.${index}.toDistanceKm`, {
                      setValueAs: (value) => value == null || value === ""
                        ? null
                        : Number(value),
                      onChange: (event) => {
                        const nextRange = form.getValues("deliveryFeeRanges")[index + 1];
                        const value = event.target.value === ""
                          ? null
                          : Number(event.target.value);
                        if (nextRange && value !== null) {
                          form.setValue(
                            `deliveryFeeRanges.${index + 1}.fromDistanceKm`,
                            value,
                            { shouldDirty: true, shouldValidate: true },
                          );
                        }
                      },
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
                  onClick={() => {
                    const remainingRanges = form.getValues("deliveryFeeRanges")
                      .filter((_, rangeIndex) => rangeIndex !== index);
                    const nextRange = remainingRanges[index];
                    if (nextRange) {
                      nextRange.fromDistanceKm = index === 0
                        ? 0
                        : remainingRanges[index - 1].toDistanceKm
                          ?? nextRange.fromDistanceKm;
                    }
                    deliveryRanges.replace(remainingRanges);
                  }}
                >
                  <Trash2 size={16} />
                </Button>
                <RangeOptions>
                  <StatusToggle>
                    <input
                      type="checkbox"
                      checked={rangeValues[index]?.isUnlimited ?? false}
                      onChange={(event) => {
                        const isUnlimited = event.target.checked;
                        const fromDistanceKm = form.getValues(
                          `deliveryFeeRanges.${index}.fromDistanceKm`,
                        );
                        form.setValue(
                          `deliveryFeeRanges.${index}.isUnlimited`,
                          isUnlimited,
                          { shouldDirty: true },
                        );
                        form.setValue(
                          `deliveryFeeRanges.${index}.toDistanceKm`,
                          isUnlimited ? null : fromDistanceKm + 1,
                          { shouldDirty: true, shouldValidate: true },
                        );
                      }}
                    />
                    Sem limite (acima de {rangeValues[index]?.fromDistanceKm ?? 0} km)
                  </StatusToggle>
                </RangeOptions>
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
        </AccordionBody>
      </Accordion>

      <Accordion>
        <AccordionSummary>
          <AccordionSummaryText>
            <strong>Endereço</strong>
            <span>Localização usada pelo restaurante.</span>
          </AccordionSummaryText>
          <AccordionIcon data-accordion-icon>
            <ChevronDown size={18} aria-hidden="true" />
          </AccordionIcon>
        </AccordionSummary>
        <AccordionBody>
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
        </AccordionBody>
      </Accordion>

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
