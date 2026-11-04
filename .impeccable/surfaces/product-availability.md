# Disponibilidade de produtos

Extensão local de **Operate** no catálogo administrativo do Flyfoods: o lojista define onde vender cada produto e consulta essa configuração sem abrir a edição. Mantém a operação densa, escaneável e utilizável em computador e celular, conforme `PRODUCT.md`.

## Comportamento

- Campo **Disponível em** no topo do formulário, para cadastro e edição: `ALL` — Delivery e salão; `DELIVERY` — Somente delivery; `TABLE` — Somente salão.
- `ALL` preserva o padrão legado. Delivery inclui entrega e retirada; salão inclui pedidos do garçom e por QR.
- Cada produto exibe badge com texto e ícones Lucide (`Truck`/`Armchair`), sem depender apenas de cor.
- **Filtrar disponibilidade** combina por interseção com busca, categoria e status. Produtos `ALL` participam dos dois canais; contador e estado vazio seguem o resultado combinado.
- Salvar a disponibilidade determina a presença do produto nos respectivos cardápios.

## Continuidade visual

Preservar `Button`, `Field`, `Select`, tokens de tema por tenant e Lucide existentes. Badge usa superfície neutra, borda e texto dos tokens locais; toolbar e metadados permitem quebra de linha. Fontes: `src/views/AdminProducts/ProductManager.tsx` e `styles.ts`. Esta decisão pertence à superfície; não estabelece um `DESIGN.md` global nem inclui correção de drift.

## Evidências atribuídas

O reviewer independente informou veredito **SHIP** após abrir `.impeccable/review/channels-list-desktop.png`, `channels-list-mobile.png`, `channels-edit-desktop.png` e `channels-edit-mobile.png`. A equipe de implementação informou uso de dados fictícios, confirmação do efeito do salvamento nos cardápios e aprovação dos testes Go, 144 testes Node, lint dos arquivos alterados e build. Esses resultados foram fornecidos para este registro; o documenter leu os arquivos citados, sem executar nova inspeção visual ou repetir verificações.
