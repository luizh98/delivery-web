# Ocultar ordinal do cliente para mesa

- Não renderizar CustomerOrderBadge quando deliveryType=TABLE, preservando nome/identidade da mesa.
- Delivery e retirada mantêm ordinal, tooltip e acessibilidade atuais.
- Teste executa trecho JSX real com 47 pedidos para confirmar ausência de badge/ordinal de mesa e presença nos outros canais.
- API também remove ordinal dos novos recibos/tickets e evita consulta do histórico para mesa. Nenhuma nova gravação frontend/backend.
