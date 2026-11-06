# Logs do WhatsApp

Em Configurações → Pedidos e alertas → WhatsApp dos pedidos, clicar em **Logs do WhatsApp**, após Desconectar. Acesso exclusivo ADMIN, inclusive por URL direta: `/admin/settings/whatsapp-logs`.

- **Por pedido:** inicia em Hoje; mesmos presets de período da tela Pedidos, busca por número/ID (aceita `#050006`) e status. Período é a criação do pedido no fuso do navegador. Clique para ver todas as etapas, tentativas, retornos e IDs da Meta. Pedidos sem envio também aparecem.
- **Webhooks sem pedido:** retornos de conta reconhecida que não encontraram uma notificação compatível. Período considera recebimento, busca usa ID exato da mensagem. Este painel ajuda a investigar associação, sem permitir reenvio ou reprocessamento.
- **Conexão e recebimento de webhooks:** mostra autorização salva e avisos ativados/desativados. Não testa configuração na Meta nem confirma que um webhook ausente foi enviado.
- Atualizar recarrega dados. Consultas são paginadas; webhooks do pedido possuem paginação própria. Histórico permanece acessível após desconexão.

Cada pedido possui contorno próprio. Ao abrir, detalhes ficam no mesmo bloco, com divisórias entre etapas. Tentativas e retornos da Meta aparecem em tabelas de duas colunas, com resultado e horários separados. Resumos das etapas ficam no cabeçalho apenas quando pedido está fechado. IDs longos podem ser consultados em **Dados técnicos da mensagem**; histórico de webhooks ocupa seção final independente dentro do pedido.

`accepted` significa aceite pela Meta, não entrega. `sent`, `delivered`, `read` e `failed` são fatos recebidos por webhook; leitura/entrega confirmadas não são apagadas por eventos tardios. Todas as ocorrências de falha continuam nos detalhes.

Registros anteriores à feature só possuem resultado mais recente e quantidade de tentativas. Interface não reconstrói tentativas antigas nem callbacks que não foram salvos. Novos retornos mostram horário na Meta e recebimento local, códigos numéricos, associação, repetição ou processamento inconclusivo/erro. Assinaturas inválidas e contas desconhecidas não são atribuídas a restaurantes.

Corpos completos de webhook, conteúdo da conversa, telefones destinatários e credenciais não são guardados neste histórico. Gravações de tentativas e eventos reconhecidos participam do Histórico de alterações, com origem Fila WhatsApp/Meta WhatsApp e isolamento por restaurante.
