"use client";

import { Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";

type OrderSummary = {
  id: string;
};

export function AdminOrderSoundNotifier() {
  const { showToast } = useToast();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const knownOrderIdsRef = useRef<Set<string> | null>(null);
  const pendingSoundCountRef = useRef(0);
  const isPlayingSoundRef = useRef(false);

  const playNextSound = useCallback(() => {
    const audio = audioRef.current;

    if (!audio || isPlayingSoundRef.current || pendingSoundCountRef.current === 0) {
      return;
    }

    pendingSoundCountRef.current -= 1;
    isPlayingSoundRef.current = true;
    audio.currentTime = 0;

    void audio.play()
      .then(() => setSoundEnabled(true))
      .catch(() => {
        isPlayingSoundRef.current = false;
        pendingSoundCountRef.current = 0;
        showToast(
          "O navegador bloqueou o som. Clique em Ativar som no menu.",
          "error",
        );
      });
  }, [showToast]);

  function activateSound() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    isPlayingSoundRef.current = true;

    void audio.play()
      .then(() => {
        setSoundEnabled(true);
        showToast("Som do admin ativado.");
      })
      .catch(() => {
        isPlayingSoundRef.current = false;
        showToast("Não foi possível ativar o som neste navegador.", "error");
      });
  }

  useEffect(() => {
    const audio = new Audio("/sounds/new-order.mp3");
    audio.preload = "auto";
    audio.volume = 1;
    audioRef.current = audio;

    function finishSound() {
      isPlayingSoundRef.current = false;
      playNextSound();
    }

    audio.addEventListener("ended", finishSound);
    audio.addEventListener("error", finishSound);

    return () => {
      audio.removeEventListener("ended", finishSound);
      audio.removeEventListener("error", finishSound);
      audio.pause();
      audioRef.current = null;
    };
  }, [playNextSound]);

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

        if (!knownOrderIdsRef.current) {
          knownOrderIdsRef.current = new Set(orders.map((order) => order.id));
          return;
        }

        const newOrders = orders.filter(
          (order) => !knownOrderIdsRef.current?.has(order.id),
        );
        orders.forEach((order) => knownOrderIdsRef.current?.add(order.id));

        if (newOrders.length > 0) {
          pendingSoundCountRef.current += newOrders.length;
          playNextSound();
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
  }, [playNextSound]);

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
