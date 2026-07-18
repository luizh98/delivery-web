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
import {
  Actions,
  Copy,
  Dialog,
  Header,
  IconWrap,
  Message,
  Overlay,
  Title,
} from "./styles";

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
        <Overlay
          role="presentation"
          onClick={() => closeConfirmation(false)}
        >
          <Dialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            onClick={(event) => event.stopPropagation()}
          >
            <Header>
              <IconWrap>
                <AlertTriangle size={22} />
              </IconWrap>
              <Copy>
                <Title id="confirmation-title">
                  Confirmacao
                </Title>
                <Message>{pendingConfirmation.message}</Message>
              </Copy>
            </Header>
            <Actions>
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
            </Actions>
          </Dialog>
        </Overlay>
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
