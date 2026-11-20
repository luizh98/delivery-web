# Tasks

Execução autorizada pelo pedido original. Ferramentas: RTK/shell/apply_patch, TLC, Impeccable e Wiser QCA. Sem delegação necessária.

- [x] T1 — Contrato API do atendimento: nome opcional e conta no caixa ao pedir fechamento. CLI-03/05/07. Go/Mongo: validação, fallback, isolamento, retry, indisponibilidade e auditoria aprovados. Commit API único para contrato e seus testes integrados.
- [x] T2 — Regressão de reabertura: consumo alterado gera nova conta; repetição do mesmo conteúdo não duplica. Teste aprovado.
- [x] T3 — Catálogo primeiro com fotos/editor/seleção final e recuperação de envio. CLI-01/02/03. 245 testes web, tipagem, lint/build e detector aprovados. Commit web próprio.
- [ ] T4 — Restrição financeira específica do cliente via configuração auditada e regressão de produção. CLI-04/06. Aplicar/testar em staging.
- [ ] T5 — Publicar staging; aguardar 60 s; QCA direto cobrindo CLI-01–08, desktop/mobile, histórico e limpeza. Sem evidências/vídeos. Atualizar estado e remover worktrees após preservar commits/docs.
