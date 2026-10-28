"use client";

import { Link2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { loadMetaSDK, parseMetaSignupMessage, type MetaSDK, type MetaSignupMessage } from "./whatsappEmbeddedSignup";
import { centralSignupContext, validSignupProvider, type CentralSignupConfig, type CentralSignupResult, type SignupProvider } from "./whatsappCentralSignup";

type Session = { origin: string; state: string; opener: Window; provider?: SignupProvider; started: boolean; done: boolean; code?: string; finished?: Extract<MetaSignupMessage, { wabaId: string }> };

export function WhatsAppSignupWindow({ config }: { config: CentralSignupConfig }) {
  const [sdk, setSDK] = useState<MetaSDK | null>(null);
  const [status, setStatus] = useState("Verificando sua solicitação…");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const session = useRef<Session | null>(null);
  const fragment = useRef<string | null>(null);

  const notify = useCallback((result: CentralSignupResult) => {
    const current = session.current;
    if (!current || current.done) return;
    current.done = true;
    if (!current.opener.closed) current.opener.postMessage({ type: "FLYFOODS_WHATSAPP_RESULT", state: current.state, result }, current.origin);
  }, []);

  const finish = useCallback(() => {
    const current = session.current;
    if (current?.code && current.finished) {
      notify({ ...current.finished, code: current.code });
      setStatus("Autorização enviada. Continue no painel do restaurante.");
    }
  }, [notify]);

  useEffect(() => {
    let disposed = false;
    fragment.current ??= window.location.hash;
    const context = centralSignupContext(fragment.current, config);
    window.history.replaceState(null, "", window.location.pathname);
    if (!context || !window.opener || window.opener.closed || config.origin !== window.location.origin || window.top !== window.self) {
      queueMicrotask(() => { if (!disposed) setError("Abra esta conexão pelo botão Conectar WhatsApp nas configurações do restaurante."); });
      return () => { disposed = true; };
    }
    const current: Session = { ...context, opener: window.opener, started: false, done: false };
    session.current = current;
    const receive = (event: MessageEvent) => {
      if (current.done) return;
      if (!current.provider && event.source === current.opener && event.origin === current.origin && event.data?.type === "FLYFOODS_WHATSAPP_INIT" && event.data.state === current.state && validSignupProvider(event.data.provider)) {
        current.provider = event.data.provider;
        setStatus("Conecte o número do restaurante pela Meta. Mantenha o painel original aberto.");
        void loadMetaSDK(current.provider!.appId, current.provider!.apiVersion).then(loaded => { if (!disposed) setSDK(loaded); }).catch(() => {
          if (!disposed) { setError("Não foi possível carregar o Facebook. Verifique bloqueadores e tente novamente pelo painel."); notify({ event: "ERROR" }); }
        });
      }
      if (!current.started) return;
      const message = parseMetaSignupMessage(event.origin, event.data);
      if (!message) return;
      if ("wabaId" in message) { current.finished = message; finish(); }
      else { notify(message); setStatus("Conexão encerrada. Continue no painel do restaurante."); }
    };
    const leaving = () => notify({ event: "CANCEL" });
    const timeout = setTimeout(() => { setError("A solicitação expirou. Inicie uma nova conexão pelo painel do restaurante."); notify({ event: "ERROR" }); }, 5 * 60 * 1000);
    window.addEventListener("message", receive);
    window.addEventListener("pagehide", leaving);
    current.opener.postMessage({ type: "FLYFOODS_WHATSAPP_READY", state: current.state }, current.origin);
    return () => { disposed = true; current.done = true; clearTimeout(timeout); window.removeEventListener("message", receive); window.removeEventListener("pagehide", leaving); };
  }, [config, finish, notify]);

  function connect() {
    const current = session.current;
    if (!sdk || !current?.provider || current.started || current.done) return;
    current.started = true;
    setBusy(true);
    setStatus("Conclua a autorização na janela da Meta. Para manter o WhatsApp Business no celular, escolha conectar sua conta existente.");
    try {
      sdk.login(response => {
        if (current.done) return;
        if (response.authResponse?.code) { current.code = response.authResponse.code; finish(); }
        else { notify({ event: "CANCEL" }); setStatus("Conexão cancelada. Continue no painel do restaurante."); }
      }, { config_id: current.provider.configId, response_type: "code", override_default_response_type: true, extras: { setup: {}, featureType: "whatsapp_business_app_onboarding", sessionInfoVersion: "3" } });
    } catch { setError("Não foi possível abrir a Meta. Permita pop-ups e tente novamente pelo painel."); notify({ event: "ERROR" }); }
  }

  return <main className="mx-auto flex min-h-svh max-w-lg flex-col justify-center gap-6 px-6 py-10">
    <div className="flex items-center gap-3 text-primary"><Link2 size={28} aria-hidden="true" /><span className="font-semibold">FlyFoods</span></div>
    <div className="space-y-3"><h1 className="text-2xl font-semibold">Conectar WhatsApp</h1><p role="status" aria-live="polite" className="text-muted">{status}</p></div>
    {error ? <p role="alert" className="text-foreground">{error}</p> : null}
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={connect} disabled={!sdk || busy || !!error}><Link2 size={18} aria-hidden="true" />Continuar na Meta</Button>
      <Button type="button" variant="outline" onClick={() => { notify({ event: "CANCEL" }); window.close(); }}><X size={18} aria-hidden="true" />Cancelar</Button>
    </div>
    <p className="text-sm text-muted">A conexão será concluída no painel do restaurante. Seus dados de acesso permanecem protegidos.</p>
  </main>;
}
