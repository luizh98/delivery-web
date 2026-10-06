# Publicação na main

Autorização explícita do usuário em 2026-10-06. Promoção apenas dos commits desta funcionalidade e seus refinamentos sobre origin/main, preservando mudanças próprias da produção.

- API: `d27f404` aplicado como `e953fa1`.
- Web: `5810733`, `47cd720`, `9dcd582`, `84281f6`, `7417886` aplicados como `332407f`, `1ee1644`, `ffeeb56`, `92e55bb`, `6de8116`.
- Worktrees isolados: `.main-product-discounts-api` e `.main-product-discounts-web`.
- Go `go test ./...`: passou.
- Web: 34 testes passaram; tsc sem incremental, ESLint dos arquivos da funcionalidade e verificação SSR passaram.
- Build Next completo passou. Link local de node_modules exigiu turbopack.root temporariamente no diretório pai; configuração restaurada antes da publicação, sem commit desse ajuste local.
- Alteração local prévia de SaveBar no checkout original preservada. O commit correspondente já aprovado na staging foi incluído na promoção.

Durante a promoção, main recebeu `4c84ad6` com a barra de salvar arredondada. Rebase preservou esse ajuste; o commit equivalente `6de8116` foi descartado automaticamente por já estar presente. Resultado final idêntico (diff completo vazio) à árvore validada anteriormente; tipagem repetida com sucesso. Commits finais web: `a3f5cce`, `35ce7dc`, `14d49b3`, `487c6db`.

API: deploy `cmuwwf2k5000o07ogccjq9wad` concluído com sucesso às 16:39:32 UTC. Smoke em `terraco-canecao.flyfoods.com.br/api/backend/public/menu`: HTTP 200; 65 produtos com `salePriceCents` calculado.

Web: main enviada em `487c6db`; deploy `cmuwwppqp001h07og3z7o02sn` concluído às 16:43:30 UTC. Inspeção dos serviços confirma API `e953fa1` e web `487c6db`, ambos com ref main. Smoke: homepage e menu HTTP 200, 65 produtos; bundle contém amarelo #FDE68A e não contém OFERTA ou % OFF. Não foram alterados produtos ou pedidos reais para a verificação.
