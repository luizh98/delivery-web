"use client";

import { Link2, RefreshCw, Unplug } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { clientApi } from "@/services/api/client";
import type { WhatsAppConnectionResponse } from "@/types/api";
import { WhatsAppMessages } from "./WhatsAppMessages";
import { connectionErrorMessage, loadMetaSDK, parseMetaSignupMessage, type MetaSDK, type MetaSignupMessage } from "./whatsappEmbeddedSignup";
import { ConnectionActions, ConnectionSurface, ErrorText, Muted } from "./styles";
import { openCentralSignup, type CentralSignupConfig } from "./whatsappCentralSignup";

type FinishedSignup = Extract<MetaSignupMessage, { wabaId: string }>;
type ActiveSignup = { code?: string; finished?: FinishedSignup; attempt: Promise<{ attemptId: string }>; submitting: boolean; central?: boolean };

export function WhatsAppConnection({ onChange, phoneSaved }: { onChange: (connection: WhatsAppConnectionResponse) => void; phoneSaved: boolean }) {
  const [connection, setConnection] = useState<WhatsAppConnectionResponse | null>(null);
  const [sdk, setSDK] = useState<MetaSDK | null>(null);
  const [centralOrigin, setCentralOrigin] = useState<string | null>(null);
  const centralAbort = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [messageRefresh, setMessageRefresh] = useState(0);
  const active = useRef<ActiveSignup | null>(null);
  const changeRef = useRef(onChange);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);
  const { requestConfirmation } = useConfirmation();

  useEffect(() => { changeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    mounted.current = true;
    void Promise.all([
      clientApi<WhatsAppConnectionResponse>("admin/whatsapp/connection"),
      fetch("/api/whatsapp-signup/config", { cache: "no-store" }).then(async response => {
        if (!response.ok) throw new Error("Configuração central indisponível");
        return await response.json() as CentralSignupConfig;
      }),
    ]).then(async ([result, central]) => {
        if (cancelled) return;
        setConnection(result);
        setCentralOrigin(central.origin);
        setLoading(false);
        if (result.provider.enabled && !central.origin) {
          try {
            const loaded = await loadMetaSDK(result.provider.appId, result.provider.apiVersion);
            if (!cancelled) setSDK(loaded);
          } catch {
            if (!cancelled) setError("O Facebook não terminou de carregar. Verifique extensões de privacidade ou bloqueadores, permita acesso a connect.facebook.net e recarregue a página.");
          }
        }
      }).catch(() => {
        if (!cancelled) { setLoading(false); setError("Não foi possível consultar o WhatsApp. Tente carregar novamente."); }
      });
    return () => {
      cancelled = true;
      mounted.current = false;
      active.current = null;
      centralAbort.current?.abort();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [reload]);

  useEffect(() => {
    async function finish(signup: ActiveSignup) {
      if (!signup.code || !signup.finished || signup.submitting || active.current !== signup) return;
      signup.submitting = true;
      setAuthorizing(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setNotice("Autorização recebida. Estamos preparando o número e as mensagens.");
      try {
        const attempt = await signup.attempt;
        if (active.current !== signup) return;
        const result = await clientApi<WhatsAppConnectionResponse>("admin/whatsapp/signup/complete", { method: "POST", body: JSON.stringify({ ...attempt, code: signup.code, ...signup.finished }) });
        if (!mounted.current) return;
        setConnection(result);
        changeRef.current(result);
        setNotice("WhatsApp conectado. Avisos dos pedidos ativados automaticamente. O envio depende da aprovação das mensagens e da cobrança na Meta.");
      } catch (failure) {
        if (mounted.current) setError(connectionErrorMessage(failure));
        // A partial server-side setup can be resumed by Atualizar status.
        if (mounted.current) {
          try { setConnection(await clientApi<WhatsAppConnectionResponse>("admin/whatsapp/connection")); } catch { /* Keep visible recovery controls. */ }
        }
      } finally {
        active.current = null;
        if (mounted.current) { setBusy(false); }
      }
    }
    const listener = (event: MessageEvent) => {
      const signup = active.current;
      if (!signup || signup.submitting || signup.central) return;
      const message = parseMetaSignupMessage(event.origin, event.data);
      if (!message) return;
      if ("wabaId" in message) { signup.finished = message; void finish(signup); }
      else {
        active.current = null;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setBusy(false);
        setNotice(message.event === "CANCEL" ? "Conexão cancelada. Você pode tentar novamente quando quiser." : "");
        if (message.event !== "CANCEL") setError(message.event === "UNSUPPORTED" ? "Esse tipo de migração precisa de suporte da plataforma antes de continuar." : "A Meta não concluiu a autorização. Tente novamente.");
      }
    };
    window.addEventListener("message", listener);
    // The SDK callback and message event can arrive in either order.
    finishRef.current = finish;
    return () => { window.removeEventListener("message", listener); finishRef.current = null; };
  }, []);

  const finishRef = useRef<((signup: ActiveSignup) => Promise<void>) | null>(null);

  function cancelSignup() {
    active.current = null;
    centralAbort.current?.abort();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setBusy(false);
    setNotice("Tentativa cancelada. Feche a janela da Meta, se estiver aberta, e tente novamente.");
  }

  function connect() {
    if ((!sdk && !centralOrigin) || !connection?.provider.enabled || active.current || !phoneSaved) return;
    setError(""); setNotice("Conclua a autorização na janela da Meta."); setAuthorizing(true); setBusy(true);
    const signup: ActiveSignup = { attempt: clientApi<{ attemptId: string }>("admin/whatsapp/signup", { method: "POST" }), submitting: false, central: !!centralOrigin };
    active.current = signup;
    // Handle rejection immediately even if the user leaves the popup open.
    void signup.attempt.catch((failure) => {
      if (active.current === signup && mounted.current) { active.current = null; centralAbort.current?.abort(); if (timeoutRef.current) clearTimeout(timeoutRef.current); setBusy(false); setNotice(""); setError(connectionErrorMessage(failure)); }
    });
    timeoutRef.current = setTimeout(() => {
      if (active.current === signup && !signup.submitting) { active.current = null; centralAbort.current?.abort(); setBusy(false); setNotice(""); setError("A autorização não foi concluída. Permita pop-ups e conecte novamente."); }
    }, 5 * 60 * 1000);
    try {
      if (centralOrigin) {
        const controller = new AbortController();
        centralAbort.current = controller;
        void openCentralSignup(centralOrigin, connection.provider, controller.signal).then(result => {
          if (active.current !== signup || signup.submitting || !mounted.current) return;
          if ("code" in result) { signup.code = result.code; signup.finished = result; void finishRef.current?.(signup); }
          else {
            active.current = null;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setBusy(false);
            setNotice(result.event === "CANCEL" ? "Conexão cancelada. Sua configuração atual foi preservada." : "");
            if (result.event !== "CANCEL") setError(result.event === "UNSUPPORTED" ? "Esse tipo de migração precisa de suporte da plataforma." : "A Meta não concluiu a autorização. Tente novamente.");
          }
        }).catch(() => {
          if (active.current !== signup || !mounted.current) return;
          active.current = null;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setBusy(false); setNotice(""); setError("A conexão não foi concluída. Tente novamente pelo painel.");
        });
        return;
      }
      // Launch synchronously in the click; awaiting the attempt would block popups.
      sdk!.login((response) => {
        if (active.current !== signup || signup.submitting) return;
        const code = response.authResponse?.code;
        if (code) { signup.code = code; void finishRef.current?.(signup); }
        else { active.current = null; setBusy(false); setNotice("Conexão cancelada. Sua configuração atual foi preservada."); if (timeoutRef.current) clearTimeout(timeoutRef.current); }
      }, { config_id: connection.provider.configId, response_type: "code", override_default_response_type: true, extras: { setup: {}, featureType: "whatsapp_business_app_onboarding", sessionInfoVersion: "3" } });
    } catch {
      active.current = null; setBusy(false); setNotice("");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setError("Não foi possível abrir a Meta. Permita pop-ups e tente novamente.");
    }
  }

  async function updateConnection(method: "POST" | "DELETE") {
    if (method === "DELETE" && !await requestConfirmation({ message: "Desconectar desativa os avisos e remove a autorização salva nesta plataforma. Seu número e sua conta na Meta serão mantidos.", confirmLabel: "Desconectar WhatsApp" })) return;
    setAuthorizing(false); setBusy(true); setError(""); setNotice("");
    try {
      const result = await clientApi<WhatsAppConnectionResponse>(method === "DELETE" ? "admin/whatsapp/connection" : "admin/whatsapp/connection/refresh", { method });
      setConnection(result); changeRef.current(result);
      setMessageRefresh((value) => value + 1);
      setNotice(method === "DELETE" ? "WhatsApp desconectado. Para revogar também o acesso na Meta, use as configurações da sua conta." : "Status atualizado.");
    } catch (failure) {
      setError(connectionErrorMessage(failure));
      try { setConnection(await clientApi<WhatsAppConnectionResponse>("admin/whatsapp/connection")); } catch { /* Keep the original error visible. */ }
    }
    finally { setBusy(false); }
  }

  const integration = connection?.integration;
  const embedded = integration?.source === "embedded_signup";
  const connected = integration?.tokenConfigured;

  return <ConnectionSurface aria-busy={busy || loading}>
    {loading ? <Muted role="status">Carregando conexão do WhatsApp…</Muted> : <>
      <div>
        <strong>{connected ? (embedded ? integration.displayPhone || "WhatsApp conectado" : "Conexão manual configurada") : "Conecte o número do restaurante"}</strong>
        <Muted>{connected ? "Edite cada mensagem abaixo e acompanhe a aprovação." : "Autorize na Meta. O número e as mensagens serão configurados aqui, sem copiar tokens."}</Muted>
      </div>
      {!connection?.provider.enabled && connection ? <Muted id="whatsapp-provider-help">A conexão automática está sendo preparada pela plataforma. A configuração avançada continua disponível.</Muted> : null}
      {!phoneSaved && connection?.provider.enabled ? <Muted>Salve o Celular do restaurante antes de conectar. Escolha esse mesmo número na Meta.</Muted> : null}
      {connection ? <WhatsAppMessages integration={connection.integration} connectionRevision={JSON.stringify([connected, integration?.templates, integration?.templateStatus, messageRefresh])} onUpdated={() => {
        void clientApi<WhatsAppConnectionResponse>("admin/whatsapp/connection").then((result) => { setConnection(result); changeRef.current(result); }).catch((failure) => setError(connectionErrorMessage(failure)));
      }} /> : null}
      {connection?.reconnectRequired ? <Muted role="status">O prazo de 24 horas da Meta para sincronizar o WhatsApp Business expirou. Atualizar o status não renova esse prazo. Fale com o suporte antes de remover ou reconectar o número no WhatsApp Business.</Muted> : connection?.pending ? <Muted>Autorização salva. Clique em Atualizar status para retomar a preparação do número e das mensagens.</Muted> : null}
      <ConnectionActions>
        <Button type="button" onClick={connect} disabled={busy || (!sdk && !centralOrigin) || !connection?.provider.enabled || !phoneSaved} aria-describedby={!connection?.provider.enabled ? "whatsapp-provider-help" : undefined}><Link2 size={18} aria-hidden="true" />{busy ? authorizing ? "Aguardando autorização na Meta…" : "Preparando WhatsApp…" : connected || connection?.reconnectRequired ? "Conectar novamente" : "Conectar WhatsApp"}</Button>
        {busy && authorizing ? <Button type="button" variant="outline" onClick={cancelSignup}>Cancelar conexão</Button> : null}
        {(embedded || connection?.pending) ? <Button type="button" variant="outline" disabled={busy || !connection?.provider.enabled || connection?.reconnectRequired} onClick={() => void updateConnection("POST")}><RefreshCw size={16} aria-hidden="true" /> Atualizar status</Button> : null}
        {(connected || connection?.pending) ? <Button type="button" variant="dangerText" disabled={busy} onClick={() => void updateConnection("DELETE")}><Unplug size={16} aria-hidden="true" /> Desconectar</Button> : null}
        {(!connection || (connection.provider.enabled && !sdk && !centralOrigin)) && error ? <Button type="button" variant="outline" onClick={() => {
          if (connection?.provider.enabled && !sdk && !centralOrigin) { window.location.reload(); return; }
          setError(""); setLoading(true); setReload((n) => n + 1);
        }}>{connection?.provider.enabled ? "Recarregar página" : "Carregar novamente"}</Button> : null}
      </ConnectionActions>
      <details><summary>Sobre a conexão com a Meta</summary>
      {integration?.coexistence ? <Muted>Coexistência ativa: continue atendendo pelo WhatsApp Business no celular. Para revogar a conexão na Meta, use Configurações → Conta → Plataforma comercial no aplicativo.</Muted> : null}
      <Muted>Na Meta, cadastre um número ou conecte seu WhatsApp Business existente para manter o atendimento no celular. Coexistência exige aplicativo Business atualizado e elegibilidade na Meta; WhatsApp comum não é compatível. Mantenha o aplicativo aberto durante a conexão. O FlyFoods não armazena seu histórico de conversas.</Muted>
      {embedded ? <Muted>A Meta decide a aprovação das mensagens. Configure a cobrança na sua conta e envie avisos apenas a clientes que autorizaram o contato.</Muted> : null}
      </details>
    </>}
    {notice ? <Muted role="status" aria-live="polite">{notice}</Muted> : null}
    {error ? <ErrorText role="alert">{error}</ErrorText> : null}
  </ConnectionSurface>;
}
