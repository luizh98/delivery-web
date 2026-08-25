# Quick Task 018: Corrigir ativação do som no admin

**Date:** 2026-08-24
**Status:** Done

## Description

Corrigir a falha do botão `Ativar som` em navegadores que recusam o elemento MP3 criado antes do gesto do usuário.

## Assumptions

- A exceção exata no dispositivo do usuário é desconhecida porque o código anterior descartava o erro.
- O alerta pode usar um sinal sonoro gerado pelo navegador, sem depender de download ou codec MP3.
- A regra de repetição a cada 5 segundos para pedidos `RECEIVED` permanece inalterada.

## Files Changed

- `src/components/AdminOrderSoundNotifier/index.tsx` — ativa e reutiliza `AudioContext` criado no clique.
- `.specs/quick/018-fix-admin-sound-activation/TASK.md` — registra escopo e verificação.
- `.specs/quick/018-fix-admin-sound-activation/SUMMARY.md` — registra resultado final.
- `.specs/project/STATE.md` — registra conclusão da quick task.

## Verification

- [x] Clique ativa o contexto de áudio e toca o sinal de confirmação.
- [x] Pedido `RECEIVED` continua gerando um sinal por ciclo de 5 segundos.
- [x] Falha de ativação informa o nome técnico do erro.
- [x] `npm run lint`.
- [x] `npm run build`.
- [x] `git diff --check`.
