"use client";

import { ArrowLeft, ReceiptText, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { useToast } from "@/components/ToastProvider";
import { AdminShell } from "@/layouts/AdminLayout/AdminShell";
import { clientApi } from "@/services/api/client";
import type { CurrentUserResponse, StaffTable, StaffTableConsumption } from "@/types/api";
import { money } from "@/utils/format";
import { tableLabel } from "@/utils/tableIdentity";
import { staffApiMessage } from "./draft";
import { Payments } from "./Payments";
import { ReasonDialog } from "./ReasonDialog";
import { CheckoutNotice, CheckoutRoot, CheckoutTotals } from "./checkoutStyles";
import { Actions, ErrorBox, Header, Heading, Muted, Title } from "./styles";

export function TableCheckout({ table, admin, restaurantName, storeOpen = true, expectedSessionId = table.session?.id ?? "" }: { table: StaffTable; admin: CurrentUserResponse; restaurantName: string; storeOpen?: boolean; expectedSessionId?: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { requestConfirmation } = useConfirmation();
  const [consumption, setConsumption] = useState<StaffTableConsumption | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [forceClose, setForceClose] = useState(false);
  const requestVersion = useRef(0);
  const hadSession = useRef(!!expectedSessionId);
  const actionPending = useRef(false);
  const session = consumption?.session;
  const sessionChanged = !!session && session.id !== expectedSessionId;
  const paid = session?.payments?.reduce((sum, payment) => sum + payment.amountCents, 0) ?? 0;
  const isAdmin = admin.roles.includes("ADMIN");
  const canAct = !busy && !blocked && !error && !sessionChanged;

  const refresh = useCallback(async (signal?: AbortSignal) => {
    const version = ++requestVersion.current;
    setRefreshing(true);
    try {
      const result = await clientApi<StaffTableConsumption>(`admin/table-operations/${table.id}/orders`, { signal });
      if (signal?.aborted || version !== requestVersion.current) return;
      if (!result.session && hadSession.current) { router.replace("/hall"); return; }
      setConsumption(result); setError("");
    } catch {
      if (!signal?.aborted && version === requestVersion.current) setError("Não foi possível atualizar a conta. Confira a conexão e tente novamente antes de receber.");
    } finally {
      if (!signal?.aborted && version === requestVersion.current) setRefreshing(false);
    }
  }, [table.id, router]);

  useEffect(() => {
    const controller = new AbortController();
    const update = () => { if (document.visibilityState === "visible") void refresh(controller.signal); };
    queueMicrotask(() => { if (!controller.signal.aborted) void refresh(controller.signal); });
    const interval = window.setInterval(update, 10000);
    const events = new EventSource("/api/backend/admin/table-operations/events");
    events.addEventListener("table-operation", update);
    events.addEventListener("open", update);
    document.addEventListener("visibilitychange", update);
    return () => { controller.abort(); window.clearInterval(interval); events.close(); document.removeEventListener("visibilitychange", update); };
  }, [refresh]);

  useEffect(() => {
    if (!blocked && !busy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [blocked, busy]);

  async function canLeave() {
    if (!blocked && !busy) return true;
    showToast("Confira a operação pendente antes de sair do fechamento.", "warning");
    return false;
  }

  async function back(toList = false) {
    if (await canLeave()) router.push(toList ? "/hall" : `/hall?${new URLSearchParams({ table: table.id })}`);
  }

  async function tableAction(path: string, body: object = {}) {
    if (!canAct || actionPending.current) return;
    actionPending.current = true; setBusy(true);
    try {
      const result = await clientApi<{ warning?: string }>(`admin/table-operations/${table.id}/${path}`, { method: "POST", body: JSON.stringify(body) });
      if (result.warning) showToast(result.warning, "warning");
      setForceClose(false);
      await refresh();
    } catch (cause) { showToast(staffApiMessage(cause, "Não foi possível concluir. Atualize a conta e tente novamente."), "error"); }
    finally { actionPending.current = false; setBusy(false); }
  }

  return <AdminShell admin={admin} restaurantName={restaurantName} storeOpen={storeOpen} beforeLeave={canLeave}><CheckoutRoot aria-label="Tela de fechamento">
    <Header><Title>Fechamento · {tableLabel(table)}</Title><Actions>
      <Button variant="outline" aria-label="Voltar ao atendimento" disabled={blocked || busy} onClick={() => void back()}><ArrowLeft size={18} />Atendimento</Button>
      <Button variant="ghost" aria-label="Atualizar conta" disabled={refreshing || busy} onClick={() => void refresh()}><RefreshCw size={18} />{refreshing ? "Atualizando…" : "Atualizar"}</Button>
    </Actions></Header>
    {error ? <ErrorBox role="alert">{error}</ErrorBox> : null}
    {!consumption && !error ? <Muted role="status">Carregando consumo e recebimentos…</Muted> : null}
    {sessionChanged ? <ErrorBox role="alert">A conta desta mesa mudou. Volte ao atendimento e selecione a conta atual antes de receber.</ErrorBox> : null}
    {consumption && !session && !expectedSessionId ? <CheckoutNotice role="status"><Heading>Nenhuma conta aberta</Heading><Muted>Volte ao atendimento para selecionar uma mesa ou comanda com consumo.</Muted><Button onClick={() => void back(true)}><ArrowLeft size={18} />Voltar às mesas</Button></CheckoutNotice> : null}
    {session && !sessionChanged && consumption?.totals ? <div>
      <CheckoutTotals aria-label="Resumo do fechamento" aria-live="polite"><div><dt>Total da conta</dt><dd>{money(consumption.totals.totalCents)}</dd></div><div><dt>Já recebido</dt><dd>{money(paid)}</dd></div><div><dt>Falta receber</dt><dd>{money(consumption.totals.totalCents - paid)}</dd></div></CheckoutTotals>
      <Muted>Consumo {money(consumption.totals.consumptionCents)} + serviço ({(consumption.totals.serviceFeeBasisPoints / 100).toLocaleString("pt-BR")}%) {money(consumption.totals.serviceFeeCents)}</Muted>
    </div> : null}
    {session && !sessionChanged && !consumption?.canCheckout ? <CheckoutNotice><Heading>Fechamento pelo caixa</Heading><Muted>Recebimento pelo garçom não está liberado. Solicite o fechamento ao caixa.</Muted></CheckoutNotice> : null}
    {session && !sessionChanged && consumption?.canCheckout && session.status === "OPEN" ? <CheckoutNotice><Heading><ReceiptText size={22} />Iniciar fechamento</Heading><Muted>Novos lançamentos serão bloqueados enquanto você recebe a conta. Antes do primeiro pagamento, é possível reabrir para corrigir o consumo.</Muted><Button disabled={!canAct} onClick={async () => { if (await requestConfirmation({ message: "Iniciar o fechamento e bloquear novos lançamentos nesta conta?", confirmLabel: "Iniciar fechamento", variant: "primary" })) await tableAction("request-bill"); }}><ReceiptText size={18} />Iniciar fechamento</Button></CheckoutNotice> : null}
    {session && !sessionChanged && session.status === "CLOSING" && consumption?.canCheckout ? <Payments key={session.id} tableId={table.id} consumption={consumption} disabled={busy || !!error} onSaved={refresh} onSettled={() => router.replace("/hall")} onBlockedChange={setBlocked} /> : null}
    {session && !sessionChanged && !paid && !session.payments?.length && isAdmin ? <details className="checkout-admin-actions"><summary>Outras ações de encerramento</summary><Muted>Use apenas quando for necessário encerrar sem registrar pagamento. Pedidos em andamento serão cancelados e o motivo ficará no histórico.</Muted><Button variant="dangerGhost" disabled={!canAct} onClick={() => setForceClose(true)}>Encerrar sem recebimento</Button></details> : null}
    {forceClose ? <ReasonDialog action={{ closeTable: true }} onClose={() => setForceClose(false)} onConfirm={(reason) => tableAction("force-close", { reason })} /> : null}
  </CheckoutRoot></AdminShell>;
}
