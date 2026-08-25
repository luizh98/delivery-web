"use client";

import { Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";

type OrderSummary = {
  status: string;
};

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
  __lastAdminOrderChimeAt?: number;
};

function playChime(audioContext: AudioContext) {
  const audioWindow = window as WindowWithWebkitAudio;
  const playedAt = Date.now();
  if (playedAt - (audioWindow.__lastAdminOrderChimeAt ?? 0) < 1_000) {
    return;
  }
  audioWindow.__lastAdminOrderChimeAt = playedAt;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const startAt = audioContext.currentTime;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, startAt);
  oscillator.frequency.setValueAtTime(1_174, startAt + 0.18);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(0.35, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.65);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + 0.65);
  oscillator.addEventListener("ended", () => {
    oscillator.disconnect();
    gain.disconnect();
  }, { once: true });
}

function getAudioErrorName(error: unknown) {
  if (error instanceof DOMException) {
    return error.name;
  }

  return error instanceof Error ? error.message : "erro desconhecido";
}

export function AdminOrderSoundNotifier() {
  const { showToast } = useToast();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(false);

  const playAlertSound = useCallback(() => {
    const audioContext = audioContextRef.current;

    if (!soundEnabledRef.current || !audioContext) {
      return;
    }

    void audioContext.resume()
      .then(() => {
        if (audioContext.state !== "running") {
          throw new DOMException("AudioContext suspenso", "NotAllowedError");
        }
        playChime(audioContext);
      })
      .catch(() => {
        soundEnabledRef.current = false;
        setSoundEnabled(false);
        showToast(
          "O navegador bloqueou o som. Clique em Ativar som no menu.",
          "error",
        );
      });
  }, [showToast]);

  async function activateSound() {
    try {
      const audioWindow = window as WindowWithWebkitAudio;
      const AudioContextConstructor = window.AudioContext
        ?? audioWindow.webkitAudioContext;

      if (!AudioContextConstructor) {
        throw new Error("recurso de áudio indisponível");
      }

      const currentContext = audioContextRef.current;
      const audioContext = currentContext && currentContext.state !== "closed"
        ? currentContext
        : new AudioContextConstructor();

      audioContextRef.current = audioContext;
      await audioContext.resume();

      if (audioContext.state !== "running") {
        throw new DOMException("AudioContext suspenso", "NotAllowedError");
      }

      soundEnabledRef.current = true;
      setSoundEnabled(true);
      playChime(audioContext);
      showToast("Som do admin ativado.");
    } catch (error) {
      soundEnabledRef.current = false;
      setSoundEnabled(false);
      showToast(
        `Não foi possível ativar o som (${getAudioErrorName(error)}).`,
        "error",
      );
    }
  }

  useEffect(() => {
    return () => {
      const audioContext = audioContextRef.current;
      audioContextRef.current = null;
      if (audioContext && audioContext.state !== "closed") {
        void audioContext.close();
      }
    };
  }, []);

  useEffect(() => {
    let active = true;
    let refreshing = false;

    async function refreshOrders() {
      if (refreshing) {
        return;
      }
      refreshing = true;

      try {
        const orders = await clientApi<OrderSummary[]>("admin/orders");
        if (!active) {
          return;
        }

        if (orders.some((order) => order.status === "RECEIVED")) {
          playAlertSound();
        }
      } catch {
        // Próximo ciclo tenta novamente sem interromper operação do admin.
      } finally {
        refreshing = false;
      }
    }

    void refreshOrders();
    const interval = window.setInterval(refreshOrders, 5_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [playAlertSound]);

  return (
    <Button
      type="button"
      variant="outline"
      onClick={activateSound}
      aria-label={soundEnabled ? "Som do admin ativo" : "Ativar som do admin"}
    >
      <Volume2 size={16} />
      {soundEnabled ? "Som ativo" : "Ativar som"}
    </Button>
  );
}
