# Design

Reusar tables.kind=COMMAND como conta individual; TableSession recebe physicalTableId/physicalTableNumber imutáveis na visita. Order guarda snapshots físicos e garçom; OrderItem guarda productionSector obtido do catálogo. Dados antigos seguem válidos. Nenhuma migração global.

BAR é destino adicional na fila existente. Conector aceita destino string e documentos kitchen-ticket/receipt; sem alteração do binário. Partição de pedidos TABLE ocorre por snapshot do item; recibo continua conta completa. Cancelamentos seguem o mesmo roteamento de setores.

Endpoint POST /api/admin/table-operations/{tableId}/print-bill aceita sessionId e submissionId; leitura revalida visita e gera conferência via RECEIPT com chave idempotente. Autor ADMIN/WAITER; nenhuma permissão financeira adicional.

Auditoria: gravações existentes de catálogo/sessão/pedido/sequência/fila continuam auditadas; novos campos via mesmas operações. Privacidade: telefone restrito ao salão/admin; cupom operacional sem contato; QR público não ganha dados de funcionário.
