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
import { useAdminOrderEvents } from "@/components/AdminOrderEvents";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import type { OrderResponse, RestaurantConfigResponse } from "@/types/api";

const soundPreferenceKey = "delivery.admin.orderSoundEnabled";
const overdueOrderStatuses = ["RECEIVED", "CONFIRMED", "PREPARING"];
const receivedOrderSoundIntervalMs = 3_000;

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

function isOverdueOrder(
  order: OrderResponse,
  now: number,
  minutes: number,
) {
  if (!overdueOrderStatuses.includes(order.status)) {
    return false;
  }

  const receivedAt = order.statusHistory.find((history) => history.status === "RECEIVED")
    ?.changedAt ?? order.createdAt;
  const timestamp = receivedAt ? new Date(receivedAt).getTime() : Number.NaN;
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const orderDate = new Date(timestamp);
  const today = new Date(now);
  const isFromToday = orderDate.getFullYear() === today.getFullYear()
    && orderDate.getMonth() === today.getMonth()
    && orderDate.getDate() === today.getDate();

  return isFromToday && now - timestamp > minutes * 60_000;
}

export function AdminOrderSoundProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [soundEnabled, setSoundEnabledState] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const overdueAudioRef = useRef<HTMLAudioElement | null>(null);
  const soundEnabledRef = useRef(false);
  const knownOrderStatusesRef = useRef(
    new Map<string, OrderResponse["status"]>(),
  );
  const receivedOrderIdsRef = useRef(new Set<string>());
  const receivedOrderSoundIntervalRef = useRef<number | null>(null);
  const pendingSoundCountRef = useRef(0);
  const isPlayingSoundRef = useRef(false);
  const overduePendingSoundCountRef = useRef(0);
  const isPlayingOverdueSoundRef = useRef(false);
  const alertedOverdueOrderIdsRef = useRef(new Set<string>());
  const subscribeToOrderEvents = useAdminOrderEvents();

  const disableSound = useCallback(() => {
    audioRef.current?.pause();
    overdueAudioRef.current?.pause();
    soundEnabledRef.current = false;
    pendingSoundCountRef.current = 0;
    overduePendingSoundCountRef.current = 0;
    isPlayingSoundRef.current = false;
    isPlayingOverdueSoundRef.current = false;
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
      return false;
    }
    overduePendingSoundCountRef.current += 2;
    playNextOverdueSound();
    return true;
  }, [playNextOverdueSound]);

  useEffect(() => {
    let active = true;

    async function alertOverdueOrders() {
      try {
        const [config, orders] = await Promise.all([
          clientApi<RestaurantConfigResponse>("admin/restaurant/config"),
          clientApi<OrderResponse[]>(
            "admin/orders?status=RECEIVED&status=CONFIRMED&status=PREPARING",
          ),
        ]);
        if (!active || !config.overdueOrderAlertEnabled) {
          return;
        }

        const minutes = config.overdueOrderAlertMinutes ?? 30;
        orders.forEach((order) => {
          if (isOverdueOrder(order, Date.now(), minutes)
            && !alertedOverdueOrderIdsRef.current.has(order.id)
            && queueOverdueAlert()) {
            alertedOverdueOrderIdsRef.current.add(order.id);
          }
        });
      } catch {
        // Próxima consulta tenta novamente sem interromper alertas de novos pedidos.
      }
    }

    void alertOverdueOrders();
    const interval = window.setInterval(() => void alertOverdueOrders(), 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [queueOverdueAlert]);

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
      if (receivedOrderSoundIntervalRef.current !== null) {
        window.clearInterval(receivedOrderSoundIntervalRef.current);
        receivedOrderSoundIntervalRef.current = null;
      }
      audioRef.current = null;
      overdueAudioRef.current = null;
      pendingSoundCountRef.current = 0;
      overduePendingSoundCountRef.current = 0;
      isPlayingSoundRef.current = false;
      isPlayingOverdueSoundRef.current = false;
    };
  }, [handlePlaybackFailure, playNextOverdueSound, playNextSound]);

  useEffect(() => subscribeToOrderEvents((order) => {
    const previousStatus = knownOrderStatusesRef.current.get(order.id);
    if (previousStatus !== undefined
      || order.status === "RECEIVED"
      || order.status === "CONFIRMED") {
      knownOrderStatusesRef.current.set(order.id, order.status);
    }

    if (order.status === "RECEIVED") {
      receivedOrderIdsRef.current.add(order.id);
      if (previousStatus !== "RECEIVED") {
        queueAlertSounds(1);
      }
      if (receivedOrderSoundIntervalRef.current === null) {
        receivedOrderSoundIntervalRef.current = window.setInterval(() => {
          if (receivedOrderIdsRef.current.size > 0) {
            queueAlertSounds(1);
          }
        }, receivedOrderSoundIntervalMs);
      }
      return;
    }

    receivedOrderIdsRef.current.delete(order.id);
    if (receivedOrderIdsRef.current.size === 0
      && receivedOrderSoundIntervalRef.current !== null) {
      window.clearInterval(receivedOrderSoundIntervalRef.current);
      receivedOrderSoundIntervalRef.current = null;
    }

    if (order.status === "CONFIRMED" && previousStatus === undefined) {
      queueAlertSounds(1);
    }
  }), [queueAlertSounds, subscribeToOrderEvents]);

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
