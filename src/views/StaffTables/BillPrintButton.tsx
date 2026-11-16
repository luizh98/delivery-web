"use client";

import { Printer } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/Button";
import { useToast } from "@/components/ToastProvider";
import { ApiError, clientApi } from "@/services/api/client";
import { staffApiMessage } from "./draft";

export function BillPrintButton({ tableId, sessionId, disabled }: { tableId: string; sessionId: string; disabled: boolean }) {
 const [busy, setBusy] = useState(false);
 const pending = useRef("");
 const sending = useRef(false);
 const { showToast } = useToast();
 async function print() {
  if (sending.current || disabled) return;
  sending.current = true; setBusy(true);
  pending.current ||= crypto.randomUUID();
  try {
   await clientApi(`admin/table-operations/${tableId}/print-bill`, { method:"POST", body:JSON.stringify({ sessionId, submissionId:pending.current }) });
   pending.current = "";
   showToast("Conferência enviada à impressora configurada.");
  } catch (cause) {
   if (cause instanceof ApiError && cause.status >= 400 && cause.status < 500) pending.current = "";
   showToast(staffApiMessage(cause, "Não foi possível confirmar a impressão. Tente novamente; a mesma solicitação não será duplicada."), "error");
  } finally { sending.current = false; setBusy(false); }
 }
 return <Button variant="outline" disabled={disabled || busy} onClick={() => void print()}><Printer size={18} aria-hidden="true" />{busy ? "Enviando impressão…" : "Imprimir conta"}</Button>;
}
