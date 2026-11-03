"use client";

import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { ScannerDialog, ScannerVideo, Subtitle } from "./styles";

type Props = { orderLabel: string; onScan: (value: string) => void; onClose: () => void };

export function PickupQrScanner({ orderLabel, onScan, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const scan = useRef(onScan);
  useEffect(() => { scan.current = onScan; }, [onScan]);
  const [error, setError] = useState("");

  useEffect(() => {
    const previousFocus = document.activeElement;
    const currentDialog = dialog.current;
    currentDialog?.showModal();
    let disposed = false;
    let stream: MediaStream | undefined;
    let controls: { stop: () => void } | undefined;
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
        controls = await reader.decodeFromStream(stream, video.current!, (result, _error, currentControls) => {
          if (!result || disposed) return;
          disposed = true;
          currentControls.stop();
          stop();
          scan.current(result.getText());
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
      <h2 id="pickup-qr-title"><Camera size={20} aria-hidden="true" /> Ler QR Code · pedido #{orderLabel}</h2>
      <Subtitle id="pickup-qr-help">Aponte para o QR Code no cupom deste pedido. A leitura confirma a retirada e a saída para entrega.</Subtitle>
      {error ? <p role="alert">{error}</p> : <ScannerVideo ref={video} autoPlay muted playsInline aria-label="Câmera para leitura do QR Code" />}
      {!error ? <Subtitle role="status">Posicione o código inteiro na câmera, com boa iluminação.</Subtitle> : null}
      <Button type="button" variant="outline" onClick={onClose} autoFocus><X size={16} aria-hidden="true" /> Cancelar leitura</Button>
    </ScannerDialog>
  );
}
