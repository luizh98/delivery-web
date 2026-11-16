# Comandas do salão

Modo Operate; extensão local de /hall, cadastro de produto e destinos de impressão.

## Direction contract
THESIS: Identificar comanda e mesa antes de enviar e alcançar conferência no resumo.
OWN-WORLD: herdar Plus Jakarta Sans, tokens do tenant, controles, superfícies e densidade do salão; sem nova identidade.
STORY: comanda → itens → mesa/contato → envio aos setores → consumo/conferência.
FIRST VIEWPORT: resumo conserva total e fechamento; mesa vinculada ao lado da identidade; Imprimir conta outline junto às ações. Lista mostra mesa de cada comanda.
FORM: extensão local, sem concept-seed. Seleção de mesa precede contato no diálogo de primeiro envio.
FINISH: revisão independente com screenshots desktop/mobile e detector; documentar delta preservando sistema. Nenhum raster novo.

## Delta implementado — 16/11/2026

Escopo restrito a `src/views/StaffTables/index.tsx`, `src/views/StaffTables/BillPrintButton.tsx`, `src/views/AdminProducts/ProductManager.tsx` e `src/views/AdminPrinter/index.tsx`. Complementa [staff-tables.md](staff-tables.md); requisitos em [spec.md](../../.specs/features/hall-comandas/spec.md) e operação em [hall-comandas.md](../../docs/hall-comandas.md). Este registro descreve a extensão; não define um sistema visual novo.

- **Comanda e mesa física:** no primeiro envio de comanda individual, o diálogo identifica a comanda e apresenta **Mesa da comanda** antes do contato. A seleção contém mesas físicas ativas, com opção inicial vazia e erro obrigatório. O vínculo vem da visita (`session.physicalTableId`/`physicalTableNumber`), não de uma alteração permanente no cadastro da comanda. Lista e resumo mostram a mesa vinculada; rodadas mostram mesa, garçom e horário quando disponíveis. A busca inclui o número da mesa vinculada. Conforme contrato funcional, outra visita pode vincular outra mesa; não há controle de transferência durante a visita. Várias comandas conservam consumo e fechamento próprios na mesma mesa; conta compartilhada existente permanece.
- **Contato e abertura:** telefone/celular com DDD obrigatório, validado como 10 ou 11 dígitos após normalização. O diálogo conserva quantidade de pessoas e ação explícita de abrir/enviar; conta já aberta sem contato pede salvar contato/enviar. O painel exibe o contato em link telefônico. O envio reutiliza corpo e chave pendentes quando o resultado é incerto e mantém **Conferir envio**, sem trocar silenciosamente a rodada.
- **Setor do produto:** campo nativo **Setor de preparo**, junto aos campos existentes de edição, oferece **Cozinha** (`KITCHEN`) e **Bar** (`BAR`). Produto novo e produto legado sem setor iniciam em Cozinha; o valor integra o formulário validado e o payload de salvamento. Setor é configuração operacional do produto, sem nova cor, badge ou linguagem visual. Partição do cupom e snapshot são regras do backend no contrato, não resultados provados por screenshot do formulário.
- **Destino Bar:** segue os destinos Recibo/Cozinha no mesmo agrupamento e reusa seletor de computador/impressora, vias, impressão automática, Salvar e Teste. A descrição explica que recebe somente itens do setor Bar no salão. Depende do conector existente; não acrescenta opção Bar às preferências de impressão neste navegador. O teste exige destino salvo.
- **Imprimir conta:** ação outline com texto visível e ícone decorativo no resumo, junto às ações existentes de fechamento. Disponível com visita carregada, bloqueada durante solicitação ou erro de atualização. Envia sessão esperada e chave própria; resultado incerto conserva a chave para repetir a mesma solicitação, enquanto recusa 4xx permite nova tentativa. A confirmação visível informa envio à impressora configurada. Pelo contrato funcional, isso é ACK da fila de conferência via destino **Recibo**: não comprova papel impresso, não recebe pagamento e não fecha a conta. Total, pessoas e permissões financeiras existentes continuam no resumo/fluxo dedicado.

## Sistema existente preservado

Leitura das fontes confirma reuso de `AdminShell`, `Button`, `Field`, `Input`, `Select`, `Dialog`, agrupamentos e estilos atuais. Imprimir conta usa a variante outline já existente; os novos campos usam rótulos e controles nativos compartilhados. Não foram acrescentados tokens, tipografia, paleta, mídia ou componentes visuais globais. Plus Jakarta Sans e identidade por tenant seguem o contrato do salão e `PRODUCT.md`; os estilos compartilhados mantêm cores por variáveis do tema, superfícies neutras, bordas e foco existentes.

No celular, lista, resumo, alternância dos painéis e barra fixa mantêm a estrutura do salão. Conforme revisão independente, as ações Imprimir conta e Fechar conta ficam integralmente acessíveis após rolagem. Bar preserva a composição responsiva existente de produto e impressão. Essas escolhas são locais e não promovem composição desta tela a regra global.

## Evidência e limites

Revisão independente: [ui-review.md](../../.specs/features/hall-comandas/ui-review.md), disposição **SHIP**, sem achado material no delta. O reviewer inspecionou nove capturas locais em `C:/projetos-pessoais/delivery-app/.wiser-qca/hall-comandas/evidences/`: `local-opening-{desktop,mobile}.png`, `local-account-{desktop,mobile}.png`, `local-account-mobile-actions.png`, `local-product-{desktop,mobile}.png` e `local-printer-{desktop,mobile}.png`. Nesta passagem documental, as nove foram localizadas e as fontes lidas; não houve nova inspeção visual nem teste funcional. O veredito visual pertence ao reviewer.

As capturas finais mobile têm 390 px; o campo de setor não foi certificado integralmente em 320 px. Produto foi mostrado sem salvar; impressão estava sem conector configurado e Teste desabilitado. Evidência local com API real foi informada pelo implementador; não comprova staging, impressão física, mutações com equipamento, teclado/leitor de tela nem conformidade WCAG global. Detector informado uma vez sobre os quatro alvos com resultado `[]`; esta documentação não o repetiu. Resultados funcionais informados constam em [ui-verification.md](../../.specs/features/hall-comandas/ui-verification.md).

`PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, briefs incumbentes e código não foram alterados nesta passagem. Ausência de documentação global e brief órfão de TableOrders já registrados permanecem fora deste delta; não houve auditoria global nem reparo de drift preexistente.
