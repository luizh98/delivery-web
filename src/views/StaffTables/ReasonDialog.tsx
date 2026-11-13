"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { Field, Textarea } from "@/components/Field";
import type { StaffTableOrder } from "@/types/api";
import { Actions, Dialog, Heading, Muted, Row } from "./styles";

export type CancelAction = { order: StaffTableOrder; itemIndex?: number } | { closeTable: true };

export function ReasonDialog({ action, onConfirm, onClose }: { action: CancelAction; onConfirm: (reason: string) => Promise<void>; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useForm({ defaultValues: { reason: "" } });
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  const title = "closeTable" in action ? "Encerrar comanda" : action.itemIndex === undefined ? "Cancelar rodada" : `Cancelar ${action.order.items[action.itemIndex].name}`;
  return <Dialog ref={dialog} onCancel={(event) => { if (form.formState.isSubmitting) event.preventDefault(); else onClose(); }} aria-labelledby="cancel-title">
    <form onSubmit={form.handleSubmit(async ({ reason }) => { await onConfirm(reason.trim()); })}>
      <Row><Heading id="cancel-title">{title}</Heading><Button type="button" variant="ghost" disabled={form.formState.isSubmitting} onClick={onClose} aria-label="Voltar sem cancelar"><X size={18} /></Button></Row>
      <Muted>{"closeTable" in action ? "Todos os itens devem estar entregues ou cancelados antes de encerrar. Esta ação não registra recebimento nem pagamento." : "O cancelamento ficará no histórico e será avisado à cozinha. Para corrigir, lance o item novamente em outra rodada."}</Muted>
      <Field label="Motivo obrigatório" error={form.formState.errors.reason?.message}><Textarea maxLength={500} {...form.register("reason", { validate: (value) => value.trim().length > 0 || "Informe o motivo." })} /></Field>
      <Actions><Button type="button" variant="outline" disabled={form.formState.isSubmitting} onClick={onClose}>Voltar</Button><Button variant="danger" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Salvando…" : title}</Button></Actions>
    </form>
  </Dialog>;
}

