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
  Product,
  ProductCategory,
  UpsellCampaign,
  UpsellBenefitType,
  UpsellOfferType,
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
  OrderedItem,
  PageHeader,
  PageSubtitle,
  PageTitle,
  Root,
  Status,
  StepButton,
  StepContent,
  StepNav,
} from "./styles";

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
    offerType: z.enum(["PRODUCT", "CATEGORY"]),
    offerIds: z.array(z.string()),
    maximumQuantityPerOrder: z.number().int().min(1),
    benefitType: z.enum(["NONE", "FIXED_PRICE"]),
    fixedOfferPriceReais: z.number().min(0).optional(),
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
    if (!value.offerIds.length) {
      context.addIssue({ code: "custom", path: ["offerIds"], message: "Selecione ao menos uma oferta." });
    }
    if (value.benefitType === "FIXED_PRICE" && value.fixedOfferPriceReais === undefined) {
      context.addIssue({ code: "custom", path: ["fixedOfferPriceReais"], message: "Informe o preço promocional." });
    }
  });

type CampaignForm = z.infer<typeof schema>;

type Props = {
  initialCampaigns: UpsellCampaign[];
  products: Product[];
  categories: ProductCategory[];
};

const stepLabels = ["Geral", "Condições", "Ofertas", "Benefício", "Bloqueios"];

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
  offerType: "CATEGORY",
  offerIds: [],
  maximumQuantityPerOrder: 1,
  benefitType: "NONE",
  fixedOfferPriceReais: undefined,
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
    offerType: campaign.offerType,
    offerIds: campaign.offers.map((offer) =>
      campaign.offerType === "PRODUCT" ? offer.productId! : offer.categoryId!,
    ),
    maximumQuantityPerOrder: campaign.maximumQuantityPerOrder,
    benefitType: campaign.benefitType,
    fixedOfferPriceReais:
      campaign.fixedOfferPriceCents == null
        ? undefined
        : centsToReais(campaign.fixedOfferPriceCents),
    allowDiscountStacking: campaign.allowDiscountStacking,
    showSavings: campaign.showSavings,
    skipIfProductInCart: campaign.skipIfProductInCart,
    skipIfOfferCategoryInCart: campaign.skipIfOfferCategoryInCart,
  };
}

function optionalNumber(value: unknown) {
  return value === "" || value === undefined ? undefined : Number(value);
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
  const offerType = useWatch({ control: form.control, name: "offerType" });
  const offerIds = useWatch({ control: form.control, name: "offerIds" });
  const benefitType = useWatch({ control: form.control, name: "benefitType" });
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const productNames = useMemo(
    () => new Map(products.map((product) => [product.id, product.name])),
    [products],
  );

  function openCreate() {
    setEditing(null);
    form.reset(defaults);
    setStep(0);
    setFormOpen(true);
  }

  function openEdit(campaign: UpsellCampaign) {
    setEditing(campaign);
    form.reset(campaignToForm(campaign));
    setStep(0);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    form.reset(defaults);
  }

  function toggleArray(field: "triggerProductIds" | "triggerCategoryIds" | "offerIds", id: string) {
    const values = form.getValues(field);
    form.setValue(
      field,
      values.includes(id) ? values.filter((value) => value !== id) : [...values, id],
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function moveOffer(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= offerIds.length) return;
    const next = [...offerIds];
    [next[index], next[target]] = [next[target], next[index]];
    form.setValue("offerIds", next, { shouldDirty: true });
  }

  async function submit(values: CampaignForm) {
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
      offerType: values.offerType,
      offers: values.offerIds.map((id, index) => ({
        productId: values.offerType === "PRODUCT" ? id : null,
        categoryId: values.offerType === "CATEGORY" ? id : null,
        displayOrder: index,
        maximumQuantity: values.maximumQuantityPerOrder,
      })),
      maximumQuantityPerOrder: values.maximumQuantityPerOrder,
      benefitType: values.benefitType,
      fixedOfferPriceCents:
        values.fixedOfferPriceReais === undefined
          ? null
          : reaisToCents(values.fixedOfferPriceReais),
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
  const benefitLabels: Record<UpsellBenefitType, string> = {
    NONE: "Sem desconto",
    FIXED_PRICE: "Preço fixo",
  };

  function offerSummary(campaign: UpsellCampaign) {
    return campaign.offers
      .map((offer) =>
        campaign.offerType === "PRODUCT"
          ? productNames.get(offer.productId ?? "")
          : categoryNames.get(offer.categoryId ?? ""),
      )
      .filter(Boolean)
      .join(", ");
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
                <Field label="Quais produtos devem ser sugeridos?">
                  <Select
                    {...form.register("offerType")}
                    onChange={(event) => {
                      form.setValue("offerType", event.target.value as UpsellOfferType);
                      form.setValue("offerIds", []);
                    }}
                  >
                    <option value="CATEGORY">Categorias selecionadas</option>
                    <option value="PRODUCT">Produtos específicos</option>
                  </Select>
                </Field>
                <ChoiceList>
                  {(offerType === "PRODUCT" ? products : categories).map((item) => (
                    <Checkbox key={item.id}>
                      <input
                        type="checkbox"
                        checked={offerIds.includes(item.id)}
                        onChange={() => toggleArray("offerIds", item.id)}
                      />
                      {item.name}
                    </Checkbox>
                  ))}
                </ChoiceList>
                {form.formState.errors.offerIds ? (
                  <ErrorText>{form.formState.errors.offerIds.message}</ErrorText>
                ) : null}
                {offerIds.map((id, index) => (
                  <OrderedItem key={id}>
                    <span>{offerType === "PRODUCT" ? productNames.get(id) : categoryNames.get(id)}</span>
                    <Actions>
                      <Button type="button" variant="ghost" disabled={index === 0} onClick={() => moveOffer(index, -1)}>
                        <ArrowUp size={15} />
                      </Button>
                      <Button type="button" variant="ghost" disabled={index === offerIds.length - 1} onClick={() => moveOffer(index, 1)}>
                        <ArrowDown size={15} />
                      </Button>
                    </Actions>
                  </OrderedItem>
                ))}
                <Field label="Quantidade máxima por pedido">
                  <Input type="number" min={1} {...form.register("maximumQuantityPerOrder", { valueAsNumber: true })} />
                </Field>
              </StepContent>
            ) : null}

            {step === 3 ? (
              <StepContent>
                <Field label="Qual benefício será aplicado?">
                  <Select {...form.register("benefitType")}>
                    <option value="NONE">Sem desconto</option>
                    <option value="FIXED_PRICE">Preço fixo promocional</option>
                  </Select>
                </Field>
                {benefitType === "FIXED_PRICE" ? (
                  <Field label="Preço promocional" error={form.formState.errors.fixedOfferPriceReais?.message}>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      {...form.register("fixedOfferPriceReais", { setValueAs: optionalNumber })}
                    />
                  </Field>
                ) : null}
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
                <Button type="button" onClick={() => setStep((value) => value + 1)}>
                  Próxima <ArrowRight size={16} />
                </Button>
              ) : (
                <Button type="submit" disabled={form.formState.isSubmitting}>
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
                <span>{benefitLabels[campaign.benefitType]}</span>
                {campaign.fixedOfferPriceCents != null ? (
                  <span>{money(campaign.fixedOfferPriceCents)}</span>
                ) : null}
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
