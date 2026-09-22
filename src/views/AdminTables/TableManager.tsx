"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Copy, Download, Pencil, Plus, Power, RefreshCw, Save, X } from "lucide-react";
import QRCode from "qrcode";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { Field, Input } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import type { TableResponse } from "@/types/api";
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
  Meta,
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
  return `/mesa/${token}`;
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
  const [error, setError] = useState("");
  const { requestConfirmation } = useConfirmation();
  const { showToast } = useToast();
  const form = useForm<TableForm>({
    resolver: zodResolver(tableSchema),
    defaultValues: defaultTableForm(),
  });
  const isEditing = Boolean(editingTableId);

  function resetForm() {
    setEditingTableId(null);
    setError("");
    form.reset(defaultTableForm());
  }

  function startEditing(table: TableResponse) {
    setEditingTableId(table.id);
    setError("");
    form.reset(tableToForm(table));
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
      if (table.token) {
        setTableLink(await createTableLink(table));
      } else {
        setTableLink((currentLink) => currentLink?.tableId === table.id
          ? { ...currentLink, tableNumber: table.number }
          : currentLink);
      }
      resetForm();
      showToast(editingTableId ? "Mesa atualizada." : "Mesa criada. Baixe ou copie o QR Code abaixo.");
    } catch {
      const message = editingTableId
        ? "Não foi possível atualizar a mesa. Tente novamente."
        : "Não foi possível criar a mesa. Verifique o número e tente novamente.";
      setError(message);
      showToast(message, "error");
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

  async function regenerateLink(table: TableResponse) {
    const confirmed = await requestConfirmation({
      message: `Regenerar o link da mesa ${table.number}? O link anterior deixará de funcionar.`,
      confirmLabel: "Regenerar link",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    setError("");
    setPendingTableId(table.id);

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
      setTableLink(await createTableLink(updatedTable));
      showToast("Novo link gerado. Baixe ou copie o QR Code abaixo.");
    } catch {
      const message = "Não foi possível regenerar o link da mesa. Tente novamente.";
      setError(message);
      showToast(message, "error");
    } finally {
      setPendingTableId(null);
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
        <Section>
          <SectionHeader>
            <div>
              <SectionTitle>{isEditing ? "Editar mesa" : "Adicionar mesa"}</SectionTitle>
              <SectionHelp>
                Uma mesa nova começa ativa e recebe um link exclusivo para pedidos.
              </SectionHelp>
            </div>
            {isEditing ? (
              <Button type="button" variant="ghost" onClick={resetForm}>
                <X size={16} aria-hidden="true" /> Cancelar
              </Button>
            ) : null}
          </SectionHeader>

          <Form onSubmit={form.handleSubmit(submit)}>
            <Field label="Número da mesa" error={form.formState.errors.number?.message}>
              <Input autoComplete="off" inputMode="numeric" {...form.register("number")} />
            </Field>
            {isEditing ? (
              <CheckboxLabel>
                <input type="checkbox" {...form.register("active")} /> Mesa ativa
              </CheckboxLabel>
            ) : null}
            <Actions>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {isEditing ? <Save size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                {form.formState.isSubmitting
                  ? "Salvando..."
                  : isEditing
                    ? "Salvar mesa"
                    : "Criar mesa"}
              </Button>
            </Actions>
          </Form>

          {tableLink ? (
            <LinkResult aria-live="polite">
              <div>
                <SectionTitle>Link da mesa {tableLink.tableNumber}</SectionTitle>
                <SectionHelp>Guarde, imprima ou baixe agora: ele só é mostrado ao criar ou regenerar.</SectionHelp>
              </div>
              <QrCodePreview>
                <QrCodeImage alt={`QR Code da mesa ${tableLink.tableNumber}`} src={tableLink.qrCodeDataUrl} />
              </QrCodePreview>
              <LinkInput aria-label={`Link da mesa ${tableLink.tableNumber}`} readOnly value={tableLink.url} />
              <Actions>
                <Button type="button" onClick={() => downloadQrCode(tableLink)}>
                  <Download size={16} aria-hidden="true" /> Baixar QR Code
                </Button>
                <Button type="button" variant="outline" onClick={() => copyLink(tableLink)}>
                  <Copy size={16} aria-hidden="true" /> Copiar link
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
                const hasCurrentLink = tableLink?.tableId === table.id;
                const isPending = pendingTableId === table.id;

                return (
                  <TableCard key={table.id}>
                    <div>
                      <TableName>Mesa {table.number}</TableName>
                      <Status active={table.active}>
                        {table.active ? <CheckCircle2 size={14} aria-hidden="true" /> : <Power size={14} aria-hidden="true" />}
                        {table.active ? "Ativa" : "Inativa"}
                      </Status>
                      <Meta>{hasCurrentLink ? "Novo link disponível nesta sessão." : "Regenerar link invalida o acesso anterior."}</Meta>
                    </div>
                    <CardActions>
                      {hasCurrentLink && tableLink ? (
                        <Button type="button" variant="outline" onClick={() => copyLink(tableLink)}>
                          <Copy size={16} aria-hidden="true" /> Copiar link
                        </Button>
                      ) : null}
                      <Button type="button" variant="outline" onClick={() => startEditing(table)} disabled={isPending}>
                        <Pencil size={16} aria-hidden="true" /> Editar
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => toggleTable(table)} disabled={isPending}>
                        <Power size={16} aria-hidden="true" /> {table.active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button type="button" variant="dangerGhost" onClick={() => regenerateLink(table)} disabled={isPending}>
                        <RefreshCw size={16} aria-hidden="true" /> {isPending ? "Gerando..." : "Regenerar link"}
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
