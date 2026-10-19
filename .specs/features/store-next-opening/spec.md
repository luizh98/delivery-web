# Próxima abertura da loja

Data: 2026-10-19. Escopo médio: correção compartilhada entre API e web, sem mudança de contrato.

## Requisitos

- R1: mostrar "hoje" somente quando a próxima abertura ocorrer no mesmo dia em America/Sao_Paulo.
- R2: mostrar "amanhã" quando a próxima abertura ocorrer no dia seguinte; usar nome do dia da semana para datas posteriores.
- R3: próxima abertura deve respeitar dias semanais fechados e a prioridade de feriados, incluindo fechamento e horários especiais.
- R4: reproduzir domingo fechado da tenant dev-terraco-canecao usando configuração pública real e data fixa de domingo.
- R5: publicar somente nas branches staging dos dois repositórios, após validação.

## Implementação

- Web: src/utils/storeAvailability.ts e src/utils/storeAvailability.test.mjs. Helper já compartilhado pelo cardápio e carrinho.
- API: internal/app/restaurant.go e internal/app/restaurant_availability_test.go, no repositório irmão .staging-next-opening-api.
- Sem mudanças de configuração da tenant, relógio do ambiente, dependências ou estrutura da resposta pública.

## Verificação

- Teste antes da correção web: 4 falhas por ausência de "amanhã".
- Teste com implementação original da API: 5 falhas por feriados ignorados.
- Web: hoje/amanhã/dia posterior, meia-noite UTC versus São Paulo, virada do ano, timestamp ausente/inválido.
- API: domingo fechado, feriado fechado antes/depois do horário normal, fechamentos consecutivos, abertura excepcional de domingo, horário especial e expediente excepcional encerrado.
- Tenant: API pública consultada em 2026-10-19; segunda a sábado 05:30–23:45, domingo fechado, nenhum feriado. Simular 2026-10-18 às 00:30, 10:30, 17:30 e 23:30; esperar 2026-10-19 05:30 e texto "Loja fechada, abre amanhã às 05:30".
- Testes gerais web/Go, TypeScript, lint dos arquivos alterados, go vet e build Next.js.

## Autorização

Usuário solicitou correção, teste no domingo e publicação em staging. Execução e publicação autorizadas na própria solicitação.
