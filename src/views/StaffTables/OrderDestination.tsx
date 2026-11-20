"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Send, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Input, Select } from "@/components/Field";
import { clientApi } from "@/services/api/client";
import type { StaffTable, StaffTableConsumption } from "@/types/api";
import { formatBrazilianPhoneInput } from "@/utils/customerInput";
import { tableLabel } from "@/utils/tableIdentity";
import { normalizeTablePhone, staffApiMessage } from "./draft";
import { GuestCountField } from "./GuestCountField";
import { Actions, Dialog, ErrorBox, Heading, Muted, Row } from "./styles";

export type OrderTarget = { tableId: string; sessionId: string; physicalTableId?: string; customerName: string; customerPhone: string; guestCount?: number };

export function OrderDestination({ tables, onConfirm, onClose }: { tables: StaffTable[]; onConfirm: (target: OrderTarget) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState<{ tableId: string; consumption: StaffTableConsumption } | null>(null);
  const [error, setError] = useState("");
  const form = useForm({ defaultValues: { tableId: "", physicalTableId: "", customerName: "", customerPhone: "", guestCount: "1" } });
  const tableId = useWatch({ control: form.control, name: "tableId" });
  const guestCount = useWatch({ control: form.control, name: "guestCount" });
  const table = tables.find((entry) => entry.id === tableId);
  const consumption = loaded && loaded.tableId === tableId ? loaded.consumption : null;
  const closing = consumption?.session?.status === "CLOSING";
  const boundTable = consumption?.session?.physicalTableId;

  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  useEffect(() => {
    if (!tableId) return;
    const controller = new AbortController();
    form.setValue("physicalTableId", ""); form.setValue("customerName", ""); form.setValue("customerPhone", ""); form.setValue("guestCount", "1");
    void clientApi<StaffTableConsumption>(`admin/table-operations/${tableId}/orders`, { signal: controller.signal }).then((value) => {
      if (controller.signal.aborted) return;
      setLoaded({ tableId, consumption: value }); setError("");
      const contact = value.orders.find((order) => order.customerPhone);
      if (!form.getValues("customerPhone")) form.setValue("customerPhone", formatBrazilianPhoneInput(contact?.customerPhone ?? ""));
      if (!form.getValues("customerName")) form.setValue("customerName", contact?.customerName ?? "");
      if (value.session?.physicalTableId) form.setValue("physicalTableId", value.session.physicalTableId);
    }).catch((cause) => { if (!controller.signal.aborted) { setLoaded(null); setError(staffApiMessage(cause, "Não foi possível conferir esta conta. Selecione novamente para tentar.")); } });
    return () => controller.abort();
  }, [tableId, form]);

  return <Dialog ref={dialog} onCancel={onClose} aria-labelledby="order-destination-title"><form onSubmit={form.handleSubmit((data) => {
    if (!table || !consumption || closing) return;
    onConfirm({ tableId: table.id, sessionId: consumption.session?.id ?? "", physicalTableId: table.kind === "COMMAND" ? boundTable || data.physicalTableId : undefined, customerName: data.customerName.trim(), customerPhone: normalizeTablePhone(data.customerPhone), guestCount: consumption.session ? undefined : Number(data.guestCount) });
  })}>
    <Row><Heading id="order-destination-title">Para onde vai o pedido?</Heading><Button type="button" variant="ghost" onClick={onClose} aria-label="Voltar aos itens"><X size={18} /></Button></Row>
    <Muted>Identifique a conta depois de revisar os itens. Nada será enviado até confirmar.</Muted>
    <Field label="Mesa ou comanda" error={form.formState.errors.tableId?.message}><Select autoFocus {...form.register("tableId", { required: "Selecione mesa ou comanda.", onChange: () => { setLoaded(null); setError(""); } })}><option value="">Selecione a conta</option>{tables.filter((entry) => entry.active).map((entry) => <option key={entry.id} value={entry.id}>{tableLabel(entry)}{entry.kind !== "COMMAND" ? " · conta compartilhada" : ""}</option>)}</Select></Field>
    {error ? <ErrorBox role="alert">{error}</ErrorBox> : tableId && !consumption ? <Muted role="status">Conferindo conta…</Muted> : null}
    {closing ? <ErrorBox role="alert">Conta em fechamento. Reabra em Mesas e comandas ou escolha outra conta.</ErrorBox> : null}
    <fieldset className="hall-destination-fields" disabled={!consumption || closing}>
    {table?.kind === "COMMAND" && !boundTable ? <Field label="Mesa da comanda" error={form.formState.errors.physicalTableId?.message}><Select {...form.register("physicalTableId", { validate: (value) => table?.kind !== "COMMAND" || !!boundTable || !!value || "Selecione a mesa desta comanda." })}><option value="">Selecione a mesa</option>{tables.filter((entry) => entry.active && entry.kind !== "COMMAND").map((entry) => <option key={entry.id} value={entry.id}>Mesa {entry.number}</option>)}</Select></Field> : consumption?.session?.physicalTableNumber ? <Muted>Mesa {consumption.session.physicalTableNumber} · {table ? tableLabel(table) : ""}</Muted> : null}
    <Field label="Nome do cliente (opcional)" error={form.formState.errors.customerName?.message}><Input maxLength={100} autoComplete="off" {...form.register("customerName", { maxLength: { value: 100, message: "Use até 100 caracteres." } })} /></Field>
    <Field label="Telefone ou celular com DDD" error={form.formState.errors.customerPhone?.message}><Input type="tel" inputMode="tel" autoComplete="off" maxLength={25} placeholder="(11) 99999-9999" {...form.register("customerPhone", { onChange: (event) => form.setValue("customerPhone", formatBrazilianPhoneInput(event.target.value)), validate: (value) => !!normalizeTablePhone(value) || "Informe DDD e telefone com 10 ou 11 dígitos." })} /></Field>
    {consumption && !consumption.session ? <GuestCountField label="Total de pessoas" value={guestCount} onChange={(value) => form.setValue("guestCount", value, { shouldValidate: true })} error={form.formState.errors.guestCount?.message} registration={form.register("guestCount", { validate: (value) => !!consumption?.session || Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 999 || "Informe de 1 a 999 pessoas." })} /> : null}
    </fieldset>
    <Actions><Button type="button" variant="outline" onClick={onClose}>Voltar aos itens</Button><Button type="submit" disabled={!consumption || closing || form.formState.isSubmitting}><Send size={18} />Confirmar e enviar ao preparo</Button></Actions>
  </form></Dialog>;
}
