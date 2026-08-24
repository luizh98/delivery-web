# Quick Task 016: Tornar alerta de pedido global no admin

**Date:** 2026-08-24
**Status:** Done

## Description

Monitorar novos pedidos em qualquer rota protegida e oferecer ativação explícita do áudio exigida pela política de autoplay do navegador.

## Files Changed

- `src/components/AdminOrderSoundNotifier/index.tsx` — monitora pedidos globalmente, controla fila e oferece ativação do áudio.
- `src/layouts/AdminLayout/index.tsx` — mantém o notifier montado durante toda sessão admin.
- `src/components/OrdersManager/index.tsx` — remove reprodução local duplicada sem alterar atualização e impressão.
- `.specs/quick/016-global-admin-order-sound/TASK.md` — registra escopo e verificação.
- `.specs/quick/016-global-admin-order-sound/SUMMARY.md` — registra resultado final.
- `.specs/project/STATE.md` — registra conclusão da quick task.

## Verification

- [x] Novo pedido dispara áudio em `/admin` e demais rotas protegidas.
- [x] Primeiro carregamento estabelece baseline sem tocar pedidos antigos.
- [x] Pedidos simultâneos mantêm fila de reprodução.
- [x] Falha de `audio.play()` gera mensagem visível.
- [x] Botão Ativar som reproduz teste e confirma liberação do áudio.
- [x] `/admin/orders` continua atualizando e imprimindo sem áudio duplicado.
- [x] `npm run lint`.
- [x] `npm run build`.
- [x] `git diff --check`.

## Commit

`fix(admin): play new order sound across admin`
