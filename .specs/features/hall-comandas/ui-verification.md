# UI verification

Contract: .impeccable/surfaces/hall-comandas.md.
API Go526 passed with isolated Mongo. Web227 passed before two new tests; new focused14/14 passed. tsc, changed-file ESLint, Next build passed. Detector once returned [].

Screenshots of actual /hall with local API: C:/projetos-pessoais/delivery-app/.wiser-qca/hall-comandas/evidences/local-{opening,account}-{desktop,mobile}.png. Operate extension. No new world or raster. Existing admin components/tokens preserved.

## Revisão independente e documentação

[ui-review.md](ui-review.md): **SHIP** para o delta visual, sem achado material. Reviewer inspecionou nove capturas: as quatro de abertura/conta acima, `local-account-mobile-actions.png`, `local-product-{desktop,mobile}.png` e `local-printer-{desktop,mobile}.png`. As finais mobile têm 390 px; setor integral em 320 px não foi certificado. Produto sem salvamento e impressora sem conector configurado limitam a evidência. Capturas locais não comprovam staging, impressão em papel ou acessibilidade global.

[Brief da superfície](../../../.impeccable/surfaces/hall-comandas.md) atualizado após leitura das fontes: vínculo por visita, contato obrigatório, Cozinha/Bar no produto, destino Bar e Imprimir conta via Recibo. Confirmação de impressão significa fila aceita, sem pagamento ou fechamento. Documenter localizou os nove arquivos e conferiu fontes; não repetiu navegador, detector ou testes. Resultados de testes acima são atribuídos à implementação.
