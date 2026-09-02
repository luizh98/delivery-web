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

const soundPreferenceKey = "delivery.admin.orderSoundEnabled";

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
  const knownOrderIdsRef = useRef(new Set<string>());
  const pendingSoundCountRef = useRef(0);
  const isPlayingSoundRef = useRef(false);
  const overduePendingSoundCountRef = useRef(0);
  const isPlayingOverdueSoundRef = useRef(false);
  const alertedOverdueOrderIdsRef = useRef(new Set<string>());
  const subscribeToOrderEvents = useAdminOrderEvents();

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
    overduePendingSoundCountRef.current += 1;
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

  useEffect(() => subscribeToOrderEvents((order) => {
    if (order.status !== "RECEIVED" || knownOrderIdsRef.current.has(order.id)) {
      return;
    }
    knownOrderIdsRef.current.add(order.id);
    queueAlertSounds(1);
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
