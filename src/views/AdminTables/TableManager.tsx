"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Copy, Download, Pencil, Plus, Power, RefreshCw, Save } from "lucide-react";
import QRCode from "qrcode";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { Field, Input } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { ApiError, clientApi } from "@/services/api/client";
import type { TableAccessResponse, TableResponse } from "@/types/api";
import {
  Actions,
  CardActions,
  CheckboxLabel,
  Empty,
  ErrorText,
  Form,
  LinkInput,
  LinkResult,
  List,
  PaneGrid,
  QrCodeImage,
  QrCodePreview,
  Root,
  Section,
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
  number: z.string().trim().min(1, "Informe o número da mesa."),
  active: z.boolean(),
});

type TableForm = z.infer<typeof tableSchema>;

type TableManagerProps = {
  initialTables: TableResponse[];
};

type TableLink = {
  tableId: string;
  tableNumber: string;
  url: string;
  qrCodeDataUrl: string;
};

const defaultTableForm = (): TableForm => ({ number: "", active: true });

function tableToForm(table: TableResponse): TableForm {
  return { number: table.number, active: table.active };
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

  return { tableId: table.id, tableNumber: table.number, url, qrCodeDataUrl };
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
  const { requestConfirmation } = useConfirmation();
  const { showToast } = useToast();
  const form = useForm<TableForm>({
    resolver: zodResolver(tableSchema),
    defaultValues: defaultTableForm(),
  });
  const isEditing = Boolean(editingTableId);
  const editingTable = tables.find((table) => table.id === editingTableId);
  const isBusy = form.formState.isSubmitting || Boolean(pendingTableId);

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
    editorRef.current?.scrollIntoView({ block: "start" });
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
      showToast(`Link da mesa ${link.tableNumber} copiado.`);
    } catch {
      showToast("Não foi possível copiar o link. Copie-o manualmente.", "error");
    }
  }

  function downloadQrCode(link: TableLink) {
    const download = document.createElement("a");
    download.href = link.qrCodeDataUrl;
    download.download = `mesa-${link.tableNumber}-qr.png`;
    document.body.append(download);
    download.click();
    download.remove();
    showToast(`QR Code da mesa ${link.tableNumber} baixado.`);
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
              ? { number: values.number, active: values.active }
              : { number: values.number },
          ),
        },
      );
      updateTable(table);
      setEditingTableId(table.id);
      if (table.token) {
        setTableLink(await createTableLink(table));
      } else if (tableLink?.tableId === table.id) {
        setTableLink({ ...tableLink, tableNumber: table.number });
      } else {
        await loadTableQrCode(table);
      }
      form.reset(tableToForm(table));
      showToast(editingTableId ? "Mesa atualizada." : "Mesa criada. Baixe ou copie o QR Code abaixo.");
    } catch {
      const message = editingTableId
        ? "Não foi possível atualizar a mesa. Tente novamente."
        : "Não foi possível criar a mesa. Verifique o número e tente novamente.";
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
      showToast(updatedTable.active ? "Mesa ativada." : "Mesa desativada.");
    } catch {
      const message = "Não foi possível alterar o estado da mesa. Tente novamente.";
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
        ? "Esta mesa precisa de um novo QR Code. Gere um novo abaixo; o código anterior deixará de funcionar."
        : "Não foi possível carregar o QR Code. Tente novamente.";
      setQrError({ message, canRetry: !unavailable });
    } finally {
      if (requestId === qrRequest.current) setQrLoading(false);
    }
  }

  async function regenerateLink(table: TableResponse) {
    const confirmed = await requestConfirmation({
      message: `Gerar novo QR Code da mesa ${table.number}? O QR Code e link anteriores deixarão de funcionar.`,
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
    <Root>
      <div>
        <Title>Mesas</Title>
        <Subtitle>Cadastre mesas e controle os links de pedido do salão.</Subtitle>
      </div>

      {error ? <ErrorText role="alert">{error}</ErrorText> : null}

      <PaneGrid>
        <Section ref={editorRef}>
          <SectionHeader>
            <div>
              <SectionTitle>{isEditing ? `Editar mesa ${editingTable?.number ?? ""}` : "Adicionar mesa"}</SectionTitle>
              <SectionHelp>
                {isEditing
                  ? "Altere os dados e acesse o QR Code desta mesa abaixo."
                  : "Uma mesa nova começa ativa e recebe um link exclusivo para pedidos."}
              </SectionHelp>
            </div>
            {isEditing ? (
              <Button type="button" variant="ghost" onClick={resetForm} disabled={isBusy}>
                <Plus size={16} aria-hidden="true" /> Nova mesa
              </Button>
            ) : null}
          </SectionHeader>

          <Form onSubmit={(event) => void form.handleSubmit(submit)(event)}>
            <Field label="Número da mesa" error={form.formState.errors.number?.message}>
              <Input autoComplete="off" inputMode="numeric" disabled={isBusy} {...form.register("number")} />
            </Field>
            {isEditing ? (
              <CheckboxLabel>
                <input type="checkbox" disabled={isBusy} {...form.register("active")} /> Mesa ativa
              </CheckboxLabel>
            ) : null}
            <Actions>
              <Button type="submit" disabled={isBusy}>
                {isEditing ? <Save size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                {form.formState.isSubmitting
                  ? "Salvando..."
                  : isEditing
                    ? "Salvar mesa"
                    : "Criar mesa"}
              </Button>
            </Actions>
          </Form>

          {editingTable ? (
            <LinkResult aria-live="polite" aria-busy={qrLoading}>
              <div>
                <SectionTitle>Link da mesa {editingTable.number}</SectionTitle>
                <SectionHelp>Baixe o QR Code ou copie o link para usar nesta mesa.</SectionHelp>
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
                    <QrCodeImage alt={`QR Code da mesa ${tableLink.tableNumber}`} src={tableLink.qrCodeDataUrl} />
                  </QrCodePreview>
                  <LinkInput aria-label={`Link da mesa ${tableLink.tableNumber}`} readOnly value={tableLink.url} />
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
        </Section>

        <Section>
          <div>
            <SectionTitle>Mesas cadastradas</SectionTitle>
            <SectionHelp>{tables.length} mesa(s) cadastrada(s).</SectionHelp>
          </div>

          {tables.length === 0 ? (
            <Empty>Nenhuma mesa cadastrada. Adicione a primeira mesa ao lado.</Empty>
          ) : (
            <List>
              {tables.map((table) => {
                const isPending = pendingTableId === table.id;

                return (
                  <TableCard key={table.id} data-selected={editingTableId === table.id}>
                    <TableIdentity>
                      <TableName>Mesa {table.number}</TableName>
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
                    </CardActions>
                  </TableCard>
                );
              })}
            </List>
          )}
        </Section>
      </PaneGrid>
    </Root>
  );
}
