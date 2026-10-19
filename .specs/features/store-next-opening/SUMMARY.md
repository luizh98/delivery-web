# Validação da próxima abertura

Data: 2026-10-19. Especificação: spec.md.

## Resultado local

- R1/R2: helper compartilhado pelo cardápio e carrinho mostra hoje, amanhã ou dia da semana, usando America/Sao_Paulo. Oito testes novos passaram; quatro deles falhavam antes da correção.
- R3: API prioriza horário/fechamento de feriado no cálculo de nextOpeningAt. Cinco cenários falharam com implementação original; correção passou. Sem alteração de contrato ou migração de dados.
- R4: configuração pública real da dev-terraco-canecao consultada por HTTP 200 em 2026-10-19: segunda a sábado 05:30–23:45, domingo fechado, nenhum feriado. Teste determinístico em domingo 2026-10-18 às 00:30, 10:30, 17:30 e 23:30 retornou segunda 2026-10-19 05:30. Texto correspondente: "Loja fechada, abre amanhã às 05:30". Cenário solicitado de 17:30 também coberto separadamente.
- Suíte web: 74 testes, zero falhas.
- TypeScript --noEmit, ESLint dos arquivos alterados, validador de landing pages, go vet e git diff --check passaram.
- Build Next.js 16.2.9 com Webpack passou, incluindo TypeScript e geração das 19 páginas. Tentativa inicial bloqueada por DNS de fontes Google no sandbox; repetição com rede passou.
- Suíte Go completa passou com servidores HTTP locais permitidos; execução restrita havia bloqueado dois testes de sockets, sem relação com a correção.

## Publicação

R5: envio dos commits para origin/staging autorizado pelo usuário; ver registro de deploy após push.

## Limites

Domingo validado com tempo fixo e configuração pública capturada, sem mudar relógio ou dados da tenant. Feriados validados em testes determinísticos. Nenhum pedido criado e nenhuma configuração da tenant alterada.
