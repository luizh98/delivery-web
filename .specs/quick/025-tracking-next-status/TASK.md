# Quick Task 025: Indicadores do acompanhamento

Data: 2026-10-13

## Requisito

Preencher o status atual com check, preservar o horário registrado e piscar somente o próximo status esperado. Publicar em staging após atualizar a base com origin.

## Implementação

- `src/views/OrderTracking/index.tsx`: separar estado do texto e do marcador; incluir o status atual nos concluídos; indicar próximo passo apenas em pedidos ativos.
- `src/views/OrderTracking/styles.ts`: reaproveitar pulso suave na variante next, incluindo redução de movimento.
- `src/views/OrderTracking/timeline.test.mjs`: cobrir entrega, retirada, mesa, cancelamento, conclusão, READY de entrega e estilos.

## Verificação

- [x] 45 testes aprovados.
- [x] TypeScript e lint dos arquivos alterados aprovados.
- [x] Build Webpack aprovado. Turbopack local não aceita junção de dependências fora da raiz do worktree.
- [x] Desktop 1280 px e mobile 390 px: atual preenchido com check/horário, somente próximo animado, sem overflow.
- [x] prefers-reduced-motion desliga animação.
- [x] Detector Impeccable sem achados.

## Publicação

Base: origin/staging atualizado em 6d45cc5. Destino autorizado: origin/staging, serviço delivery-app-staging/delivery-web com deploy automático. Confirmar resultado no Easypanel após push.
