# Atendimento de mesas

## Acesso

`/hall` usa o login existente em `/admin/login`. Usuário com perfil **Garçom (WAITER)** é redirecionado para o atendimento; administrador encontra **Atendimento de mesas** no menu. Endereço anterior removido, sem redirecionamento. Nenhum novo serviço ou banco é necessário em produção: extensão do delivery-web e da API Go existentes.

Página reutiliza `AdminShell` e `AdminNavigation`, os mesmos do motoboy: cabeçalho/sidebar no desktop e menu lateral no celular. WAITER puro vê somente Atendimento de mesas; ADMIN preserva menu completo e ENTREGADOR mantém Pedidos. Navegação e saída pelo menu confirmam descarte quando existem rascunhos ou envio inconclusivo. Hall mantém seu próprio SSE de mesas, sem iniciar SSE geral de pedidos administrativos. Alertas usam `/hall?table=ID`.

## Fluxo

1. Escolher mesa pelo número ou busca; conferir se está livre, em consumo ou fechando.
2. Buscar produto ou filtrar categoria. Produto simples entra com um toque. Produto com opções abre editor que valida escolhas obrigatórias.
3. Na rodada, editar quantidade/adicionais/observação, duplicar ou excluir itens. Descartar elimina somente rascunho.
4. **Enviar à cozinha** cria uma nova rodada. **Consumo** mostra pedidos enviados, situação e total sem telefone/dados pessoais de clientes.
5. Após envio, só ADMIN cancela item/rodada com motivo. Corrigir pedido enviado exige cancelamento explícito e novo lançamento. Cozinha recebe evento e, quando configurada, impressão de cancelamento.

## Permissões

| Ação | Garçom | ADMIN |
| --- | --- | --- |
| Mesas, catálogo, consumo e chamados do próprio restaurante | Sim | Sim |
| Editar/excluir/duplicar rascunho e lançar rodadas | Sim | Sim |
| Assumir/concluir chamado; pedir conta; reabrir comanda | Sim | Sim |
| Cancelar item/rodada enviada com motivo | Não | Sim |
| Encerrar comanda, com motivo e cancelamento de pendências | Não | Sim |
| Cadastros, delivery, clientes, configurações, análises e histórico | Não | Conforme painel ADMIN |
| Registrar pagamento, dividir conta, desconto, transferência de mesa | Fora deste escopo | Fora deste escopo |

Pedir conta bloqueia novos lançamentos até reabertura. Encerrar comanda **não registra pagamento**. Cozinha mantém controle de preparo.

Quando a conta está em fechamento, aviso destacado com **Reabrir comanda** permanece visível tanto no catálogo quanto em Rodada e consumo. Tentar adicionar produto ou enviar uma rodada mostra aviso explicando o bloqueio, sem editar itens nem criar pedido. Conferir um envio anterior sem confirmação mantém a retentativa com o mesmo ID.

Resumo **Comanda** com total e ações agora fica acima das abas, disponível ao selecionar mesa: **Pedir fechamento** (ADMIN/WAITER), **Reabrir comanda** quando fechando e **Encerrar comanda** (somente ADMIN). Encerramento conserva confirmação/motivo e não registra pagamento. No celular, aba e barra inferior Comanda abrem consumo diretamente; Rodada abre rascunho. Não é preciso entrar em Consumo para acessar fechamento.

## Proteções e limites

- API autoriza papéis e tenant; interface não é a barreira de segurança.
- Servidor verifica disponibilidade, adicionais e preços. Mudança no preço pede revisão.
- ID de submissão impede pedido duplicado no retry. Envio sem confirmação mantém o mesmo ID e bloqueia edição até conferência.
- Cancelamento usa versão atual para não sobrescrever atualização concorrente da cozinha.
- Auditoria inclui autor, tenant, origem `/hall` e diferenças, ocultando credenciais da comanda; cobre gravações indiretas de sessão, sequência e impressão. Origem antiga não é mais aceita; histórico já salvo permanece preservado.
- Mesas e consumo atualizam a cada dez segundos, ao voltar à aba e manualmente.
- Rascunhos por mesa ficam na memória da página; sair/recarregar avisa sobre perda. Sem operação offline ou sincronização de rascunho entre aparelhos.
- Não existe transação distribuída entre sessão, pedido, impressão e histórico. Falha de impressão de cancelamento é informada para que equipe avise cozinha pessoalmente. Sem impressora configurada, aviso fica no painel da cozinha.

## Referências de mercado

[Saipos Garçom](https://saipos.com/gestao/comanda/aplicativo-de-comanda-eletronica): mesa, produtos/opcionais, pedidos à cozinha e pedir conta. [Goomer](https://ajuda.goomer.com.br/goomergo/painel/pedidos/gestor-de-mesas): busca por número e situação de consumo. [KCMS](https://ajuda.kcms.com.br/como-utilizar-comanda): mesa → lançamento → revisão/observações. [Sipos](https://ayuda.sipos.ai/portal/es/kb/articles/eliminar-modificar-tickets): cancelamento com motivo e restrição de pedidos arquivados. Pesquisa em 04/11/2026; implementação segue política confirmada para Flyfoods.

## Validação

Build Next e TypeScript aprovados; 140 testes web aprovados; suíte Go completa e testes Mongo de autorização/auditoria aprovados. Lint dos arquivos da task aprovado. Lint global ainda encontra erros preexistentes fora desta alteração. Screenshots em `.impeccable/review/staff-*.png`, com dados fictícios. Revisão Impeccable independente: SHIP.

Especificação e tarefas locais: `../.specs/features/staff-table-entry/` a partir da pasta que reúne API e web.
