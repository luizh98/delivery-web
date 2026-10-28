# Desconto no produto

## Ajuste vigente — somente valor final

Solicitação de 2026-10-06 substitui as opções percentuais de DISC-01, DISC-03 e DISC-04 na interface:

- Cadastro/edição oferece apenas Sem desconto / Valor final, com valor em reais convertido para centavos no envio.
- Exibição compartilhada no cardápio, carrossel, detalhe e prévia: original riscado seguido do preço final dentro do selo amarelo suave (#FDE68A), com texto preto. Sem OFERTA, X% OFF ou repetição do preço final.
- Produtos percentuais antigos continuam com cálculo compatível no carrinho/API. Ao editar, o formulário apresenta o preço final equivalente; salvar persiste FIXED. Se o arredondamento não gera economia, apresenta Sem desconto para evitar FIXED inválido.
- Preservar a barra fixa de salvar e as alterações locais existentes fora deste ajuste.

Verificação: tsc sem incremental, ESLint dos arquivos alterados, quatro testes de preços/combos e `npx tsx scripts/qa-product-price.tsx`. Renderização real do componente em desktop (1440px) e mobile (390px), sem overflow. Evidências: `.impeccable/review/final-price-badge-1440.png` e `final-price-badge-390.png`.

Publicação: implementação `e3481e8`, staging `84281f6`. Deploy inicial cancelado pelo painel durante TypeScript; deploy posterior `cmuwucgco000707og2qiy8b6e` concluído com `7417886`, que inclui este ajuste e uma alteração independente da barra de salvar. Homepage e menu público HTTP 200; bundle público contém selo amarelo e não contém o texto OFERTA. Revisão: ship, sem drift. Compatibilidade percentual permanece apenas para dados antigos/API; a interface não oferece porcentagem.

Escopo médio, implementação em `delivery-api` e `delivery-web`. Preservar UI existente; sem novas dependências ou migração MongoDB.

## Requisitos

- DISC-01: cadastrar, editar e remover desconto opcional por porcentagem inteira (1–100%) ou preço final em centavos (0 até abaixo do original).
- DISC-02: preço original permanece salvo; API retorna `salePriceCents` calculado e configuração do desconto. Produtos legados preservam preço.
- DISC-03: preço final mostra original riscado seguido do novo preço. Porcentagem mostra apenas preço descontado seguido de `X% OFF`. Aplicar paleta da tenant no cardápio, carrossel e detalhe.
- DISC-04: formulário oferece Sem desconto / Porcentagem / Valor final, validação e prévia do resultado.
- DISC-05: carrinho, combos e API de pedidos usam preço descontado; adicionais não recebem desconto; totais registram economia sem descontá-la duas vezes.
- DISC-06: ofertas de upsell não podem elevar preço promocional. Empilhamento segue configuração existente da campanha; percentual empilhado usa preço já descontado.

## Decisões

- `discountType`: vazio (sem desconto), `PERCENTAGE`, `FIXED`. `discountValue`: percentual inteiro ou preço final em centavos.
- Arredondar percentual por unidade para centavo mais próximo. Desconto é permanente até edição, sem agenda.
- Sem desconto remove configuração. Não alterar preços de pedidos históricos.
- Destaque por hierarquia de preço e selo com cores da tenant; sem animação ou redesign.

## Execução

1. API: models.go, catalog.go, orders.go, promotions.go e teste de desconto. Validar cálculo, persistência, rejeição e interação com upsell. Commit `feat(catalog): support product discounts in pricing`.
2. Web: types/api.ts, formulário, componente de preço, cardápio/carrossel/detalhe, combos e ajuste do carrinho. Validar testes, lint e build. Commit `feat(products): configure and highlight product discounts`.
3. Verificação: telas desktop/mobile, cadastro e carrinho; registrar evidências/limitações em validation.md e STATE.md. Commit `docs(products): record discount validation`.

Status: DISC-01 a DISC-06 verificados. Evidências e limites em validation.md.
