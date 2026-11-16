# Capture validity

Revisão independente em 16/11/2026, limitada ao delta de mesa vinculada, contato, impressão da conta, setor de preparo e destino Bar. Foram lidos o contrato `.impeccable/surfaces/hall-comandas.md`, `PRODUCT.md`, o brief `staff-tables.md`, o craft floor e as fontes alteradas. Nenhum código de aplicação foi editado nesta revisão.

Inspecionadas pessoalmente com `view_image` as nove capturas em `C:/projetos-pessoais/delivery-app/.wiser-qca/hall-comandas/evidences/`:

- `local-opening-desktop.png` e `local-opening-mobile.png`.
- `local-account-desktop.png` e `local-account-mobile.png`.
- `local-account-mobile-actions.png`.
- `local-product-desktop.png` e `local-product-mobile.png`.
- `local-printer-desktop.png` e `local-printer-mobile.png`.

As capturas de ações e produto foram reenquadradas e novamente inspecionadas. A primeira versão mobile da conta tinha a barra fixa sobre as ações; a captura final, com rolagem, mostra Imprimir conta e Fechar conta integralmente acessíveis. O enquadramento final de produto mostra rótulo e seleção Bar no desktop e no celular. As capturas finais mobile têm largura observada de 390 px; a primeira captura do produto tinha 320 px e rótulo cortado, portanto não certifica esse campo integralmente em 320 px.

Evidências informadas pelo implementador como navegador com API local real. Não são prova de staging nem impressão física. Produto permaneceu em edição sem salvar; impressão está sem conector configurado, com Teste desabilitado. A captura desktop da impressão mostra o destino Bar e o início dos controles; a mobile mostra o conjunto completo. Esta revisão não executou navegação por teclado, leitor de tela, salvamento, envio nem impressão. A semântica dos controles e os estados de carregamento/erro foram conferidos na fonte. Detector informado como executado uma vez sobre os quatro alvos, resultado `[]`; não foi repetido.

# Findings

Nenhum achado material confirmado no delta revisado. Sem P0, P1 ou P2. Limites de evidência acima não constituem certificação global de acessibilidade.

Mesa da comanda e contato possuem rótulos via `Field`/`label`; seleção usa controle nativo e mensagem de validação. Diálogo mantém nome acessível, cancelamento e ação de voltar. Imprimir conta possui texto visível, ícone decorativo oculto para tecnologia assistiva, bloqueio durante solicitação, retorno explícito e chave preservada em resultado incerto. Campos Bar reutilizam os controles existentes.

# Direction fidelity

Direção Operate preservada. Identidade, tema do tenant, tipografia, controles e densidade permanecem os existentes. Seleção da mesa precede contato no primeiro envio; resumo e rodadas identificam mesa/comanda. Total e fechamento continuam no resumo. Imprimir conta usa outline junto ao fechamento e permanece visível após rolagem no celular. Setor de preparo oferece Cozinha e Bar; destino Bar ocupa o padrão existente de configuração, com descrição operacional específica. Nenhuma nova identidade, mídia ou redesenho foi introduzido.

# Disposition

**SHIP** para o delta visual revisado. Nenhuma correção de UI ou nova captura necessária para esse escopo. O veredito não cobre impressão em papel, mutações com equipamento real, staging ou certificação WCAG completa; os respectivos testes funcionais pertencem à validação da feature.

# Documentation delta

Registrar no brief da superfície: vínculo físico definido antes do primeiro envio e conservado na visita; contato obrigatório; setor legado Cozinha e novo Bar; conferência solicitada por Imprimir conta via destino Recibo, sem registrar pagamento nem afirmar saída física em papel. Vincular este relatório e distinguir capturas locais de QCA em staging. Não criar ou alterar identidade global.

O carregador de contexto apontou brief órfão preexistente em `.impeccable/surfaces/delivery-web-src-views-tableorders-index-tsx.md`. Fora deste delta; não reparado nesta revisão.
