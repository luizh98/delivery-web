"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";

const soundPreferenceKey = "delivery.admin.orderSoundEnabled";

type OrderSummary = {
  id: string;
  status: string;
  createdAt?: string;
};

type AdminOrderSoundContextValue = {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
};

const AdminOrderSoundContext = createContext<AdminOrderSoundContextValue | null>(
  null,
);

function getAudioErrorName(error: unknown) {
  if (error instanceof DOMException) {
    return error.name;
  }

  return error instanceof Error ? error.message : "erro desconhecido";
}

export function AdminOrderSoundProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [soundEnabled, setSoundEnabledState] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundEnabledRef = useRef(false);
  const knownOrderIdsRef = useRef<Set<string> | null>(null);
  const pendingSoundCountRef = useRef(0);
  const isPlayingSoundRef = useRef(false);

  const disableSound = useCallback(() => {
    soundEnabledRef.current = false;
    pendingSoundCountRef.current = 0;
    isPlayingSoundRef.current = false;
    setSoundEnabledState(false);
    window.localStorage.setItem(soundPreferenceKey, "false");
  }, []);

  const handlePlaybackFailure = useCallback((error: unknown) => {
    if (!soundEnabledRef.current) {
      return;
    }

    disableSound();
    showToast(
      `O navegador bloqueou o som (${getAudioErrorName(error)}). Ative novamente nas configurações.`,
      "error",
    );
  }, [disableSound, showToast]);

  const playNextSound = useCallback(() => {
    const audio = audioRef.current;

    if (!soundEnabledRef.current
      || !audio
      || isPlayingSoundRef.current
      || pendingSoundCountRef.current === 0) {
      return;
    }

    pendingSoundCountRef.current -= 1;
    isPlayingSoundRef.current = true;
    void audio.play().catch(handlePlaybackFailure);
  }, [handlePlaybackFailure]);

  const queueAlertSounds = useCallback((count: number) => {
    if (!soundEnabledRef.current || count <= 0) {
      return;
    }

    pendingSoundCountRef.current += count;
    playNextSound();
  }, [playNextSound]);

  const setSoundEnabled = useCallback(async (enabled: boolean) => {
    const audio = audioRef.current;

    if (!enabled) {
      audio?.pause();
      disableSound();
      return;
    }

    if (!audio) {
      showToast("Recurso de áudio indisponível.", "error");
      return;
    }

    try {
      isPlayingSoundRef.current = true;
      await audio.play();
      soundEnabledRef.current = true;
      setSoundEnabledState(true);
      window.localStorage.setItem(soundPreferenceKey, "true");
      showToast("Som do admin ativado.");
    } catch (error) {
      isPlayingSoundRef.current = false;
      disableSound();
      showToast(
        `Não foi possível ativar o som (${getAudioErrorName(error)}).`,
        "error",
      );
    }
  }, [disableSound, showToast]);

  useEffect(() => {
    const audio = new Audio("/sounds/new-order.mp3");
    audio.preload = "auto";
    audioRef.current = audio;

    const storedSoundEnabled = window.localStorage.getItem(soundPreferenceKey)
      === "true";
    soundEnabledRef.current = storedSoundEnabled;
    const preferenceTimeout = window.setTimeout(() => {
      setSoundEnabledState(storedSoundEnabled);
    }, 0);

    function finishSound() {
      isPlayingSoundRef.current = false;
      playNextSound();
    }

    function failSound() {
      isPlayingSoundRef.current = false;
      handlePlaybackFailure(
        new DOMException("Falha ao reproduzir áudio", "NotSupportedError"),
      );
    }

    audio.addEventListener("ended", finishSound);
    audio.addEventListener("error", failSound);

    return () => {
      window.clearTimeout(preferenceTimeout);
      audio.removeEventListener("ended", finishSound);
      audio.removeEventListener("error", failSound);
      audio.pause();
      audioRef.current = null;
      pendingSoundCountRef.current = 0;
      isPlayingSoundRef.current = false;
    };
  }, [handlePlaybackFailure, playNextSound]);

  useEffect(() => {
    let active = true;
    let refreshing = false;
    const monitoringStartedAt = Date.now();

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

        const hasReceivedOrder = orders.some(
          (order) => order.status === "RECEIVED",
        );

        if (!knownOrderIdsRef.current) {
          knownOrderIdsRef.current = new Set(orders.map((order) => order.id));
          const newOrdersSinceMonitoringStarted = orders.filter((order) => {
            const createdAt = order.createdAt ? Date.parse(order.createdAt) : Number.NaN;
            return Number.isFinite(createdAt) && createdAt >= monitoringStartedAt;
          });
          if (newOrdersSinceMonitoringStarted.length > 0) {
            queueAlertSounds(newOrdersSinceMonitoringStarted.length);
          } else if (hasReceivedOrder) {
            queueAlertSounds(1);
          }
          return;
        }

        const newOrders = orders.filter(
          (order) => !knownOrderIdsRef.current?.has(order.id),
        );
        orders.forEach((order) => knownOrderIdsRef.current?.add(order.id));

        if (newOrders.length > 0) {
          queueAlertSounds(newOrders.length);
        } else if (hasReceivedOrder) {
          queueAlertSounds(1);
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
  }, [queueAlertSounds]);

  const contextValue = useMemo(() => ({
    soundEnabled,
    setSoundEnabled,
  }), [setSoundEnabled, soundEnabled]);

  return (
    <AdminOrderSoundContext.Provider value={contextValue}>
      {children}
    </AdminOrderSoundContext.Provider>
  );
}

export function useAdminOrderSound() {
  const context = useContext(AdminOrderSoundContext);
  if (!context) {
    throw new Error("useAdminOrderSound must be used within AdminOrderSoundProvider");
  }
  return context;
}
