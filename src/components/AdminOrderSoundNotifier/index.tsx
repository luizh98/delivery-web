"use client";

import { Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";

type OrderSummary = {
  status: string;
};

function getAudioErrorName(error: unknown) {
  if (error instanceof DOMException) {
    return error.name;
  }

  return error instanceof Error ? error.message : "erro desconhecido";
}

export function AdminOrderSoundNotifier() {
  const { showToast } = useToast();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundEnabledRef = useRef(false);

  const playAlertSound = useCallback(() => {
    const audio = audioRef.current;

    if (!soundEnabledRef.current || !audio) {
      return;
    }

    void audio.play()
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
      const audio = audioRef.current ?? new Audio("/sounds/new-order.mp3");
      audioRef.current = audio;
      await audio.play();

      soundEnabledRef.current = true;
      setSoundEnabled(true);
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
      audioRef.current?.pause();
      audioRef.current = null;
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
