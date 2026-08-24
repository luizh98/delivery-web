"use client";

import { Download, ExternalLink, Printer, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Field, Select } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import {
  getSelectedPrinter,
  getQzErrorMessage,
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
  SecurityNote,
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
      const nextSelected = saved && result.printers.includes(saved)
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
    showToast("Impressora padrão salva neste computador");
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
        <Subtitle>Escolha a impressora usada pelos pedidos neste computador.</Subtitle>
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

        <SecurityNote>
          Este download contém somente o certificado público. A chave privada permanece protegida no servidor.
        </SecurityNote>
      </Panel>

      <Panel>
        <PanelHeader>
          <PanelTitle>Impressora deste computador</PanelTitle>
          <PanelDescription>
            A seleção fica salva apenas neste navegador e não altera outros caixas.
          </PanelDescription>
        </PanelHeader>

        <Status>
          <StatusDot connected={!error && !loading} />
          {loading ? "Conectando ao QZ Tray..." : error ? "QZ Tray desconectado" : "QZ Tray conectado"}
        </Status>

        {error ? <ErrorText>{error}</ErrorText> : null}

        <Field label="Impressora padrão">
          <Select
            value={selected}
            disabled={loading || printers.length === 0}
            onChange={(event) => changePrinter(event.target.value)}
          >
            {printers.length === 0 ? <option value="">Nenhuma impressora encontrada</option> : null}
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
          O QZ Tray precisa estar aberto neste computador. A impressora escolhida fica salva somente
          neste navegador, evitando que a configuração de um caixa altere a de outro.
        </Help>
      </Panel>
    </Root>
  );
}
