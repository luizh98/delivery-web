"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Copy, Pencil, Plus, ReceiptText, Search, Send, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Input, Select, Textarea } from "@/components/Field";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { useToast } from "@/components/ToastProvider";
import { AdminShell } from "@/layouts/AdminLayout/AdminShell";
import { ApiError, clientApi } from "@/services/api/client";
import type { CurrentUserResponse, MenuResponse, StaffTable, StaffTableOrder } from "@/types/api";
import { money } from "@/utils/format";
import { productSalePrice } from "@/utils/productPricing";
import { tableLabel } from "@/utils/tableIdentity";
import { draftItemTotal, staffApiMessage, type DraftItem } from "./draft";
import { ItemEditor } from "./ItemEditor";
import { OrderDestination, type OrderTarget } from "./OrderDestination";
import { Actions, Badge, Empty, ErrorBox, Header, Heading, ItemRow, MobileBar, MobileSwitch, Muted, Panel, Price, ProductButton, ProductList, Root, Row, Summary, Title, Workbench } from "./styles";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function NewTableOrder({ menu, tables, admin, restaurantName, storeOpen, onTables, onSent }: { menu: MenuResponse; tables: StaffTable[] | null; admin: CurrentUserResponse; restaurantName: string; storeOpen: boolean; onTables: () => void; onSent: () => void }) {
  const [items, setItems] = useState<DraftItem[]>([]);
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [pane, setPane] = useState<"catalog" | "ticket">("catalog");
  const [editor, setEditor] = useState<{ item: DraftItem; editing: boolean } | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef<{ tableId: string; body: string } | null>(null);
  const sending = useRef(false);
  const { showToast } = useToast();
  const { requestConfirmation } = useConfirmation();
  const total = items.reduce((sum, item) => sum + draftItemTotal(item), 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const locked = busy || uncertain;
  const products = menu.products.filter((product) => product.active && (!category || product.categoryId === category) && normalize(product.name).includes(normalize(search)));

  useEffect(() => {
    if (!items.length && !notes && !uncertain) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [items.length, notes, uncertain]);

  async function leave() {
    if (busy || uncertain) { showToast("Confira o envio antes de sair do pedido.", "warning"); return false; }
    return !items.length && !notes || await requestConfirmation({ message: "Há itens ou observações ainda não enviados. Sair descartará este pedido. Continuar?", confirmLabel: "Descartar e sair", variant: "danger" });
  }

  async function send(target?: OrderTarget) {
    if (sending.current || !pending.current && (!target || !items.length)) return;
    sending.current = true; setBusy(true); setChoosing(false); setError("");
    if (!pending.current && target) pending.current = { tableId: target.tableId, body: JSON.stringify({ ...target, submissionId: crypto.randomUUID(), expectedTotalCents: total, notes, items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, observations: item.observations, options: item.options })) }) };
    try {
      const submission = pending.current!;
      const order = await clientApi<StaffTableOrder>(`admin/table-operations/${submission.tableId}/orders`, { method: "POST", body: submission.body });
      const destination = tables?.find((table) => table.id === submission.tableId);
      pending.current = null; setUncertain(false); setItems([]); setNotes(""); setPane("catalog");
      showToast(`Pedido ${order.orderNumber ?? ""} enviado ao preparo${destination ? ` · ${tableLabel(destination)}` : ""}.`);
      onSent();
    } catch (cause) {
      if (cause instanceof ApiError && cause.status >= 400 && cause.status < 500) {
        pending.current = null; setUncertain(false);
        setError(staffApiMessage(cause, "Envio recusado. Confira conta, produtos e preços antes de tentar novamente."));
      } else {
        setUncertain(true);
        setError("Envio sem confirmação. Use Conferir envio; o mesmo pedido não será duplicado.");
      }
    } finally { sending.current = false; setBusy(false); }
  }

  function review() { setPane("ticket"); window.scrollTo({ top: 0, behavior: "instant" }); }

  return <AdminShell admin={admin} restaurantName={restaurantName} storeOpen={storeOpen} beforeLeave={leave}><Root>
    <Header><div><Title>Novo pedido do salão</Title><Muted>Escolha os itens. Informe mesa e comanda ao enviar.</Muted></div><Button variant="outline" disabled={locked} onClick={async () => { if (await leave()) onTables(); }}><ReceiptText size={18} />Mesas e comandas</Button></Header>
    {error ? <ErrorBox role="alert">{error}</ErrorBox> : null}
    <MobileSwitch><Button variant={pane === "catalog" ? "primary" : "outline"} aria-pressed={pane === "catalog"} onClick={() => setPane("catalog")}>Cardápio</Button><Button variant={pane === "ticket" ? "primary" : "outline"} aria-pressed={pane === "ticket"} onClick={review}>Pedido ({count})</Button></MobileSwitch>
    <Workbench data-mobile-pane={pane}><Panel aria-labelledby="new-order-catalog"><Heading id="new-order-catalog">Adicionar itens</Heading>
      <Field label="Buscar produto"><Input type="search" placeholder="Digite o nome do produto" value={search} onChange={(event) => setSearch(event.target.value)} /></Field>
      <Field label="Categoria"><Select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todas as categorias</option>{menu.categories.filter((entry) => entry.active).map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</Select></Field>
      <ProductList>{products.map((product) => <ProductButton key={product.id} disabled={locked} onClick={() => setEditor({ editing: false, item: { id: crypto.randomUUID(), product, quantity: 1, observations: "", options: [] } })} aria-label={`Adicionar ${product.name}`}>
        {product.imageUrl ? <Image className="hall-product-photo" src={product.imageUrl} width={64} height={64} alt="" unoptimized /> : <span className="hall-product-placeholder" aria-hidden="true"><Utensils size={22} /></span>}
        <span className="hall-product-description"><strong>{product.name}</strong><Muted>{money(productSalePrice(product))}</Muted></span><Plus size={20} aria-hidden="true" />
      </ProductButton>)}</ProductList>
      {!products.length ? <Empty><Search size={24} aria-hidden="true" />Nenhum produto encontrado. Tente outro nome ou categoria.</Empty> : null}
    </Panel><Panel aria-label="Revisão do novo pedido"><Row><Heading>Itens do pedido</Heading><Badge>{count} {count === 1 ? "item" : "itens"}</Badge></Row><Muted>Revise antes de escolher mesa e comanda.</Muted>
      {!items.length ? <Empty><Send size={24} aria-hidden="true" />Escolha um produto para ajustar quantidade e observações.</Empty> : items.map((item) => <ItemRow key={item.id}>
        <Row><strong>{item.quantity}× {item.product.name}</strong><Price>{money(draftItemTotal(item))}</Price></Row>
        {item.options.length ? <Muted>{item.options.map((option) => item.product.optionGroups.find((group) => group.id === option.groupId)?.items.find((entry) => entry.id === option.itemId)?.name).join(", ")}</Muted> : null}
        {item.observations ? <Muted>Observação: {item.observations}</Muted> : null}
        <Actions><Button variant="ghost" disabled={locked} onClick={() => setEditor({ item, editing: true })}><Pencil size={16} />Editar</Button><Button variant="ghost" disabled={locked} onClick={() => setItems([...items, { ...item, id: crypto.randomUUID() }])}><Copy size={16} />Duplicar</Button><Button variant="dangerGhost" disabled={locked} aria-label={`Excluir ${item.product.name}`} onClick={() => setItems(items.filter((entry) => entry.id !== item.id))}><Trash2 size={16} /></Button></Actions>
      </ItemRow>)}
      {items.length ? <Field label="Observação do pedido (opcional)"><Textarea maxLength={2000} disabled={locked} value={notes} onChange={(event) => setNotes(event.target.value)} /></Field> : null}
      <Summary><Row><span>Total do pedido</span><Price>{money(total)}</Price></Row><Button disabled={busy || !items.length || !tables} onClick={() => uncertain ? void send() : setChoosing(true)}><Send size={18} />{busy ? "Enviando…" : uncertain ? "Conferir envio" : "Informar mesa/comanda e enviar"}</Button>{!tables ? <ErrorBox role="alert">Não foi possível carregar as contas. Acesse Mesas e comandas para atualizar.</ErrorBox> : null}</Summary>
    </Panel></Workbench>
    {count > 0 && pane === "catalog" ? <MobileBar><Button variant="outline" disabled={busy} onClick={review}><ReceiptText size={18} />Revisar {count} {count === 1 ? "item" : "itens"}</Button><Button disabled={busy || !tables} onClick={() => uncertain ? void send() : setChoosing(true)}><Send size={18} />{busy ? "Enviando…" : uncertain ? "Conferir envio" : `Enviar · ${money(total)}`}</Button></MobileBar> : null}
    {editor ? <ItemEditor item={editor.item} editing={editor.editing} onClose={() => setEditor(null)} onSave={(item) => { setItems(editor.editing ? items.map((entry) => entry.id === item.id ? item : entry) : [...items, item]); setEditor(null); showToast(`${item.product.name} incluído no pedido.`); }} /> : null}
    {choosing && tables ? <OrderDestination tables={tables} onClose={() => setChoosing(false)} onConfirm={(target) => void send(target)} /> : null}
  </Root></AdminShell>;
}
