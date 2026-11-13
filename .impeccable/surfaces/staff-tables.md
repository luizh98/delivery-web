# Atendimento de mesas — /salao

## Brief da superfície

Correção de 13/11/2026: fechamento da equipe também exige todos os pedidos COMPLETED/CANCELED. Salão apresenta motivo visível; Pedir fechamento fica desabilitado com pendências e orienta entrega ou cancelamento explícito. Fechar conta conserva acesso à conferência; início/recebimento/encerramento são bloqueados na tela dedicada e API enquanto houver pendências. READY não equivale a entregue.

Modo **Operate**. Extensão operacional do admin existente: selecionar mesa, montar e revisar uma rodada, enviar à cozinha e consultar consumo/chamados. Público: WAITER (Garçom) e ADMIN do restaurante. O cabeçalho identifica restaurante e perfil; a mesa selecionada permanece identificada antes do espaço de trabalho. A ação principal apresenta quantidade de itens; o resumo apresenta total da rodada.

Este registro descreve somente `src/views/StaffTables/` e `src/app/(product)/salao/page.tsx`, conforme código verificado em 04/11/2026 e contrato em `../.specs/features/staff-table-entry/{spec,design}.md`. Não estabelece nova identidade visual nem regras globais.

## Identidade e componentes herdados

- Plus Jakarta Sans, definida no layout de produto e aplicada em `src/app/globals.css`; título de página de 1,5rem/700, mantendo a hierarquia de `AdminTables/styles.ts`.
- Tema por tenant: `--color-primary`, `--color-primary-text`, `--color-primary-foreground` e variantes secundárias. Superfícies usam `--color-background`, `--color-surface`, `--color-surface-muted`, `--color-border`, `--color-foreground` e `--color-muted`. As cores padrão de `globals.css` são fallback, não identidade fixa do salão.
- Reuso direto de `Button` e `Field`/`Input`/`Select`/`Textarea`: controles base de 2,75rem, texto de 0,875rem e raio de 0,375rem. Ações secundárias usam outline/ghost; exclusão/cancelamento reutilizam variantes danger existentes.
- Mesma linguagem operacional de `AdminTables`: bordas finas, fundos neutros, textos auxiliares compactos, agrupamento por tarefa e ícones Lucide. Painéis e mesas desta superfície têm raio de 0,75rem; diálogo, 1rem. São medidas locais, não novos tokens globais.
- Painéis usam separação por borda e fundo, sem sombra própria. A elevação do botão principal continua sendo a do componente compartilhado; o diálogo modal usa backdrop escuro existente no CSS local.

## Desktop e celular

Lista de mesas em grade responsiva: `minmax(7.5rem, 1fr)` no mobile e `minmax(12rem, 1fr)` a partir de 1024px. Busca por número e cores semânticas: verde livre, vermelho ocupado e amarelo fechamento, com fundos suaves e bordas finas. Fechamento usa fundo `#fef3c7`, borda e marcador da legenda `#eab308`, texto `#854d0e`; hover usa fundo `#fde68a` e borda `#ca8a04`. Ocupado mantém vermelho. São estados operacionais locais, separados da primária do tenant. Mobile prioriza identificação e cor, com legenda e nomes acessíveis. Desktop exibe também status escrito, tempo da abertura e pessoas. Chamados e rodada não enviada continuam com texto próprio. Refinamento atualizado em 12/11/2026 na rota atual `/hall`.

Quantidade de pessoas é editável no resumo da comanda por ADMIN/WAITER, após existir uma visita aberta, inclusive durante fechamento. Campo inteiro de 1 a 999, salvo por sessão com auditoria. Ausência de quantidade ou data em comandas antigas não gera valores inventados. Relógio inicia após montagem e acompanha atualização de 10 segundos. Evidências e limites desta alteração estão em `.specs/features/table-overview/spec.md`.

A partir de 1024px, catálogo e comanda ficam lado a lado, com colunas `minmax(0, 1.3fr)` e `minmax(20rem, 0.8fr)`. Contêiner limitado a 90rem. Abaixo desse limite, botões Cardápio / Rodada e consumo alternam o painel visível. No catálogo, barra inferior fixa mostra quantidade e valor e leva à revisão; respeita safe area. A comanda oferece Rodada e Consumo como escolhas separadas.

Busca de produto e filtro de categoria precedem a lista. Editor modal nativo (`showModal`) reúne adicionais, observação, quantidade e preço calculado. Campos têm rótulos; botões de ícone têm nomes acessíveis. Foco visível usa contorno de 2px com a cor de texto primária do tenant. Produtos têm alvo mínimo de 4,5rem; opções, 2,75rem. Essas medidas descrevem código, não certificação de acessibilidade.

## Estados e segurança operacional

- Falha de mesas aparece em alerta com orientação para atualizar; não vira estado vazio. Lista vazia distingue ausência de mesas ativas de busca sem resultado.
- Consumo em carregamento tem texto. Falha de atualização bloqueia envio/cancelamento. Atualização ocorre a cada 10 segundos, no retorno à aba e manualmente; atualização manual também busca cardápio.
- Rascunho vazio orienta a escolher produtos. Rascunhos por mesa ficam somente na memória da tela; trocar mesa os conserva. Sair/recarregar com itens ou envio incerto exige aviso. Envio é sempre explícito.
- Editar, duplicar, excluir e descartar afetam apenas rascunho. Envio em andamento bloqueia alterações; resultado incerto mostra Conferir envio, reutilizando a submissão pendente e bloqueando troca de mesa/edição.
- Conta em fechamento bloqueia novos itens e oferece reabertura. Rascunho de sessão encerrada recebe alerta e deve ser descartado.
- Consumo distingue rodadas, itens, observações, situação, cancelamentos e totais. Rodada cancelada informa que não entra no total.

## Permissões e limites

| Ação | Garçom | ADMIN |
| --- | --- | --- |
| Consultar mesas, consumo e chamados; montar/enviar rodada | Sim | Sim |
| Editar, duplicar, excluir rascunho; descartar rodada | Sim | Sim |
| Assumir/concluir chamado; pedir conta; reabrir comanda | Sim, respeitando atribuição do chamado | Sim |
| Cancelar item ou rodada enviada | Não; solicitar ao ADMIN e lançar correção em nova rodada | Com motivo obrigatório; cozinha avisada |
| Receber por itens ou divisão igual; encerrar conta paga | Somente com configuração de fechamento pelo garçom habilitada | Sim |
| Encerrar comanda sem recebimento | Não | Com motivo e sem baixas anteriores; diálogo informa cancelamento de pendências |

Cancelamento de consumo enviado e encerramento forçado são exclusivos de ADMIN. Após a primeira baixa, cancelamento e reabertura ficam bloqueados. A interface não edita silenciosamente item enviado. O encerramento forçado legado não registra pagamento; o encerramento financeiro exige saldo zero e pedidos prontos/concluídos. Não há desconto novo, estorno, transferência de mesas ou integração bancária. A rota exige ADMIN ou WAITER; permissão financeira efetiva vem de `canCheckout` no consumo e é revalidada pelo backend em toda mutação.

Extensão de 12/11/2026: o recebimento antes apresentado no resumo foi extraído para [tela dedicada de fechamento](table-checkout.md). No atendimento, **Fechar conta** é a única entrada financeira para quem tem `canCheckout`; abre `/hall?table=ID&view=checkout&session=ID`, preservando mesa e sessão na recarga. Sem essa permissão, conta aberta oferece **Pedir fechamento**, que solicita o fechamento ao caixa. Na conta em fechamento, reabertura continua disponível antes de haver pagamentos. O resumo e a edição de pessoas permanecem acima das abas no celular; catálogo, rodada e chamados pertencem ao atendimento. A tela dedicada não carrega cardápio nem monta esses painéis.

A navegação para fechamento não altera uma conta `OPEN`: a tela dedicada exige **Iniciar fechamento** e confirmação explícita antes de bloquear lançamentos. Recebimento, divisão e histórico passam a constar no brief próprio. O encerramento forçado legado de ADMIN fica em **Outras ações de encerramento** nessa tela, separado do recebimento e com motivo obrigatório. A origem auditada continua `/hall`, usando endpoints existentes.

Após confirmação do encerramento financeiro pelo backend, a tela retorna diretamente à lista via `router.replace('/hall')`, sem tela ou toast de finalização. Atualização que observa a sessão encerrada produz o mesmo retorno. Resultado inconclusivo mantém conferência pendente e não antecipa saída.

## Evidência e limites da verificação

Verificação própria: leitura de `PRODUCT.md`, contrato da feature, rota, `StaffTables/index.tsx`, `ItemEditor.tsx`, `styles.ts`, `globals.css`, `Button/styles.ts`, `Field/styles.ts`, `AdminTables/styles.ts` e definição de breakpoints em `src/styles.tsx`. Confirma extensão coerente da identidade existente, com escolhas locais de densidade e navegação.

Evidência visual disponível em `.impeccable/review/`: `staff-desktop.png`, `staff-mobile.png`, `staff-order-desktop.png` e `staff-order-mobile.png`. O reviewer independente informou inspeção das quatro imagens e veredito **SHIP**, com correção documental de permissões já aplicada. Nesta passagem de documentação, os arquivos foram localizados; não houve nova inspeção de imagens, navegador ou teste funcional. O veredito visual é atribuído ao reviewer, não a esta passagem.

Drift documental preexistente: `DESIGN.md` e `.impeccable/design.json` globais não existem neste checkout. Permanecem sem criação ou reparo, conforme limite autorizado. `PRODUCT.md`, configuração e código foram preservados; somente este brief foi criado.

Atualização documental de 12/11/2026: leitura dos arquivos de fechamento, entrada e rota, do contrato `.specs/features/table-checkout-screen/spec.md` e dos componentes compartilhados. Inspeção própria das cinco capturas em `.impeccable/review/checkout-screen/`: `desktop.png`, `mobile.png`, `mobile-320.png`, `entry-desktop.png` e `entry-mobile.png`. Entrada mantém a linguagem do salão; fechamento conserva shell, tema, tipografia e controles, com grupos separados por linhas. Capturas mostram o CTA autorizado único e formulário em duas colunas no desktop/uma no celular; não comprovam mutações reais ou todos os estados. Reviewer informou **pass**, achado dos dois CTAs resolvido, disposição **ship** apenas nesta extração. Limites e estados derivados de código estão no brief próprio. Esta passagem altera somente este brief e cria `table-checkout.md`; identidade global e drift dos outros briefs permanecem preservados.

Complemento pontual: fonte e capturas `.wiser-qca/checkout-return/{desktop,mobile}.png` (1440/390px) inspecionadas nesta passagem confirmam lista com livre verde, ocupado vermelho e fechamento amarelo. Fluxo de retorno sem mensagem foi confirmado pelo teste de navegador com backend simulado informado pela implementação; também foram informados 223 testes, tipos, lint, build e detector aprovados. Reviewer fresh `impeccable_return_review`: disposição **ship**, sem correções materiais. Esses resultados são atribuídos às respectivas verificações; esta passagem documental não os executou nem certifica backend real/staging.
