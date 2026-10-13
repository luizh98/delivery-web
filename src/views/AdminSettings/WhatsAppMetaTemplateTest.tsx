"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FilePlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { ApiError, clientApi } from "@/services/api/client";
import { ErrorText, Muted } from "./styles";

const schema = z.object({
  accessToken: z.string().trim().min(1, "Informe o token temporário.").max(8192).refine((value) => !/[\r\n]/.test(value), "Cole o token em uma única linha."),
  name: z.string().regex(/^flyfoods_dev_pedido_entrega_[0-9]{1,20}$/, "Use o prefixo flyfoods_dev_pedido_entrega_ seguido somente de números."),
});

type Result = { id: string; name: string; status: string; existing: boolean };

export function WhatsAppMetaTemplateTest() {
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { accessToken: "", name: "" } });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const create = form.handleSubmit(async (values) => {
    setResult(null); setError("");
    try {
      setResult(await clientApi<Result>("admin/whatsapp/test-template", { method: "POST", body: JSON.stringify(values) }));
    } catch (caught) {
      let message = "Criação não confirmada. Confira esse nome no Gerenciador do WhatsApp antes de repetir.";
      if (caught instanceof ApiError) {
        try {
          const body = JSON.parse(caught.message) as { message?: unknown };
          if (typeof body.message === "string") message = body.message;
        } catch { /* Keep the safe fallback for non-JSON proxy errors. */ }
      }
      setError(message);
    } finally {
      form.resetField("accessToken");
    }
  });

  return <details
    onToggle={(event) => { if (event.currentTarget.open && !form.getValues("name")) form.setValue("name", `flyfoods_dev_pedido_entrega_${Date.now()}`); }}
    onKeyDown={(event) => { if (event.key === "Enter" && event.target instanceof HTMLInputElement) event.preventDefault(); }}
  >
    <summary>Teste de criação de modelo · ambiente dev</summary>
    <Muted>Cria um modelo de atualização de entrega somente na conta de teste da Meta. Não envia mensagens nem altera a integração do restaurante.</Muted>
    <Field label="Token temporário para criar modelo" error={form.formState.errors.accessToken?.message}>
      <Input type="password" autoComplete="off" spellCheck={false} {...form.register("accessToken")} />
      <Muted>Usado somente neste teste; não é salvo. O token precisa da permissão whatsapp_business_management.</Muted>
    </Field>
    <Field label="Nome do modelo de teste" error={form.formState.errors.name?.message}>
      <Input autoComplete="off" spellCheck={false} {...form.register("name")} />
      <Muted>Para gravar outra criação, altere o sufixo numérico. Um nome existente é consultado, sem criar novamente.</Muted>
    </Field>
    <Muted>Categoria: Utilidade · Idioma: Português (Brasil) · Variável: número do pedido (amostra fictícia: 1588).</Muted>
    <p>🛵 Notícia boa! Seu pedido nº {"{{1}}"} acabou de sair para entrega. 😋</p>
    <Button type="button" disabled={form.formState.isSubmitting} onClick={() => void create()}>
      <FilePlus size={16} aria-hidden="true" />{form.formState.isSubmitting ? "Criando modelo…" : "Criar modelo pelo FlyFoods"}
    </Button>
    {result ? <div role="status" aria-live="polite">
      <Muted>{result.existing ? "A Meta confirmou o modelo já existente." : "A Meta confirmou a criação pelo FlyFoods."}</Muted>
      <p>Nome: {result.name}<br />ID: {result.id}<br />Status na Meta: {result.status}</p>
      <Muted>PENDING significa em análise; não confirma aprovação nem permite envio automático.</Muted>
    </div> : null}
    {error ? <ErrorText role="alert">{error}</ErrorText> : null}
  </details>;
}
