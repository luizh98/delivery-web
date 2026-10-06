# Validação — 2026-10-06

## Resultado

- API: `rtk go test ./...` — 196 testes aprovados, 4 pacotes.
- Web: `rtk npm test` — 31 testes aprovados.
- TypeScript: `rtk proxy npx tsc --noEmit --incremental false` aprovado; build de produção aprovado.
- ESLint dos arquivos alterados aprovado, sem warnings após adoção de `useWatch`.
- Lint geral: 3 erros preexistentes (`react-hooks/set-state-in-effect`, Dashboard e Impressora), 1 warning preexistente no Dashboard. Fora do escopo.
- Detector Impeccable nos arquivos UI alterados: `[]`.

## Cenários

| Requisito | Evidência | Resultado |
| --- | --- | --- |
| DISC-01 / DISC-02 | Go testa percentual, preço final, zero, 100%, arredondamento, legado, BSON, respostas admin/públicas, remoção e rejeição de campos inválidos | Aprovado |
| DISC-03 | Browser: valor final `R$ 29,90` riscado + `R$ 24,90`; percentual `R$ 28,00` + `20% OFF`, sem original; produto normal sem selo | Aprovado |
| DISC-04 | Browser: editar restaura R$ 24,90 / 20%; rejeita preço final R$ 40 em produto de R$ 29,90; cria R$ 10 com 10% = R$ 9; remove desconto e volta a R$ 10 | Aprovado |
| DISC-05 | Browser: R$ 35 com 20% + adicional R$ 3 = R$ 31; quantidade 2: subtotal R$ 76, desconto R$ 14, total R$ 62; diminuir volta a R$ 31. Combo testado com 3 unidades | Aprovado |
| DISC-06 | Go verifica menor preço sem empilhar, percentual sobre preço descontado quando permitido e campanha sem benefício | Aprovado |

## Visual

Capturas em `../../../.impeccable/review/`: desktop.png, mobile.png, admin-desktop.png, admin-mobile.png, detail-desktop.png e detail-mobile.png. Viewports 1440×1000 e 390×844, sem overflow horizontal. Fixtures sem fotos usam fallback existente.

Contraste medido no selo após correção: tenant rosa/amarelo 16,05:1; amarelo/preto 5,13:1; branco/preto 4,95:1. Todos acima de 4,5:1. Preço com contraste mínimo medido 5,74:1.

Revisão Impeccable inicial: `ship` no escopo visual; conferência posterior encontrou contraste insuficiente em duas paletas e corrigiu texto do selo. Veredito da correção: `ship`, contraste resolvido e sem regressões nas seis recapturas. Documenter conferiu componentes, tokens, estilos existentes e capturas; sistema preservado, sem drift material identificado. PRODUCT.md/DESIGN.md ausentes anteriormente; extensão limitada não criou novo sistema.

Commits de implementação: API `d27f404`; frontend `863aba2`.

## Limites

Browser usa backend descartável em memória (porta 18080), isolado de tenants reais. Testes Go cobrem cálculo, validação, contrato e serialização BSON; não executamos checkout integrado com MongoDB real. Nenhum deploy/push nesta entrega.
