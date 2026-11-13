# Fechamento de mesa ou comanda — /hall?view=checkout

## Brief da superfície

Correção de 13/11/2026: ADMIN/WAITER também aguardam todos os pedidos COMPLETED/CANCELED antes de iniciar, receber nova baixa ou encerrar. READY ainda é pendente. Aviso "Itens ainda não entregues" explica motivo e orienta cancelamento separado; CTAs de início/encerramento têm disabled e associação ao aviso. Conta antiga CLOSING/quitada conserva pagamentos e bloqueia novas ações enquanto houver pendências. Retry de operação já confirmada preservado. Encerrar sem recebimento não cancela nem conclui pedidos implicitamente; esta regra substitui descrições históricas de cancelamento automático abaixo. Mundo visual e componentes herdados preservados. Browser local confirmou 1440/390/320px, início/forçado bloqueados e conta quitada READY bloqueada, com liberação após COMPLETED.

Modo **Operate**, herdado do atendimento e do admin. Tarefa: conferir conta, dividir recebimento por itens ou cotas, registrar pagamento presencial e liberar atendimento quitado. Público: ADMIN e WAITER autorizado pela configuração/backend. Extensão do mundo visual existente; não estabelece identidade, tokens ou proibições globais.

Registro de 12/11/2026, baseado em `src/views/StaffTables/{TableCheckout.tsx,Payments.tsx,checkoutStyles.ts,index.tsx,ReasonDialog.tsx}`, `src/app/(product)/hall/page.tsx` e contrato `.specs/features/table-checkout-screen/spec.md`. O brief de [atendimento](staff-tables.md) continua descrevendo catálogo, rodada, consumo e chamados.

## Entrada e fronteira da tarefa

- Atendimento autorizado mostra **Fechar conta**, único CTA de entrada financeira; quem não tem `canCheckout` vê **Pedir fechamento** na conta aberta. São permissões e efeitos distintos.
- URL `/hall?table=ID&view=checkout&session=ID` mantém contexto na recarga. A rota valida usuário ADMIN/WAITER e mesa ativa, renderiza `TableCheckout` antes de chamar `getMenu`; portanto esta tela não monta catálogo, rodada nem chamados gerais.
- Cabeçalho identifica **Fechamento · Mesa/Comanda**. **Atendimento** retorna à mesa selecionada; **Atualizar** recarrega consumo e pagamentos. Shell administrativo e identificação do restaurante/perfil são compartilhados.
- Consulta/navegação não inicia fechamento. Conta `OPEN` exige **Iniciar fechamento**, texto sobre bloqueio de novos lançamentos e confirmação. Somente `CLOSING` com `canCheckout` apresenta formulário financeiro.
- Endpoints de consulta, início, pagamentos, quitação e encerramento são os existentes em `admin/table-operations/**`, chamados pelo proxy do app. A query conserva caminho e origem auditada `/hall`; não cria endpoint ou operação de backend.

## Identidade e hierarquia herdadas

Plus Jakarta Sans do layout de produto, tema por tenant e componentes compartilhados `Button`, `Field`, `Input` e `Select`. O laranja das capturas é o tema demonstrado, não cor fixa desta superfície. Primária e texto de ação usam variáveis do tenant; fundo, texto auxiliar, superfícies e linhas usam variáveis semânticas existentes.

Título de página (1,5rem/700); títulos de seção (1,125rem/700); rótulos/campos e texto auxiliar (0,875rem), com detalhes de item/histórico menores (0,8125rem). Resumo usa rótulos de 0,75rem e valores de 1,125rem no celular; a partir de 768px, rótulos de 0,875rem e valores de 1,75rem. Valores usam algarismos tabulares. **Falta receber** recebe peso 800; **Receber agora**, valor de 1,5rem. Hierarquia serve à conferência financeira.

Controles compartilham altura de 2,75rem e raio de 0,375rem. Primária conserva elevação do botão compartilhado; linhas e seções do fechamento separam por borda e espaço, sem novos cards ou sombras próprias. Ícones Lucide indicam voltar, atualizar, recebimento e conclusão. Foco local em botões, campos, selects e summaries usa contorno de 2px com `--color-primary-text`, deslocado 3px.

## Layout e adaptação

Contêiner de até 74rem, espaço vertical de 1,5rem e largura mínima zero. Resumo mantém três colunas: **Total da conta**, **Já recebido**, **Falta receber**; consumo e serviço aparecem abaixo. Valores admitem quebra para evitar transbordamento.

A partir de 1024px, formulário divide seleção e recebimento em `minmax(0, 1.4fr)` / `minmax(18rem, 0.8fr)`, separados por 2,5rem. Detalhes financeiros ficam sticky a 5rem do topo. No celular, sequência única: resumo, critério, itens/cotas, pessoa, método, composição do valor e CTA. Separador acima dos detalhes torna a mudança de etapa legível. Histórico ocupa seção própria abaixo do formulário.

Cada item apresenta nome, quantidade pendente, valor e, quando existem, adicionais/observações; controle de quantidade à direita. Menos/mais têm 44×44px; campo numérico, 44×44px, com largura de 36px abaixo de 359px. Nomes quebram em linhas a 320px. Isso descreve os controles de quantidade, não garante alvo de 44px para todo elemento auxiliar da tela.

## Recebimento e estados operacionais

- Critério: selecionar quantidades por pessoa ou dividir igualmente entre 1 e 999 pessoas. Cotas indicam parte atual e distribuição de centavos. Primeira baixa fixa critério e número de partes.
- Pessoa é opcional; método vem das opções existentes. Composição mostra consumo selecionado, serviço desta parte e **Receber agora**. CTA traz valor exato e confirmação pede conferência do pagamento presencial.
- Histórico informa pessoa, método, horário, valor, divisão igual quando aplicável e itens expansíveis. Itens quitados saem da seleção pendente.
- Conta quitada mostra conclusão financeira; **Encerrar conta paga** depende de saldo zero e ausência de pedidos ainda em preparo. Após ACK de `settle`, `onSettled` retorna diretamente à lista com `router.replace('/hall')`, sem tela ou toast de finalização. Atualização que observa ausência da sessão antes existente faz o mesmo retorno. Consulta inicial sem conta aberta conserva orientação para voltar ao atendimento. Resultado inconclusivo mantém retry e bloqueio de saída até conferência.
- Consulta mostra carregamento, falha em alerta e orientação para atualizar antes de receber. Atualização ocorre manualmente, a cada 10 segundos, no retorno à aba e por eventos da operação. Falha bloqueia ações financeiras.
- Sessão recebida diferente da sessão esperada mostra alerta e não renderiza recebimento; operador precisa voltar e selecionar conta atual. Evita baixar nova visita a partir de URL antiga.
- Submissão de pagamento/encerramento é guardada em `sessionStorage` por mesa/sessão antes do envio. Resultado inconclusivo oferece **Conferir recebimento/encerramento** com o mesmo corpo; pagamentos reutilizam `submissionId`. Enquanto pendente ou salvando, controles e saída pelo app ficam bloqueados, com aviso de unload; recarga recupera conferência. Isso é retry operacional, não novo registro silencioso.
- ADMIN sem baixas anteriores tem **Outras ações de encerramento** expansível. **Encerrar sem recebimento** usa diálogo de motivo obrigatório e explica cancelamento de pedidos em andamento; não registra pagamento. É ação legada separada do encerramento financeiro.

## Evidência e limites

Inspeção própria de fonte e das cinco capturas em `.impeccable/review/checkout-screen/`: `desktop.png` (1440px), `mobile.png` (390px), `mobile-320.png`, `entry-desktop.png` e `entry-mobile.png`. As capturas mostram formulário por itens com valores e CTA legíveis, shell consistente, ausência dos painéis de atendimento no fechamento e entrada autorizada única. A 320px, nomes/descrições quebram mantendo controles e valores visíveis. Comparação com a entrada confirma tema, família tipográfica, botões e linhas herdados; a composição financeira mais plana é local à tarefa.

Estados `OPEN`, ausência de permissão, cotas, histórico, falhas, sessão divergente, retry e encerramento acima foram conferidos no código; essas cinco imagens não mostram todos eles. Esta passagem não executou navegador, mutação, teste funcional, pagamento real, medição de contraste nem auditoria completa de acessibilidade. Reviewer independente informou **pass**, achado de dois CTAs ambíguos resolvido e disposição **ship** somente para a extração; isso não substitui QCA real de staging previsto no contrato.

Complemento de retorno e estados: inspeção própria de fonte atualizada e `.wiser-qca/checkout-return/{desktop,mobile}.png` (1440/390px). Capturas mostram a lista de destino e distinção livre verde / ocupado vermelho / fechamento amarelo, conforme [brief do atendimento](staff-tables.md). O amarelo de fechamento é semântico local; não substitui primária do tenant. Teste de navegador com backend simulado informado pela implementação confirmou retorno após ACK e ausência de mensagem; foram informados 223 testes, tipos, lint, build e detector aprovados. Reviewer fresh `impeccable_return_review` deu disposição **ship**, sem correções materiais. Esta passagem não repetiu esses testes; imagens estáticas não demonstram sozinhas a transição nem validam backend real/staging.

Deriva preexistente não reparada: `DESIGN.md` e `.impeccable/design.json` globais ausentes; o brief de atendimento preserva referências históricas a `/salao` e contratos anteriores. Nenhum desses fatos vira nova regra visual. Limite desta passagem: atualizar `staff-tables.md` e criar este brief, preservando `PRODUCT.md`, código, testes, configuração e artefatos globais.
