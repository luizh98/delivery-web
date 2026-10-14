# Estado — upsell results

Concluído em 2026-10-14. Requisitos R1–R6 verificados e feature publicada somente em staging.

Atualização 2026-10-14: filtro de período extraído para src/components/DateRangeFilter e adotado em todas as telas operacionais que tinham filtro por período. Upsells usa select de presets e aplicação direta, com Este mês inicial. 64 testes, TypeScript, build e navegador aprovados; ajuste c5c944a publicado e validado nas cinco telas da staging. Issue 04 registra escopo/evidências. Dois erros preexistentes de lint em effects do dashboard preservados.

Decisões: snapshots históricos, somente COMPLETED nas vendas, cancelados/pendentes separados, valores dos produtos sem adicionais/frete/cupom geral, campanha/período de até 366 dias, fuso Brasília por criação. Preços originais ausentes sinalizados. Sem migração ou dependência nova.

API: ../delivery-api/internal/app/upsell_report.go (checkout isolado .upsell-report-api), commit 3a77d53. Web: src/views/AdminUpsell/UpsellReport.tsx, commit 8383067. Plano/spec/issues/evidências neste diretório. Revisão Impeccable aprovou visual; alternativa textual diária corrigida.

Verificação: 254 testes Go, vet, 62 testes web, TypeScript/lint/build, detector, QA fixtures e smoke autenticado API/browser staging. Mongo local e leitor de tela real não testados; banco staging validado por leitura.

Adiado: custos/margem, exibições/conversão, comparação entre períodos e exportação. Histórico sem campaignId não permite atribuição retroativa. Alterações locais anteriores no checkout principal preservadas.
