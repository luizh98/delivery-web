"use client";

import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { IconWrap, ToastRoot, Viewport } from "./styles";

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastVariant = "success" | "error" | "warning";

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
  setToastHost: (host: HTMLElement | null) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastHost, setToastHost] = useState<HTMLElement | null>(null);
  const timeouts = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismissToast = useCallback((id: number) => {
    const timeout = timeouts.current.get(id);

    if (timeout) {
      clearTimeout(timeout);
      timeouts.current.delete(id);
    }

    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = Date.now();

      setToasts((items) => [...items.slice(-2), { id, message, variant }]);
      timeouts.current.set(id, setTimeout(() => dismissToast(id), 3500));
    },
    [dismissToast],
  );

  useEffect(() => {
    const activeTimeouts = timeouts.current;

    return () => {
      activeTimeouts.forEach((timeout) => clearTimeout(timeout));
      activeTimeouts.clear();
    };
  }, []);

  const value = useMemo(() => ({ showToast, setToastHost }), [showToast]);

  const viewport = (
    <Viewport aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <ToastRoot key={toast.id} variant={toast.variant}>
          <IconWrap variant={toast.variant}>
            {toast.variant === "error" ? <AlertCircle size={18} /> : toast.variant === "warning" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          </IconWrap>
          <p>{toast.message}</p>
        </ToastRoot>
      ))}
    </Viewport>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toastHost ? createPortal(viewport, toastHost) : viewport}
    </ToastContext.Provider>
  );
}

// Native dialogs are above the page's z-index stack; host the shared toast inside them.
export function ToastHost() {
  const { setToastHost } = useToast();
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setToastHost(host.current);
    return () => setToastHost(null);
  }, [setToastHost]);
  return <div ref={host} style={{ display: "contents" }} />;
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
