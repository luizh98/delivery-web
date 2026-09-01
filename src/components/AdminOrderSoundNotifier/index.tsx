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
  updatedAt?: string;
  statusHistory?: { status: string; changedAt: string }[];
};

type RestaurantAlertConfig = {
  overdueOrderAlertEnabled?: boolean;
  overdueOrderAlertMinutes?: number;
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
  const overdueAudioRef = useRef<HTMLAudioElement | null>(null);
  const soundEnabledRef = useRef(false);
  const knownOrderIdsRef = useRef<Set<string> | null>(null);
  const pendingSoundCountRef = useRef(0);
  const isPlayingSoundRef = useRef(false);
  const overduePendingSoundCountRef = useRef(0);
  const isPlayingOverdueSoundRef = useRef(false);
  const overdueEpisodesRef = useRef(new Map<string, string>());

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

  const playNextOverdueSound = useCallback(() => {
    const audio = overdueAudioRef.current;
    if (!soundEnabledRef.current || !audio || isPlayingOverdueSoundRef.current
      || overduePendingSoundCountRef.current === 0) {
      return;
    }
    overduePendingSoundCountRef.current -= 1;
    isPlayingOverdueSoundRef.current = true;
    void audio.play().catch(handlePlaybackFailure);
  }, [handlePlaybackFailure]);

  const queueOverdueAlert = useCallback(() => {
    if (!soundEnabledRef.current) {
      return;
    }
    overduePendingSoundCountRef.current += 2;
    playNextOverdueSound();
  }, [playNextOverdueSound]);

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
    const overdueAudio = new Audio("/sounds/overdue-order.mp3");
    audio.preload = "auto";
    overdueAudio.preload = "auto";
    audioRef.current = audio;
    overdueAudioRef.current = overdueAudio;

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

    function finishOverdueSound() {
      isPlayingOverdueSoundRef.current = false;
      playNextOverdueSound();
    }

    function failOverdueSound() {
      isPlayingOverdueSoundRef.current = false;
      handlePlaybackFailure(
        new DOMException("Falha ao reproduzir áudio de atraso", "NotSupportedError"),
      );
    }

    audio.addEventListener("ended", finishSound);
    audio.addEventListener("error", failSound);
    overdueAudio.addEventListener("ended", finishOverdueSound);
    overdueAudio.addEventListener("error", failOverdueSound);

    return () => {
      window.clearTimeout(preferenceTimeout);
      audio.removeEventListener("ended", finishSound);
      audio.removeEventListener("error", failSound);
      overdueAudio.removeEventListener("ended", finishOverdueSound);
      overdueAudio.removeEventListener("error", failOverdueSound);
      audio.pause();
      overdueAudio.pause();
      audioRef.current = null;
      overdueAudioRef.current = null;
      pendingSoundCountRef.current = 0;
      overduePendingSoundCountRef.current = 0;
      isPlayingSoundRef.current = false;
      isPlayingOverdueSoundRef.current = false;
    };
  }, [handlePlaybackFailure, playNextOverdueSound, playNextSound]);

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
        const [orders, config] = await Promise.all([
          clientApi<OrderSummary[]>("admin/orders"),
          clientApi<RestaurantAlertConfig>("admin/restaurant/config"),
        ]);
        if (!active) {
          return;
        }

        const hasReceivedOrder = orders.some(
          (order) => order.status === "RECEIVED",
        );

        const overdueMinutes = config.overdueOrderAlertMinutes ?? 30;
        const overdueStatuses = new Set(["RECEIVED", "CONFIRMED", "PREPARING"]);
        const now = Date.now();
        const overdueOrders = config.overdueOrderAlertEnabled
          ? orders.filter((order) => {
            if (!overdueStatuses.has(order.status)) return false;
            const enteredAt = order.statusHistory?.findLast(
              (history) => history.status === order.status,
            )?.changedAt;
            const timestamp = enteredAt ? Date.parse(enteredAt) : Number.NaN;
            return Number.isFinite(timestamp)
              && now - timestamp > overdueMinutes * 60_000;
          })
          : [];
        const currentOverdue = new Map(overdueOrders.map((order) => [order.id, order.status]));
        for (const [orderId, status] of overdueEpisodesRef.current) {
          if (currentOverdue.get(orderId) !== status) {
            overdueEpisodesRef.current.delete(orderId);
          }
        }
        overdueOrders.forEach((order) => {
          if (overdueEpisodesRef.current.get(order.id) !== order.status) {
            overdueEpisodesRef.current.set(order.id, order.status);
            queueOverdueAlert();
          }
        });

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
  }, [queueAlertSounds, queueOverdueAlert]);

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
