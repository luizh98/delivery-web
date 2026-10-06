"use client";

import { CheckCircle2, Clock3, ExternalLink, Link2, RefreshCw, Unplug } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { clientApi } from "@/services/api/client";
import type { WhatsAppConnectionResponse } from "@/types/api";
import { connectionErrorMessage, loadMetaSDK, parseMetaSignupMessage, templateStatusLabel, type MetaSDK, type MetaSignupMessage } from "./whatsappEmbeddedSignup";
import { ConnectionActions, ConnectionSteps, ConnectionSurface, ErrorText, Muted } from "./styles";

type FinishedSignup = Extract<MetaSignupMessage, { event: "FINISH" }>;
type ActiveSignup = { code?: string; finished?: FinishedSignup; attempt: Promise<{ attemptId: string }>; submitting: boolean };

export function WhatsAppConnection({ onChange, phoneSaved }: { onChange: (connection: WhatsAppConnectionResponse) => void; phoneSaved: boolean }) {
  const [connection, setConnection] = useState<WhatsAppConnectionResponse | null>(null);
  const [sdk, setSDK] = useState<MetaSDK | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const active = useRef<ActiveSignup | null>(null);
  const changeRef = useRef(onChange);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);
  const { requestConfirmation } = useConfirmation();

  useEffect(() => { changeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    mounted.current = true;
    void clientApi<WhatsAppConnectionResponse>("admin/whatsapp/connection")
      .then(async (result) => {
        if (cancelled) return;
        setConnection(result);
        setLoading(false);
        if (result.provider.enabled) {
          try {
            const loaded = await loadMetaSDK(result.provider.appId, result.provider.apiVersion);
            if (!cancelled) setSDK(loaded);
          } catch {
            if (!cancelled) setError("Não foi possível carregar a conexão com a Meta. Permita o acesso ao Facebook no navegador e tente novamente.");
          }
        }
      }).catch(() => {
        if (!cancelled) { setLoading(false); setError("Não foi possível consultar o WhatsApp. Tente carregar novamente."); }
      });
    return () => {
      cancelled = true;
      mounted.current = false;
      active.current = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [reload]);

  useEffect(() => {
    async function finish(signup: ActiveSignup) {
      if (!signup.code || !signup.finished || signup.submitting || active.current !== signup) return;
      signup.submitting = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setNotice("Autorização recebida. Estamos preparando o número e as mensagens.");
      try {
        const attempt = await signup.attempt;
        if (active.current !== signup) return;
        const result = await clientApi<WhatsAppConnectionResponse>("admin/whatsapp/signup/complete", { method: "POST", body: JSON.stringify({ ...attempt, code: signup.code, ...signup.finished }) });
        if (!mounted.current) return;
        setConnection(result);
        changeRef.current(result);
        setNotice("WhatsApp conectado. Confira a aprovação das mensagens e a cobrança antes de ativar os avisos.");
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
      if (!signup || signup.submitting) return;
      const message = parseMetaSignupMessage(event.origin, event.data);
      if (!message) return;
      if (message.event === "FINISH") { signup.finished = message; void finish(signup); }
      else {
        active.current = null;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setBusy(false);
        setNotice(message.event === "CANCEL" ? "Conexão cancelada. Você pode tentar novamente quando quiser." : "");
        if (message.event !== "CANCEL") setError(message.event === "UNSUPPORTED" ? "Esse número precisa de um fluxo de coexistência ou migração. Fale com o suporte da plataforma antes de continuar." : "A Meta não concluiu a autorização. Tente novamente.");
      }
    };
    window.addEventListener("message", listener);
    // The SDK callback and message event can arrive in either order.
    finishRef.current = finish;
    return () => { window.removeEventListener("message", listener); finishRef.current = null; };
  }, []);

  const finishRef = useRef<((signup: ActiveSignup) => Promise<void>) | null>(null);

  function connect() {
    if (!sdk || !connection?.provider.enabled || active.current || !phoneSaved) return;
    setError(""); setNotice("Conclua a autorização na janela da Meta."); setBusy(true);
    const signup: ActiveSignup = { attempt: clientApi<{ attemptId: string }>("admin/whatsapp/signup", { method: "POST" }), submitting: false };
    active.current = signup;
    // Handle rejection immediately even if the user leaves the popup open.
    void signup.attempt.catch((failure) => {
      if (active.current === signup && mounted.current) { active.current = null; setBusy(false); setNotice(""); setError(connectionErrorMessage(failure)); }
    });
    timeoutRef.current = setTimeout(() => {
      if (active.current === signup && !signup.submitting) { active.current = null; setBusy(false); setNotice(""); setError("A autorização não foi concluída. Permita pop-ups e conecte novamente."); }
    }, 5 * 60 * 1000);
    try {
      // Launch synchronously in the click; awaiting the attempt would block popups.
      sdk.login((response) => {
        if (active.current !== signup || signup.submitting) return;
        const code = response.authResponse?.code;
        if (code) { signup.code = code; void finishRef.current?.(signup); }
        else { active.current = null; setBusy(false); setNotice("Conexão cancelada. Sua configuração atual foi preservada."); if (timeoutRef.current) clearTimeout(timeoutRef.current); }
      }, { config_id: connection.provider.configId, response_type: "code", override_default_response_type: true, extras: { setup: {} } });
    } catch {
      active.current = null; setBusy(false); setNotice("");
      setError("Não foi possível abrir a Meta. Permita pop-ups e tente novamente.");
    }
  }

  async function updateConnection(method: "POST" | "DELETE") {
    if (method === "DELETE" && !await requestConfirmation({ message: "Desconectar desativa os avisos e remove a autorização salva nesta plataforma. Seu número e sua conta na Meta serão mantidos.", confirmLabel: "Desconectar WhatsApp" })) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await clientApi<WhatsAppConnectionResponse>(method === "DELETE" ? "admin/whatsapp/connection" : "admin/whatsapp/connection/refresh", { method });
      setConnection(result); changeRef.current(result);
      setNotice(method === "DELETE" ? "WhatsApp desconectado. Para revogar também o acesso na Meta, use as configurações da sua conta." : "Status atualizado.");
    } catch (failure) { setError(connectionErrorMessage(failure)); }
    finally { setBusy(false); }
  }

  const integration = connection?.integration;
  const embedded = integration?.source === "embedded_signup";
  const connected = integration?.tokenConfigured;

  return <ConnectionSurface aria-busy={busy || loading}>
    {loading ? <Muted role="status">Carregando conexão do WhatsApp…</Muted> : <>
      <div>
        <strong>{connected ? (embedded ? integration.displayPhone || "WhatsApp conectado" : "Conexão manual configurada") : "Conecte o número do restaurante"}</strong>
        <Muted>{connected ? "Acompanhe as mensagens e ative os avisos quando tudo estiver pronto." : "Autorize na Meta. O número e as mensagens serão configurados aqui, sem copiar tokens."}</Muted>
      </div>
      {!connection?.provider.enabled && connection ? <Muted id="whatsapp-provider-help">A conexão automática está sendo preparada pela plataforma. A configuração avançada continua disponível.</Muted> : null}
      {!phoneSaved && connection?.provider.enabled ? <Muted>Salve o Celular do restaurante antes de conectar. Escolha esse mesmo número na Meta.</Muted> : null}
      {embedded ? <ConnectionSteps aria-label="Preparação do WhatsApp">
        <li><span>{integration.registered ? <CheckCircle2 size={18} aria-hidden="true" /> : <Clock3 size={18} aria-hidden="true" />} Número do restaurante</span><span>{integration.status === "revoked" ? "Conecte novamente" : integration.registered ? "Registrado" : "Registro pendente"}</span></li>
        {([ ["production", "Pedido em preparação"], ["delivery", "Saiu para entrega"], ["completed", "Pedido concluído"] ] as const).map(([stage, label]) => <li key={stage}><span>{integration.templateStatus?.[stage] === "APPROVED" ? <CheckCircle2 size={18} aria-hidden="true" /> : <Clock3 size={18} aria-hidden="true" />} {label}</span><span>{templateStatusLabel(integration.templateStatus?.[stage])}</span></li>)}
        <li><span><ExternalLink size={18} aria-hidden="true" /> Cobrança do WhatsApp</span><a href="https://business.facebook.com/wa/manage/" target="_blank" rel="noopener noreferrer">Configurar na Meta <ExternalLink size={14} aria-hidden="true" /></a></li>
      </ConnectionSteps> : null}
      {connection?.pending ? <Muted>Autorização salva. Clique em Atualizar status para retomar a preparação do número e das mensagens.</Muted> : null}
      <ConnectionActions>
        <Button type="button" onClick={connect} disabled={busy || !sdk || !connection?.provider.enabled || !phoneSaved} aria-describedby={!connection?.provider.enabled ? "whatsapp-provider-help" : undefined}><Link2 size={18} aria-hidden="true" />{busy ? "Aguarde…" : connected ? "Conectar novamente" : "Conectar WhatsApp"}</Button>
        {(embedded || connection?.pending) ? <Button type="button" variant="outline" disabled={busy || !connection?.provider.enabled} onClick={() => void updateConnection("POST")}><RefreshCw size={16} aria-hidden="true" /> Atualizar status</Button> : null}
        {(connected || connection?.pending) ? <Button type="button" variant="dangerText" disabled={busy} onClick={() => void updateConnection("DELETE")}><Unplug size={16} aria-hidden="true" /> Desconectar</Button> : null}
        {(!connection || (connection.provider.enabled && !sdk)) && error ? <Button type="button" variant="outline" onClick={() => { setError(""); setLoading(true); setReload((n) => n + 1); }}>Carregar novamente</Button> : null}
      </ConnectionActions>
      {!connected ? <details><summary>Meu número já usa WhatsApp Business</summary><Muted>Manter o aplicativo e conectar a API no mesmo número exige coexistência, que ainda não está disponível aqui. Fale com o suporte para configurar seu caso.</Muted></details> : null}
      {embedded ? <Muted>A Meta decide a aprovação das mensagens. Configure a cobrança na sua conta e envie avisos apenas a clientes que autorizaram o contato.</Muted> : null}
    </>}
    {notice ? <Muted role="status" aria-live="polite">{notice}</Muted> : null}
    {error ? <ErrorText role="alert">{error}</ErrorText> : null}
  </ConnectionSurface>;
}
