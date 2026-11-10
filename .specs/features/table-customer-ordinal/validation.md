# Validação — 2026-11-10

- 205 testes passaram, incluindo execução do JSX real CustomerNameRow com ordinal 47: TABLE mantém Mesa 01 sem badge/47; DELIVERY e PICKUP preservam ordinal/tooltip.
- TypeScript, ESLint nos arquivos alterados, git diff --check e build de produção passaram.
- API também validada: 490 testes com Mongo isolado, paridade cozinha/recibo, ausência de consulta ao histórico para mesa e regressões de auditoria/impressão.
- Nenhuma alteração de código nos checkouts compartilhados anteriores; nova worktree baseada em origin/staging.
- Sem teste físico de impressora ou inspeção pós-push. Documentos já enfileirados mantêm snapshot anterior. Publicação somente staging.
