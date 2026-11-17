# Recebimento por valor livre

17/11/2026. Escopo médio; desenho e tarefas separados dispensados.

Como garçom autorizado ou ADMIN, quero informar o valor que cada cliente paga sem selecionar itens ou dividir igualmente.

## Aceite

- FREE-01: Ao escolher Informar valor, mostrar campo livre em reais, com teclado decimal, aceitando vírgula/ponto e até dois centavos. Valor inicial vazio; não reformatar enquanto digita.
- FREE-02: Ao confirmar valor positivo até o saldo, registrar exatamente os centavos informados, forma e pessoa; atualizar recebido/saldo e limpar campo após confirmação.
- FREE-03: Rejeitar vazio, zero, negativo, formato inválido, excesso de casas e valor acima do saldo. API valida também; não registrar excedente/troco.
- FREE-04: Preservar modos por itens/igual. Como hoje, primeiro recebimento fixa critério até quitar. Valor livre será opção inicial em contas novas.
- FREE-05: Preservar permissão do garçom, entrega prévia, versão concorrente, retry idempotente e encerramento explícito só com saldo zero. Distribuir serviço proporcionalmente, cumulativo, sem perder centavos.
- FREE-06: Auditar recebimentos, encerramento e resolução indireta de chamados com tenant, autor, origem e diferenças, sem segredos. Usar gravações auditadas existentes.
- FREE-07: Testes de cálculo/fluxo, API com Mongo isolado, tipos/lint/build e inspeção desktop/mobile. Publicar API/web em staging; esperar60s e executar QCA real com vídeo/capturas, sem consultar deploy. Limpar fixtures.

## Execução atômica

1. API: table_payments.go e novo teste de valores/auditoria; verificar Go/Mongo; commit feat(tables): accept custom payment amounts.
2. Web: Payments.tsx, paymentCalculation.ts, tipos e testes pertinentes; verificar cálculos/fluxo/tipos/lint/build/browser/detector; commit feat(hall): allow custom payment amounts.
3. Publicação staging e QCA; relatório na pasta agregadora .wiser-qca/hall-free-payment. Preservar alterações alheias e arquivar worktrees ao terminar.

## Limites

Sem troca de critério após primeiro recebimento, troco, gorjeta, desconto, estorno, nova integração financeira ou alteração main. Sem migração de dados.

## Rastreabilidade

FREE-01–07: implementação pendente.
