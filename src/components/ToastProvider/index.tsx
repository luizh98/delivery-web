"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
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
import { cx } from "@/utils/classNames";
import styles from "./styles.module.css";

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastVariant = "success" | "error";

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
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

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={styles.viewport}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cx(
              styles.toast,
              toast.variant === "error" ? styles.error : styles.success,
            )}
          >
            {toast.variant === "error" ? (
              <AlertCircle className={styles.errorIcon} size={18} />
            ) : (
              <CheckCircle2 className={styles.successIcon} size={18} />
            )}
            <p>{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
