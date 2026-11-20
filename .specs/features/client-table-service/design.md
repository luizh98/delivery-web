# Design

Modo Operate; preservar Plus Jakarta Sans, tokens por tenant, Button/Field/Dialog e layout operacional mobile-first existentes.

- Nova entrada `NewTableOrder`: catálogo primeiro, resumo da rodada ao lado no desktop e alternância no celular. Reutiliza ItemEditor, draftItemTotal, normalizeTablePhone e API auditada de lançamento. A seleção final ocorre em diálogo com mesa/comanda, contato, nome opcional e pessoas. Visita é carregada ao escolher destino; dados antigos não habilitam envio. Retentativa mantém corpo e chave imutáveis.
- `StaffTables`: mantém consulta de mesas, consumo, chamados e fechamento; acesso por botão Mesas e comandas. Qualquer produto abre editor, inclusive sem adicionais.
- `staffTableLaunch`: nome opcional com fallback legado e validação; dados seguem snapshot do pedido, produção e histórico existente.
- Extrair geração/enfileiramento da conferência de `staffTablePrintBill`; reutilizar no pedido de fechamento com chave derivada do chamado. Impressão automática não registra baixa nem encerra sessão. Erros retornam aviso explícito e permitem reimpressão existente.
- Auditoria: pedidos, sessões, sequências, chamados e print_jobs continuam usando contexto autenticado e Store.collection. Sem método Mongo novo.
- Pagamentos: usuário confirmou restrição específica do cliente; preservar configuração por tenant e desligar waiterCheckoutEnabled no staging Terraço via API auditada.

Arquivos: web StaffTables/{NewTableOrder,OrderDestination,index,styles,*.test}, types/api; API table_staff.go, table_bill_print.go e testes relacionados; configurações/permissões conforme resposta de escopo.
