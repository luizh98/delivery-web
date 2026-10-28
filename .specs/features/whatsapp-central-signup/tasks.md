# Tarefas

Ferramentas aprovadas pelo usuário: Git/Node, Playwright, Easypanel. Execução sequencial.

- [x] T1 — Protocolo e configuração runtime: helper/testes, rota config, `.env.example`. Quatro testes Node, TypeScript e lint passaram.
- [x] T2 — Página central e integração no painel: 104 testes, TypeScript, lint, build Webpack e detector passaram. Navegador: duas origens, dois tenants via headers de fixture, coexistência e cadastro padrão em ordens diferentes; cancelamento e abertura direta; desktop/mobile sem overflow.
- [ ] T3 — Configurar staging, documentar resultado e publicar. Preservar produção; push termina publicação; se smoke staging, esperar 60 segundos e testar diretamente, sem acompanhar deploy. Remover worktree após preservar commits.

## Arquivos previstos

`src/views/AdminSettings/whatsappCentralSignup.ts` e `.test.mjs`; `src/app/api/whatsapp-signup/config/route.ts`; `src/app/(integrations)/layout.tsx`; `src/app/(integrations)/integrations/whatsapp/page.tsx`; `src/views/AdminSettings/WhatsAppSignupWindow.tsx`; `src/views/AdminSettings/WhatsAppConnection.tsx`; `next.config.ts`; `.env.example`; `docs/meta-tech-provider.md`; `.specs/features/whatsapp-central-signup/*`; `.specs/project/STATE.md`.
