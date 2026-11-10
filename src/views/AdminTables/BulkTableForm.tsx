"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Field, Input, Select } from "@/components/Field";
import { clientApi } from "@/services/api/client";
import type { TableResponse } from "@/types/api";
import { Actions, BulkDialog, ErrorText, Form, Section, SectionHeader, SectionHelp, SectionTitle } from "./styles";

const schema = z.object({
  kind: z.enum(["TABLE", "COMMAND"]),
  start: z.number().int().min(1).max(999999),
  end: z.number().int().min(1).max(999999),
}).refine((value) => value.end >= value.start && value.end - value.start < 500, {
  path: ["end"], message: "Informe intervalo crescente de até 500 números.",
});
type Values = z.infer<typeof schema>;
type BulkResult = { created: TableResponse[]; existing: string[]; failed: string[] };

export function BulkTableForm({ disabled, onComplete }: { disabled: boolean; onComplete: (tables: TableResponse[]) => void }) {
  const [result, setResult] = useState<BulkResult | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (open) element?.showModal();
    return () => element?.close();
  }, [open]);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { kind: "TABLE", start: 1, end: 10 } });
  const [start, end] = useWatch({ control: form.control, name: ["start", "end"] });
  const count = Number.isInteger(start) && Number.isInteger(end) && end >= start && end - start < 500 ? end - start + 1 : 0;
  const busy = disabled || form.formState.isSubmitting;
  function close() {
    if (busy) return;
    dialog.current?.close();
    setOpen(false);
  }
  async function submit(values: Values) {
    setError(""); setResult(null);
    try {
      const next = await clientApi<BulkResult>("admin/tables/bulk", { method: "POST", body: JSON.stringify(values) });
      setResult(next); onComplete(next.created);
    } catch {
      setError("Não foi possível concluir o lote. Repita o intervalo: números já cadastrados serão preservados.");
    }
  }
  return <>
    <Button type="button" variant="outline" disabled={disabled} aria-haspopup="dialog" aria-expanded={open} style={{ width: "100%" }} onClick={() => setOpen(true)}><Plus size={16} aria-hidden="true" />Cadastro em massa</Button>
    {open ? <BulkDialog ref={dialog} aria-labelledby="bulk-table-title" aria-describedby="bulk-table-help" onCancel={(event) => { event.preventDefault(); close(); }}>
    <Section>
    <SectionHeader><div><SectionTitle id="bulk-table-title">Cadastro em massa</SectionTitle><SectionHelp id="bulk-table-help">Cada número recebe conta e QR próprios. Mesas e comandas têm numeração independente.</SectionHelp></div><Button type="button" variant="ghost" disabled={busy} onClick={close} aria-label="Fechar cadastro em massa"><X size={18} aria-hidden="true" /></Button></SectionHeader>
    <Form onSubmit={form.handleSubmit(submit)}>
      <Field label="Tipo de atendimento"><Select autoFocus disabled={busy} {...form.register("kind")}><option value="TABLE">Mesa · conta compartilhada</option><option value="COMMAND">Comanda · conta individual</option></Select></Field>
      <Field label="Número inicial" error={form.formState.errors.start?.message}><Input type="number" min={1} max={999999} disabled={busy} {...form.register("start", { valueAsNumber: true })} /></Field>
      <Field label="Número final" error={form.formState.errors.end?.message}><Input type="number" min={1} max={999999} disabled={busy} {...form.register("end", { valueAsNumber: true })} /></Field>
      <SectionHelp>{count ? `${count} cadastro(s), do número ${start} ao ${end}. Existentes serão preservados.` : "Informe até 500 números por lote."}</SectionHelp>
      <Actions><Button type="submit" disabled={busy}><Plus size={16} aria-hidden="true" />{form.formState.isSubmitting ? "Cadastrando…" : `Cadastrar ${count || "em massa"}`}</Button></Actions>
    </Form>
    {error ? <ErrorText role="alert">{error}</ErrorText> : null}
    {result ? <div role="status"><SectionHelp>{result.created.length} criado(s); {result.existing.length} já existente(s).</SectionHelp>{result.failed.length ? <ErrorText>Falha nos números: {result.failed.join(", ")}. Repita o intervalo para tentar novamente.</ErrorText> : null}</div> : null}
    </Section>
    </BulkDialog> : null}
  </>;
}
