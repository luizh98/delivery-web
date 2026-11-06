# Resultado

- Causa: checkout da mesa persistia `TABLE` na chave global `delivery-order-v1`, reaproveitada por `/cart` sem token.
- Correção: mesa usa armazenamento e cache por token; delivery preserva chave anterior e recupera modalidade legada para `DELIVERY`, sem apagar os demais dados.
- Defesa no checkout: modalidade segue contexto da rota; pedido da mesa omite endereço de entrega.
- Quatro testes de regressão exercitam componentes reais transpilados, incluindo captura do POST do checkout. Três testes falharam antes da correção e passaram depois.
- Validação: suíte web (172 testes), TypeScript, ESLint dos arquivos alterados e build Next aprovados.
- Commit: `fix(cart): isolate table and delivery state`.
- Sem alteração de API, dependências ou testes com pedidos reais em homolog.
