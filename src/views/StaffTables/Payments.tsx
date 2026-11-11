"use client";

import { Check, Minus, Plus, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/Button";
import { Field, Input, Select } from "@/components/Field";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { useToast } from "@/components/ToastProvider";
import { ApiError, clientApi } from "@/services/api/client";
import type { StaffTableConsumption, TablePayment } from "@/types/api";
import { money } from "@/utils/format";
import { staffApiMessage } from "./draft";
import { paymentLines, paymentMethodLabels, paymentQuote } from "./paymentCalculation";
import { Actions, ErrorBox, Heading, ItemRow, Muted, Price, Row, Stack, Summary, GuestCountControls } from "./styles";

type Values = { mode: "ITEMS" | "EQUAL"; splitCount: number; method: TablePayment["method"]; person: string; quantities: Record<string, number> };
type Pending = { path: "payments" | "settle"; body: string };
const emptyPayments: TablePayment[] = [];

export function Payments({ tableId, consumption, disabled, onSaved, onBlockedChange }: { tableId: string; consumption: StaffTableConsumption; disabled: boolean; onSaved: () => Promise<void>; onBlockedChange: (blocked: boolean) => void }) {
  const { showToast } = useToast();
  const { requestConfirmation } = useConfirmation();
  const session = consumption.session!;
  const payments = session.payments ?? emptyPayments;
  const form = useForm<Values>({ defaultValues: { mode: payments[0]?.mode ?? "ITEMS", splitCount: payments[0]?.splitCount || session.guestCount || 1, method: "CREDIT_CARD", person: "", quantities: Object.fromEntries(paymentLines(consumption).map((_, index) => [index, 0])) } });
  const values = useWatch({ control: form.control });
  const mode = payments[0]?.mode ?? values.mode ?? "ITEMS";
  const splitCount = payments[0]?.splitCount || Number(values.splitCount);
  const quantities = Object.fromEntries(paymentLines(consumption).map((line, index) => [`${line.orderId}:${line.itemIndex}`, Number(values.quantities?.[index] ?? 0)]));
  const quote = paymentQuote(consumption, mode, splitCount, quantities);
  const [pending, setPending] = useState<Pending | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const storageKey = `table-payment:${tableId}:${session.id}`;
  const paid = payments.reduce((sum, payment) => sum + payment.amountCents, 0);
  const balance = (consumption.totals?.totalCents ?? 0) - paid;
  const locked = disabled || saving || !!pending || !ready;
  const kitchenPending = consumption.orders.some((order) => !["READY", "COMPLETED", "CANCELED"].includes(order.status));

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) setPending(JSON.parse(saved));
        setReady(true);
      } catch { setError("Não foi possível recuperar a confirmação. Libere o armazenamento deste navegador antes de receber."); }
    });
    return () => { active = false; };
  }, [storageKey]);

  useEffect(() => { onBlockedChange(saving || !!pending); }, [saving, pending, onBlockedChange]);
  useEffect(() => () => onBlockedChange(false), [onBlockedChange]);
  useEffect(() => {
    if (pending?.path !== "payments") return;
    const id = JSON.parse(pending.body).submissionId;
    if (payments.some((payment) => payment.id === id)) {
      queueMicrotask(() => {
        sessionStorage.removeItem(storageKey); setPending(null); setError("");
        form.setValue("quantities", Object.fromEntries(paymentLines(consumption).map((_, index) => [index, 0]))); form.resetField("person", { defaultValue: "" });
      });
    }
  }, [payments, pending, storageKey, form, consumption]);

  async function send(request: Pending) {
    if (submitting.current) return;
    submitting.current = true; setSaving(true); setError("");
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(request));
      setPending(request);
    } catch {
      setError("Não foi possível guardar a confirmação. Libere o armazenamento do navegador e tente novamente.");
      submitting.current = false; setSaving(false); return;
    }
    try {
      await clientApi(`admin/table-operations/${tableId}/${request.path}`, { method: "POST", body: request.body });
      sessionStorage.removeItem(storageKey); setPending(null);
      form.setValue("quantities", Object.fromEntries(paymentLines(consumption).map((_, index) => [index, 0]))); form.resetField("person", { defaultValue: "" });
      showToast(request.path === "payments" ? "Recebimento registrado. Confira o saldo restante." : "Conta paga e comanda encerrada.");
    } catch (cause) {
      if (cause instanceof ApiError && [400, 404, 409, 422].includes(cause.status)) {
        sessionStorage.removeItem(storageKey); setPending(null);
        setError(staffApiMessage(cause, "A conta mudou. Confira os recebimentos antes de continuar."));
      } else {
        setError("Resultado sem confirmação. Use Conferir recebimento; a mesma baixa não será duplicada.");
      }
    } finally {
      await onSaved(); submitting.current = false; setSaving(false);
    }
  }

  async function receive(data: Values) {
    if (locked || !quote.valid) return;
    if (!await requestConfirmation({ message: `Confirmar recebimento presencial de ${money(quote.amountCents)} em ${paymentMethodLabels[data.method]}? Registre somente após conferir o pagamento.`, confirmLabel: "Confirmar recebimento", variant: "primary" })) return;
    await send({ path: "payments", body: JSON.stringify({ sessionId: session.id, version: session.paymentVersion ?? 0, submissionId: crypto.randomUUID(), mode, splitCount: mode === "EQUAL" ? splitCount : 0, method: data.method, person: data.person.trim(), items: quote.items, expectedAmountCents: quote.amountCents }) });
  }

  return <Stack aria-label="Recebimentos da conta">
    <Heading><Wallet size={20} aria-hidden="true" /> Receber e dividir conta</Heading>
    <Row aria-live="polite"><span>Recebido: <Price>{money(paid)}</Price></span><span>Falta receber: <Price>{money(balance)}</Price></span></Row>
    {error ? <ErrorBox role="alert">{error}</ErrorBox> : null}
    {pending ? <><Muted>Há uma operação sem confirmação. Confira antes de fazer outra baixa ou sair desta mesa.</Muted><Button disabled={saving || !consumption.canCheckout} onClick={() => void send(pending)}>{saving ? "Conferindo…" : pending.path === "payments" ? "Conferir recebimento" : "Conferir encerramento"}</Button></> : null}
    {payments.length ? <div aria-label="Pagamentos registrados">{payments.map((payment) => <ItemRow key={payment.id}>
      <Row><strong><Check size={16} aria-hidden="true" /> {payment.person}</strong><Price>{money(payment.amountCents)}</Price></Row>
      <Muted>{paymentMethodLabels[payment.method]} · {new Date(payment.receivedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}{payment.mode === "EQUAL" ? ` · Divisão em ${payment.splitCount} pessoas` : ""}</Muted>
      {payment.items?.map((item) => <Muted key={`${item.orderId}:${item.itemIndex}`}>{item.quantity}× {item.name}</Muted>)}
    </ItemRow>)}</div> : null}
    {!consumption.canCheckout ? <Muted>Recebimento pelo garçom não está liberado. Solicite o fechamento ao caixa.</Muted> : balance > 0 || !payments.length && (consumption.totals?.totalCents ?? 0) > 0 ? <form onSubmit={(event) => void form.handleSubmit(receive)(event)} className="table-payment-form">
      <Field label="Como dividir a conta"><Select disabled={locked || payments.length > 0} {...form.register("mode")}><option value="ITEMS">Selecionar itens por pessoa</option><option value="EQUAL">Dividir igualmente por pessoas</option></Select></Field>
      {mode === "EQUAL" ? <><Field label="Dividir entre quantas pessoas?" error={form.formState.errors.splitCount?.message}><Input type="number" inputMode="numeric" min={1} max={999} step={1} disabled={locked || payments.length > 0} {...form.register("splitCount", { valueAsNumber: true, validate: (value) => Number.isInteger(value) && value >= 1 && value <= 999 || "Informe entre 1 e 999 pessoas." })} /></Field><Muted>Parte {payments.length + 1} de {splitCount || "…"}. Centavos são distribuídos entre as partes. Use 1 para receber o total.</Muted></> : <div aria-label="Selecionar itens para pagamento">{paymentLines(consumption).map((line, index) => <ItemRow key={`${line.orderId}:${line.itemIndex}`}>
        <Row><div><strong>{line.item.name}</strong><Muted>Rodada #{line.orderNumber ?? line.orderId.slice(-6)} · {line.remaining} de {line.item.quantity} disponível(is)</Muted></div><Price>{money(line.item.totalCents)}</Price></Row>
        {line.item.options?.length ? <Muted>{line.item.options.map((option) => option.itemName).join(", ")}</Muted> : null}{line.item.observations ? <Muted>{line.item.observations}</Muted> : null}
        <Field label={`Quantidade de ${line.item.name} a receber`}><GuestCountControls>
          <Button type="button" variant="outline" disabled={locked || Number(values.quantities?.[index] ?? 0) <= 0} aria-label={`Diminuir ${line.item.name} a receber`} onClick={() => form.setValue(`quantities.${index}`, Math.max(0, Number(values.quantities?.[index] ?? 0) - 1))}><Minus size={18} /></Button>
          <Input type="number" inputMode="numeric" aria-label={`Quantidade de ${line.item.name} a receber`} min={0} max={line.remaining} step={1} disabled={locked || !line.remaining} {...form.register(`quantities.${index}`, { valueAsNumber: true })} placeholder="0" />
          <Button type="button" variant="outline" disabled={locked || Number(values.quantities?.[index] ?? 0) >= line.remaining} aria-label={`Aumentar ${line.item.name} a receber`} onClick={() => form.setValue(`quantities.${index}`, Math.min(line.remaining, Number(values.quantities?.[index] ?? 0) + 1))}><Plus size={18} /></Button>
        </GuestCountControls></Field>
      </ItemRow>)}</div>}
      <Field label="Pessoa (opcional)"><Input maxLength={100} placeholder={`Pessoa ${payments.length + 1}`} disabled={locked} {...form.register("person")} /></Field>
      <Field label="Forma de pagamento"><Select disabled={locked} {...form.register("method")}>{Object.entries(paymentMethodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
      <Muted>Taxa de serviço incluída nesta parte: {money(quote.serviceFeeCents)}. Após a primeira baixa, divisão e consumo ficam protegidos.</Muted>
      <Summary><Button type="submit" disabled={locked || !quote.valid}><Wallet size={18} />{saving ? "Registrando…" : `Receber ${money(quote.amountCents)}`}</Button></Summary>
    </form> : null}
    {consumption.canCheckout && balance === 0 && consumption.totals ? <><Muted>{kitchenPending ? "Conta quitada. Aguarde a cozinha marcar os pedidos em preparo como prontos para encerrar." : "Conta quitada. Encerre para liberar a mesa ou comanda."}</Muted><Actions><Button disabled={locked || kitchenPending} onClick={async () => {
      if (await requestConfirmation({ message: "Conta quitada. Encerrar comanda e liberar este atendimento?", confirmLabel: "Encerrar conta paga", variant: "primary" })) await send({ path: "settle", body: JSON.stringify({ sessionId: session.id, version: session.paymentVersion ?? 0 }) });
    }}><Check size={18} />Encerrar conta paga</Button></Actions></> : null}
  </Stack>;
}
