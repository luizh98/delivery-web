# Cadastro em massa e taxa de serviço

Em `/admin/tables`, escolha Mesa (conta compartilhada) ou Comanda (conta individual). Cada número tem conta e QR próprios; Mesa 1 e Comanda 1 podem coexistir. Cadastros anteriores continuam como mesas.

A lista tem filtro por número e rolagem própria; título, filtro e cadastro ficam fixos na área de trabalho. Em alturas pequenas, o editor permite rolagem para manter o QR acessível. **Excluir** pede confirmação e faz exclusão lógica: o cadastro sai da lista e o QR deixa de funcionar, preservando histórico. Encerre contas abertas antes de excluir. O número excluído pode ser cadastrado novamente, com QR novo.

Clique em **Cadastro em massa**, abaixo de **Criar cadastro**, para abrir o modal. Informe tipo, número inicial e final. São permitidos até 500 números por lote. A prévia mostra a quantidade. Ao concluir sem falhas, o modal fecha e um toast confirma o sucesso com a quantidade criada e existente. Quando todos os números já existem, o toast avisa que já estão cadastrados. Em caso de falhas, o modal permanece aberto mostrando os números pendentes. Feche pelo botão no cabeçalho ou Esc; durante o envio, aguarde a conclusão. Repetir o intervalo preserva números existentes. Use Editar em cada cadastro para baixar o respectivo QR.

Em **Configurações → Pedidos e alertas → Taxa de serviço**, informe percentual entre 0 e 100%, com até duas casas decimais. Zero desativa. Mudança vale para contas abertas depois da alteração; contas já abertas mantêm o percentual inicial.

Salão e cliente veem consumo, taxa e total separados, calculados pela API após descontos e cancelamentos. Exemplo: consumo R$ 29,90 com taxa de 12,5% resulta em taxa de R$ 3,74 e total R$ 33,64. Delivery e retirada não recebem taxa. Fechar uma conta não registra pagamento eletrônico.
