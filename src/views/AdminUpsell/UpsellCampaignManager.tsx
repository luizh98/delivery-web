"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CopyPlus,
  Pencil,
  Plus,
  Power,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { Field, Input, Select } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import type {
  DayOfWeek,
  Product,
  ProductCategory,
  UpsellCampaign,
  UpsellTriggerType,
} from "@/types/api";
import { centsToReais, money, reaisToCents } from "@/utils/format";
import {
  Actions,
  CampaignCard,
  CampaignList,
  CampaignMeta,
  CampaignName,
  Checkbox,
  ChoiceList,
  Empty,
  ErrorText,
  FormActions,
  FormCard,
  GridTwo,
  OfferCard,
  OfferHeader,
  PageHeader,
  PageSubtitle,
  PageTitle,
  Root,
  Status,
  StepButton,
  StepContent,
  StepNav,
  WeekdayDetails,
  WeekdayGrid,
  WeekdayRow,
} from "./styles";

const dayOptions: { value: DayOfWeek; label: string }[] = [
  { value: "MONDAY", label: "Segunda-feira" },
  { value: "TUESDAY", label: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta-feira" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

const schema = z
  .object({
    name: z.string().min(2, "Informe o nome."),
    displayTitle: z.string().min(2, "Informe o título."),
    active: z.boolean(),
    priority: z.number().int(),
    maxSuggestions: z.number().int().min(1),
    startsAt: z.string(),
    endsAt: z.string(),
    triggerType: z.enum(["PRODUCT", "CATEGORY", "ANY_CART_ITEM", "CART_AMOUNT"]),
    triggerProductIds: z.array(z.string()),
    triggerCategoryIds: z.array(z.string()),
    minimumCartAmountReais: z.number().min(0).optional(),
    maximumCartAmountReais: z.number().min(0).optional(),
    minimumItems: z.number().int().min(1),
    offers: z
      .array(
        z.object({
          targetType: z.enum(["PRODUCT", "CATEGORY"]),
          targetId: z.string().min(1),
          fixedOfferPriceReais: z.number().min(0).optional(),
          weekdayPrices: z.array(
            z.object({
              dayOfWeek: z.enum([
                "MONDAY",
                "TUESDAY",
                "WEDNESDAY",
                "THURSDAY",
                "FRIDAY",
                "SATURDAY",
                "SUNDAY",
              ]),
              enabled: z.boolean(),
              priceReais: z.number().min(0).optional(),
            }),
          ),
        }),
      )
      .min(1, "Selecione ao menos uma categoria ou produto."),
    maximumQuantityPerOrder: z.number().int().min(1),
    allowDiscountStacking: z.boolean(),
    showSavings: z.boolean(),
    skipIfProductInCart: z.boolean(),
    skipIfOfferCategoryInCart: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.triggerType === "PRODUCT" && !value.triggerProductIds.length) {
      context.addIssue({ code: "custom", path: ["triggerProductIds"], message: "Selecione um produto." });
    }
    if (value.triggerType === "CATEGORY" && !value.triggerCategoryIds.length) {
      context.addIssue({ code: "custom", path: ["triggerCategoryIds"], message: "Selecione uma categoria." });
    }
    if (value.triggerType === "CART_AMOUNT" && value.minimumCartAmountReais === undefined) {
      context.addIssue({ code: "custom", path: ["minimumCartAmountReais"], message: "Informe o valor mínimo." });
    }
    value.offers.forEach((offer, offerIndex) => {
      offer.weekdayPrices.forEach((weekday, weekdayIndex) => {
        if (weekday.enabled && weekday.priceReais === undefined) {
          context.addIssue({
            code: "custom",
            path: ["offers", offerIndex, "weekdayPrices", weekdayIndex, "priceReais"],
            message: "Informe o preço deste dia.",
          });
        }
      });
    });
  });

type CampaignForm = z.infer<typeof schema>;

type Props = {
  initialCampaigns: UpsellCampaign[];
  products: Product[];
  categories: ProductCategory[];
};

const stepLabels = ["Geral", "Condições", "Ofertas", "Exibição", "Bloqueios"];

function createWeekdayPrices() {
  return dayOptions.map((day) => ({
    dayOfWeek: day.value,
    enabled: false,
    priceReais: undefined,
  }));
}

const defaults: CampaignForm = {
  name: "",
  displayTitle: "Complete seu pedido",
  active: true,
  priority: 0,
  maxSuggestions: 3,
  startsAt: "",
  endsAt: "",
  triggerType: "CATEGORY",
  triggerProductIds: [],
  triggerCategoryIds: [],
  minimumCartAmountReais: undefined,
  maximumCartAmountReais: undefined,
  minimumItems: 1,
  offers: [],
  maximumQuantityPerOrder: 1,
  allowDiscountStacking: false,
  showSavings: true,
  skipIfProductInCart: true,
  skipIfOfferCategoryInCart: false,
};

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function campaignToForm(campaign: UpsellCampaign): CampaignForm {
  return {
    name: campaign.name,
    displayTitle: campaign.displayTitle,
    active: campaign.active,
    priority: campaign.priority,
    maxSuggestions: campaign.maxSuggestions,
    startsAt: toLocalInput(campaign.startsAt),
    endsAt: toLocalInput(campaign.endsAt),
    triggerType: campaign.triggerType,
    triggerProductIds: campaign.triggerProductIds,
    triggerCategoryIds: campaign.triggerCategoryIds,
    minimumCartAmountReais:
      campaign.minimumCartAmountCents == null
        ? undefined
        : centsToReais(campaign.minimumCartAmountCents),
    maximumCartAmountReais:
      campaign.maximumCartAmountCents == null
        ? undefined
        : centsToReais(campaign.maximumCartAmountCents),
    minimumItems: campaign.minimumItems,
    offers: campaign.offers.map((offer) => ({
      targetType: offer.productId ? "PRODUCT" : "CATEGORY",
      targetId: offer.productId ?? offer.categoryId ?? "",
      fixedOfferPriceReais:
        offer.fixedOfferPriceCents != null
          ? centsToReais(offer.fixedOfferPriceCents)
          : campaign.fixedOfferPriceCents != null
            ? centsToReais(campaign.fixedOfferPriceCents)
            : undefined,
      weekdayPrices: dayOptions.map((day) => {
        const saved = offer.weekdayPrices?.find((price) => price.dayOfWeek === day.value);
        return {
          dayOfWeek: day.value,
          enabled: Boolean(saved),
          priceReais: saved ? centsToReais(saved.priceCents) : undefined,
        };
      }),
    })),
    maximumQuantityPerOrder: campaign.maximumQuantityPerOrder,
    allowDiscountStacking: campaign.allowDiscountStacking,
    showSavings: campaign.showSavings,
    skipIfProductInCart: campaign.skipIfProductInCart,
    skipIfOfferCategoryInCart: campaign.skipIfOfferCategoryInCart,
  };
}

function optionalNumber(value: unknown) {
  return value === "" || value === undefined ? undefined : Number(value);
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function UpsellCampaignManager({
  initialCampaigns,
  products,
  categories,
}: Props) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [editing, setEditing] = useState<UpsellCampaign | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [offerSearch, setOfferSearch] = useState("");
  const { showToast } = useToast();
  const { requestConfirmation } = useConfirmation();
  const form = useForm<CampaignForm>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const triggerType = useWatch({ control: form.control, name: "triggerType" });
  const triggerProductIds = useWatch({
    control: form.control,
    name: "triggerProductIds",
  });
  const triggerCategoryIds = useWatch({
    control: form.control,
    name: "triggerCategoryIds",
  });
  const offers = useWatch({ control: form.control, name: "offers" });
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const productNames = useMemo(
    () => new Map(products.map((product) => [product.id, product.name])),
    [products],
  );
  const filteredCategories = useMemo(() => {
    const search = normalizeSearch(offerSearch);
    return search
      ? categories.filter((category) => normalizeSearch(category.name).includes(search))
      : categories;
  }, [categories, offerSearch]);
  const filteredProducts = useMemo(() => {
    const search = normalizeSearch(offerSearch);
    return search
      ? products.filter((product) => normalizeSearch(product.name).includes(search))
      : products;
  }, [offerSearch, products]);

  function openCreate() {
    setEditing(null);
    form.reset(defaults);
    setOfferSearch("");
    setStep(0);
    setFormOpen(true);
  }

  function openEdit(campaign: UpsellCampaign) {
    setEditing(campaign);
    form.reset(campaignToForm(campaign));
    setOfferSearch("");
    setStep(0);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    form.reset(defaults);
    setOfferSearch("");
  }

  function toggleArray(field: "triggerProductIds" | "triggerCategoryIds", id: string) {
    const values = form.getValues(field);
    form.setValue(
      field,
      values.includes(id) ? values.filter((value) => value !== id) : [...values, id],
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function toggleOffer(targetType: "PRODUCT" | "CATEGORY", targetId: string) {
    const current = form.getValues("offers");
    const exists = current.some(
      (offer) => offer.targetType === targetType && offer.targetId === targetId,
    );
    const next = exists
      ? current.filter(
          (offer) => offer.targetType !== targetType || offer.targetId !== targetId,
        )
      : [
          ...current,
          {
            targetType,
            targetId,
            fixedOfferPriceReais: undefined,
            weekdayPrices: createWeekdayPrices(),
          },
        ];
    form.setValue("offers", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function moveOffer(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= offers.length) return;
    const next = [...offers];
    [next[index], next[target]] = [next[target], next[index]];
    form.setValue("offers", next, { shouldDirty: true });
  }

  async function submit(values: CampaignForm) {
    const hasProductOffers = values.offers.some((offer) => offer.targetType === "PRODUCT");
    const hasCategoryOffers = values.offers.some((offer) => offer.targetType === "CATEGORY");
    const offerType = hasProductOffers && hasCategoryOffers
      ? "MIXED"
      : hasProductOffers ? "PRODUCT" : "CATEGORY";
    const hasConfiguredPrice = values.offers.some(
      (offer) =>
        offer.fixedOfferPriceReais !== undefined ||
        offer.weekdayPrices.some((weekday) => weekday.enabled),
    );
    const payload = {
      name: values.name,
      displayTitle: values.displayTitle,
      active: values.active,
      priority: values.priority,
      maxSuggestions: values.maxSuggestions,
      startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
      endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : null,
      triggerType: values.triggerType,
      triggerProductIds: values.triggerProductIds,
      triggerCategoryIds: values.triggerCategoryIds,
      minimumCartAmountCents:
        values.minimumCartAmountReais === undefined
          ? null
          : reaisToCents(values.minimumCartAmountReais),
      maximumCartAmountCents:
        values.maximumCartAmountReais === undefined
          ? null
          : reaisToCents(values.maximumCartAmountReais),
      minimumItems: values.minimumItems,
      offerType,
      offers: values.offers.map((offer, index) => ({
        productId: offer.targetType === "PRODUCT" ? offer.targetId : null,
        categoryId: offer.targetType === "CATEGORY" ? offer.targetId : null,
        displayOrder: index,
        maximumQuantity: values.maximumQuantityPerOrder,
        fixedOfferPriceCents:
          offer.fixedOfferPriceReais === undefined
            ? null
            : reaisToCents(offer.fixedOfferPriceReais),
        weekdayPrices: offer.weekdayPrices
          .filter((weekday) => weekday.enabled)
          .map((weekday) => ({
            dayOfWeek: weekday.dayOfWeek,
            priceCents: reaisToCents(weekday.priceReais ?? 0),
          })),
      })),
      maximumQuantityPerOrder: values.maximumQuantityPerOrder,
      benefitType: hasConfiguredPrice ? "FIXED_PRICE" : "NONE",
      fixedOfferPriceCents: null,
      allowDiscountStacking: values.allowDiscountStacking,
      showSavings: values.showSavings,
      skipIfProductInCart: values.skipIfProductInCart,
      skipIfOfferCategoryInCart: values.skipIfOfferCategoryInCart,
    };
    const path = editing
      ? `admin/upsell-campaigns/${editing.id}`
      : "admin/upsell-campaigns";
    try {
      const saved = await clientApi<UpsellCampaign>(path, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setCampaigns((current) =>
        editing
          ? current.map((campaign) => (campaign.id === saved.id ? saved : campaign))
          : [...current, saved],
      );
      showToast(editing ? "Campanha atualizada." : "Campanha criada.");
      closeForm();
    } catch {
      showToast("Não foi possível salvar a campanha.", "error");
    }
  }

  async function toggleStatus(campaign: UpsellCampaign) {
    try {
      const updated = await clientApi<UpsellCampaign>(
        `admin/upsell-campaigns/${campaign.id}/status`,
        { method: "PATCH", body: JSON.stringify({ active: !campaign.active }) },
      );
      setCampaigns((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      showToast(updated.active ? "Campanha ativada." : "Campanha desativada.");
    } catch {
      showToast("Não foi possível alterar o status.", "error");
    }
  }

  async function duplicate(campaign: UpsellCampaign) {
    try {
      const copy = await clientApi<UpsellCampaign>(
        `admin/upsell-campaigns/${campaign.id}/duplicate`,
        { method: "POST" },
      );
      setCampaigns((current) => [...current, copy]);
      showToast("Campanha duplicada como inativa.");
    } catch {
      showToast("Não foi possível duplicar.", "error");
    }
  }

  async function remove(campaign: UpsellCampaign) {
    const confirmed = await requestConfirmation({
      message: `Excluir a campanha ${campaign.name}?`,
      confirmLabel: "Excluir",
    });
    if (!confirmed) return;
    try {
      await clientApi<void>(`admin/upsell-campaigns/${campaign.id}`, {
        method: "DELETE",
      });
      setCampaigns((current) => current.filter((item) => item.id !== campaign.id));
      showToast("Campanha excluída.");
    } catch {
      showToast("Não foi possível excluir.", "error");
    }
  }

  const triggerLabels: Record<UpsellTriggerType, string> = {
    PRODUCT: "Produto específico",
    CATEGORY: "Categoria",
    ANY_CART_ITEM: "Qualquer item",
    CART_AMOUNT: "Valor do carrinho",
  };
  function offerSummary(campaign: UpsellCampaign) {
    return campaign.offers
      .map((offer) =>
        offer.productId
          ? productNames.get(offer.productId ?? "")
          : categoryNames.get(offer.categoryId ?? ""),
      )
      .filter(Boolean)
      .join(", ");
  }

  function pricingSummary(campaign: UpsellCampaign) {
    const weeklyRules = campaign.offers.reduce(
      (total, offer) => total + (offer.weekdayPrices?.length ?? 0),
      0,
    );
    const hasOfferPrices = campaign.offers.some(
      (offer) => offer.fixedOfferPriceCents != null,
    );
    if (weeklyRules > 0) {
      return `Preços por oferta • ${weeklyRules} regra(s) semanal(is)`;
    }
    if (hasOfferPrices) return "Preços por oferta";
    if (campaign.fixedOfferPriceCents != null) {
      return `Preço único ${money(campaign.fixedOfferPriceCents)}`;
    }
    return "Sem desconto";
  }

  function periodSummary(campaign: UpsellCampaign) {
    if (!campaign.startsAt && !campaign.endsAt) return "Sem prazo";
    const start = campaign.startsAt
      ? new Date(campaign.startsAt).toLocaleDateString("pt-BR")
      : "agora";
    const end = campaign.endsAt
      ? new Date(campaign.endsAt).toLocaleDateString("pt-BR")
      : "sem término";
    return `${start} → ${end}`;
  }

  return (
    <Root>
      <PageHeader>
        <div>
          <PageTitle>Upsell</PageTitle>
          <PageSubtitle>Campanhas de produtos complementares no carrinho.</PageSubtitle>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus size={16} /> Criar campanha
        </Button>
      </PageHeader>

      {formOpen ? (
        <FormCard>
          <PageHeader>
            <CampaignName>{editing ? "Editar campanha" : "Nova campanha"}</CampaignName>
            <Button type="button" variant="ghost" onClick={closeForm}>
              <X size={16} /> Fechar
            </Button>
          </PageHeader>
          <StepNav aria-label="Etapas da campanha">
            {stepLabels.map((label, index) => (
              <StepButton
                key={label}
                type="button"
                active={step === index}
                onClick={() => setStep(index)}
              >
                {index + 1}. {label}
              </StepButton>
            ))}
          </StepNav>
          <form onSubmit={form.handleSubmit(submit)}>
            {step === 0 ? (
              <StepContent>
                <GridTwo>
                  <Field label="Nome" error={form.formState.errors.name?.message}>
                    <Input {...form.register("name")} />
                  </Field>
                  <Field label="Título para o cliente" error={form.formState.errors.displayTitle?.message}>
                    <Input {...form.register("displayTitle")} />
                  </Field>
                  <Field label="Prioridade">
                    <Input type="number" {...form.register("priority", { valueAsNumber: true })} />
                  </Field>
                  <Field label="Máximo de sugestões">
                    <Input type="number" min={1} {...form.register("maxSuggestions", { valueAsNumber: true })} />
                  </Field>
                  <Field label="Início">
                    <Input type="datetime-local" {...form.register("startsAt")} />
                  </Field>
                  <Field label="Término">
                    <Input type="datetime-local" {...form.register("endsAt")} />
                  </Field>
                </GridTwo>
                <Checkbox>
                  <input type="checkbox" {...form.register("active")} />
                  Campanha ativa
                </Checkbox>
              </StepContent>
            ) : null}

            {step === 1 ? (
              <StepContent>
                <Field label="Quando esta campanha deve aparecer?">
                  <Select {...form.register("triggerType")}>
                    <option value="PRODUCT">Produto específico</option>
                    <option value="CATEGORY">Categoria</option>
                    <option value="ANY_CART_ITEM">Qualquer item</option>
                    <option value="CART_AMOUNT">Valor do carrinho</option>
                  </Select>
                </Field>
                {triggerType === "PRODUCT" ? (
                  <ChoiceList>
                    {products.map((product) => (
                      <Checkbox key={product.id}>
                        <input
                          type="checkbox"
                          checked={triggerProductIds.includes(product.id)}
                          onChange={() => toggleArray("triggerProductIds", product.id)}
                        />
                        {product.name}
                      </Checkbox>
                    ))}
                  </ChoiceList>
                ) : null}
                {triggerType === "CATEGORY" ? (
                  <ChoiceList>
                    {categories.map((category) => (
                      <Checkbox key={category.id}>
                        <input
                          type="checkbox"
                          checked={triggerCategoryIds.includes(category.id)}
                          onChange={() => toggleArray("triggerCategoryIds", category.id)}
                        />
                        {category.name}
                      </Checkbox>
                    ))}
                  </ChoiceList>
                ) : null}
                <GridTwo>
                  <Field label="Valor mínimo" error={form.formState.errors.minimumCartAmountReais?.message}>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      {...form.register("minimumCartAmountReais", { setValueAs: optionalNumber })}
                    />
                  </Field>
                  <Field label="Valor máximo">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      {...form.register("maximumCartAmountReais", { setValueAs: optionalNumber })}
                    />
                  </Field>
                  <Field label="Quantidade mínima de itens">
                    <Input type="number" min={1} {...form.register("minimumItems", { valueAsNumber: true })} />
                  </Field>
                </GridTwo>
              </StepContent>
            ) : null}

            {step === 2 ? (
              <StepContent>
                <PageSubtitle>
                  Escolha categorias inteiras, produtos específicos ou ambos. Produto específico
                  prevalece quando também pertence a uma categoria selecionada.
                </PageSubtitle>
                <Field label="Pesquisar categoria ou produto">
                  <Input
                    type="search"
                    value={offerSearch}
                    onChange={(event) => setOfferSearch(event.target.value)}
                    placeholder="Digite um nome..."
                  />
                </Field>
                <GridTwo>
                  <StepContent>
                    <CampaignName>Categorias</CampaignName>
                    <ChoiceList>
                      {filteredCategories.map((category) => (
                        <Checkbox key={category.id}>
                          <input
                            type="checkbox"
                            checked={offers.some(
                              (offer) =>
                                offer.targetType === "CATEGORY" &&
                                offer.targetId === category.id,
                            )}
                            onChange={() => toggleOffer("CATEGORY", category.id)}
                          />
                          {category.name}
                        </Checkbox>
                      ))}
                      {!filteredCategories.length ? (
                        <PageSubtitle>Nenhuma categoria encontrada.</PageSubtitle>
                      ) : null}
                    </ChoiceList>
                  </StepContent>
                  <StepContent>
                    <CampaignName>Produtos específicos</CampaignName>
                    <ChoiceList>
                      {filteredProducts.map((product) => (
                        <Checkbox key={product.id}>
                          <input
                            type="checkbox"
                            checked={offers.some(
                              (offer) =>
                                offer.targetType === "PRODUCT" &&
                                offer.targetId === product.id,
                            )}
                            onChange={() => toggleOffer("PRODUCT", product.id)}
                          />
                          {product.name}
                        </Checkbox>
                      ))}
                      {!filteredProducts.length ? (
                        <PageSubtitle>Nenhum produto encontrado.</PageSubtitle>
                      ) : null}
                    </ChoiceList>
                  </StepContent>
                </GridTwo>
                {form.formState.errors.offers?.message ? (
                  <ErrorText>{form.formState.errors.offers.message}</ErrorText>
                ) : null}
                {offers.map((offer, index) => (
                  <OfferCard key={`${offer.targetType}:${offer.targetId}`}>
                    <OfferHeader>
                      <div>
                        <CampaignName>
                          {offer.targetType === "PRODUCT"
                            ? productNames.get(offer.targetId)
                            : categoryNames.get(offer.targetId)}
                        </CampaignName>
                        <PageSubtitle>
                          {offer.targetType === "PRODUCT" ? "Produto" : "Categoria"}
                        </PageSubtitle>
                      </div>
                      <Actions>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={index === 0}
                          onClick={() => moveOffer(index, -1)}
                          aria-label="Mover oferta para cima"
                        >
                          <ArrowUp size={15} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={index === offers.length - 1}
                          onClick={() => moveOffer(index, 1)}
                          aria-label="Mover oferta para baixo"
                        >
                          <ArrowDown size={15} />
                        </Button>
                      </Actions>
                    </OfferHeader>
                    <Field label="Preço padrão no upsell (opcional)">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Vazio = preço normal"
                        {...form.register(`offers.${index}.fixedOfferPriceReais`, {
                          setValueAs: optionalNumber,
                        })}
                      />
                    </Field>
                    <WeekdayDetails>
                      <summary>Preços por dia da semana (opcional)</summary>
                      <WeekdayGrid>
                        {offer.weekdayPrices.map((weekday, weekdayIndex) => (
                          <WeekdayRow key={weekday.dayOfWeek}>
                            <Checkbox>
                              <input
                                type="checkbox"
                                {...form.register(
                                  `offers.${index}.weekdayPrices.${weekdayIndex}.enabled`,
                                )}
                              />
                              {dayOptions[weekdayIndex]?.label}
                            </Checkbox>
                            {weekday.enabled ? (
                              <Field
                                label="Preço no dia"
                                error={
                                  form.formState.errors.offers?.[index]
                                    ?.weekdayPrices?.[weekdayIndex]?.priceReais?.message
                                }
                              >
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  {...form.register(
                                    `offers.${index}.weekdayPrices.${weekdayIndex}.priceReais`,
                                    { setValueAs: optionalNumber },
                                  )}
                                />
                              </Field>
                            ) : (
                              <PageSubtitle>Usa o preço padrão</PageSubtitle>
                            )}
                          </WeekdayRow>
                        ))}
                      </WeekdayGrid>
                    </WeekdayDetails>
                  </OfferCard>
                ))}
                <Field label="Quantidade máxima por pedido">
                  <Input
                    type="number"
                    min={1}
                    {...form.register("maximumQuantityPerOrder", { valueAsNumber: true })}
                  />
                </Field>
              </StepContent>
            ) : null}

            {step === 3 ? (
              <StepContent>
                <PageSubtitle>
                  Preços são configurados em cada oferta. Sem preço preenchido, produto usa valor
                  normal do catálogo.
                </PageSubtitle>
                <Checkbox>
                  <input type="checkbox" {...form.register("showSavings")} />
                  Exibir economia para o cliente
                </Checkbox>
                <Checkbox>
                  <input type="checkbox" {...form.register("allowDiscountStacking")} />
                  Permitir acumular com outros descontos
                </Checkbox>
              </StepContent>
            ) : null}

            {step === 4 ? (
              <StepContent>
                <Checkbox>
                  <input type="checkbox" {...form.register("skipIfProductInCart")} />
                  Não sugerir produto já presente
                </Checkbox>
                <Checkbox>
                  <input type="checkbox" {...form.register("skipIfOfferCategoryInCart")} />
                  Não sugerir categoria já presente
                </Checkbox>
              </StepContent>
            ) : null}

            <FormActions>
              <div>
                {step > 0 ? (
                  <Button type="button" variant="outline" onClick={() => setStep((value) => value - 1)}>
                    <ArrowLeft size={16} /> Voltar
                  </Button>
                ) : null}
              </div>
              {step < stepLabels.length - 1 ? (
                <Button
                  key="next-step"
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    setStep((value) => Math.min(value + 1, stepLabels.length - 1));
                  }}
                >
                  Próxima <ArrowRight size={16} />
                </Button>
              ) : (
                <Button
                  key="submit-campaign"
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  <Save size={16} /> Salvar campanha
                </Button>
              )}
            </FormActions>
          </form>
        </FormCard>
      ) : null}

      <CampaignList>
        {!campaigns.length ? <Empty>Nenhuma campanha cadastrada.</Empty> : null}
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id}>
            <div>
              <CampaignName>
                {campaign.name} <Status active={campaign.active}>{campaign.active ? "Ativa" : "Inativa"}</Status>
              </CampaignName>
              <CampaignMeta>
                <span>Prioridade {campaign.priority}</span>
                <span>{triggerLabels[campaign.triggerType]}</span>
                {campaign.minimumCartAmountCents != null ? (
                  <span>Mínimo {money(campaign.minimumCartAmountCents)}</span>
                ) : null}
                <span>Ofertas: {offerSummary(campaign) || "itens removidos"}</span>
                <span>{pricingSummary(campaign)}</span>
                <span>Até {campaign.maxSuggestions} sugestão(ões)</span>
                <span>{periodSummary(campaign)}</span>
              </CampaignMeta>
            </div>
            <Actions>
              <Button type="button" variant="outline" onClick={() => openEdit(campaign)}>
                <Pencil size={15} /> Editar
              </Button>
              <Button type="button" variant="ghost" onClick={() => duplicate(campaign)}>
                <CopyPlus size={15} /> Duplicar
              </Button>
              <Button type="button" variant="ghost" onClick={() => toggleStatus(campaign)}>
                <Power size={15} /> {campaign.active ? "Desativar" : "Ativar"}
              </Button>
              <Button type="button" variant="dangerGhost" onClick={() => remove(campaign)}>
                <Trash2 size={15} /> Excluir
              </Button>
            </Actions>
          </CampaignCard>
        ))}
      </CampaignList>
    </Root>
  );
}
