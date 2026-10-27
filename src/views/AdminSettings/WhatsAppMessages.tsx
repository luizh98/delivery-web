"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, GripVertical, Pencil, RefreshCw, RotateCcw, Save, Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Field, Select, Textarea } from "@/components/Field";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { clientApi } from "@/services/api/client";
import { connectionErrorMessage } from "./whatsappEmbeddedSignup";
import { messageReviewStatus, messageStages, messageValidation, previewWhatsAppMessage, type MessageMode, type MessageStage, type WhatsAppMessagesResponse } from "./whatsappMessageEditor";
import { ConnectionActions, ErrorText, Muted } from "./styles";
import { MessageBody, MessageList, MessagePanel, MessagePreview, MessageToolbar, ParameterList } from "./whatsappMessageStyles";

const schema = z.object({ body: z.string().max(8192, "Rascunho muito longo.") });

export function WhatsAppMessages({ connectionRevision, onUpdated }: { connectionRevision: string; onUpdated: () => void }) {
  const [data, setData] = useState<WhatsAppMessagesResponse | null>(null);
  const [stage, setStage] = useState<MessageStage | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [mode, setMode] = useState<MessageMode>("delivery");
  const [reload, setReload] = useState(0);
  const selection = useRef({ start: 0, end: 0 });
  const { requestConfirmation } = useConfirmation();
  const { register, control, reset, setValue, handleSubmit, formState: { isDirty, errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { body: "" } });
  const body = useWatch({ control, name: "body" });

  useEffect(() => {
    let mounted = true;
    clientApi<WhatsAppMessagesResponse>("admin/whatsapp/messages").then((result) => { if (mounted) { setData(result); setError(""); } }).catch((failure) => { if (mounted) setError(connectionErrorMessage(failure)); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [connectionRevision, reload]);

  useEffect(() => {
    if (!isDirty) return;
    const preventLeave = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    let asking = false;
    const preventNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin === window.location.origin && destination.pathname === window.location.pathname && destination.search === window.location.search) return;
      event.preventDefault(); event.stopPropagation();
      if (asking) return;
      asking = true;
      void requestConfirmation({ message: "Há alterações não salvas nesta mensagem. Deseja sair e descartá-las?", confirmLabel: "Sair sem salvar" }).then((confirmed) => {
        if (confirmed) { window.removeEventListener("beforeunload", preventLeave); window.location.assign(destination.href); }
      }).finally(() => { asking = false; });
    };
    window.addEventListener("beforeunload", preventLeave);
    document.addEventListener("click", preventNavigation, true);
    return () => { window.removeEventListener("beforeunload", preventLeave); document.removeEventListener("click", preventNavigation, true); };
  }, [isDirty, requestConfirmation]);

  async function edit(next: MessageStage) {
    if (!data || busy || next === stage) return;
    if (isDirty && !await requestConfirmation({ message: "Há alterações não salvas nesta mensagem. Deseja descartá-las?", confirmLabel: "Descartar alterações" })) return;
    setStage(next); reset({ body: data.messages[next].draft }); setShowPreview(false); setError(""); setNotice("");
    selection.current = { start: data.messages[next].draft.length, end: data.messages[next].draft.length };
  }

  function insertParameter(key: string) {
    if (!stage || busy) return;
    const element = document.getElementById(`whatsapp-message-${stage}`);
    if (!(element instanceof HTMLTextAreaElement)) return;
    element.focus(); element.setSelectionRange(selection.current.start, selection.current.end);
    const token = `{{${key}}}`;
    // Native insertion keeps the browser's undo stack and selection behavior.
    if (!document.execCommand("insertText", false, token)) {
      element.setRangeText(token, element.selectionStart, element.selectionEnd, "end");
    }
    setValue("body", element.value, { shouldDirty: true, shouldValidate: true });
    selection.current = { start: element.selectionStart, end: element.selectionEnd };
  }

  async function save(action: "draft" | "submit" | "refresh") {
    if (!stage || !data || busy) return;
    setError(""); setNotice("");
    const validation = messageValidation(body, data.parameters);
    if (action === "submit" && validation) { setError(validation); return; }
    setBusy(true);
    try {
      const result = await clientApi<WhatsAppMessagesResponse>(`admin/whatsapp/messages/${stage}`, { method: action === "draft" ? "PUT" : "POST", body: JSON.stringify({ body, revision: data.revision, action }) });
      setData(result);
      if (action !== "refresh") reset({ body: result.messages[stage].draft });
      setNotice(action === "draft" ? "Rascunho salvo. A mensagem em uso não foi alterada." : action === "submit" ? "Mensagem enviada para análise. A versão aprovada continua em uso até a nova aprovação." : "Status atualizado. Versões aprovadas são ativadas automaticamente.");
      if (action !== "draft") onUpdated();
    } catch (failure) { setError(connectionErrorMessage(failure)); }
    finally { setBusy(false); }
  }

  const editor = stage && data?.messages[stage];
  const validation = data ? messageValidation(body, data.parameters) : "";
  const pending = editor && ["PENDING", "SUBMITTING", "SUBMISSION_UNCERTAIN"].includes(editor.candidate?.status ?? "");
  const selected = messageStages.find((item) => item.key === stage);

  return <MessagePanel aria-labelledby="whatsapp-messages-title" aria-busy={loading || busy}>
    <div><h3 id="whatsapp-messages-title">Mensagens dos pedidos</h3><Muted>Personalize o texto e escolha os dados de cada aviso. Alterações precisam da aprovação da Meta.</Muted></div>
    {loading ? <Muted role="status">Carregando mensagens…</Muted> : null}
    {data ? <>
      <MessageList aria-label="Mensagens de WhatsApp">
        {messageStages.map((item) => <li key={item.key}>
          <button type="button" onClick={() => void edit(item.key)} disabled={busy} aria-expanded={stage === item.key} aria-controls="whatsapp-message-editor">
            <span><strong>{item.label}</strong><small>{data.activeStatuses?.[item.key] === "APPROVED" ? "Versão aprovada em uso" : messageReviewStatus(data.activeStatuses?.[item.key])}{data.messages[item.key].candidate ? ` · Nova versão: ${messageReviewStatus(data.messages[item.key].candidate?.status)}` : ""}</small></span>
            <span><Pencil size={16} aria-hidden="true" /> Editar</span>
          </button>
        </li>)}
      </MessageList>
      {stage && editor ? <div id="whatsapp-message-editor">
        <MessageToolbar><h4>{selected?.label}</h4><span>{[...body].length}/1024 caracteres</span></MessageToolbar>
        <Muted>{selected?.description}</Muted>
        <Muted>O editor começa com uma sugestão. Salvar rascunho não muda a versão em uso.</Muted>
        <Field label="Mensagem" error={errors.body?.message}>
          <Textarea {...register("body")} id={`whatsapp-message-${stage}`} aria-label={`Mensagem: ${selected?.label}`} aria-describedby="whatsapp-message-help" rows={12} disabled={busy}
            onSelect={(event) => { selection.current = { start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd }; }}
            onDragOver={(event) => { if (event.dataTransfer.types.includes("text/plain")) event.dataTransfer.dropEffect = "copy"; }} />
        </Field>
        <div><strong>Inserir dados do pedido</strong><Muted id="whatsapp-message-help">Arraste um dado para o ponto desejado do texto ou clique para inserir no cursor. Você pode mover ou remover os dados no texto.</Muted></div>
        <ParameterList aria-label="Dados disponíveis">
          {data.parameters.map((parameter) => <button key={parameter.key} type="button" draggable={!busy} disabled={busy} onDragStart={(event) => { event.dataTransfer.setData("text/plain", `{{${parameter.key}}}`); event.dataTransfer.effectAllowed = "copy"; }} onClick={() => insertParameter(parameter.key)} title={`Inserir ${parameter.label}`}><GripVertical size={14} aria-hidden="true" />{parameter.label}</button>)}
        </ParameterList>
        {!body.includes("{{numero_pedido}}") ? <Muted>Sem o número do pedido, pode ficar mais difícil identificar este aviso.</Muted> : null}
        <ConnectionActions>
          <Button type="button" variant="outline" onClick={() => setShowPreview((value) => !value)} aria-expanded={showPreview} aria-controls="whatsapp-message-preview">{showPreview ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}{showPreview ? "Ocultar prévia" : "Prévia"}</Button>
          <Button type="button" variant="ghost" disabled={busy} onClick={() => {
            const element = document.getElementById(`whatsapp-message-${stage}`);
            if (element instanceof HTMLTextAreaElement) {
              element.focus(); element.select();
              if (!document.execCommand("insertText", false, data.defaults[stage])) element.setRangeText(data.defaults[stage], 0, element.value.length, "end");
              setValue("body", element.value, { shouldDirty: true });
            }
            setNotice("Sugestão restaurada apenas no editor. A versão em uso não foi alterada.");
          }}><RotateCcw size={16} aria-hidden="true" /> Restaurar sugestão</Button>
        </ConnectionActions>
        {showPreview ? <MessagePreview id="whatsapp-message-preview" aria-label="Prévia da mensagem">
          <MessageToolbar><h4>Prévia no WhatsApp</h4><Select value={mode} aria-label="Modalidade da prévia" onChange={(event) => setMode(event.target.value as MessageMode)}><option value="delivery">Entrega</option><option value="pickup">Retirada</option><option value="table">Mesa</option></Select></MessageToolbar>
          <Muted>Simulação com dados fictícios. Nada será enviado.</Muted>
          {validation ? <ErrorText role="status">{validation}</ErrorText> : <MessageBody>{previewWhatsAppMessage(body, data.parameters, mode)}</MessageBody>}
          <Muted>Quebras ficam no texto fixo. Dados como a lista de itens são enviados em uma linha, conforme limite dos parâmetros.</Muted>
        </MessagePreview> : null}
        {editor.candidate ? <Muted>Nova versão: {messageReviewStatus(editor.candidate.status)}. {data.activeStatuses?.[stage] === "APPROVED" ? "A versão aprovada continua em uso." : "Nenhuma versão aprovada está disponível para esta etapa."}</Muted> : null}
        {validation && !showPreview ? <Muted>{validation}</Muted> : null}
        {!data.connected ? <Muted>Conecte o WhatsApp pela Meta para salvar e enviar mensagens para aprovação. Você já pode editar e visualizar a sugestão.</Muted> : null}
        <ConnectionActions>
          <Button type="button" variant="outline" disabled={busy || !data.connected || !isDirty} onClick={() => void handleSubmit(() => save("draft"))()}><Save size={16} aria-hidden="true" /> Salvar rascunho</Button>
          <Button type="button" disabled={busy || !data.connected || !!validation || !!pending || editor.active?.body === body.trim()} onClick={() => void handleSubmit(() => save("submit"))()}><Send size={16} aria-hidden="true" /> {busy ? "Aguarde…" : "Enviar para aprovação"}</Button>
          {editor.candidate ? <Button type="button" variant="ghost" disabled={busy || !data.connected} onClick={() => void save("refresh")}><RefreshCw size={16} aria-hidden="true" /> Atualizar status</Button> : null}
        </ConnectionActions>
      </div> : null}
    </> : null}
    {notice ? <Muted role="status" aria-live="polite">{notice}</Muted> : null}
    {error ? <><ErrorText role="alert">{error}</ErrorText><Button type="button" variant="ghost" disabled={busy} onClick={() => { setReload((value) => value + 1); }}>Recarregar configuração</Button></> : null}
  </MessagePanel>;
}
