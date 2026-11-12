# Tela dedicada de fechamento

## Objetivo
Separar recebimento da operação de lançamento do salão. Entrada por **Fechar conta** na mesa/comanda, sem catálogo ou nova rodada na tela de fechamento.

## Direção visual — Operate
Extensão precisa do sistema existente, sem nova identidade. Plus Jakarta Sans, tema do tenant e componentes de botão/campo atuais. Cabeçalho identifica atendimento; resumo mostra total, recebido e saldo; seleção compacta de quantidades à esquerda, pessoa/forma/valor/CTA à direita. No celular, sequência em uma coluna e alvos de 44px. Histórico em área própria, sem interromper seleção.

## Aceite
- CHECKOUT-01: entrada abre tela dedicada e recarga mantém contexto; nenhum catálogo, chamados gerais ou rodada nessa tela.
- CHECKOUT-02: pedido aberto exige início explícito do fechamento; consulta/navegação não grava dados. Permissão do garçom continua controlada pela configuração e API.
- CHECKOUT-03: seleção por itens e divisão igual, taxa/centavos, pagamentos/saldo e encerramento preservados; operações inconclusivas sobrevivem à recarga.
- CHECKOUT-04: resumo e seleção legíveis a 1440/390/320px; foco/nomes acessíveis, erro e vazio explícitos.
- CHECKOUT-05: conta diferente da sessão esperada bloqueia recebimento até nova seleção. Sair com baixa inconclusiva bloqueado pelos controles; armazenamento mantém retry idempotente.
- CHECKOUT-06: gravações usam endpoints existentes com origem /hall. Query `view=checkout` preserva caminho de auditoria; nenhuma nova gravação/backend.

## Execução
1. Tela e integração no salão; formulário compacto, resumo e histórico.
2. Testes de renderização/handlers, tipos/lint/build, inspeção desktop/mobile e reviewer/documenter Impeccable.
3. Publicar web staging; aguardar ao menos 60s e Wiser QCA real. Corrigir/publicar/retestar se houver defeito.
