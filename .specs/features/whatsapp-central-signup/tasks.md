# Tarefas

Ferramentas propostas ao usuário: Git/Node, Playwright, Easypanel. Execução sequencial.

- [x] T1 — Protocolo e configuração runtime: helper/testes, rota config, `.env.example`. Quatro testes Node, TypeScript e lint passaram.
- [ ] T2 — Página central e integração no painel: layout/página/view, WhatsAppConnection, headers. Verificar WCS-01/04 e regressão; TypeScript/lint/build e navegador em duas origens; commit próprio.
- [ ] T3 — Configurar staging, documentar resultado e publicar. Preservar produção; push termina publicação; se smoke staging, esperar 60 segundos e testar diretamente, sem acompanhar deploy. Remover worktree após preservar commits.

## Arquivos previstos

`src/views/AdminSettings/whatsappCentralSignup.ts` e `.test.mjs`; `src/app/api/whatsapp-signup/config/route.ts`; `src/app/(integrations)/layout.tsx`; `src/app/(integrations)/integrations/whatsapp/page.tsx`; `src/views/AdminSettings/WhatsAppCentralSignup.tsx`; `src/views/AdminSettings/WhatsAppConnection.tsx`; `next.config.ts`; `.env.example`; `docs/meta-tech-provider.md`; `.specs/features/whatsapp-central-signup/*`; `.specs/project/STATE.md`.
