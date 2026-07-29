# Quick Task 005: Desabilitar zoom no mobile

**Date:** 2026-07-29
**Status:** Done

## Description

Impedir que o navegador altere a escala da página ao focar e preencher campos de texto no mobile.

## Files Changed

- `src/app/layout.tsx` — fixa a escala do viewport e desabilita zoom do usuário.
- `.specs/quick/005-disable-mobile-zoom/TASK.md` — registra escopo e verificação.
- `.specs/quick/005-disable-mobile-zoom/SUMMARY.md` — registra resultado final.

## Verification

- [x] Viewport usa largura do dispositivo e escala inicial 1.
- [x] Escala máxima permanece em 1.
- [x] Zoom do usuário fica desabilitado.
- [x] HTML renderizado contém `user-scalable=no`.
- [x] Lint e build do frontend passam.

## Commit

`fix(mobile): disable viewport zoom`
