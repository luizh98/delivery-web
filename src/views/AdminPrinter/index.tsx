"use client";

import { Download, ExternalLink, Printer, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Field, Select } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import {
  getSelectedPrinter,
  getQzErrorMessage,
  isBrowserPrintSelected,
  listLocalPrinters,
  printTextWithQz,
  setSelectedPrinter,
} from "@/services/printing/qz";
import {
  Actions,
  DownloadActions,
  DownloadLink,
  ErrorText,
  Help,
  Panel,
  PanelDescription,
  PanelHeader,
  PanelTitle,
  PathCode,
  Root,
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

export function AdminPrinterView() {
  const { showToast } = useToast();
  const [printers, setPrinters] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listLocalPrinters();
      const saved = getSelectedPrinter();
      const nextSelected = isBrowserPrintSelected()
        ? ""
        : saved && result.printers.includes(saved)
        ? saved
        : result.defaultPrinter && result.printers.includes(result.defaultPrinter)
          ? result.defaultPrinter
          : result.printers[0] ?? "";
      setPrinters(result.printers);
      setSelected(nextSelected);
      if (nextSelected && nextSelected !== saved) {
        setSelectedPrinter(nextSelected);
      }
    } catch (cause) {
      setError(getQzErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  function changePrinter(printer: string) {
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
      </Panel>
    </Root>
  );
}
