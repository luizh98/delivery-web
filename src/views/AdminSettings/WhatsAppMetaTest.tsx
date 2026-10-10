"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { clientApi } from "@/services/api/client";
import { isValidBrazilianMobile } from "@/utils/customerInput";
import { ErrorText, Muted } from "./styles";

const schema = z.object({
  accessToken: z.string().trim().min(1, "Informe o token temporário.").max(8192).refine((value) => !/[\r\n]/.test(value), "Cole o token em uma única linha."),
  recipient: z.string().refine(isValidBrazilianMobile, "Informe celular válido com DDD."),
});

export function WhatsAppMetaTest() {
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { accessToken: "", recipient: "" } });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const send = form.handleSubmit(async (values) => {
    setNotice(""); setError("");
    try {
      await clientApi<{ messageId: string }>("admin/whatsapp/test-message", { method: "POST", body: JSON.stringify(values) });
      setNotice("Meta aceitou o envio pelo FlyFoods. Confira o recebimento no WhatsApp.");
    } catch {
      setError("Envio não confirmado. Confira seu WhatsApp antes de repetir. Se não recebeu, gere outro token e confira o destinatário autorizado na Meta.");
    } finally {
      form.resetField("accessToken");
    }
  });
  return <details onKeyDown={(event) => { if (event.key === "Enter" && event.target instanceof HTMLInputElement) event.preventDefault(); }}>
    <summary>Teste com número da Meta · ambiente dev</summary>
    <Muted>Remetente +1 (555) 648-1161. Envia mensagem demonstrativa em inglês, sem criar pedidos ou alterar o número do restaurante.</Muted>
    <Field label="Token temporário para teste" error={form.formState.errors.accessToken?.message}>
      <Input type="password" autoComplete="off" spellCheck={false} {...form.register("accessToken")} />
      <Muted>Usado somente neste envio; não é salvo. Gere no painel de testes do app na Meta.</Muted>
    </Field>
    <Field label="Destinatário autorizado na Meta" error={form.formState.errors.recipient?.message}>
      <Input type="tel" placeholder="DDD e celular" {...form.register("recipient")} />
    </Field>
    <Button type="button" disabled={form.formState.isSubmitting} onClick={() => void send()}><Send size={16} aria-hidden="true" />{form.formState.isSubmitting ? "Enviando teste…" : "Enviar teste pelo FlyFoods"}</Button>
    {notice ? <Muted role="status" aria-live="polite">{notice}</Muted> : null}
    {error ? <ErrorText role="alert">{error}</ErrorText> : null}
  </details>;
}
