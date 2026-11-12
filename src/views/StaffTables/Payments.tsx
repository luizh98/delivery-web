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
import { ErrorBox, Heading, ItemRow, Muted, Price, Row } from "./styles";
import { CheckoutNotice, PaymentAmount, PaymentDetails, PaymentHistory, PaymentLine, PaymentQuantity, PaymentSelection, PaymentWorkspace } from "./checkoutStyles";

type Values = { mode: "ITEMS" | "EQUAL"; splitCount: number; method: TablePayment["method"]; person: string; quantities: Record<string, number> };
type Pending = { path: "payments" | "settle"; body: string };
const emptyPayments: TablePayment[] = [];

export function Payments({ tableId, consumption, disabled, onSaved, onSettled, onBlockedChange }: { tableId: string; consumption: StaffTableConsumption; disabled: boolean; onSaved: () => Promise<void>; onSettled: () => void; onBlockedChange: (blocked: boolean) => void }) {
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
    let settled = false;
    try {
      await clientApi(`admin/table-operations/${tableId}/${request.path}`, { method: "POST", body: request.body });
      sessionStorage.removeItem(storageKey); setPending(null);
      form.setValue("quantities", Object.fromEntries(paymentLines(consumption).map((_, index) => [index, 0]))); form.resetField("person", { defaultValue: "" });
      if (request.path === "settle") { settled = true; onSettled(); }
      else showToast("Recebimento registrado. Confira o saldo restante.");
    } catch (cause) {
      if (cause instanceof ApiError && [400, 404, 409, 422].includes(cause.status)) {
        sessionStorage.removeItem(storageKey); setPending(null);
        setError(staffApiMessage(cause, "A conta mudou. Confira os recebimentos antes de continuar."));
      } else {
        setError("Resultado sem confirmação. Use Conferir recebimento; a mesma baixa não será duplicada.");
      }
    } finally {
      if (!settled) await onSaved();
      submitting.current = false; setSaving(false);
    }
  }

  async function receive(data: Values) {
    if (locked || !quote.valid) return;
    if (!await requestConfirmation({ message: `Confirmar recebimento presencial de ${money(quote.amountCents)} em ${paymentMethodLabels[data.method]}? Registre somente após conferir o pagamento.`, confirmLabel: "Confirmar recebimento", variant: "primary" })) return;
    await send({ path: "payments", body: JSON.stringify({ sessionId: session.id, version: session.paymentVersion ?? 0, submissionId: crypto.randomUUID(), mode, splitCount: mode === "EQUAL" ? splitCount : 0, method: data.method, person: data.person.trim(), items: quote.items, expectedAmountCents: quote.amountCents }) });
  }

  return <PaymentWorkspace aria-label="Recebimentos da conta">
    {error ? <ErrorBox role="alert">{error}</ErrorBox> : null}
    {pending ? <CheckoutNotice role="status"><Heading>Confira o recebimento pendente</Heading><Muted>Esta operação ainda não foi confirmada. Confira antes de registrar outro pagamento.</Muted><Button disabled={saving || !consumption.canCheckout} onClick={() => void send(pending)}>{saving ? "Conferindo…" : pending.path === "payments" ? "Conferir recebimento" : "Conferir encerramento"}</Button></CheckoutNotice> : null}
    {!consumption.canCheckout ? <Muted>Recebimento pelo garçom não está liberado. Solicite o fechamento ao caixa.</Muted> : balance > 0 || !payments.length && (consumption.totals?.totalCents ?? 0) > 0 ? <form onSubmit={(event) => void form.handleSubmit(receive)(event)}>
      <PaymentSelection aria-label="Divisão do pagamento">
        <div><Heading>Dividir pagamento</Heading><Muted>Escolha os itens desta pessoa ou divida o total igualmente.</Muted></div>
        <Field label="Como dividir a conta"><Select disabled={locked || payments.length > 0} {...form.register("mode")}><option value="ITEMS">Selecionar itens por pessoa</option><option value="EQUAL">Dividir igualmente por pessoas</option></Select></Field>
        {mode === "EQUAL" ? <><Field label="Dividir entre quantas pessoas?" error={form.formState.errors.splitCount?.message}><Input type="number" inputMode="numeric" min={1} max={999} step={1} disabled={locked || payments.length > 0} {...form.register("splitCount", { valueAsNumber: true, validate: (value) => Number.isInteger(value) && value >= 1 && value <= 999 || "Informe entre 1 e 999 pessoas." })} /></Field><Muted>Parte {payments.length + 1} de {splitCount || "…"}. Centavos são distribuídos entre as partes. Use 1 para receber o total.</Muted></> :
        <div aria-label="Selecionar itens para pagamento">{paymentLines(consumption).map((line, index) => {
          if (!line.remaining) return null;
          const quantity = Number(values.quantities?.[index] ?? 0);
          const remainingCents = line.item.totalCents - Math.floor(line.item.totalCents * line.paid / line.item.quantity);
          return <PaymentLine key={`${line.orderId}:${line.itemIndex}`} data-selected={quantity > 0}>
            <div data-item-info><strong>{line.item.name}</strong><Muted>{line.remaining} pendente(s) · {money(remainingCents)}</Muted>
              {line.item.options?.length ? <Muted>{line.item.options.map((option) => option.itemName).join(", ")}</Muted> : null}
              {line.item.observations ? <Muted>{line.item.observations}</Muted> : null}
            </div>
            <PaymentQuantity role="group" aria-label={`Selecionar ${line.item.name}`}>
              <Button type="button" variant="outline" disabled={locked || quantity <= 0} aria-label={`Diminuir ${line.item.name} a receber`} onClick={() => form.setValue(`quantities.${index}`, Math.max(0, quantity - 1))}><Minus size={18} /></Button>
              <Input type="number" inputMode="numeric" aria-label={`Quantidade de ${line.item.name} a receber`} min={0} max={line.remaining} step={1} disabled={locked} {...form.register(`quantities.${index}`, { valueAsNumber: true })} placeholder="0" />
              <Button type="button" variant="outline" disabled={locked || quantity >= line.remaining} aria-label={`Aumentar ${line.item.name} a receber`} onClick={() => form.setValue(`quantities.${index}`, Math.min(line.remaining, quantity + 1))}><Plus size={18} /></Button>
            </PaymentQuantity>
          </PaymentLine>;
        })}</div>}
        {payments.length ? <Muted>Divisão mantida conforme o primeiro recebimento. Itens quitados aparecem no histórico abaixo.</Muted> : null}
      </PaymentSelection>
      <PaymentDetails aria-label="Pagamento desta pessoa">
        <Heading>Receber desta pessoa</Heading>
        <Field label="Pessoa (opcional)"><Input maxLength={100} placeholder={`Pessoa ${payments.length + 1}`} disabled={locked} {...form.register("person")} /></Field>
        <Field label="Forma de pagamento"><Select disabled={locked} {...form.register("method")}>{Object.entries(paymentMethodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
        <PaymentAmount aria-live="polite">
          <Row><Muted>Consumo selecionado</Muted><Price>{money(quote.consumptionCents)}</Price></Row>
          <Row><Muted>Serviço desta parte</Muted><Price>{money(quote.serviceFeeCents)}</Price></Row>
          <Row><span>Receber agora</span><Price>{money(quote.amountCents)}</Price></Row>
        </PaymentAmount>
        <Button type="submit" disabled={locked || !quote.valid}><Wallet size={18} />{saving ? "Registrando…" : `Receber ${money(quote.amountCents)}`}</Button>
        <Muted>{mode === "ITEMS" && !quote.items.length ? "Selecione as quantidades que esta pessoa vai pagar." : "Confirme a baixa somente depois de conferir o pagamento presencial."}</Muted>
      </PaymentDetails>
    </form> : null}
    {consumption.canCheckout && balance === 0 && consumption.totals ? <CheckoutNotice role="status"><Heading><Check size={22} />Conta quitada</Heading><Muted>{kitchenPending ? "Aguarde a cozinha marcar os pedidos em preparo como prontos para encerrar." : "Todos os pagamentos foram registrados. Encerre para liberar a mesa ou comanda."}</Muted><Button disabled={locked || kitchenPending} onClick={async () => {
      if (await requestConfirmation({ message: "Conta quitada. Encerrar comanda e liberar este atendimento?", confirmLabel: "Encerrar conta paga", variant: "primary" })) await send({ path: "settle", body: JSON.stringify({ sessionId: session.id, version: session.paymentVersion ?? 0 }) });
    }}><Check size={18} />Encerrar conta paga</Button></CheckoutNotice> : null}
    {payments.length ? <PaymentHistory aria-label="Pagamentos registrados"><Heading>Pagamentos registrados · {payments.length}</Heading>{payments.map((payment) => <ItemRow key={payment.id}>
      <Row><div><strong>{payment.person}</strong><Muted>{paymentMethodLabels[payment.method]} · {new Date(payment.receivedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}{payment.mode === "EQUAL" ? ` · Divisão em ${payment.splitCount} pessoas` : ""}</Muted></div><Price>{money(payment.amountCents)}</Price></Row>
      {payment.items?.length ? <details><summary>Ver itens deste pagamento</summary>{payment.items.map((item) => <Muted key={`${item.orderId}:${item.itemIndex}`}>{item.quantity}× {item.name}</Muted>)}</details> : null}
    </ItemRow>)}</PaymentHistory> : null}
  </PaymentWorkspace>;
}
