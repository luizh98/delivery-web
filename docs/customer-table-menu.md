# Cardápio do salão

Implementado em 05/11/2026. Sem publicação.

## Rotas e componentes

- `/`: delivery, com acesso à conta e informações comerciais existentes.
- `/menu?mesa=TOKEN`: cardápio da mesa sem login/horários/pedido mínimo no cabeçalho.
- `/menu/sacola?mesa=TOKEN`: revisão e confirmação da rodada.
- `/menu/pedidos?mesa=TOKEN`: **Comanda**, com consumo acumulado da visita, incluindo rodadas concluídas. Link e título do salão usam Comanda; histórico do delivery mantém Meus pedidos.
- Links antigos `/?mesa=TOKEN` e `/mesa/TOKEN` redirecionam ao novo cardápio.

`Home/MenuCatalog.tsx` contém catálogo compartilhado da busca à sacola, preservando categorias, carrossel, produtos, foco de retorno, seleção e valores. `CustomerMenu` compõe cabeçalho e mesmo catálogo. Links de produto mantêm token e retornam ao `/menu`.

## Consumo e chamados

Consulta `GET public/tables/{token}/orders?participationId=...` projeta consumo sem dados pessoais, tracking ou autores internos. Polling 5s permanece vinculado à visita recebida ao abrir página; encerramento limpa conteúdo sem acompanhar próxima visita silenciosamente. Novo acesso pelo cardápio consulta visita vigente. Histórico administrativo é preservado.

Comanda usa cor primária do tenant no total e acentos suaves nos estados, com texto contrastante. Total e ações de atendimento/fechamento precedem detalhes. Não há botão de atualização manual; consultas automáticas não se sobrepõem. Retorno à aba atualiza dados; confirmação de chamado invalida leitura anterior e busca estado novo.

**Chamar garçom** usa SERVICE (dúvida). **Pedir fechamento** confirma solicitação e usa CLOSURE; bloqueia novos lançamentos até equipe reabrir. Não registra pagamento nem encerra mesa automaticamente. Nome/celular exigidos pela API ficam visíveis no checkout da mesa; retirada, frete e seleção de pagamento ficam restritos ao delivery.

ADMIN recebe banner global; WAITER atende em `/salao`. Chamados pendentes exibem mesa/motivo e pulso suave 2s. Assumir interrompe pulso; concluir remove chamado. Redução de movimento desliga animação e mantém contorno/texto. SSE `table-operation`, reconexão e polling 10s atualizam alertas. Falhas de atualização são informadas.

Comandas individuais e recebimentos financeiros não foram adicionados. Interface identifica mesas existentes.

No salão, resumo com total, Pedir fechamento/Reabrir e Encerrar comanda fica acima das abas. Encerrar permanece ADMIN, com confirmação/motivo e cancelamento de pendências informado. Garçom solicita fechamento e reabre. Barra inferior mobile tem atalhos Rodada/Comanda; Comanda abre diretamente consumo e retorna ao topo, onde ações estão visíveis.

## Auditoria e validação

Chamados públicos registram origem `/menu/pedidos` e autor descritivo, sem usuário administrativo fictício; tokens nos caminhos são ocultados. Criação do chamado, transição da sessão e limpeza dos chamados ao encerrar são auditadas. Consulta pura não grava. Não existe transação global entre sessão/pedidos/chamados/histórico.

- Suíte Go completa com MongoDB descartável: privacidade, tenant, participação antiga, encerramento, efeitos indiretos e auditoria.
- 155 testes web, TypeScript, lint dos arquivos alterados, build Next e diff check aprovados.
- Navegador com API/Mongo isolados: busca/produto/sacola/envio, consumo, dúvida, assumir/concluir como WAITER, fechamento e banner ADMIN, redução de movimento; sem overflow em 390/1440.
- Encerramento removeu pedidos da consulta antiga; próxima visita manteve tela antiga vazia e exibiu apenas novos pedidos na consulta nova.
- Detector sem findings. Revisão independente pediu contraste em textos novos; correção aprovada no verdict pass. Documenter confirmou extensão preservando sistema existente.
- Screenshots no workspace pai `.impeccable/review/customer-{menu,orders,staff,admin}-{desktop,mobile}.png` e `customer-orders-closed-mobile.png`.

Fixture inicial sem `statusHistory` gerou falha preexistente no painel de atenção; pedidos normais possuem histórico. Banner validado em `/admin/tables`; painel de atenção não foi alterado.

Sem teste de produção ou integrações externas. Especificação no workspace pai `.specs/features/customer-table-menu/`.
