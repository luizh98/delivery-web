# Resultado dos upsells

Status: claimed
Data: 2026-10-14
Solicitação: planejar e executar com TLC Spec Driven e Impeccable; publicar em staging.

## Requisitos

- R1: relatório protegido por autenticação admin e tenant, com período de até 366 dias e campanha opcional.
- R2: mostrar unidades, pedidos com upsell, valor original, desconto registrado e valor vendido dos produtos, usando snapshots históricos. Somente pedidos COMPLETED compõem vendas. CANCELED e pedidos em andamento aparecem separados.
- R3: ranking por unidades ou valor vendido, tabela por campanha/produto com 10 linhas por página e evolução diária, inclusive dias sem venda.
- R4: participação nos pedidos concluídos e valor médio de upsell por pedido. Explicar que vendas não equivalem a lucro, descontos podem incluir promoção do produto e totais excluem adicionais, frete e cupons gerais.
- R5: loading sem mostrar dados de filtros antigos, erro com recuperação, estado vazio, filtros acessíveis, valores pt-BR, tema existente e mobile sem overflow da página.
- R6: testes financeiros e de isolamento, TypeScript/lint/build, inspeção desktop/mobile e publicação somente em origin/staging nos dois repositórios.

## Design e decisões

Extensão do admin existente, modo Operate. Entrada em Campanhas → Ver resultados; rota /admin/catalog/upsell/results. Resumo financeiro em faixa de dados, ranking em barras horizontais, tabela com rolagem local e evolução diária com gráfico existente. Sem dependências novas, migrações ou alteração de checkout.

API GET /api/admin/upsell-report reutiliza adminOnly, parseAdminDashboardQuery e consulta tenant/período. Agrupa snapshots por campaignId/productId, sem consultar preços atuais. Denominador da participação: todos os pedidos concluídos no período; filtro de campanha restringe numerador. Data é criação do pedido no fuso America/Sao_Paulo.

Dados legados: preço original ausente não é reconstruído do catálogo. Conta unidades sem preço original e oculta valor original/desconto de totais afetados na UI, mantendo valor vendido conhecido. Snapshot mantém campanhas removidas no histórico.

Fora de escopo: custo/margem, causalidade, eventos de exibição, comparação de períodos e exportação. Nenhuma alteração em produção ou dados reais.

## Verificação

Testar múltiplas quantidades/linhas, mesmo produto em campanhas diferentes, descontos, adicionais excluídos, cancelados/pendentes, filtro, fuso/dias vazios, valores zero e dados legados. Confirmar autenticação/tenant e datas inválidas. Validar estados/filtros/paginação no navegador com dados de teste explicitamente identificados.
