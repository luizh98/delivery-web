"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
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
import { whatsappSettingsSchema } from "./whatsappSettings";
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
  SaveBar,
  SettingsGroup,
  SectionTitle,
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

const settingsBaseSchema = z.object({
  name: z.string().refine(
    (value) => !value.trim() || value.trim().length >= 2,
    "Informe pelo menos 2 caracteres no nome.",
  ),
  whatsapp: z.string().refine(
    (value) => !value.trim() || isValidBrazilianMobile(value),
    "Informe um celular válido com DDD.",
  ),
  menuDescription: z.string().optional(),
  minimumOrderReais: z.number().min(0, "Pedido mínimo não pode ser negativo."),
  automaticOrderConfirmation: z.boolean(),
  whatsappNotificationsEnabled: z.boolean(),
  whatsappPhoneNumberId: z.string(),
  whatsappAccessToken: z.string(),
  whatsappApiVersion: z.string(),
  whatsappProductionTemplate: z.string(),
  whatsappDeliveryTemplate: z.string(),
  whatsappCompletedTemplate: z.string(),
  overdueOrderAlertEnabled: z.boolean(),
  overdueOrderAlertMinutes: z.number().int(),
  deliveryEnabled: z.boolean(),
  deliveryOrganizationStrategy: z.enum(["INDIVIDUAL", "NEIGHBORHOOD", "PROXIMITY"]),
  deliveryMaxOrdersPerRoute: z.number().int(),
  deliveryWaitToleranceMinutes: z.number().int(),
  deliveryMaxDistanceKm: z.number().int(),
  pricingMode: z.enum(["PER_KM", "RANGE"]),
  maxDistanceKm: z.number(),
  pricePerKmReais: z.number(),
  deliveryFeeRanges: z.array(z.object({
    fromDistanceKm: z.number(),
    toDistanceKm: z.number().nullable(),
    isUnlimited: z.boolean(),
    feeReais: z.number(),
  })),
  freeDeliveryMinimumOrderReais: z.number(),
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
  metaPixelId: z.string(),
  metaPixelEnabled: z.boolean(),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsBaseSchema>;

function settingsSchemaFor(scope: {
  alerts: boolean;
  delivery: boolean;
  organization: boolean;
  pixel: boolean;
}) {
  return settingsBaseSchema.superRefine((values, context) => {
  if (scope.alerts && values.overdueOrderAlertEnabled && values.overdueOrderAlertMinutes < 1) {
    context.addIssue({
      code: "custom",
      path: ["overdueOrderAlertMinutes"],
      message: "Informe pelo menos 1 minuto.",
    });
  }
  if (scope.organization && values.deliveryOrganizationStrategy !== "INDIVIDUAL"
    && (values.deliveryWaitToleranceMinutes < 0 || values.deliveryWaitToleranceMinutes > 30)) {
    context.addIssue({
      code: "custom",
      path: ["deliveryWaitToleranceMinutes"],
      message: "Informe um tempo entre 0 e 30 minutos.",
    });
  }
  if (scope.organization && values.deliveryOrganizationStrategy !== "INDIVIDUAL"
    && (values.deliveryMaxOrdersPerRoute < 2 || values.deliveryMaxOrdersPerRoute > 15)) {
    context.addIssue({
      code: "custom",
      path: ["deliveryMaxOrdersPerRoute"],
      message: "Escolha entre 2 e 15 pedidos.",
    });
  }
  if (scope.organization && values.deliveryOrganizationStrategy === "PROXIMITY"
    && (values.deliveryMaxDistanceKm < 1 || values.deliveryMaxDistanceKm > 10)) {
    context.addIssue({
      code: "custom",
      path: ["deliveryMaxDistanceKm"],
      message: "Escolha uma distância válida.",
    });
  }
  if (scope.pixel && values.metaPixelEnabled && !/^[0-9]{5,20}$/.test(values.metaPixelId.trim())) {
    context.addIssue({
      code: "custom",
      path: ["metaPixelId"],
      message: "Informe um ID de Pixel válido com 5 a 20 dígitos.",
    });
  }
  if (!scope.delivery || !values.deliveryEnabled) {
    return;
  }

  if (values.freeDeliveryMinimumOrderReais < 0) {
    context.addIssue({ code: "custom", path: ["freeDeliveryMinimumOrderReais"], message: "Limite para frete grátis não pode ser negativo." });
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
      if (range.fromDistanceKm < 0) {
        context.addIssue({ code: "custom", path: ["deliveryFeeRanges", index, "fromDistanceKm"], message: "Distância inicial não pode ser negativa." });
      }
      if (range.feeReais < 0) {
        context.addIssue({ code: "custom", path: ["deliveryFeeRanges", index, "feeReais"], message: "Valor não pode ser negativo." });
      }
      if (range.toDistanceKm !== null && range.toDistanceKm < 0) {
        context.addIssue({ code: "custom", path: ["deliveryFeeRanges", index, "toDistanceKm"], message: "Distância final não pode ser negativa." });
      }
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
}

const deliveryWeekDays = [
  { value: "MONDAY", label: "Segunda" },
  { value: "TUESDAY", label: "Terça" },
  { value: "WEDNESDAY", label: "Quarta" },
  { value: "THURSDAY", label: "Quinta" },
  { value: "FRIDAY", label: "Sexta" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
] as const;

const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
const MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function SettingsForm({
  initialConfig,
}: SettingsFormProps) {
  const [currentConfig, setCurrentConfig] = useState(initialConfig);
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
  const [businessHoursDirty, setBusinessHoursDirty] = useState(false);
  const [holidayHoursDirty, setHolidayHoursDirty] = useState(false);
  const [operatingHoursErrors, setOperatingHoursErrors] = useState<OperatingHoursErrors>({
    businessHours: {},
    holidayHours: {},
  });
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();
  const { soundEnabled, setSoundEnabled } = useAdminOrderSound();
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsBaseSchema),
    defaultValues: {
      name: initialConfig?.name ?? "",
      whatsapp: formatBrazilianMobileInput(initialConfig?.whatsapp ?? ""),
      menuDescription: initialConfig?.menuDescription ??
        "Escolha seus itens, revise o pedido e envie.",
      minimumOrderReais: centsToReais(initialConfig?.minimumOrderCents ?? 0),
      automaticOrderConfirmation: initialConfig?.automaticOrderConfirmation ?? false,
      whatsappNotificationsEnabled: initialConfig?.whatsappNotificationsEnabled ?? false,
      whatsappPhoneNumberId: initialConfig?.whatsappIntegration?.phoneNumberId ?? "",
      whatsappAccessToken: "",
      whatsappApiVersion: initialConfig?.whatsappIntegration?.apiVersion ?? "v25.0",
      whatsappProductionTemplate: initialConfig?.whatsappIntegration?.templates?.production ?? "pedido_producao",
      whatsappDeliveryTemplate: initialConfig?.whatsappIntegration?.templates?.delivery ?? "pedido_entrega",
      whatsappCompletedTemplate: initialConfig?.whatsappIntegration?.templates?.completed ?? "pedido_concluido",
      overdueOrderAlertEnabled: initialConfig?.overdueOrderAlertEnabled ?? false,
      overdueOrderAlertMinutes: initialConfig?.overdueOrderAlertMinutes ?? 30,
      deliveryEnabled: initialConfig?.deliverySettings?.enabled ?? false,
      deliveryOrganizationStrategy: initialConfig?.deliveryOrganization?.strategy ?? "INDIVIDUAL",
      deliveryMaxOrdersPerRoute: initialConfig?.deliveryOrganization?.maxOrdersPerRoute ?? 2,
      deliveryWaitToleranceMinutes: initialConfig?.deliveryOrganization?.waitToleranceMinutes ?? 5,
      deliveryMaxDistanceKm: initialConfig?.deliveryOrganization?.maxDistanceKm ?? 2,
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
      metaPixelId: initialConfig?.integrations?.metaPixel?.pixelId ?? "",
      metaPixelEnabled: initialConfig?.integrations?.metaPixel?.enabled ?? false,
      street: initialConfig?.address?.street ?? "",
      number: initialConfig?.address?.number ?? "",
      neighborhood: initialConfig?.address?.neighborhood ?? "",
      city: initialConfig?.address?.city ?? "",
      state: initialConfig?.address?.state ?? "",
    },
  });
  const dirtyFields = form.formState.dirtyFields;
  const hasChanges = form.formState.isDirty || businessHoursDirty || holidayHoursDirty
    || Boolean(logoFile || bannerFile);
  const deliveryRanges = useFieldArray({
    control: form.control,
    name: "deliveryFeeRanges",
  });
  const pricingMode = useWatch({
    control: form.control,
    name: "pricingMode",
  });
  const deliveryOrganizationStrategy = useWatch({
    control: form.control,
    name: "deliveryOrganizationStrategy",
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

  useEffect(() => {
    const root = formRef.current;
    if (!root) return;
    const errors = Object.keys(form.formState.errors);
    const invalidFields = Array.from(root.querySelectorAll<HTMLInputElement>("[name]"))
      .filter((field) => errors.some((key) => field.name === key || field.name.startsWith(key + ".")));
    invalidFields.forEach((field) => {
      const section = field.closest("details");
      if (section) section.open = true;
    });
    if (hasOperatingHoursErrors(operatingHoursErrors)) {
      const section = root.querySelector<HTMLDetailsElement>("#operating-hours");
      if (section) section.open = true;
      section?.scrollIntoView({ block: "nearest" });
    }
    invalidFields[0]?.focus();
  }, [form.formState.errors, operatingHoursErrors]);

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
    const dirty = dirtyFields;
    const changed = (...fields: (keyof SettingsFormData)[]) =>
      fields.some((field) => Boolean(dirty[field]));
    if (dirty.name && !values.name.trim()) {
      const message = "Informe o nome do restaurante.";
      form.setError("name", { type: "manual", message });
      setError(message);
      showToast(message, "error");
      return;
    }
    const deliveryChanged = changed("deliveryEnabled", "pricingMode", "maxDistanceKm", "pricePerKmReais", "deliveryFeeRanges", "freeDeliveryMinimumOrderReais", "freeDeliveryDays");
    const organizationChanged = changed("deliveryOrganizationStrategy", "deliveryMaxOrdersPerRoute", "deliveryWaitToleranceMinutes", "deliveryMaxDistanceKm");
    const pixelChanged = changed("metaPixelId", "metaPixelEnabled");
    const whatsappChanged = changed("whatsappPhoneNumberId", "whatsappAccessToken", "whatsappApiVersion", "whatsappProductionTemplate", "whatsappDeliveryTemplate", "whatsappCompletedTemplate");
    if (whatsappChanged || (values.whatsappNotificationsEnabled && !currentConfig?.whatsappIntegration?.tokenConfigured)) {
      const result = whatsappSettingsSchema.safeParse({ ...values, tokenConfigured: currentConfig?.whatsappIntegration?.tokenConfigured ?? false });
      if (!result.success) {
        for (const issue of result.error.issues) {
          form.setError(issue.path[0] as FieldPath<SettingsFormData>, { type: "manual", message: issue.message });
        }
        setError("Revise a configuração do WhatsApp antes de salvar.");
        showToast("Revise a configuração do WhatsApp antes de salvar.", "error");
        return;
      }
    }
    const sectionResult = settingsSchemaFor({
      alerts: changed("overdueOrderAlertEnabled", "overdueOrderAlertMinutes"),
      delivery: deliveryChanged,
      organization: organizationChanged,
      pixel: pixelChanged,
    }).safeParse(values);
    if (!sectionResult.success) {
      sectionResult.error.issues.forEach((issue) => {
        form.setError(issue.path.map(String).join(".") as FieldPath<SettingsFormData>, {
          type: "manual",
          message: issue.message,
        });
      });
      const message = "Corrija os campos destacados antes de salvar.";
      setError(message);
      showToast(message, "error");
      return;
    }
    const hoursErrors = validateOperatingHours(
      businessHoursDirty ? businessHours : [],
      holidayHoursDirty ? holidayHours : [],
    );
    setOperatingHoursErrors(hoursErrors);

    if (hasOperatingHoursErrors(hoursErrors)) {
      const message = "Corrija os horários e feriados destacados antes de salvar.";

      setError(message);
      showToast(message, "error");
      return;
    }

    try {
      const configPayload = {
        ...(dirty.name && values.name.trim() ? { name: values.name.trim() } : {}),
        ...(dirty.whatsapp ? { whatsapp: normalizeBrazilianMobile(values.whatsapp) } : {}),
        ...(dirty.menuDescription ? { menuDescription: values.menuDescription } : {}),
        ...(dirty.minimumOrderReais ? { minimumOrderCents: reaisToCents(values.minimumOrderReais) } : {}),
        ...(dirty.automaticOrderConfirmation ? { automaticOrderConfirmation: values.automaticOrderConfirmation } : {}),
        ...(dirty.whatsappNotificationsEnabled ? { whatsappNotificationsEnabled: values.whatsappNotificationsEnabled } : {}),
        ...(whatsappChanged ? { whatsappIntegration: {
          phoneNumberId: values.whatsappPhoneNumberId.trim(),
          accessToken: values.whatsappAccessToken.trim(),
          apiVersion: values.whatsappApiVersion.trim(),
          language: "pt_BR",
          templates: { production: values.whatsappProductionTemplate.trim(), delivery: values.whatsappDeliveryTemplate.trim(), completed: values.whatsappCompletedTemplate.trim() },
        }} : {}),
        ...(dirty.overdueOrderAlertEnabled ? { overdueOrderAlertEnabled: values.overdueOrderAlertEnabled } : {}),
        ...(dirty.overdueOrderAlertMinutes ? { overdueOrderAlertMinutes: values.overdueOrderAlertMinutes } : {}),
        ...(deliveryChanged ? { deliverySettings: {
          ...currentConfig?.deliverySettings,
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
        }} : {}),
        ...(organizationChanged ? { deliveryOrganization: {
          ...currentConfig?.deliveryOrganization,
          strategy: values.deliveryOrganizationStrategy,
          maxOrdersPerRoute: values.deliveryMaxOrdersPerRoute,
          waitToleranceMinutes: values.deliveryWaitToleranceMinutes,
          maxDistanceKm: values.deliveryMaxDistanceKm,
        }} : {}),
        ...(changed("primaryColor", "secondaryColor") ? { theme: {
          ...currentConfig?.theme,
          primaryColor: values.primaryColor,
          secondaryColor: values.secondaryColor,
        }} : {}),
        ...(pixelChanged ? { integrations: {
          ...currentConfig?.integrations,
          metaPixel: {
            ...currentConfig?.integrations?.metaPixel,
            pixelId: values.metaPixelId.trim(),
            enabled: values.metaPixelEnabled,
          },
        }} : {}),
        ...(changed("street", "number", "neighborhood", "city", "state") ? { address: {
          ...currentConfig?.address,
          street: values.street,
          number: values.number,
          neighborhood: values.neighborhood,
          city: values.city,
          state: values.state,
        }} : {}),
        ...(businessHoursDirty ? { businessHours: normalizeBusinessHours(businessHours) } : {}),
        ...(holidayHoursDirty ? { holidayHours: normalizeHolidayHours(holidayHours) } : {}),
      };
      const body = new FormData();
      body.append("config", JSON.stringify(configPayload));
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
      setCurrentConfig(savedConfig);
      setLogoFile(null);
      setBannerFile(null);
      setLogoPreview("");
      setBannerPreview("");
      form.reset({ ...values, whatsappAccessToken: "" });
      setBusinessHoursDirty(false);
      setHolidayHoursDirty(false);
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
    setBusinessHoursDirty(true);
    setOperatingHoursErrors({ businessHours: {}, holidayHours: {} });
  }

  function changeHolidayHours(hours: typeof holidayHours) {
    setHolidayHours(hours);
    setHolidayHoursDirty(true);
    setOperatingHoursErrors({ businessHours: {}, holidayHours: {} });
  }

  return (
    <Form ref={formRef} noValidate onSubmit={form.handleSubmit(submit, onInvalidSubmit)}>
      <div>
        <Title>Configurações</Title>
        <Subtitle>Abra uma seção, ajuste o que precisa e salve as alterações.</Subtitle>
      </div>

      <Accordion id="restaurant">
        <AccordionSummary>
          <AccordionSummaryText>
            <strong>Restaurante</strong>
            <span>Nome, WhatsApp e endereço.</span>
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
          </GridTwo>
          <SettingsGroup>
          <SectionTitle as="h3">Endereço</SectionTitle>
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
          </SettingsGroup>
        </AccordionBody>
      </Accordion>

      <Accordion id="appearance">
        <AccordionSummary>
          <AccordionSummaryText>
            <strong>Cardápio e aparência</strong>
            <span>Descrição, logo, banner e cores do cardápio.</span>
          </AccordionSummaryText>
          <AccordionIcon data-accordion-icon>
            <ChevronDown size={18} aria-hidden="true" />
          </AccordionIcon>
        </AccordionSummary>
        <AccordionBody>
          <AppearanceLayout>
            <AppearanceControls>
          <Field label="Descrição do cardápio">
            <Textarea rows={3} {...form.register("menuDescription")} />
          </Field>
          <MediaUploadGrid css={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
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

      <Accordion id="orders">
        <AccordionSummary>
          <AccordionSummaryText>
            <strong>Pedidos e alertas</strong>
            <span>Pedido mínimo, confirmação automática e notificações.</span>
          </AccordionSummaryText>
          <AccordionIcon data-accordion-icon>
            <ChevronDown size={18} aria-hidden="true" />
          </AccordionIcon>
        </AccordionSummary>
        <AccordionBody>
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
          <StatusToggle>
            <input type="checkbox" {...form.register("automaticOrderConfirmation")} />
            <span>Confirmar pedidos automaticamente e enviar para impressão</span>
          </StatusToggle>
          <SettingsGroup aria-labelledby="whatsapp-settings-title" css={{ "& input::placeholder": { color: "var(--color-muted)", opacity: 1 } }}>
            <SectionTitle as="h3" id="whatsapp-settings-title">WhatsApp dos pedidos</SectionTitle>
            <Muted>Avisos de preparação, saída para entrega e conclusão pelo número do restaurante.</Muted>
            <StatusToggle>
              <input type="checkbox" defaultChecked={initialConfig?.whatsappNotificationsEnabled ?? false} {...form.register("whatsappNotificationsEnabled")} />
              <span>Enviar status dos pedidos por WhatsApp</span>
            </StatusToggle>
            <Muted role="status">{currentConfig?.whatsappIntegration?.tokenConfigured ? "Token configurado. Deixe o campo vazio para manter o atual." : "Para começar, informe o ID do número e o token obtidos na Meta."}</Muted>
            <GridTwo>
              <Field label="ID do número na Meta" error={form.formState.errors.whatsappPhoneNumberId?.message}>
                <Input inputMode="numeric" autoComplete="off" placeholder="Ex.: 123456789012345" aria-describedby="whatsapp-number-help" aria-invalid={!!form.formState.errors.whatsappPhoneNumberId} {...form.register("whatsappPhoneNumberId")} />
                <Muted id="whatsapp-number-help">É o Phone Number ID, não o telefone. Use o número cadastrado em Restaurante → Celular.</Muted>
              </Field>
              <Field label={currentConfig?.whatsappIntegration?.tokenConfigured ? "Substituir token de acesso" : "Token de acesso"} error={form.formState.errors.whatsappAccessToken?.message}>
                <Input type="password" autoComplete="new-password" spellCheck={false} placeholder={currentConfig?.whatsappIntegration?.tokenConfigured ? "Deixe vazio para manter" : "Cole o token da Meta"} aria-describedby="whatsapp-token-help" aria-invalid={!!form.formState.errors.whatsappAccessToken} {...form.register("whatsappAccessToken")} />
                <Muted id="whatsapp-token-help">O token é protegido e não será exibido depois de salvar.</Muted>
              </Field>
            </GridTwo>
            <SectionTitle as="h4">Mensagens aprovadas na Meta</SectionTitle>
            <Muted>Use os nomes exatos dos templates em Português (Brasil), com os parâmetros definidos para cada etapa.</Muted>
            <Field label="Recebido / Confirmado · preparação" error={form.formState.errors.whatsappProductionTemplate?.message}>
              <Input autoComplete="off" spellCheck={false} aria-describedby="whatsapp-production-help" aria-invalid={!!form.formState.errors.whatsappProductionTemplate} {...form.register("whatsappProductionTemplate")} />
              <Muted id="whatsapp-production-help">Um único aviso. Parâmetros: número do pedido e detalhes.</Muted>
            </Field>
            <GridTwo>
              <Field label="Saiu para entrega" error={form.formState.errors.whatsappDeliveryTemplate?.message}>
                <Input autoComplete="off" spellCheck={false} aria-describedby="whatsapp-delivery-help" aria-invalid={!!form.formState.errors.whatsappDeliveryTemplate} {...form.register("whatsappDeliveryTemplate")} />
                <Muted id="whatsapp-delivery-help">Parâmetro: número do pedido.</Muted>
              </Field>
              <Field label="Concluído · avaliação" error={form.formState.errors.whatsappCompletedTemplate?.message}>
                <Input autoComplete="off" spellCheck={false} aria-describedby="whatsapp-completed-help" aria-invalid={!!form.formState.errors.whatsappCompletedTemplate} {...form.register("whatsappCompletedTemplate")} />
                <Muted id="whatsapp-completed-help">Parâmetros: primeiro nome e número do pedido.</Muted>
              </Field>
            </GridTwo>
            <Field label="Versão da API Meta" error={form.formState.errors.whatsappApiVersion?.message}>
              <Input autoComplete="off" placeholder="v25.0" aria-describedby="whatsapp-version-help" aria-invalid={!!form.formState.errors.whatsappApiVersion} {...form.register("whatsappApiVersion")} />
              <Muted id="whatsapp-version-help">Mantenha v25.0, a menos que sua integração use outra versão.</Muted>
            </Field>
            <Muted>Salve no botão abaixo. Alterações passam a valer nos próximos envios, sem reiniciar o sistema. Ative após registrar o número, aprovar os templates na Meta e obter autorização dos clientes.</Muted>
          </SettingsGroup>
          <SettingsGroup>
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
          <Muted>Aplicado na hora, somente neste navegador. Não precisa salvar.</Muted>
          </SettingsGroup>
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

      <Accordion id="delivery">
        <AccordionSummary>
          <AccordionSummaryText>
            <strong>Entregas</strong>
            <span>Cálculo de frete, promoções e organização dos motoboys.</span>
          </AccordionSummaryText>
          <AccordionIcon data-accordion-icon>
            <ChevronDown size={18} aria-hidden="true" />
          </AccordionIcon>
        </AccordionSummary>
        <AccordionBody>
          <SectionTitle as="h3">Frete e promoções</SectionTitle>
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
          <SettingsGroup>
          <SectionTitle as="h3">Organização das entregas</SectionTitle>
          <Field label="Como você quer organizar suas entregas?">
            <Select {...form.register("deliveryOrganizationStrategy")}>
              <option value="INDIVIDUAL">Uma entrega por vez</option>
              <option value="NEIGHBORHOOD">Agrupar por bairro</option>
              <option value="PROXIMITY">Agrupar por proximidade</option>
            </Select>
          </Field>
          <Muted>
            {deliveryOrganizationStrategy === "INDIVIDUAL"
              ? "Cada pedido é enviado individualmente para um motoboy."
              : deliveryOrganizationStrategy === "NEIGHBORHOOD"
                ? "Pedidos do mesmo bairro podem ser enviados juntos."
                : "Pedidos com endereços próximos podem ser enviados juntos."}
          </Muted>
          {deliveryOrganizationStrategy !== "INDIVIDUAL" ? (
            <GridTwo>
              <Field
                label="Quantos pedidos o motoboy pode levar por viagem?"
                error={form.formState.errors.deliveryMaxOrdersPerRoute?.message}
              >
                <Select {...form.register("deliveryMaxOrdersPerRoute", { valueAsNumber: true })}>
                  {Array.from({ length: 14 }, (_, index) => index + 2).map((count) => (
                    <option key={count} value={count}>{count} pedidos</option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Tempo de espera para agrupar pedidos (minutos)"
                error={form.formState.errors.deliveryWaitToleranceMinutes?.message}
              >
                <Input
                  type="number"
                  min="0"
                  max="30"
                  step="1"
                  {...form.register("deliveryWaitToleranceMinutes", { valueAsNumber: true })}
                />
              </Field>
              {deliveryOrganizationStrategy === "PROXIMITY" ? (
                <Field
                  label="Distância máxima entre entregas"
                  error={form.formState.errors.deliveryMaxDistanceKm?.message}
                >
                  <Select {...form.register("deliveryMaxDistanceKm", { valueAsNumber: true })}>
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((distance) => (
                      <option key={distance} value={distance}>{distance} km</option>
                    ))}
                  </Select>
                </Field>
              ) : null}
            </GridTwo>
          ) : null}
          <Muted>O tempo é um limite máximo: se surgir uma combinação adequada antes, ela segue imediatamente.</Muted>
          </SettingsGroup>
        </AccordionBody>
      </Accordion>

      <OperatingHoursEditor
        businessHours={businessHours}
        holidayHours={holidayHours}
        errors={operatingHoursErrors}
        onBusinessHoursChange={changeBusinessHours}
        onHolidayHoursChange={changeHolidayHours}
      />

      <Accordion id="marketing">
        <AccordionSummary>
          <AccordionSummaryText>
            <strong>Marketing</strong>
            <span>Meta Pixel e acompanhamento do cardápio.</span>
          </AccordionSummaryText>
          <AccordionIcon data-accordion-icon>
            <ChevronDown size={18} aria-hidden="true" />
          </AccordionIcon>
        </AccordionSummary>
        <AccordionBody>
          <div>
            <strong>Meta Pixel</strong>
            <Muted>Informe somente o ID. Scripts personalizados não são aceitos.</Muted>
          </div>
          <GridTwo>
            <Field
              label="ID do Pixel"
              error={form.formState.errors.metaPixelId?.message}
            >
              <Input
                inputMode="numeric"
                maxLength={20}
                autoComplete="off"
                {...form.register("metaPixelId")}
              />
            </Field>
          </GridTwo>
          <StatusToggle>
            <input type="checkbox" {...form.register("metaPixelEnabled")} />
            <span>Ativar Meta Pixel</span>
          </StatusToggle>
        </AccordionBody>
      </Accordion>

      {error ? <ErrorText role="alert">{error}</ErrorText> : null}
      <SaveBar>
        <Subtitle role="status" aria-live="polite">
          {form.formState.isSubmitting ? "Salvando alterações…"
            : hasChanges ? "Você tem alterações não salvas." : "Nenhuma alteração pendente."}
        </Subtitle>
        <Button type="submit" disabled={form.formState.isSubmitting || !hasChanges}>
          <Save size={16} />
          {form.formState.isSubmitting ? "Salvando…" : "Salvar alterações"}
        </Button>
      </SaveBar>
    </Form>
  );
}
