"use client";

import { ArrowLeft, Armchair, BellRing, Check, Copy, LogOut, Pencil, Plus, ReceiptText, RefreshCw, Search, Send, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { Field, Input, Select, Textarea } from "@/components/Field";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { useToast } from "@/components/ToastProvider";
import { ApiError, authApi, clientApi } from "@/services/api/client";
import type { CurrentUserResponse, MenuResponse, Product, StaffTable, StaffTableConsumption, StaffTableOrder } from "@/types/api";
import { money, statusLabel } from "@/utils/format";
import { productSalePrice } from "@/utils/productPricing";
import { draftItemTotal, staffApiMessage, type DraftItem } from "./draft";
import { ItemEditor } from "./ItemEditor";
import { Actions, Badge, Dialog, Empty, ErrorBox, Header, Heading, ItemRow, MobileBar, MobileSwitch, Muted, Panel, Price, ProductButton, ProductList, Root, Row, Stack, Summary, TableButton, TableGrid, Tabs, Title, Workbench } from "./styles";

type Draft = { items: DraftItem[]; sessionId: string; notes: string };
type CancelAction = { order: StaffTableOrder; itemIndex?: number } | { closeTable: true };
const emptyDraft = (sessionId = ""): Draft => ({ items: [], sessionId, notes: "" });
const requestLabel = { SERVICE: "Chamou atendimento", CLOSURE: "Pediu a conta", PAYMENT: "Pediu pagamento" };
const tableStatus = (table: StaffTable) => table.session?.status === "CLOSING" ? "Fechando conta" : table.session ? "Em consumo" : "Livre";
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

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

export function StaffTables({ initialTables, initialMenu, admin, restaurantName }: { initialTables: StaffTable[] | null; initialMenu: MenuResponse; admin: CurrentUserResponse; restaurantName: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { requestConfirmation } = useConfirmation();
  const [tables, setTables] = useState(initialTables);
  const [menu, setMenu] = useState(initialMenu);
  const [selectedId, setSelectedId] = useState("");
  const [consumption, setConsumption] = useState<StaffTableConsumption | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [tableSearch, setTableSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tab, setTab] = useState<"draft" | "consumption">("draft");
  const [mobilePane, setMobilePane] = useState<"catalog" | "ticket">("catalog");
  const [editor, setEditor] = useState<{ item: DraftItem; editing: boolean } | null>(null);
  const [cancelAction, setCancelAction] = useState<CancelAction | null>(null);
  const [error, setError] = useState(initialTables === null ? "Não foi possível carregar as mesas. Toque em Atualizar para tentar novamente." : "");
  const [consumptionError, setConsumptionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const submitting = useRef(false);
  const consumptionVersion = useRef(0);
  const pendingSubmission = useRef<{ tableId: string; body: string } | null>(null);
  const [uncertainSubmission, setUncertainSubmission] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const isAdmin = admin.roles.includes("ADMIN");
  const selected = tables?.find((table) => table.id === selectedId);
  const draft = drafts[selectedId] ?? emptyDraft(consumption?.session?.id);
  const draftCount = draft.items.reduce((sum, item) => sum + item.quantity, 0);
  const draftTotal = draft.items.reduce((sum, item) => sum + draftItemTotal(item), 0);
  const hasDrafts = Object.values(drafts).some((value) => value.items.length > 0);
  const consumptionTotal = consumption?.orders.filter((order) => order.status !== "CANCELED").reduce((sum, order) => sum + order.totals.totalCents, 0) ?? 0;

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
    const update = () => { void refresh(controller.signal); if (selectedId) void loadConsumption(selectedId, controller.signal); };
    queueMicrotask(() => { if (selectedId && !controller.signal.aborted) void loadConsumption(selectedId, controller.signal); });
    const timer = window.setInterval(update, 10000);
    const onVisible = () => { if (document.visibilityState === "visible") update(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { controller.abort(); window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [selectedId, refresh, loadConsumption]);

  useEffect(() => {
    if (!hasDrafts && !uncertainSubmission) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasDrafts, uncertainSubmission]);

  function updateDraft(next: Draft) { setDrafts((current) => ({ ...current, [selectedId]: next })); }
  function openTable(id: string) { consumptionVersion.current++; setSelectedId(id); setConsumption(null); setConsumptionError(""); setProductSearch(""); setCategoryId(""); setTab("draft"); setMobilePane("catalog"); }
  function addProduct(product: Product) {
    const item: DraftItem = { id: crypto.randomUUID(), product, quantity: 1, observations: "", options: [] };
    if (product.optionGroups?.some((group) => !group.deleted)) { setEditor({ editing: false, item }); return; }
    updateDraft({ ...draft, sessionId: draft.items.length ? draft.sessionId : consumption?.session?.id ?? "", items: [...draft.items, item] });
    showToast(`${product.name} adicionado à rodada. Use Editar para incluir uma observação.`);
  }

  async function manualRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([refresh(), selectedId ? loadConsumption(selectedId) : Promise.resolve()]);
      const nextMenu = await clientApi<MenuResponse>("public/menu");
      setMenu(nextMenu);
    } catch { showToast("Não foi possível atualizar o cardápio. Tente novamente.", "error"); }
    finally { setRefreshing(false); }
  }

  async function sendRound() {
    if (submitting.current || !selected || !consumption || consumptionError) return;
    if (!pendingSubmission.current && (!draft.items.length || consumption.session?.status === "CLOSING")) return;
    submitting.current = true; setBusy(true);
    if (!pendingSubmission.current) {
      pendingSubmission.current = { tableId: selectedId, body: JSON.stringify({ submissionId: crypto.randomUUID(), sessionId: draft.sessionId, notes: draft.notes, expectedTotalCents: draftTotal, items: draft.items.map((item) => ({ productId: item.product.id, quantity: item.quantity, observations: item.observations, options: item.options })) }) };
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

  async function leave(destination?: string) {
    if ((hasDrafts || uncertainSubmission) && !await requestConfirmation({ message: "Há itens ainda não enviados ou um envio sem confirmação. Sair descartará os rascunhos. Deseja sair?", confirmLabel: "Sair", variant: "danger" })) return;
    if (destination) router.push(destination);
    else { await authApi("logout", { method: "POST" }); router.push("/admin/login"); router.refresh(); }
  }

  const tableList = [...(tables ?? [])].filter((table) => table.active && normalize(table.number).includes(normalize(tableSearch))).sort((left, right) => left.number.localeCompare(right.number, "pt-BR", { numeric: true }));
  const products = menu.products.filter((product) => product.active && (!categoryId || product.categoryId === categoryId) && normalize(product.name).includes(normalize(productSearch)));
  const canEdit = !busy && !uncertainSubmission;
  const canLaunch = canEdit && consumption !== null && !consumptionError && consumption.session?.status !== "CLOSING" && (!draft.sessionId || draft.sessionId === consumption.session?.id);

  return <Root>
    <Header><div><Title>Atendimento de mesas</Title><Muted>{restaurantName} · {isAdmin ? "Administrador" : "Garçom"}</Muted></div><Actions>
      {isAdmin ? <Button variant="outline" onClick={() => void leave("/admin")}><ArrowLeft size={16} />Admin</Button> : null}
      <Button variant="ghost" onClick={() => void leave()}><LogOut size={16} />Sair</Button>
    </Actions></Header>
    <Row><div><Heading>{selected ? `Mesa ${selected.number}` : "Escolha a mesa"}</Heading><Muted>{selected ? tableStatus(selected) : "Selecione a mesa para lançar uma nova rodada."}{lastUpdated ? ` · Atualizado às ${lastUpdated}` : ""}</Muted></div><Actions>
      {selected ? <Button variant="outline" disabled={busy || uncertainSubmission} onClick={() => { setSelectedId(""); setConsumption(null); }}><ArrowLeft size={16} />Mesas</Button> : null}
      <Button variant="outline" disabled={refreshing || busy} onClick={() => void manualRefresh()}><RefreshCw size={16} />{refreshing ? "Atualizando…" : "Atualizar"}</Button>
    </Actions></Row>
    {error ? <ErrorBox role="alert">{error}</ErrorBox> : null}
    {!selected ? <Stack>
      <Field label="Buscar mesa"><Input type="search" inputMode="numeric" placeholder="Número da mesa" value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} /></Field>
      <TableGrid>{tableList.map((table) => <TableButton key={table.id} onClick={() => openTable(table.id)} aria-label={`Mesa ${table.number}, ${tableStatus(table)}`}>
        <Row><Armchair size={20} aria-hidden="true" /><Badge>{tableStatus(table)}</Badge></Row><strong>Mesa {table.number}</strong>
        {table.requests?.length ? <Badge><BellRing size={16} />{table.requests.length} chamado(s)</Badge> : <Muted>Toque para atender</Muted>}
        {drafts[table.id]?.items.length ? <Badge>Rodada não enviada</Badge> : null}
      </TableButton>)}</TableGrid>
      {tables !== null && !tableList.length ? <Empty>{tables.some((table) => table.active) ? "Nenhuma mesa encontrada. Tente outro número." : "Nenhuma mesa ativa. Peça ao administrador para cadastrar ou ativar as mesas."}</Empty> : null}
    </Stack> : <Stack>
      {consumptionError ? <ErrorBox role="alert">{consumptionError}</ErrorBox> : null}
      {uncertainSubmission ? <ErrorBox role="alert">Envio sem confirmação. Use Conferir envio antes de alterar a rodada ou trocar de mesa.</ErrorBox> : null}
      {selected.requests?.map((request) => <Panel key={request.id}><Row><div><Heading><BellRing size={18} aria-hidden="true" /> {requestLabel[request.type]}</Heading><Muted>{request.status === "ASSIGNED" ? request.assignedBy === admin.id ? "Em atendimento por você" : "Em atendimento por outro funcionário" : "Aguardando atendimento"}</Muted></div><Actions>
        {request.status === "PENDING" ? <Button variant="outline" disabled={busy} onClick={() => void tableAction(`requests/${request.id}/claim`, "Atendimento assumido.")}><Check size={16} />Assumir</Button> : null}
        {request.status === "PENDING" || request.assignedBy === admin.id || isAdmin ? <Button variant="outline" disabled={busy} onClick={() => void tableAction(`requests/${request.id}/resolve`, "Chamado concluído.")}><Check size={16} />Concluir chamado</Button> : null}
      </Actions></Row></Panel>)}
      <MobileSwitch><Button variant={mobilePane === "catalog" ? "primary" : "outline"} aria-pressed={mobilePane === "catalog"} onClick={() => setMobilePane("catalog")}>Cardápio</Button><Button variant={mobilePane === "ticket" ? "primary" : "outline"} aria-pressed={mobilePane === "ticket"} onClick={() => setMobilePane("ticket")}>Rodada e consumo</Button></MobileSwitch>
      <Workbench data-mobile-pane={mobilePane}><Panel aria-labelledby="catalog-title"><Heading id="catalog-title">Adicionar itens</Heading>
        <Field label="Buscar produto"><Input type="search" placeholder="Digite o nome do produto" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} /></Field>
        <Field label="Categoria"><Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Todas as categorias</option>{menu.categories.filter((category) => category.active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></Field>
        {!consumption && !consumptionError ? <Muted role="status">Carregando comanda…</Muted> : null}
        {consumption?.session?.status === "CLOSING" ? <Stack><Muted>Conta em fechamento. Reabra a comanda para lançar novos itens.</Muted><Button variant="outline" disabled={busy || uncertainSubmission} onClick={() => void tableAction("reopen", "Comanda reaberta.")}>Reabrir comanda</Button></Stack> : null}
        <ProductList>{products.map((product) => <ProductButton key={product.id} disabled={!canLaunch} onClick={() => addProduct(product)} aria-label={`Adicionar ${product.name}`}><span><strong>{product.name}</strong><Muted>{money(productSalePrice(product))}{product.optionGroups?.some((group) => !group.deleted) ? " · Ver opções" : ""}</Muted></span><Plus size={20} aria-hidden="true" /></ProductButton>)}</ProductList>
        {!products.length ? <Empty><Search size={24} aria-hidden="true" />Nenhum produto encontrado. Tente outro nome ou categoria.</Empty> : null}
      </Panel><Panel aria-label={`Comanda da mesa ${selected.number}`}>
        <Tabs><Button variant={tab === "draft" ? "primary" : "ghost"} aria-pressed={tab === "draft"} onClick={() => setTab("draft")}>Rodada ({draftCount})</Button><Button variant={tab === "consumption" ? "primary" : "ghost"} aria-pressed={tab === "consumption"} onClick={() => setTab("consumption")}><ReceiptText size={16} />Consumo</Button></Tabs>
        {tab === "draft" ? <Stack><div><Heading>Nova rodada · Mesa {selected.number}</Heading><Muted>Os itens abaixo ainda não foram enviados.</Muted></div>
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
          <Summary><Row><span>Total da rodada</span><Price>{money(draftTotal)}</Price></Row><Button disabled={busy || (!uncertainSubmission && (!canLaunch || !draft.items.length)) || !!consumptionError} onClick={() => void sendRound()}><Send size={18} />{busy ? "Enviando…" : uncertainSubmission ? "Conferir envio" : `Enviar ${draftCount} ${draftCount === 1 ? "item" : "itens"} à cozinha`}</Button></Summary>
        </Stack> : <Stack><Row><Heading>Consumo da mesa</Heading><Price>{money(consumptionTotal)}</Price></Row>
          {!consumption?.orders.length ? <Empty>{consumption ? "Nenhum pedido enviado nesta comanda." : "Carregando consumo…"}</Empty> : consumption.orders.map((order) => <ItemRow key={order.id}>
            <Row><strong>Rodada #{order.orderNumber ?? order.id.slice(-6)}</strong><Badge>{statusLabel(order.status, "TABLE")}</Badge></Row>
            <Muted>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}</Muted>
            {order.items.map((item, index) => <Stack key={index}><Row><span>{item.quantity}× {item.name}</span><Price>{money(item.totalCents)}</Price></Row>{item.options?.length ? <Muted>{item.options.map((option) => option.itemName).join(", ")}</Muted> : null}{item.observations ? <Muted>Observação: {item.observations}</Muted> : null}
              {isAdmin && order.status !== "CANCELED" && order.status !== "COMPLETED" ? <Button variant="dangerGhost" disabled={busy || uncertainSubmission || !!consumptionError} onClick={() => setCancelAction({ order, itemIndex: index })}><X size={16} />Cancelar item</Button> : null}</Stack>)}
            {order.notes ? <Muted>Rodada: {order.notes}</Muted> : null}
            {order.tableItemCancellations?.map((entry, index) => <Muted key={index}>Cancelado: {entry.item.quantity}× {entry.item.name} · {entry.reason}</Muted>)}
            {order.cancellation ? <Muted>Motivo: {order.cancellation.reason}</Muted> : null}
            <Row><Muted>{order.status === "CANCELED" ? "Não entra no total" : "Total da rodada"}</Muted><Price>{money(order.totals.totalCents)}</Price></Row>
            {isAdmin && order.status !== "CANCELED" && order.status !== "COMPLETED" ? <Button variant="dangerGhost" disabled={busy || uncertainSubmission || !!consumptionError} onClick={() => setCancelAction({ order })}><Trash2 size={16} />Cancelar rodada</Button> : null}
          </ItemRow>)}
          {!isAdmin ? <Muted>Precisa corrigir algo já enviado? Peça ao administrador para cancelar o item com motivo e lance a correção em uma nova rodada.</Muted> : null}
          {consumption?.session ? <Actions>{consumption.session.status === "OPEN" ? <Button variant="outline" disabled={busy || uncertainSubmission || !!consumptionError} onClick={async () => { if (await requestConfirmation({ message: "Pedir a conta bloqueará novos lançamentos até a comanda ser reaberta. Continuar?", confirmLabel: "Pedir a conta", variant: "primary" })) await tableAction("request-bill", "Conta solicitada."); }}><ReceiptText size={16} />Pedir a conta</Button> : null}{isAdmin ? <Button variant="dangerGhost" disabled={busy || uncertainSubmission || !!consumptionError} onClick={() => setCancelAction({ closeTable: true })}>Encerrar comanda</Button> : null}</Actions> : null}
        </Stack>}
      </Panel></Workbench>
      {mobilePane === "catalog" ? <MobileBar><Button onClick={() => { setTab("draft"); setMobilePane("ticket"); window.scrollTo({ top: 0, behavior: "instant" }); }}><ReceiptText size={18} />Ver rodada · {draftCount} {draftCount === 1 ? "item" : "itens"} · {money(draftTotal)}</Button></MobileBar> : null}
    </Stack>}
    {editor ? <ItemEditor key={editor.item.id} item={editor.item} editing={editor.editing} onClose={() => setEditor(null)} onSave={(item) => { updateDraft({ ...draft, sessionId: draft.items.length ? draft.sessionId : consumption?.session?.id ?? "", items: editor.editing ? draft.items.map((entry) => entry.id === item.id ? item : entry) : [...draft.items, item] }); setEditor(null); showToast(editor.editing ? "Item atualizado na rodada." : `${item.product.name} adicionado à rodada.`); }} /> : null}
    {cancelAction ? <ReasonDialog action={cancelAction} onClose={() => setCancelAction(null)} onConfirm={cancelSent} /> : null}
  </Root>;
}
