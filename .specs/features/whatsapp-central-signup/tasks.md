# Tarefas

Ferramentas aprovadas pelo usuário: Git/Node, Playwright, Easypanel. Execução sequencial.

- [x] T1 — Protocolo e configuração runtime: helper/testes, rota config, `.env.example`. Quatro testes Node, TypeScript e lint passaram.
- [x] T2 — Página central e integração no painel: 104 testes, TypeScript, lint, build Webpack e detector passaram. Navegador: duas origens, dois tenants via headers de fixture, coexistência e cadastro padrão em ordens diferentes; cancelamento e abertura direta; desktop/mobile sem overflow.
- [x] T3a — Configuração runtime de staging e documentação prontas; produção preservada.
- [x] T3b — Push funcional 7af5573 em staging; smoke direto após 60 segundos passou sem acompanhar deploy. Commits preservados na branch remota; remover worktree ao encerrar.

## Arquivos previstos

`src/views/AdminSettings/whatsappCentralSignup.ts` e `.test.mjs`; `src/app/api/whatsapp-signup/config/route.ts`; `src/app/(integrations)/layout.tsx`; `src/app/(integrations)/integrations/whatsapp/page.tsx`; `src/views/AdminSettings/WhatsAppSignupWindow.tsx`; `src/views/AdminSettings/WhatsAppConnection.tsx`; `next.config.ts`; `.env.example`; `docs/meta-tech-provider.md`; `.specs/features/whatsapp-central-signup/*`; `.specs/project/STATE.md`.
