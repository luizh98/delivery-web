# Bloqueio também no admin — 2026-11-13

Correção de escopo após usuário conseguir fechar pelo admin. Substitui BILL-04 na parte que preservava fechamento da equipe com pedidos pendentes.

- BILL-05: ADMIN e WAITER também aguardam todos os pedidos COMPLETED/CANCELED antes de solicitar fechamento, receber nova baixa ou encerrar. READY ainda não foi entregue. SERVICE e reabertura sem baixa preservados.
- BILL-06: Encerramento sem recebimento e endpoints legados também bloqueiam pendência. Não cancelar nem concluir pedidos implicitamente ao fechar. Cancelamento de item/rodada permanece ação explícita com motivo.
- BILL-07: Conta antiga já em CLOSING com pendências bloqueia nova baixa e encerramento, inclusive se quitada. Consulta/retry de pagamento já confirmado permanece idempotente.
- BILL-08: Rejeições não gravam pedido, sessão, chamado, baixa ou auditoria. Operações aceitas conservam autoria ADMIN/WAITER, tenant, origem/hall, diferenças e ocultação de segredos.

Plano atômico: API compartilhada + regressões/auditoria; tela e textos + regressões; publicação staging + QCA admin com evidências, após60s e sem consultar deploy.

Reprodução antes da correção: teste de checkout falhou por disabled=false com RECEIVED. Testes Mongo atravessaram handlers reais e reproduziram request-bill200 e payments201 com pendência. Regra originalmente só estava na entrada pública; settle aceitava READY; force-close cancelava pendências.
