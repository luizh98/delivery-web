# Conta do cliente somente após receber os itens

Data: 2026-11-12. Escopo médio; design e tarefas detalhadas dispensados.

- BILL-01: Cliente só solicita CLOSURE/PAYMENT quando todos os pedidos da sessão estão COMPLETED ou CANCELED. READY significa pronto para servir e permanece pendente. Mesa compartilhada considera todas as rodadas.
- BILL-02: Validar ambos os endpoints públicos antes de gravações. Rejeição não cria chamado, não muda sessão nem gera auditoria de mutação.
- BILL-03: Botão da comanda desabilitado durante pendência, carregamento ou falha de leitura; motivo visível e associado ao controle. Polling existente libera após entrega. Revalidar no servidor para dados antigos.
- BILL-04: Chamado SERVICE e ações autenticadas da equipe preservados. Cancelados não bloqueiam. Histórico das solicitações aceitas mantém tenant, cliente, origem e segredos ocultos.

Passos atômicos: API + regressões/auditoria; UI + regressões; publicar staging e QCA real após 60 segundos sem consultar deploy.

Verificação: testes Go com Mongo isolado, testes web/tipos/lint/build, inspeção desktop/mobile e QCA com fixtures próprias removidas ao final.

Limite: mutex existente serializa no processo; não estabelece transação entre documentos ou isolamento entre instâncias.
