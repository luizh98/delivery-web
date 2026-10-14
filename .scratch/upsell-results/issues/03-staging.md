# Publicar e validar staging
Type: task
Status: resolved
Blocked by: 01, 02
Requirements: R6

Conferir remoto staging antes de push, preservar alterações concorrentes, publicar API antes de web, acompanhar Easypanel delivery-app-staging e conferir commits ativos, health e relatório autenticado. Registrar evidências e limites em validation.md. Produção fora de escopo.

## Answer
API 3a77d53b139c8f747cea9a9144fbf69b75e2c080 e web 8383067bec4e082e2d93defa8e300712313614d4 publicados. Easypanel: ambos done/running, health API UP. Smoke autenticado API 200, bloqueios 401/403/400; totais conferidos. Navegador real staging: acesso por Campanhas → Ver resultados, cinco combinações, 287 linhas diárias, somas diárias/resumo reconciliadas, desktop/mobile sem overflow e zero erros de runtime. Produção e pedidos preservados. Evidências: ../validation.md.
