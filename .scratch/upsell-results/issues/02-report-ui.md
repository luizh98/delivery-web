# Interface do relatório
Type: task
Status: resolved
Blocked by: 01
Requirements: R3, R4, R5

Adicionar tipos em src/types/api.ts, view em src/views/AdminUpsell/UpsellReport.tsx e estilos próprios, rota results/page.tsx e link em UpsellCampaignManager.tsx. Usar Button/Field e chart existentes; nenhuma dependência. Verificar cálculos de ordenação/paginação quando necessário, TypeScript, lint, build e desktop/mobile. Commit independente.

## Answer
UI completa, com leitura por teclado dos valores diários via tabela recolhível. 62 testes web, TypeScript, lint direcionado, build e QA de navegador aprovados. Revisão Impeccable aprovou visual e apontou ausência de alternativa acessível no chart compartilhado; correção local aplicada sem alterar dashboard. Desktop/mobile sem overflow. Leitor de tela real não testado.
