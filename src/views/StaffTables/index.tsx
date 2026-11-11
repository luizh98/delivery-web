"use client";

import { ArrowLeft, BellRing, Check, CircleAlert, Clock3, Copy, LockKeyhole, Pencil, Plus, ReceiptText, RefreshCw, Search, Send, Trash2, Users, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/Button";
import { Field, Input, Select, Textarea } from "@/components/Field";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { useToast } from "@/components/ToastProvider";
import { ApiError, clientApi } from "@/services/api/client";
import type { CurrentUserResponse, MenuResponse, Product, StaffTable, StaffTableConsumption, StaffTableOrder } from "@/types/api";
import { money, statusLabel } from "@/utils/format";
import { productSalePrice } from "@/utils/productPricing";
import { draftItemTotal, normalizeTablePhone, staffApiMessage, type DraftItem } from "./draft";
import { ItemEditor } from "./ItemEditor";
import { Payments } from "./Payments";
import { GuestCountField } from "./GuestCountField";
import { TableServiceAlerts } from "@/components/TableServiceAlerts";
import { tableServiceLabels } from "@/utils/tableService";
import { tableLabel } from "@/utils/tableIdentity";
import { tableElapsed, tableGuests, tableState, tableStatus } from "./presentation";
import { AdminShell } from "@/layouts/AdminLayout/AdminShell";
import { AccountPanel, AccountTotal, Actions, Badge, Dialog, Empty, ErrorBox, Header, Heading, ItemRow, MobileBar, MobileSwitch, Muted, Panel, Price, ProductButton, ProductList, Root, Row, Stack, Summary, TableButton, TableGrid, Tabs, Title, Workbench } from "./styles";

type Draft = { items: DraftItem[]; sessionId: string; notes: string };
type CancelAction = { order: StaffTableOrder; itemIndex?: number } | { closeTable: true };
const emptyDraft = (sessionId = ""): Draft => ({ items: [], sessionId, notes: "" });
const closingMessage = "Conta em fechamento. Reabra a comanda para lançar novos itens.";
const requestLabel = tableServiceLabels;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function PhoneDialog({ opening, onConfirm, onClose }: { opening: boolean; onConfirm: (phone: string, guestCount?: number) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useForm({ defaultValues: { phone: "", guestCount: "" } });
  const guestCount = useWatch({ control: form.control, name: "guestCount" });
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  return <Dialog ref={dialog} onCancel={onClose} aria-labelledby="phone-title">
    <form onSubmit={form.handleSubmit(({ phone, guestCount }) => onConfirm(normalizeTablePhone(phone), opening ? Number(guestCount) : undefined))}>
      <Row><Heading id="phone-title">{opening ? "Abertura da conta" : "Contato da conta"}</Heading><Button type="button" variant="ghost" onClick={onClose} aria-label="Voltar à rodada"><X size={18} /></Button></Row>
      <Muted>Informe telefone ou celular da pessoa responsável pela conta para contato, caso ela saia.</Muted>
      <Field label="Telefone ou celular com DDD" error={form.formState.errors.phone?.message}><Input type="tel" autoComplete="tel" placeholder="(11) 99999-9999" maxLength={25} autoFocus {...form.register("phone", { validate: (value) => !!normalizeTablePhone(value) || "Informe DDD e telefone com 10 ou 11 dígitos." })} /></Field>
      {opening ? <GuestCountField label="Total de pessoas" value={guestCount} onChange={(value) => form.setValue("guestCount", value, { shouldDirty: true, shouldValidate: true })} error={form.formState.errors.guestCount?.message} registration={form.register("guestCount", { validate: (value) => (Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 999) || "Informe um número inteiro entre 1 e 999." })} /> : null}
      <Actions><Button type="button" variant="outline" onClick={onClose}>Voltar</Button><Button type="submit"><Send size={18} />{opening ? "Abrir conta e enviar" : "Salvar contato e enviar"}</Button></Actions>
    </form>
  </Dialog>;
}

function ReasonDialog({ action, onConfirm, onClose }: { action: CancelAction; onConfirm: (reason: string) => Promise<void>; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useForm({ defaultValues: { reason: "" } });
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  const title = "closeTable" in action ? "Encerrar comanda" : action.itemIndex === undefined ? "Cancelar rodada" : `Cancelar ${action.order.items[action.itemIndex].name}`;
  return <Dialog ref={dialog} onCancel={(event) => { if (form.formState.isSubmitting) event.preventDefault(); else onClose(); }} aria-labelledby="cancel-title">
    <form onSubmit={form.handleSubmit(async ({ reason }) => { await onConfirm(reason.trim()); })}>
      <Row><Heading id="cancel-title">{title}</Heading><Button type="button" variant="ghost" disabled={form.formState.isSubmitting} onClick={onClose} aria-label="Voltar sem cancelar"><X size={18} /></Button></Row>
      <Muted>{"closeTable" in action ? "Pedidos em andamento serão cancelados. Esta ação não registra recebimento nem pagamento." : "O cancelamento ficará no histórico e será avisado à cozinha. Para corrigir, lance o item novamente em outra rodada."}</Muted>
      <Field label="Motivo obrigatório" error={form.formState.errors.reason?.message}><Textarea maxLength={500} {...form.register("reason", { validate: (value) => value.trim().length > 0 || "Informe o motivo." })} /></Field>
      <Actions><Button type="button" variant="outline" disabled={form.formState.isSubmitting} onClick={onClose}>Voltar</Button><Button variant="danger" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Salvando…" : title}</Button></Actions>
    </form>
  </Dialog>;
}

function GuestCountForm({ tableId, session, disabled, onSaved }: { tableId: string; session: NonNullable<StaffTable["session"]>; disabled: boolean; onSaved: () => Promise<void> }) {
  const { showToast } = useToast();
  const form = useForm({ defaultValues: { guestCount: session.guestCount ? String(session.guestCount) : "" } });
  const guestCount = useWatch({ control: form.control, name: "guestCount" });
  return <form className="table-guests-form" onSubmit={form.handleSubmit(async ({ guestCount }) => {
    try {
      await clientApi(`admin/table-operations/${tableId}/guests`, { method: "PATCH", body: JSON.stringify({ sessionId: session.id, guestCount: Number(guestCount) }) });
      showToast("Quantidade de pessoas salva.");
      await onSaved();
    } catch (cause) { showToast(staffApiMessage(cause, "Não foi possível salvar. Atualize a mesa e tente novamente."), "error"); }
  })}>
    <GuestCountField label="Quantidade de pessoas" value={guestCount} onChange={(value) => form.setValue("guestCount", value, { shouldDirty: true, shouldValidate: true })} error={form.formState.errors.guestCount?.message} disabled={disabled || form.formState.isSubmitting} registration={form.register("guestCount", { validate: (value) => (Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 999) || "Informe um número inteiro entre 1 e 999." })} />
    <Button type="submit" variant="outline" disabled={disabled || form.formState.isSubmitting}>{form.formState.isSubmitting ? "Salvando…" : "Salvar pessoas"}</Button>
  </form>;
}

export function StaffTables({ initialTables, initialMenu, admin, restaurantName, initialTableId = "", storeOpen = true }: { initialTables: StaffTable[] | null; initialMenu: MenuResponse; admin: CurrentUserResponse; restaurantName: string; initialTableId?: string; storeOpen?: boolean }) {
  const { showToast } = useToast();
  const { requestConfirmation } = useConfirmation();
  const [tables, setTables] = useState(initialTables);
  const [menu, setMenu] = useState(initialMenu);
  const [selectedId, setSelectedId] = useState(initialTableId);
  const [consumption, setConsumption] = useState<StaffTableConsumption | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [tableSearch, setTableSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tab, setTab] = useState<"draft" | "consumption">("draft");
  const [mobilePane, setMobilePane] = useState<"catalog" | "ticket">("catalog");
  const [editor, setEditor] = useState<{ item: DraftItem; editing: boolean } | null>(null);
  const [cancelAction, setCancelAction] = useState<CancelAction | null>(null);
  const [askingPhone, setAskingPhone] = useState(false);
  const [error, setError] = useState(initialTables === null ? "Não foi possível carregar as mesas. Toque em Atualizar para tentar novamente." : "");
  const [consumptionError, setConsumptionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const submitting = useRef(false);
  const consumptionVersion = useRef(0);
  const pendingSubmission = useRef<{ tableId: string; body: string } | null>(null);
  const [uncertainSubmission, setUncertainSubmission] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const isAdmin = admin.roles.includes("ADMIN");
  const selected = tables?.find((table) => table.id === selectedId);
  const draft = drafts[selectedId] ?? emptyDraft(consumption?.session?.id);
  const draftCount = draft.items.reduce((sum, item) => sum + item.quantity, 0);
  const draftTotal = draft.items.reduce((sum, item) => sum + draftItemTotal(item), 0);
  const hasDrafts = Object.values(drafts).some((value) => value.items.length > 0);
  const consumptionTotal = consumption?.totals?.totalCents ?? consumption?.orders.filter((order) => order.status !== "CANCELED").reduce((sum, order) => sum + order.totals.totalCents, 0) ?? 0;
  const tablePhone = consumption?.orders.find((order) => order.customerPhone)?.customerPhone ?? "";
  const isClosing = consumption?.session?.status === "CLOSING";
  const hasPayments = !!consumption?.session?.payments?.length;

  const loadConsumption = useCallback(async (id: string, signal?: AbortSignal) => {
    const version = ++consumptionVersion.current;
    try {
      const result = await clientApi<StaffTableConsumption>(`admin/table-operations/${id}/orders`, { signal });
      if (!signal?.aborted && version === consumptionVersion.current) { setConsumption(result); setConsumptionError(""); }
    } catch {
      if (!signal?.aborted && version === consumptionVersion.current) setConsumptionError("Não foi possível atualizar o consumo. Atualize antes de enviar ou cancelar.");
    }
  }, []);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const values = await clientApi<StaffTable[]>("admin/table-operations", { signal });
      if (!signal?.aborted) { setTables(values); setError(""); setLastUpdated(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })); }
    } catch {
      if (!signal?.aborted) setError("Sem atualização das mesas. Confira a conexão e toque em Atualizar.");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const update = () => { setNow(Date.now()); void refresh(controller.signal); if (selectedId) void loadConsumption(selectedId, controller.signal); };
    queueMicrotask(() => { if (!controller.signal.aborted) { setNow(Date.now()); if (selectedId) void loadConsumption(selectedId, controller.signal); } });
    const timer = window.setInterval(update, 10000);
    const onVisible = () => { if (document.visibilityState === "visible") update(); };
    const events = new EventSource("/api/backend/admin/table-operations/events");
    events.addEventListener("table-operation", onVisible);
    events.addEventListener("open", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => { controller.abort(); events.close(); window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [selectedId, refresh, loadConsumption]);

  useEffect(() => {
    if (!hasDrafts && !uncertainSubmission && !checkoutPending) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasDrafts, uncertainSubmission, checkoutPending]);

  function updateDraft(next: Draft) { setDrafts((current) => ({ ...current, [selectedId]: next })); }
  function openTable(id: string) {
    if (id === selectedId) { void loadConsumption(id); return; }
    consumptionVersion.current++; setSelectedId(id); setConsumption(null); setConsumptionError(""); setProductSearch(""); setCategoryId(""); setTab("draft"); setMobilePane("catalog");
  }
  function addProduct(product: Product) {
    if (isClosing) { showToast(closingMessage, "warning"); return; }
    const item: DraftItem = { id: crypto.randomUUID(), product, quantity: 1, observations: "", options: [] };
    if (product.optionGroups?.some((group) => !group.deleted)) { setEditor({ editing: false, item }); return; }
    updateDraft({ ...draft, sessionId: draft.items.length ? draft.sessionId : consumption?.session?.id ?? "", items: [...draft.items, item] });
    showToast(`${product.name} adicionado à rodada. Use Editar para incluir uma observação.`);
  }

  async function manualRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([refresh(), selectedId ? loadConsumption(selectedId) : Promise.resolve()]);
      const nextMenu = await clientApi<MenuResponse>("public/menu?channel=TABLE");
      setMenu(nextMenu);
    } catch { showToast("Não foi possível atualizar o cardápio. Tente novamente.", "error"); }
    finally { setRefreshing(false); }
  }

  async function sendRound(contactPhone = tablePhone, guestCount?: number) {
    if (submitting.current || !selected || !consumption || consumptionError) return;
    if (!pendingSubmission.current && isClosing) { showToast(closingMessage, "warning"); return; }
    if (!pendingSubmission.current && !draft.items.length) return;
    if (!pendingSubmission.current && (!normalizeTablePhone(contactPhone) || (!consumption.session && guestCount === undefined))) { setAskingPhone(true); return; }
    submitting.current = true; setBusy(true);
    if (!pendingSubmission.current) {
      pendingSubmission.current = { tableId: selectedId, body: JSON.stringify({ submissionId: crypto.randomUUID(), sessionId: draft.sessionId, customerPhone: normalizeTablePhone(contactPhone), guestCount, notes: draft.notes, expectedTotalCents: draftTotal, items: draft.items.map((item) => ({ productId: item.product.id, quantity: item.quantity, observations: item.observations, options: item.options })) }) };
    }
    try {
      const submission = pendingSubmission.current;
      const order = await clientApi<StaffTableOrder>(`admin/table-operations/${submission.tableId}/orders`, { method: "POST", body: submission.body });
      pendingSubmission.current = null; setUncertainSubmission(false);
      updateDraft(emptyDraft());
      showToast(`Rodada ${order.orderNumber ?? ""} enviada à cozinha.`);
      setTab("consumption");
      setMobilePane("ticket");
      await Promise.all([refresh(), loadConsumption(selectedId)]);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status >= 400 && cause.status < 500) {
        pendingSubmission.current = null; setUncertainSubmission(false);
        showToast(staffApiMessage(cause, "Envio recusado. Atualize a mesa e revise produtos, adicionais e preços."), "error");
        await loadConsumption(selectedId);
      } else {
        setUncertainSubmission(true);
        showToast("Não foi possível confirmar o envio. Toque em Conferir envio; a mesma rodada não será duplicada.", "error");
      }
    } finally { submitting.current = false; setBusy(false); }
  }

  async function tableAction(path: string, message: string) {
    if (submitting.current) return;
    submitting.current = true; setBusy(true);
    try { await clientApi(`admin/table-operations/${selectedId}/${path}`, { method: "POST", body: "{}" }); showToast(message); await Promise.all([refresh(), loadConsumption(selectedId)]); }
    catch (cause) { showToast(staffApiMessage(cause, "Não foi possível concluir. Atualize a mesa e tente novamente."), "error"); }
    finally { submitting.current = false; setBusy(false); }
  }

  async function requestBill() {
    if (await requestConfirmation({ message: "Pedir a conta bloqueará novos lançamentos até a comanda ser reaberta. Continuar?", confirmLabel: "Pedir fechamento", variant: "primary" })) {
      await tableAction("request-bill", "Fechamento solicitado.");
    }
  }

  function showAccount() {
    setTab("consumption"); setMobilePane("ticket");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  async function cancelSent(reason: string) {
    if (!cancelAction || !selected) return;
    setBusy(true);
    try {
      if ("closeTable" in cancelAction) {
        const response = await clientApi<{ warning?: string }>(`admin/table-operations/${selectedId}/force-close`, { method: "POST", body: JSON.stringify({ reason }) });
        if (response.warning) showToast(response.warning, "error");
      } else {
        const response = await clientApi<StaffTableOrder & { warning?: string }>(`admin/table-operations/${selectedId}/orders/${cancelAction.order.id}/cancel`, { method: "POST", body: JSON.stringify({ reason, itemIndex: cancelAction.itemIndex, updatedAt: cancelAction.order.updatedAt }) });
        if (response.warning) showToast(response.warning, "error");
      }
      setCancelAction(null); showToast("Alteração registrada no histórico.");
      await Promise.all([refresh(), loadConsumption(selectedId)]);
    } catch (cause) { showToast(staffApiMessage(cause, "Não foi possível cancelar. Atualize a mesa e tente novamente."), "error"); }
    finally { setBusy(false); }
  }

  async function confirmLeave() {
    if (checkoutPending) { showToast("Confira o recebimento pendente antes de sair desta mesa.", "warning"); return false; }
    return !(hasDrafts || uncertainSubmission) || await requestConfirmation({ message: "Há itens ainda não enviados ou um envio sem confirmação. Sair descartará os rascunhos. Deseja sair?", confirmLabel: "Sair", variant: "danger" });
  }

  const tableList = [...(tables ?? [])].filter((table) => table.active && normalize(tableLabel(table)).includes(normalize(tableSearch))).sort((left, right) => left.number.localeCompare(right.number, "pt-BR", { numeric: true }));
  const products = menu.products.filter((product) => product.active && (!categoryId || product.categoryId === categoryId) && normalize(product.name).includes(normalize(productSearch)));
  const canEdit = !busy && !uncertainSubmission && !checkoutPending;
  const canLaunch = canEdit && consumption !== null && !consumptionError && consumption.session?.status !== "CLOSING" && (!draft.sessionId || draft.sessionId === consumption.session?.id);

  return <AdminShell admin={admin} restaurantName={restaurantName} storeOpen={storeOpen} beforeLeave={confirmLeave}><Root>
    <Header><div><Title>Atendimento do salão</Title><Muted>{restaurantName} · {isAdmin ? "Administrador" : "Garçom"}</Muted></div></Header>
    <TableServiceAlerts tables={tables} onSelect={openTable} disabled={!canEdit} />
    <Row><div><Heading>{selected ? tableLabel(selected) : "Escolha mesa ou comanda"}</Heading><Muted>{selected ? `${tableStatus(selected)} · ${selected.kind === "COMMAND" ? "Conta individual" : "Conta compartilhada"}` : "Selecione para lançar uma nova rodada."}{lastUpdated ? ` · Atualizado às ${lastUpdated}` : ""}</Muted></div><Actions>
      {selected ? <Button variant="outline" disabled={!canEdit} onClick={() => { setSelectedId(""); setConsumption(null); }}><ArrowLeft size={16} />Mesas e comandas</Button> : null}
      <Button variant="outline" disabled={refreshing || busy} onClick={() => void manualRefresh()}><RefreshCw size={16} />{refreshing ? "Atualizando…" : "Atualizar"}</Button>
    </Actions></Row>
    {error ? <ErrorBox role="alert">{error}</ErrorBox> : null}
    {!selected ? <Stack>
      <Field label="Buscar mesa ou comanda"><Input type="search" placeholder="Número ou tipo de atendimento" value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} /></Field>
      <div className="table-legend" aria-label="Status das mesas"><span data-state="free">Livre</span><span data-state="occupied">Ocupado</span><span data-state="closing">Fechamento</span></div>
      <TableGrid>{tableList.map((table) => <TableButton key={table.id} data-state={tableState(table)} onClick={() => openTable(table.id)} aria-label={`${tableLabel(table)}, ${tableStatus(table)}`}>
        <strong>{tableLabel(table)}</strong><span className="table-status">{tableStatus(table)}</span>
        {table.session ? <span className="table-details"><Clock3 size={14} aria-hidden="true" />{now === null ? "Calculando tempo…" : tableElapsed(table.session.createdAt, now)}</span> : null}
        {table.session ? <span className="table-details"><Users size={14} aria-hidden="true" />{tableGuests(table.session.guestCount)}</span> : null}
        {table.requests?.length ? <span className="table-request"><BellRing size={14} aria-hidden="true" />{table.requests.length} {table.requests.length === 1 ? "chamado" : "chamados"}</span> : null}
        {table.requests?.map((request) => <span className="table-request" key={request.id}>{requestLabel[request.type]}{request.status === "ASSIGNED" ? " · Em atendimento" : ""}</span>)}
        {drafts[table.id]?.items.length ? <Badge>Rodada não enviada</Badge> : null}
      </TableButton>)}</TableGrid>
      {tables !== null && !tableList.length ? <Empty>{tables.some((table) => table.active) ? "Nenhuma mesa ou comanda encontrada. Tente outro número." : "Nenhuma mesa ou comanda ativa. Peça ao administrador para cadastrar ou ativar."}</Empty> : null}
    </Stack> : <Stack>
      {consumptionError ? <ErrorBox role="alert">{consumptionError}</ErrorBox> : null}
      {uncertainSubmission ? <ErrorBox role="alert">Envio sem confirmação. Use Conferir envio antes de alterar a rodada ou trocar de mesa.</ErrorBox> : null}
      <AccountPanel aria-label={`Resumo · ${tableLabel(selected)}`}>
        <Row><Heading><ReceiptText size={20} aria-hidden="true" /> Conta · {tableLabel(selected)}</Heading><AccountTotal><span>Total do consumo</span><Price>{consumption ? money(consumptionTotal) : "Carregando…"}</Price></AccountTotal></Row>
        {consumption?.totals ? <div aria-label="Composição da conta"><Row><Muted>Consumo</Muted><Price>{money(consumption.totals.consumptionCents)}</Price></Row><Row><Muted>Taxa de serviço ({(consumption.totals.serviceFeeBasisPoints / 100).toLocaleString("pt-BR")}%)</Muted><Price>{money(consumption.totals.serviceFeeCents)}</Price></Row></div> : null}
        {isClosing ? <div id="table-closing-notice" role="status"><Heading><CircleAlert size={18} aria-hidden="true" /> Conta em fechamento</Heading><Muted>{hasPayments ? "Há pagamentos registrados. Receba o saldo restante para encerrar a comanda." : closingMessage}</Muted></div> : <Muted>{consumption?.session ? "Confira o consumo e solicite o fechamento por aqui." : consumption ? "Nenhuma comanda aberta nesta mesa." : "Carregando comanda…"}</Muted>}
        {consumption?.session ? <GuestCountForm key={`${consumption.session.id}:${consumption.session.guestCount ?? ""}`} tableId={selectedId} session={consumption.session} disabled={!canEdit || !!consumptionError} onSaved={refresh} /> : null}
        <Actions>
          {isClosing ? !hasPayments && <Button variant="outline" disabled={!canEdit || !!consumptionError} onClick={() => void tableAction("reopen", "Comanda reaberta.")}>Reabrir comanda</Button> : <Button disabled={!canEdit || !consumption?.session || !!consumptionError} onClick={() => void requestBill()}><ReceiptText size={18} aria-hidden="true" />Pedir fechamento</Button>}
          {isAdmin && !hasPayments ? <Button variant="dangerGhost" disabled={!canEdit || !consumption?.session || !!consumptionError} onClick={() => setCancelAction({ closeTable: true })}>Encerrar comanda</Button> : null}
        </Actions>
        {isClosing && consumption?.session ? <Payments key={consumption.session.id} tableId={selectedId} consumption={consumption} disabled={!canEdit || !!consumptionError} onBlockedChange={setCheckoutPending} onSaved={async () => { await Promise.all([refresh(), loadConsumption(selectedId)]); }} /> : null}
      </AccountPanel>
      {selected.requests?.map((request) => <Panel key={request.id} className={request.status === "PENDING" ? "table-service-pending" : undefined}><Row><div><Heading><BellRing size={18} aria-hidden="true" /> {requestLabel[request.type]}</Heading><Muted>{request.status === "ASSIGNED" ? request.assignedBy === admin.id ? "Em atendimento por você" : "Em atendimento por outro funcionário" : "Aguardando atendimento"}</Muted></div><Actions>
        {request.status === "PENDING" ? <Button variant="outline" disabled={busy} onClick={() => void tableAction(`requests/${request.id}/claim`, "Atendimento assumido.")}><Check size={16} />Assumir</Button> : null}
        {request.status === "PENDING" || request.assignedBy === admin.id || isAdmin ? <Button variant="outline" disabled={busy} onClick={() => void tableAction(`requests/${request.id}/resolve`, "Chamado concluído.")}><Check size={16} />Concluir chamado</Button> : null}
      </Actions></Row></Panel>)}
      <MobileSwitch><Button variant={mobilePane === "catalog" ? "primary" : "outline"} aria-pressed={mobilePane === "catalog"} onClick={() => setMobilePane("catalog")}>Cardápio</Button><Button variant={mobilePane === "ticket" ? "primary" : "outline"} aria-pressed={mobilePane === "ticket"} onClick={showAccount}>Comanda</Button></MobileSwitch>
      <Workbench data-mobile-pane={mobilePane}><Panel aria-labelledby="catalog-title"><Heading id="catalog-title">Adicionar itens</Heading>
        <Field label="Buscar produto"><Input type="search" placeholder="Digite o nome do produto" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} /></Field>
        <Field label="Categoria"><Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Todas as categorias</option>{menu.categories.filter((category) => category.active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></Field>
        {!consumption && !consumptionError ? <Muted role="status">Carregando comanda…</Muted> : null}
        <ProductList>{products.map((product) => <ProductButton key={product.id} disabled={!canEdit || (!canLaunch && !isClosing)} aria-disabled={!canLaunch} aria-describedby={isClosing ? "table-closing-notice" : undefined} onClick={() => addProduct(product)} aria-label={`Adicionar ${product.name}`}><span><strong>{product.name}</strong><Muted>{money(productSalePrice(product))}{product.optionGroups?.some((group) => !group.deleted) ? " · Ver opções" : ""}</Muted></span>{isClosing ? <LockKeyhole size={20} aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}</ProductButton>)}</ProductList>
        {!products.length ? <Empty><Search size={24} aria-hidden="true" />Nenhum produto encontrado. Tente outro nome ou categoria.</Empty> : null}
      </Panel><Panel aria-label={`Conta · ${tableLabel(selected)}`}>
        {tablePhone ? <Muted>Contato da conta: <a href={`tel:${tablePhone}`}>{tablePhone}</a></Muted> : null}
        <Tabs><Button variant={tab === "draft" ? "primary" : "ghost"} aria-pressed={tab === "draft"} onClick={() => setTab("draft")}>Rodada ({draftCount})</Button><Button variant={tab === "consumption" ? "primary" : "ghost"} aria-pressed={tab === "consumption"} onClick={() => setTab("consumption")}><ReceiptText size={16} />Comanda</Button></Tabs>
        {tab === "draft" ? <Stack><div><Heading>Nova rodada · {tableLabel(selected)}</Heading><Muted>Os itens abaixo ainda não foram enviados.</Muted></div>
          {draft.sessionId && consumption?.session?.id !== draft.sessionId ? <ErrorBox role="alert">Esta rodada pertence a uma comanda encerrada. Descarte os itens e comece uma nova rodada.</ErrorBox> : null}
          {!draft.items.length ? <Empty><Send size={24} aria-hidden="true" />Escolha produtos no cardápio. Você pode revisar tudo antes de enviar à cozinha.</Empty> : draft.items.map((item) => <ItemRow key={item.id}>
            <Row><strong>{item.quantity}× {item.product.name}</strong><Price>{money(draftItemTotal(item))}</Price></Row>
            {item.options.length ? <Muted>{item.options.map((option) => item.product.optionGroups.find((group) => group.id === option.groupId)?.items.find((entry) => entry.id === option.itemId)?.name).join(", ")}</Muted> : null}
            {item.observations ? <Muted>{item.observations}</Muted> : null}
            <Actions><Button variant="ghost" disabled={!canEdit} onClick={() => setEditor({ item: { ...item, product: menu.products.find((product) => product.id === item.product.id) ?? item.product }, editing: true })}><Pencil size={16} />Editar</Button>
              <Button variant="ghost" disabled={!canEdit} onClick={() => updateDraft({ ...draft, items: [...draft.items, { ...item, id: crypto.randomUUID() }] })}><Copy size={16} />Duplicar</Button>
              <Button variant="dangerGhost" disabled={!canEdit} onClick={() => updateDraft({ ...draft, items: draft.items.filter((entry) => entry.id !== item.id) })} aria-label={`Excluir ${item.product.name}`}><Trash2 size={16} /></Button></Actions>
          </ItemRow>)}
          {draft.items.length ? <><Field label="Observação da rodada (opcional)"><Textarea maxLength={2000} disabled={!canEdit} value={draft.notes} onChange={(event) => updateDraft({ ...draft, notes: event.target.value })} /></Field><Button variant="dangerGhost" disabled={!canEdit} onClick={async () => { if (await requestConfirmation({ message: "Descartar os itens desta rodada? Os pedidos já enviados serão mantidos.", confirmLabel: "Descartar rodada" })) updateDraft(emptyDraft(consumption?.session?.id)); }}><Trash2 size={16} />Descartar rodada</Button></> : null}
          <Summary><Row><span>Total da rodada</span><Price>{money(draftTotal)}</Price></Row><Button disabled={busy || (!uncertainSubmission && ((!canLaunch && !isClosing) || !draft.items.length)) || !!consumptionError} aria-disabled={isClosing && !uncertainSubmission} aria-describedby={isClosing ? "table-closing-notice" : undefined} onClick={() => void sendRound()}><Send size={18} />{busy ? "Enviando…" : uncertainSubmission ? "Conferir envio" : `Enviar ${draftCount} ${draftCount === 1 ? "item" : "itens"} à cozinha`}</Button></Summary>
        </Stack> : <Stack><Row><Heading>Consumo da conta</Heading><Price>{money(consumptionTotal)}</Price></Row>
          {!consumption?.orders.length ? <Empty>{consumption ? "Nenhum pedido enviado nesta comanda." : "Carregando consumo…"}</Empty> : consumption.orders.map((order) => <ItemRow key={order.id}>
            <Row><strong>Rodada #{order.orderNumber ?? order.id.slice(-6)}</strong><Badge>{statusLabel(order.status, "TABLE")}</Badge></Row>
            <Muted>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}</Muted>
            {order.items.map((item, index) => <Stack key={index}><Row><span>{item.quantity}× {item.name}</span><Price>{money(item.totalCents)}</Price></Row>{item.options?.length ? <Muted>{item.options.map((option) => option.itemName).join(", ")}</Muted> : null}{item.observations ? <Muted>Observação: {item.observations}</Muted> : null}
              {isAdmin && !hasPayments && order.status !== "CANCELED" && order.status !== "COMPLETED" ? <Button variant="dangerGhost" disabled={!canEdit || !!consumptionError} onClick={() => setCancelAction({ order, itemIndex: index })}><X size={16} />Cancelar item</Button> : null}</Stack>)}
            {order.notes ? <Muted>Rodada: {order.notes}</Muted> : null}
            {order.tableItemCancellations?.map((entry, index) => <Muted key={index}>Cancelado: {entry.item.quantity}× {entry.item.name} · {entry.reason}</Muted>)}
            {order.cancellation ? <Muted>Motivo: {order.cancellation.reason}</Muted> : null}
            <Row><Muted>{order.status === "CANCELED" ? "Não entra no total" : "Total da rodada"}</Muted><Price>{money(order.totals.totalCents)}</Price></Row>
            {isAdmin && !hasPayments && order.status !== "CANCELED" && order.status !== "COMPLETED" ? <Button variant="dangerGhost" disabled={!canEdit || !!consumptionError} onClick={() => setCancelAction({ order })}><Trash2 size={16} />Cancelar rodada</Button> : null}
          </ItemRow>)}
          {!isAdmin ? <Muted>Precisa corrigir algo já enviado? Peça ao administrador para cancelar o item com motivo e lance a correção em uma nova rodada.</Muted> : null}
        </Stack>}
      </Panel></Workbench>
      <MobileBar><Button variant="outline" onClick={() => { setTab("draft"); setMobilePane("ticket"); window.scrollTo({ top: 0, behavior: "instant" }); }}><Send size={18} aria-hidden="true" />Rodada · {draftCount}</Button><Button onClick={showAccount}><ReceiptText size={18} aria-hidden="true" />Comanda{consumption ? ` · ${money(consumptionTotal)}` : ""}</Button></MobileBar>
    </Stack>}
    {editor ? <ItemEditor key={editor.item.id} item={editor.item} editing={editor.editing} onClose={() => setEditor(null)} onSave={(item) => { updateDraft({ ...draft, sessionId: draft.items.length ? draft.sessionId : consumption?.session?.id ?? "", items: editor.editing ? draft.items.map((entry) => entry.id === item.id ? item : entry) : [...draft.items, item] }); setEditor(null); showToast(editor.editing ? "Item atualizado na rodada." : `${item.product.name} adicionado à rodada.`); }} /> : null}
    {cancelAction ? <ReasonDialog action={cancelAction} onClose={() => setCancelAction(null)} onConfirm={cancelSent} /> : null}
    {askingPhone ? <PhoneDialog opening={!consumption?.session} onClose={() => setAskingPhone(false)} onConfirm={(phone, guestCount) => { setAskingPhone(false); void sendRound(phone, guestCount); }} /> : null}
  </Root></AdminShell>;
}
