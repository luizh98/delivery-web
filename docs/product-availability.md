# Disponibilidade por canal

Em **Produtos**, cada item mostra selo com texto e ícone: **Delivery e salão**, **Somente delivery** ou **Somente salão**. O filtro **Filtrar disponibilidade** combina com pesquisa, categoria e status. Produtos compartilhados aparecem nos filtros de ambos os canais.

No cadastro e na edição, **Disponível em** fica no início do formulário. Delivery inclui entrega e retirada; salão inclui funcionário e QR Code. A alteração só é aplicada ao salvar e aparece no Histórico de alterações com autor, tenant, origem e diferença.

## Compatibilidade

- Campo API `availability`: `ALL`, `DELIVERY`, `TABLE`.
- Produtos antigos sem campo são tratados como `ALL`, sem migração ou alteração em lote.
- Cliente antigo que omite campo ao editar preserva a restrição já salva.
- Cardápio público usa `channel=DELIVERY` por padrão; salão usa `channel=TABLE`. Categorias sem produtos naquele canal são omitidas.
- API valida modalidade real do pedido, incluindo itens de carrinhos antigos. Mudar query de leitura não permite comprar pelo canal errado.
- Combos e ofertas respeitam canal nas leituras e validações. Alterar canal de um produto pode tornar um combo existente indisponível naquele canal.
- QR mantém contexto da mesa ao navegar por `/?mesa=token`, detalhe do produto e `/mesa/token`. Token de participação atual da comanda acompanha o envio. Compartilhamento de produto continua sem incluir token da mesa.
- Carrinho existente não é apagado: itens incompatíveis precisam ser removidos/revistos pelo cliente. Não foram criados preços por canal nem canais próprios para adicionais.

## Verificação

144 testes web, TypeScript, lint dos arquivos alterados, build Next e suíte Go completa aprovados. Teste Mongo isolado cobre padrão legado, enum, preservação do campo omitido, filtro de menu/categoria/tenant, modalidade do pedido, combos/ofertas e auditoria. Teste real no navegador alterou produto de DELIVERY para TABLE e confirmou saída/entrada nos respectivos cardápios. Navegação QR catálogo → produto → adicionar → catálogo manteve mesa e filtro.

Capturas desktop/mobile da listagem e edição: `.impeccable/review/channels-*.png`, com dados fictícios. Detector Impeccable sem achados; revisão visual independente: SHIP. Erros de lint global preexistentes fora da alteração não foram modificados. Nenhum push/publicação.
