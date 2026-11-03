"use client";

import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { ScannerDialog, ScannerVideo, Subtitle } from "./styles";
import type { PickupResult } from "./pickup";

type Props = { onScan: (value: string) => Promise<PickupResult>; onClose: () => void };

export function PickupQrScanner({ onScan, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const scan = useRef(onScan);
  useEffect(() => { scan.current = onScan; }, [onScan]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<PickupResult | null>(null);
  const retry = useRef(() => {});

  useEffect(() => {
    const previousFocus = document.activeElement;
    const currentDialog = dialog.current;
    currentDialog?.showModal();
    let disposed = false;
    let stream: MediaStream | undefined;
    let controls: { stop: () => void } | undefined;
    let processing = false;
    let lastCode = "";
    retry.current = () => { if (!processing) { lastCode = ""; setFeedback(null); } };
    const stop = () => {
      controls?.stop();
      stream?.getTracks().forEach((track) => track.stop());
    };
    const hide = () => { if (document.visibilityState === "hidden") onClose(); };
    document.addEventListener("visibilitychange", hide);
    void (async () => {
      try {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
          throw new Error("camera_unavailable");
        }
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        if (disposed) return;
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" } } });
        if (disposed) { stop(); return; }
        const reader = new BrowserQRCodeReader();
        controls = await reader.decodeFromStream(stream, video.current!, (result) => {
          if (!result || disposed || processing || lastCode === result.getText()) return;
          processing = true;
          lastCode = result.getText();
          setBusy(true);
          setFeedback(null);
          void scan.current(lastCode).then((response) => {
            if (!disposed) setFeedback(response);
          }).catch(() => {
            if (!disposed) setFeedback({ success: false, message: "Não foi possível confirmar o resultado. Confira seus pedidos e tente novamente." });
          }).finally(() => {
            processing = false;
            if (!disposed) setBusy(false);
          });
        });
        if (disposed) stop();
      } catch (cause) {
        stop();
        if (disposed) return;
        setError(cause instanceof DOMException && (cause.name === "NotAllowedError" || cause.name === "SecurityError")
          ? "Câmera bloqueada. Permita o acesso nas configurações do navegador e tente novamente. Você também pode usar a retirada manual."
          : "Não foi possível abrir a câmera. Confira se está disponível e se o site usa HTTPS. Você também pode usar a retirada manual.");
      }
    })();
    return () => {
      disposed = true;
      stop();
      document.removeEventListener("visibilitychange", hide);
      currentDialog?.close();
      queueMicrotask(() => {
        if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
      });
    };
  }, [onClose]);

  return (
    <ScannerDialog ref={dialog} onCancel={(event) => { event.preventDefault(); onClose(); }} aria-labelledby="pickup-qr-title" aria-describedby="pickup-qr-help">
      <h2 id="pickup-qr-title"><Camera size={20} aria-hidden="true" /> Ler QR Codes</h2>
      <Subtitle id="pickup-qr-help">Leia os cupons, um de cada vez. Cada leitura confirma a retirada e a saída do pedido. A câmera permanece aberta para o próximo.</Subtitle>
      {error ? <p role="alert">{error}</p> : <ScannerVideo ref={video} autoPlay muted playsInline aria-label="Câmera para leitura do QR Code" />}
      {busy ? <p role="status">Confirmando retirada… Aguarde antes de ler o próximo cupom.</p> : feedback ? <p role={feedback.success ? "status" : "alert"}>{feedback.message}{feedback.success ? " Aponte para o próximo cupom." : ""}</p> : !error ? <Subtitle role="status">Posicione o código inteiro na câmera, com boa iluminação.</Subtitle> : null}
      {feedback && !feedback.success && !busy ? <Button type="button" variant="outline" onClick={() => retry.current()}>Tentar este código novamente</Button> : null}
      <Button type="button" variant="outline" onClick={onClose} autoFocus><X size={16} aria-hidden="true" /> Fechar leitor</Button>
    </ScannerDialog>
  );
}
