"use client";

import { AlertTriangle } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/Button";
import styles from "./styles.module.css";

type ConfirmationRequest = {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
};

type PendingConfirmation = Required<ConfirmationRequest> & {
  resolve: (confirmed: boolean) => void;
};

type ConfirmationContextValue = {
  requestConfirmation: (request: ConfirmationRequest) => Promise<boolean>;
};

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);

  const requestConfirmation = useCallback(
    (request: ConfirmationRequest) =>
      new Promise<boolean>((resolve) => {
        setPendingConfirmation({
          message: request.message,
          confirmLabel: request.confirmLabel ?? "Confirmar",
          cancelLabel: request.cancelLabel ?? "Cancelar",
          variant: request.variant ?? "danger",
          resolve,
        });
      }),
    [],
  );

  const closeConfirmation = useCallback(
    (confirmed: boolean) => {
      pendingConfirmation?.resolve(confirmed);
      setPendingConfirmation(null);
    },
    [pendingConfirmation],
  );

  const value = useMemo(() => ({ requestConfirmation }), [requestConfirmation]);

  return (
    <ConfirmationContext.Provider value={value}>
      {children}
      {pendingConfirmation ? (
        <div
          className={styles.overlay}
          role="presentation"
          onClick={() => closeConfirmation(false)}
        >
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.header}>
              <AlertTriangle className={styles.icon} size={22} />
              <div className={styles.copy}>
                <h2 id="confirmation-title" className={styles.title}>
                  Confirmacao
                </h2>
                <p className={styles.message}>{pendingConfirmation.message}</p>
              </div>
            </div>
            <div className={styles.actions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => closeConfirmation(false)}
              >
                {pendingConfirmation.cancelLabel}
              </Button>
              <Button
                type="button"
                variant={pendingConfirmation.variant}
                onClick={() => closeConfirmation(true)}
              >
                {pendingConfirmation.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation() {
  const context = useContext(ConfirmationContext);

  if (!context) {
    throw new Error("useConfirmation must be used within ConfirmationProvider");
  }

  return context;
}
