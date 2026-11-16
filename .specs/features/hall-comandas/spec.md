# Salão com comandas e setores

16/11/2026. Extensão do salão existente solicitada pelo usuário.

## Requisitos
| ID | Aceite |
|---|---|
| SALC-01 | Garçom seleciona comanda numerada existente e mesa física ativa do tenant; contato obrigatório; várias comandas por mesa, consumo e fechamento independentes. Mesa compartilhada existente preservada. |
| SALC-02 | Vínculo fica na visita e no snapshot do pedido; nova visita permite outra mesa; envio repetido não duplica pedido nem impressão. Sem transferência de conta em andamento. |
| SALC-03 | Cadastro do produto define setor COZINHA/BAR; padrão legado COZINHA. Rodada mista gera documentos distintos, só itens do setor; adicionais e observações preservados. |
| SALC-04 | Cupom operacional mostra horário local, garçom autenticado, mesa, comanda e itens. Não imprime telefone na produção. |
| SALC-05 | ADMIN/WAITER imprimem conferência da conta no salão via destino Recibo configurado; não registra pagamento nem altera estado; sessão esperada e chave de envio impedem repetição involuntária. |
| SALC-06 | Todas gravações usam Store.collection e contexto autenticado; verificar autor, tenant, origem, diferenças e sigilos, incluindo sessão, pedido, sequência e fila de impressão. |
| SALC-07 | Interface herda tema/componentes existentes, celular/desktop, erros explícitos; seleção de mesa/comanda visível antes do envio. |
| SALC-08 | Publicar apenas staging; após pushes aguardar60s e executar Wiser QCA com screenshots/vídeo e relatório. |

## Premissas e limites
- Comanda individual por cliente, várias comandas na mesma mesa: confirmado pelo usuário em16/11/2026.
- Aplicativo web autenticado atual /hall. Rede Wi-Fi não é autorização; conector já instalado acessa impressoras locais. Sem aplicação nativa/offline ou restrição por SSID.
- QR existente da comanda mantém acesso ao cardápio. Cadastro em lote existente gera cartões/QR; sem inventar integração com equipamento do Terraço.
- Impressão efetiva em papel depende de impressoras/conector configurados, somente fila e documento podem ser provados sem hardware.
- Financeiro e regras de entrega/fechamento atuais preservados. Sem fiscal, transferência, junção ou estorno.

## Verificação
Testes Go/Mongo isolado de vínculo, isolamento, retry, partição, impressão e auditoria; web testes/tipos/lint/build; browser desktop/mobile e QCA staging com fixtures identificadas e limpas.
