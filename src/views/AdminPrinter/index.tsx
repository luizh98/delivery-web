"use client";

import { Clipboard, Download, Printer, RefreshCw, Unlink } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Field, Input, Select } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import {
  createPrintPairingCode,
  createPrintTest,
  getPrintJobs,
  getPrintOverview,
  type PrintDestination,
  type PrintDestinationConfig,
  type PrintJob,
  type PrintOverview,
  reprintJob,
  revokePrintDevice,
  savePrintDestination,
} from "@/services/printing/connector";
import {
  Actions,
  Code,
  DestinationCard,
  DestinationGrid,
  DownloadActions,
  DeviceList,
  DeviceRow,
  Help,
  InlineField,
  Muted,
  Panel,
  PanelDescription,
  PanelHeader,
  PanelTitle,
  Root,
  RowDetails,
  Status,
  StatusDot,
  Step,
  StepContent,
  StepDescription,
  StepList,
  StepNumber,
  StepTitle,
  Subtitle,
  Title,
} from "./styles";

const destinations: Array<{ id: PrintDestination; label: string; description: string }> = [
  { id: "RECEIPT", label: "Recibo", description: "Pedido completo para o balcão." },
  { id: "KITCHEN", label: "Cozinha", description: "Comanda com itens e observações." },
  { id: "EXPEDITION", label: "Expedição", description: "Conferência antes da saída." },
];

type DestinationDraft = Omit<PrintDestinationConfig, "destination">;

const emptyDraft: DestinationDraft = { deviceId: "", printerId: "", automatic: true, copies: 1, model: "" };

function printerChoice(deviceID: string, printerID: string) {
  return `${deviceID}|${printerID}`;
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString("pt-BR") : "Ainda não conectado";
}

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : "Não foi possível concluir esta operação.";
}

export function AdminPrinterView() {
  const { showToast } = useToast();
  const [overview, setOverview] = useState<PrintOverview | null>(null);
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [drafts, setDrafts] = useState<Record<PrintDestination, DestinationDraft>>({ RECEIPT: emptyDraft, KITCHEN: emptyDraft, EXPEDITION: emptyDraft });
  const [pairingCode, setPairingCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextOverview, nextJobs] = await Promise.all([getPrintOverview(), getPrintJobs()]);
      setOverview(nextOverview);
      setJobs(nextJobs.jobs);
      setDrafts((current) => {
        const next = { ...current };
        for (const destination of destinations) {
          const saved = nextOverview.destinations.find((value) => value.destination === destination.id);
          next[destination.id] = saved
            ? { deviceId: saved.deviceId, printerId: saved.printerId, automatic: saved.automatic, copies: saved.copies, model: saved.model }
            : current[destination.id] ?? emptyDraft;
        }
        return next;
      });
    } catch (error) {
      showToast(messageFrom(error), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void refresh(); }, [refresh]);

  /* Legacy QZ local-browser helpers removed with the connector flow.
    setSelected(printer);
    setSelectedPrinter(printer);
    showToast(printer ? "Impressora padrão salva neste computador" : "Diálogo do navegador salvo neste computador");
  }

  async function testPrint() {
    try {
      await printTextWithQz(
        `FLYFOODS - TESTE DE IMPRESSAO\n${new Date().toLocaleString("pt-BR")}\nImpressora: ${selected}`,
        selected,
      );
      showToast("Teste enviado para a impressora");
    } catch (cause) {
      showToast(getQzErrorMessage(cause), "error");
    }
  }

  */

  const printerOptions = useMemo(
    () => overview?.printers.map((printer) => ({ ...printer, device: overview.devices.find((device) => device.id === printer.deviceId) })) ?? [],
    [overview],
  );

  function changeDraft(destination: PrintDestination, patch: Partial<DestinationDraft>) {
    setDrafts((current) => ({ ...current, [destination]: { ...current[destination], ...patch } }));
  }

  async function createPairingCode() {
    setBusy("pair");
    try {
      setPairingCode(await createPrintPairingCode());
      showToast("Código de vinculação criado. Ele expira em 10 minutos.");
    } catch (error) {
      showToast(messageFrom(error), "error");
    } finally {
      setBusy(null);
    }
  }

  async function copyPairingCode() {
    if (!pairingCode) return;
    try {
      await navigator.clipboard.writeText(pairingCode.code);
      showToast("Código copiado.");
    } catch {
      showToast("Copie o código exibido manualmente.", "error");
    }
  }

  async function saveDestination(destination: PrintDestination) {
    const draft = drafts[destination];
    if (!draft.deviceId || !draft.printerId) {
      showToast("Selecione computador e impressora.", "error");
      return;
    }
    setBusy(`save:${destination}`);
    try {
      await savePrintDestination(destination, draft);
      showToast("Destino de impressão salvo.");
      await refresh();
    } catch (error) {
      showToast(messageFrom(error), "error");
    } finally {
      setBusy(null);
    }
  }

  async function testDestination(destination: PrintDestination) {
    setBusy(`test:${destination}`);
    try {
      await createPrintTest(destination);
      showToast("Teste colocado na fila do conector.");
      await refresh();
    } catch (error) {
      showToast(messageFrom(error), "error");
    } finally {
      setBusy(null);
    }
  }

  async function revokeDevice(deviceID: string) {
    setBusy(`revoke:${deviceID}`);
    try {
      await revokePrintDevice(deviceID);
      showToast("Computador desvinculado.");
      await refresh();
    } catch (error) {
      showToast(messageFrom(error), "error");
    } finally {
      setBusy(null);
    }
  }

  async function reprint(jobID: string) {
    setBusy(`reprint:${jobID}`);
    try {
      await reprintJob(jobID);
      showToast("Reimpressão adicionada à fila.");
      await refresh();
    } catch (error) {
      showToast(messageFrom(error), "error");
    } finally {
      setBusy(null);
    }
  }

  /* Legacy QZ screen retained below only while this edit replaces its JSX.
  return (
    <Root>
      <div>
        <Title>Impressora</Title>
        <Subtitle>Escolha se pedidos usam diálogo do navegador ou impressora direta neste computador.</Subtitle>
      </div>

      <Panel>
        <PanelHeader>
          <PanelTitle>Configurar um novo computador</PanelTitle>
          <PanelDescription>
            Faça esta preparação uma vez em cada computador que imprimirá pedidos.
          </PanelDescription>
        </PanelHeader>

        <DownloadActions>
          <DownloadLink
            primary
            href="https://qz.io/download/?os=windows"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={16} />
            Baixar QZ Tray para Windows
          </DownloadLink>
          <DownloadLink
            href="/api/backend/admin/printing/qz/certificate"
            download="override.crt"
          >
            <Download size={16} />
            Baixar certificado público
          </DownloadLink>
        </DownloadActions>

        <StepList>
          <Step>
            <StepNumber>1</StepNumber>
            <StepContent>
              <StepTitle>Instale o driver da impressora</StepTitle>
              <StepDescription>
                Use o driver fornecido pelo fabricante e confirme que a impressora aparece no Windows.
              </StepDescription>
            </StepContent>
          </Step>
          <Step>
            <StepNumber>2</StepNumber>
            <StepContent>
              <StepTitle>Instale e abra o QZ Tray</StepTitle>
              <StepDescription>
                Use a instalação padrão e deixe a opção de iniciar automaticamente com o Windows ativa.
              </StepDescription>
            </StepContent>
          </Step>
          <Step>
            <StepNumber>3</StepNumber>
            <StepContent>
              <StepTitle>Instale o certificado público</StepTitle>
              <StepDescription>
                Feche o QZ Tray e salve o arquivo baixado como <PathCode>override.crt</PathCode> em{" "}
                <PathCode>C:\Program Files\QZ Tray\</PathCode>. O Windows solicitará permissão de administrador.
              </StepDescription>
            </StepContent>
          </Step>
          <Step>
            <StepNumber>4</StepNumber>
            <StepContent>
              <StepTitle>Reabra e autorize o QZ Tray</StepTitle>
              <StepDescription>
                Volte a esta página. Caso apareça uma solicitação, permita a conexão e marque para lembrar a decisão.
              </StepDescription>
            </StepContent>
          </Step>
          <Step>
            <StepNumber>5</StepNumber>
            <StepContent>
              <StepTitle>Selecione e teste a impressora</StepTitle>
              <StepDescription>
                Atualize a lista abaixo, escolha a impressora e envie uma impressão de teste.
              </StepDescription>
            </StepContent>
          </Step>
        </StepList>

      </Panel>

      <Panel>
        <PanelHeader>
          <PanelTitle>Destino da impressão</PanelTitle>
          <PanelDescription>
            A seleção fica salva neste navegador e não altera outros caixas.
          </PanelDescription>
        </PanelHeader>

        <Status>
          <StatusDot connected={isBrowserPrintSelected() || (!error && !loading)} />
          {isBrowserPrintSelected() ? "Diálogo do navegador selecionado" : loading ? "Conectando ao QZ Tray..." : error ? "QZ Tray desconectado" : "QZ Tray conectado"}
        </Status>

        {error && !isBrowserPrintSelected() ? <ErrorText>{error}</ErrorText> : null}

        <Field label="Destino">
          <Select
            value={selected}
            disabled={loading}
            onChange={(event) => changePrinter(event.target.value)}
          >
            <option value="">Usar diálogo do navegador (salvar como PDF)</option>
            {printers.map((printer) => (
              <option key={printer} value={printer}>{printer}</option>
            ))}
          </Select>
        </Field>

        <Actions>
          <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw size={16} />
            Atualizar lista
          </Button>
          <Button type="button" onClick={() => void testPrint()} disabled={!selected || loading}>
            <Printer size={16} />
            Imprimir teste
          </Button>
        </Actions>

        <Help>
          Use diálogo do navegador para testar ou salvar PDF. QZ Tray só é necessário para enviar
          diretamente a uma impressora. A escolha fica salva somente neste navegador.
        </Help>
        {jobs.some((job) => job.lastErrorCode) ? <Muted role="status">Falha mais recente: {jobs.find((job) => job.lastErrorCode)?.lastErrorCode}</Muted> : null}
      </Panel>
    </Root>
  ); */

  return (
    <Root>
      <div>
        <Title>Impressão</Title>
        <Subtitle>Gerencie conectores e impressoras pelo painel. QZ Tray não é necessário.</Subtitle>
      </div>

      <Panel>
        <PanelHeader>
          <PanelTitle>Instalar e vincular computador</PanelTitle>
          <PanelDescription>O conector fica em segundo plano e descobre as impressoras instaladas.</PanelDescription>
        </PanelHeader>
        <DownloadActions>
          <Button type="button" disabled>
            <Download size={16} /> Instalador Windows em preparação
          </Button>
        </DownloadActions>
        <StepList>
          <Step><StepNumber>1</StepNumber><StepContent><StepTitle>Instale o driver da impressora</StepTitle><StepDescription>Confirme que a impressora aparece no sistema operacional.</StepDescription></StepContent></Step>
          <Step><StepNumber>2</StepNumber><StepContent><StepTitle>Instale o conector do delivery</StepTitle><StepDescription>Use o instalador e permita iniciar junto com o computador.</StepDescription></StepContent></Step>
          <Step><StepNumber>3</StepNumber><StepContent><StepTitle>Vincule usando o código</StepTitle><StepDescription>Gere um código abaixo e informe-o no aplicativo.</StepDescription></StepContent></Step>
          <Step><StepNumber>4</StepNumber><StepContent><StepTitle>Escolha os destinos e faça um teste</StepTitle><StepDescription>As impressoras aparecem automaticamente após o conector sincronizar.</StepDescription></StepContent></Step>
        </StepList>
        <Actions><Button type="button" onClick={() => void createPairingCode()} disabled={busy === "pair"}><Clipboard size={16} />Gerar código de vinculação</Button></Actions>
        {pairingCode ? <div><Code>{pairingCode.code}</Code><Muted>Expira em {formatDate(pairingCode.expiresAt)}.</Muted><Button type="button" variant="outline" onClick={() => void copyPairingCode()}>Copiar código</Button></div> : null}
      </Panel>

      <Panel>
        <PanelHeader><PanelTitle>Computadores vinculados</PanelTitle><PanelDescription>Impressoras continuam visíveis mesmo se o computador estiver offline.</PanelDescription></PanelHeader>
        <Status><StatusDot connected={Boolean(overview?.devices.some((device) => !device.revokedAt))} />{loading ? "Carregando conectores..." : `${overview?.devices.filter((device) => !device.revokedAt).length ?? 0} conector(es) ativo(s)`}</Status>
        <DeviceList>
          {overview?.devices.map((device) => <DeviceRow key={device.id}><RowDetails><strong>{device.name}</strong><Muted>Versão {device.version || "não informada"} · última conexão: {formatDate(device.lastSeenAt)}</Muted></RowDetails>{device.revokedAt ? <Muted>Desvinculado</Muted> : <Button type="button" variant="outline" onClick={() => void revokeDevice(device.id)} disabled={busy === `revoke:${device.id}`}><Unlink size={16} />Desvincular</Button>}</DeviceRow>)}
          {!loading && !overview?.devices.length ? <Muted>Nenhum computador vinculado ainda.</Muted> : null}
        </DeviceList>
      </Panel>

      <Panel>
        <PanelHeader><PanelTitle>Destinos de impressão</PanelTitle><PanelDescription>Cada destino aponta para um computador e uma impressora específicos.</PanelDescription></PanelHeader>
        <DestinationGrid>
          {destinations.map((destination) => {
            const draft = drafts[destination.id];
            return <DestinationCard key={destination.id}>
              <div><strong>{destination.label}</strong><Muted>{destination.description}</Muted></div>
              <Field label="Computador e impressora"><Select value={printerChoice(draft.deviceId, draft.printerId)} disabled={loading} onChange={(event) => { const [deviceId, printerId] = event.target.value.split("|"); changeDraft(destination.id, { deviceId: deviceId ?? "", printerId: printerId ?? "" }); }}><option value="">Selecione uma impressora</option>{printerOptions.map((printer) => <option key={printer.id} value={printerChoice(printer.deviceId, printer.id)}>{printer.device?.name ?? "Computador removido"} — {printer.name}{printer.available ? "" : " (indisponível)"}</option>)}</Select></Field>
              <Field label="Vias"><Input type="number" min="1" max="5" value={draft.copies} onChange={(event) => changeDraft(destination.id, { copies: Math.min(5, Math.max(1, Number(event.target.value) || 1)) })} /></Field>
              <InlineField><input type="checkbox" checked={draft.automatic} onChange={(event) => changeDraft(destination.id, { automatic: event.target.checked })} />Imprimir automaticamente</InlineField>
              <Actions><Button type="button" variant="outline" onClick={() => void saveDestination(destination.id)} disabled={busy === `save:${destination.id}`}>Salvar</Button><Button type="button" onClick={() => void testDestination(destination.id)} disabled={busy === `test:${destination.id}` || !overview?.destinations.some((value) => value.destination === destination.id)}><Printer size={16} />Teste</Button></Actions>
            </DestinationCard>;
          })}
        </DestinationGrid>
      </Panel>

      <Panel>
        <PanelHeader><PanelTitle>Trabalhos recentes</PanelTitle><PanelDescription>Resultado aceito pelo sistema operacional não confirma impressão física.</PanelDescription></PanelHeader>
        <Actions><Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw size={16} />Atualizar</Button></Actions>
        <DeviceList>{jobs.map((job) => <DeviceRow key={job.id}><RowDetails><strong>{job.destination} · {job.status}</strong><Muted>{job.orderId ? `Pedido ${job.orderId}` : "Teste de impressão"} · {formatDate(job.createdAt)}</Muted></RowDetails><Button type="button" variant="outline" onClick={() => void reprint(job.id)} disabled={busy === `reprint:${job.id}`}><Printer size={16} />Reimprimir</Button></DeviceRow>)}{!loading && !jobs.length ? <Muted>Nenhum trabalho de impressão.</Muted> : null}</DeviceList>
        <Help>Se uma impressora estiver offline, seus trabalhos permanecem pendentes no computador configurado; outro computador não os consome.</Help>
      </Panel>
    </Root>
  );
}
