# Quick Task 015: Padronizar cor dos botões primários

**Date:** 2026-08-06
**Status:** Done

## Description

Fazer os botões primários seguirem a mesma cor do seletor ativo de categoria da home.

## Files Changed

- `src/components/Button/styles.ts` — usa diretamente a cor primária do tenant nos botões primários.
- `.specs/quick/015-match-primary-button-color/TASK.md` — registra escopo e verificação.
- `.specs/quick/015-match-primary-button-color/SUMMARY.md` — registra resultado final.
- `.specs/project/STATE.md` — registra a conclusão da quick task.

## Verification

- [x] Botão primário usa `var(--color-primary)`, igual à categoria ativa da home.
- [x] Texto do botão primário permanece branco.
- [x] Hover mantém a cor-base e fornece feedback visual.
- [x] Estados desabilitado e variantes semânticas permanecem inalterados.
- [x] `npm run lint`.
- [x] `npm run build`.
- [x] `git diff --check`.

## Commit

`style(button): match home category color`
