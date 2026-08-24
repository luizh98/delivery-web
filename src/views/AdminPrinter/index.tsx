"use client";

import { Printer, RefreshCw } from "lucide-react";
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
  ErrorText,
  Help,
  Panel,
  Root,
  Status,
  StatusDot,
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
