"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LockKeyhole, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { ApiError, clientApi } from "@/services/api/client";
import type { PublicTableResponse } from "@/types/api";
import { tableLabel } from "@/utils/tableIdentity";
import { shareTableAccess } from "@/utils/tableSharing";
import { AccessPage, AccessSection, ShareRow } from "./styles";

export const tableCodeSchema = z.object({ code: z.string().trim().toUpperCase().regex(/^[A-HJ-NP-Z2-9]{10}$/, "Informe os 10 caracteres do código compartilhado.") });

export function TableAccess({ token, table }: { token: string; table: PublicTableResponse }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof tableCodeSchema>>({ resolver: zodResolver(tableCodeSchema), defaultValues: { code: "" } });
  async function join(values: z.infer<typeof tableCodeSchema>) {
    setError("");
    try {
      await clientApi(`public/tables/${encodeURIComponent(token)}/join`, { method: "POST", body: JSON.stringify({ code: values.code, sessionId: table.session?.id }) });
      router.refresh();
    } catch (cause) {
      setError(cause instanceof ApiError && (cause.status === 400 || cause.status === 403 || cause.status === 409)
        ? "Código inválido ou atendimento encerrado. Confira com o responsável; se a conta mudou, abra o cardápio novamente."
        : "Não foi possível entrar. Confira sua conexão e tente novamente.");
    }
  }
  const fieldError = form.formState.errors.code?.message;
  return <AccessSection aria-labelledby="table-access-title">
    <h2 id="table-access-title"><LockKeyhole size={20} aria-hidden="true" />{tableLabel(table)} protegida</h2>
    <p>Alguém já fez o primeiro pedido e é responsável por esta conta. Peça a essa pessoa o código de compartilhamento para fazer pedidos e consultar o consumo neste navegador.</p>
    <form onSubmit={form.handleSubmit(join)}>
      <Field label="Código de compartilhamento">
        <Input {...form.register("code")} autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={10} placeholder="Ex.: 23AB45CD67" aria-invalid={!!fieldError} aria-describedby="table-code-help" disabled={form.formState.isSubmitting} />
      </Field>
      <p id="table-code-help" role={fieldError ? "alert" : undefined}>{fieldError || "Use os 10 caracteres do código. Ele vale somente para esta abertura da conta."}</p>
      {error ? <p role="alert">{error}</p> : null}
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Entrando…" : "Entrar na mesa/comanda"}</Button>
    </form>
    <p>Sem o código? Peça ajuda à equipe do restaurante. Você pode continuar consultando o cardápio.</p>
  </AccessSection>;
}

export function TableAccessPage(props: { token: string; table: PublicTableResponse }) {
  const router = useRouter();
  return <AccessPage><TableAccess {...props} /><Button variant="outline" onClick={() => router.push(`/menu?mesa=${encodeURIComponent(props.token)}`)}><ArrowLeft size={18} aria-hidden="true" />Voltar ao cardápio</Button></AccessPage>;
}

export function TableShare({ token, table }: { token: string; table: PublicTableResponse }) {
  const [notice, setNotice] = useState("");
  const [sharing, setSharing] = useState(false);
  async function share() {
    setSharing(true); setNotice("");
    const text = `${tableLabel(table)} — código de compartilhamento: ${table.shareCode}. Abra ${window.location.origin}/menu?mesa=${encodeURIComponent(token)} e informe o código para entrar nesta conta.`;
    const result = await shareTableAccess(text, navigator);
    setNotice(result === "shared" ? "Código compartilhado." : result === "copied" ? "Código e link copiados. Envie para as pessoas da sua mesa." : result === "manual" ? "Não foi possível copiar automaticamente. Selecione o código acima e envie para seu grupo." : "");
    setSharing(false);
  }
  return <AccessSection aria-labelledby="table-share-title">
    <h2 id="table-share-title">Você é responsável por esta conta</h2>
    <p>Compartilhe o código com seu grupo para que outras pessoas possam pedir e consultar o consumo. Ele muda quando esta conta é encerrada e outra é aberta.</p>
    <ShareRow><output aria-label="Código de compartilhamento">{table.shareCode}</output><Button variant="outline" disabled={sharing} onClick={() => void share()}><Share2 size={18} aria-hidden="true" />{sharing ? "Compartilhando…" : "Compartilhar código"}</Button></ShareRow>
    {notice ? <p role="status">{notice}</p> : null}
  </AccessSection>;
}
