"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Copy, Download, Pencil, Plus, Power, RefreshCw, Save, Trash2 } from "lucide-react";
import QRCode from "qrcode";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { Field, Input, Select } from "@/components/Field";
import { BulkTableForm } from "./BulkTableForm";
import { tableLabel } from "@/utils/tableIdentity";
import { useToast } from "@/components/ToastProvider";
import { ApiError, clientApi } from "@/services/api/client";
import type { TableAccessResponse, TableResponse } from "@/types/api";
import {
  Actions,
  CardActions,
  CheckboxLabel,
  Empty,
  EditorSection,
  ErrorText,
  Form,
  LinkInput,
  LinkResult,
  List,
  PaneGrid,
  QrCodeImage,
  QrCodePreview,
  Root,
  RegisteredSection,
  SectionHeader,
  SectionHelp,
  SectionTitle,
  Status,
  Subtitle,
  TableCard,
  TableIdentity,
  TableName,
  Title,
} from "./styles";

const tableSchema = z.object({
  kind: z.enum(["TABLE", "COMMAND"]),
  number: z.string().trim().min(1, "Informe o número."),
  active: z.boolean(),
});

type TableForm = z.infer<typeof tableSchema>;

type TableManagerProps = {
  initialTables: TableResponse[];
};

type TableLink = {
  tableId: string;
  tableNumber: string;
  label: string;
  url: string;
  qrCodeDataUrl: string;
};

const defaultTableForm = (): TableForm => ({ number: "", active: true, kind: "TABLE" });

function tableToForm(table: TableResponse): TableForm {
  return { number: table.number, active: table.active, kind: table.kind ?? "TABLE" };
}

function sortTables(tables: TableResponse[]) {
  return [...tables].sort((left, right) => left.number.localeCompare(right.number, "pt-BR", { numeric: true }));
}

function tableUrl(token: string) {
  return `/menu?mesa=${encodeURIComponent(token)}`;
}

async function createTableLink(table: TableResponse): Promise<TableLink> {
  if (!table.token) {
    throw new Error("Token ausente na resposta.");
  }

  const url = new URL(tableUrl(table.token), window.location.origin).toString();
  const qrCodeDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return { tableId: table.id, tableNumber: table.number, label: tableLabel(table), url, qrCodeDataUrl };
}

export function TableManager({ initialTables }: TableManagerProps) {
  const [tables, setTables] = useState(() => sortTables(initialTables));
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [pendingTableId, setPendingTableId] = useState<string | null>(null);
  const [tableLink, setTableLink] = useState<TableLink | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<{ message: string; canRetry: boolean } | null>(null);
  const qrRequest = useRef(0);
  const editorRef = useRef<HTMLElement | null>(null);
  const [error, setError] = useState("");
  const [numberFilter, setNumberFilter] = useState("");
  const { requestConfirmation } = useConfirmation();
  const { showToast } = useToast();
  const form = useForm<TableForm>({
    resolver: zodResolver(tableSchema),
    defaultValues: defaultTableForm(),
  });
  const isEditing = Boolean(editingTableId);
  const editingTable = tables.find((table) => table.id === editingTableId);
  const isBusy = form.formState.isSubmitting || Boolean(pendingTableId);
  const filteredTables = tables.filter((table) => table.number.toLocaleLowerCase("pt-BR").includes(numberFilter.trim().toLocaleLowerCase("pt-BR")));

  function resetForm() {
    qrRequest.current += 1;
    setEditingTableId(null);
    setTableLink(null);
    setQrLoading(false);
    setQrError(null);
    setError("");
    form.reset(defaultTableForm());
  }

  function startEditing(table: TableResponse) {
    setEditingTableId(table.id);
    setError("");
    form.reset(tableToForm(table));
    void loadTableQrCode(table);
    editorRef.current?.scrollTo({ top: 0 });
  }

  function updateTable(savedTable: TableResponse) {
    setTables((currentTables) => sortTables(
      currentTables.some((table) => table.id === savedTable.id)
        ? currentTables.map((table) => (table.id === savedTable.id ? savedTable : table))
        : [...currentTables, savedTable],
    ));
  }

  async function copyLink(link: TableLink) {
    try {
      await navigator.clipboard.writeText(link.url);
      showToast(`Link · ${link.label} copiado.`);
    } catch {
      showToast("Não foi possível copiar o link. Copie-o manualmente.", "error");
    }
  }

  function downloadQrCode(link: TableLink) {
    const download = document.createElement("a");
    download.href = link.qrCodeDataUrl;
    download.download = `${link.label.toLowerCase().replaceAll(" ", "-")}-qr.png`;
    document.body.append(download);
    download.click();
    download.remove();
    showToast(`QR Code · ${link.label} baixado.`);
  }

  async function submit(values: TableForm) {
    qrRequest.current += 1;
    setQrLoading(true);
    setQrError(null);
    setError("");

    try {
      const table = await clientApi<TableResponse>(
        editingTableId ? `admin/tables/${editingTableId}` : "admin/tables",
        {
          method: editingTableId ? "PUT" : "POST",
          body: JSON.stringify(
            editingTableId
              ? { number: values.number, active: values.active, kind: values.kind }
              : { number: values.number, kind: values.kind },
          ),
        },
      );
      updateTable(table);
      setEditingTableId(table.id);
      if (table.token) {
        setTableLink(await createTableLink(table));
      } else if (tableLink?.tableId === table.id) {
        setTableLink({ ...tableLink, tableNumber: table.number, label: tableLabel(table) });
      } else {
        await loadTableQrCode(table);
      }
      form.reset(tableToForm(table));
      showToast(editingTableId ? "Cadastro atualizado." : "Cadastro criado. Baixe ou copie o QR Code abaixo.");
    } catch {
      const message = editingTableId
        ? "Não foi possível atualizar o cadastro. Tente novamente."
        : "Não foi possível criar o cadastro. Verifique o número e tente novamente.";
      setError(message);
      showToast(message, "error");
    } finally {
      setQrLoading(false);
    }
  }

  async function toggleTable(table: TableResponse) {
    setError("");
    setPendingTableId(table.id);

    try {
      const updatedTable = await clientApi<TableResponse>(`admin/tables/${table.id}`, {
        method: "PUT",
        body: JSON.stringify({ number: table.number, active: !table.active }),
      });
      updateTable(updatedTable);
      showToast(updatedTable.active ? "Cadastro ativado." : "Cadastro desativado.");
    } catch {
      const message = "Não foi possível alterar o estado do cadastro. Tente novamente.";
      setError(message);
      showToast(message, "error");
    } finally {
      setPendingTableId(null);
    }
  }

  async function deleteTable(table: TableResponse) {
    const confirmed = await requestConfirmation({
      message: `Excluir ${tableLabel(table)}? O cadastro sairá da listagem e o QR deixará de funcionar. O histórico de consumo será preservado.`,
      confirmLabel: "Excluir cadastro",
      variant: "danger",
    });
    if (!confirmed) return;
    setError("");
    setPendingTableId(table.id);
    try {
      await clientApi(`admin/tables/${table.id}`, { method: "DELETE" });
      setTables((current) => current.filter((value) => value.id !== table.id));
      if (editingTableId === table.id) resetForm();
      showToast("Cadastro excluído com sucesso.");
    } catch (cause) {
      const message = cause instanceof ApiError && cause.status === 409
        ? "Encerre o atendimento antes de excluir a mesa ou comanda."
        : "Não foi possível excluir o cadastro. Tente novamente.";
      setError(message);
      showToast(message, "error");
    } finally {
      setPendingTableId(null);
    }
  }

  async function loadTableQrCode(table: TableResponse) {
    const requestId = ++qrRequest.current;
    setTableLink(null);
    setQrError(null);
    setQrLoading(true);

    try {
      const access = await clientApi<TableAccessResponse>(`admin/tables/${table.id}/access`);
      const link = await createTableLink({ ...table, token: access.token });
      if (requestId === qrRequest.current) setTableLink(link);
    } catch (error) {
      if (requestId !== qrRequest.current) return;
      const unavailable = error instanceof ApiError && error.status === 409;
      const message = unavailable
        ? "Este cadastro precisa de um novo QR Code. Gere um novo abaixo; o código anterior deixará de funcionar."
        : "Não foi possível carregar o QR Code. Tente novamente.";
      setQrError({ message, canRetry: !unavailable });
    } finally {
      if (requestId === qrRequest.current) setQrLoading(false);
    }
  }

  async function regenerateLink(table: TableResponse) {
    const confirmed = await requestConfirmation({
      message: `Gerar novo QR Code de ${tableLabel(table)}? O QR Code e link anteriores deixarão de funcionar.`,
      confirmLabel: "Gerar novo QR",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    setError("");
    setPendingTableId(table.id);
    qrRequest.current += 1;
    setQrLoading(true);
    setTableLink(null);
    setQrError(null);

    try {
      const updatedTable = await clientApi<TableResponse>(`admin/tables/${table.id}`, {
        method: "PUT",
        body: JSON.stringify({
          number: table.number,
          active: table.active,
          regenerateToken: true,
        }),
      });

      updateTable(updatedTable);
      const nextTableLink = await createTableLink(updatedTable);
      setTableLink(nextTableLink);

      showToast("Novo QR Code gerado. Baixe o código atualizado abaixo.");
    } catch {
      const message = "Não foi possível gerar o novo QR Code. Tente novamente.";
      setQrError({ message, canRetry: true });
      showToast(message, "error");
    } finally {
      setPendingTableId(null);
      setQrLoading(false);
    }
  }

  return (
    <Root data-table-manager>
      <div>
        <Title>Mesas e comandas</Title>
        <Subtitle>Mesas compartilham a conta do grupo. Comandas têm contas individuais, cada uma com QR próprio.</Subtitle>
      </div>

      {error ? <ErrorText role="alert">{error}</ErrorText> : null}

      <PaneGrid>
        <EditorSection ref={editorRef}>
          <SectionHeader>
            <div>
              <SectionTitle>{isEditing && editingTable ? `Editar ${tableLabel(editingTable)}` : "Cadastro individual"}</SectionTitle>
              <SectionHelp>
                {isEditing
                  ? "Altere os dados e acesse o QR Code abaixo."
                  : "Novo cadastro começa ativo e recebe um link exclusivo para pedidos."}
              </SectionHelp>
            </div>
            {isEditing ? (
              <Button type="button" variant="ghost" onClick={resetForm} disabled={isBusy}>
                <Plus size={16} aria-hidden="true" /> Novo cadastro
              </Button>
            ) : null}
          </SectionHeader>

          <Form onSubmit={(event) => void form.handleSubmit(submit)(event)}>
            <Field label="Tipo de atendimento"><Select disabled={isBusy} {...form.register("kind")}><option value="TABLE">Mesa · conta compartilhada</option><option value="COMMAND">Comanda · conta individual</option></Select></Field>
            <Field label="Número" error={form.formState.errors.number?.message}>
              <Input autoComplete="off" inputMode="numeric" disabled={isBusy} {...form.register("number")} />
            </Field>
            {isEditing ? (
              <CheckboxLabel>
                <input type="checkbox" disabled={isBusy} {...form.register("active")} /> Cadastro ativo
              </CheckboxLabel>
            ) : null}
            <Actions>
              <Button type="submit" disabled={isBusy}>
                {isEditing ? <Save size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                {form.formState.isSubmitting
                  ? "Salvando..."
                  : isEditing
                    ? "Salvar cadastro"
                    : "Criar cadastro"}
              </Button>
            </Actions>
          </Form>
          <BulkTableForm disabled={isBusy} onComplete={(created) => setTables((current) => sortTables([...current.filter((table) => !created.some((value) => value.id === table.id)), ...created]))} />

          {editingTable ? (
            <LinkResult aria-live="polite" aria-busy={qrLoading}>
              <div>
                <SectionTitle>Link · {tableLabel(editingTable)}</SectionTitle>
                <SectionHelp>Baixe o QR Code ou copie o link deste atendimento.</SectionHelp>
              </div>
              {qrLoading ? <SectionHelp role="status">Carregando QR Code...</SectionHelp> : null}
              {qrError ? (
                <div>
                  <ErrorText role="alert">{qrError.message}</ErrorText>
                  {qrError.canRetry ? (
                    <Button type="button" variant="outline" onClick={() => loadTableQrCode(editingTable)} disabled={isBusy}>
                      <RefreshCw size={16} aria-hidden="true" /> Tentar novamente
                    </Button>
                  ) : null}
                </div>
              ) : null}
              {tableLink && tableLink.tableId === editingTable.id ? (
                <>
                  <QrCodePreview>
                    <QrCodeImage alt={`QR Code · ${tableLink.label}`} src={tableLink.qrCodeDataUrl} />
                  </QrCodePreview>
                  <LinkInput aria-label={`Link · ${tableLink.label}`} readOnly value={tableLink.url} />
                  <Actions>
                    <Button type="button" onClick={() => downloadQrCode(tableLink)} disabled={isBusy}>
                      <Download size={16} aria-hidden="true" /> Baixar QR Code
                    </Button>
                    <Button type="button" variant="outline" onClick={() => copyLink(tableLink)} disabled={isBusy}>
                      <Copy size={16} aria-hidden="true" /> Copiar link
                    </Button>
                  </Actions>
                </>
              ) : null}
              <Actions>
                <Button type="button" variant="dangerGhost" onClick={() => regenerateLink(editingTable)} disabled={isBusy || qrLoading}>
                  <RefreshCw size={16} aria-hidden="true" /> {pendingTableId === editingTable.id ? "Gerando..." : "Gerar novo QR"}
                </Button>
              </Actions>
            </LinkResult>
          ) : null}
        </EditorSection>

        <RegisteredSection>
          <div>
            <SectionTitle>Mesas e comandas cadastradas</SectionTitle>
            <SectionHelp role="status">{filteredTables.length} de {tables.length} cadastro(s).</SectionHelp>
          </div>

          <Field label="Filtrar por número da mesa/comanda"><Input type="search" inputMode="numeric" placeholder="Ex.: 12" value={numberFilter} onChange={(event) => setNumberFilter(event.target.value)} /></Field>

          {tables.length === 0 ? (
            <Empty>Nenhuma mesa ou comanda cadastrada. Adicione o primeiro cadastro.</Empty>
          ) : filteredTables.length === 0 ? <Empty>Nenhuma mesa ou comanda encontrada para este número.</Empty> : (
            <List role="region" aria-label="Lista de mesas e comandas" tabIndex={0}>
              {filteredTables.map((table) => {
                const isPending = pendingTableId === table.id;

                return (
                  <TableCard key={table.id} data-selected={editingTableId === table.id}>
                    <TableIdentity>
                      <TableName>{tableLabel(table)}</TableName>
                      <Status active={table.active}>
                        {table.active ? <CheckCircle2 size={14} aria-hidden="true" /> : <Power size={14} aria-hidden="true" />}
                        {table.active ? "Ativa" : "Inativa"}
                      </Status>
                    </TableIdentity>
                    <CardActions>
                      <Button type="button" variant="outline" onClick={() => startEditing(table)} disabled={isBusy}>
                        <Pencil size={16} aria-hidden="true" /> Editar
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => toggleTable(table)} disabled={isBusy}>
                        <Power size={16} aria-hidden="true" /> {isPending ? "Salvando..." : table.active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button type="button" variant="dangerGhost" onClick={() => deleteTable(table)} disabled={isBusy}>
                        <Trash2 size={16} aria-hidden="true" /> Excluir
                      </Button>
                    </CardActions>
                  </TableCard>
                );
              })}
            </List>
          )}
        </RegisteredSection>
      </PaneGrid>
    </Root>
  );
}
