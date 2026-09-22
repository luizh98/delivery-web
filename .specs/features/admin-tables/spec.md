# Administração de Mesas — Especificação

## Problema

O backend já permite criar, editar, ativar e regenerar o acesso de mesas, mas o Admin não oferece interface para essas operações. O restaurante não consegue disponibilizar novos links de pedido por mesa sem acesso direto à API.

## Objetivos

- [x] Permitir cadastro e edição do número e estado de uma mesa no Admin.
- [x] Permitir copiar o link seguro da mesa ao criar ou regenerar seu acesso.
- [x] Expor a tela na navegação administrativa.
- [x] Permitir baixar o QR Code do link seguro da mesa.

## Fora de escopo

| Item | Motivo |
| --- | --- |
| Excluir mesas | API não oferece exclusão; desativação preserva histórico. |
| Gerenciar sessões de mesa | Fluxo separado já coberto pelos endpoints de sessões. |

## Histórias

### P1: Cadastrar mesa

Como administrador, quero cadastrar uma mesa pelo número para disponibilizar um link de pedido.

1. QUANDO informar número válido e salvar, ENTÃO sistema SHALL criar mesa ativa e atualizar lista.
2. QUANDO API retornar token de criação, ENTÃO sistema SHALL mostrar e permitir copiar link `/mesa/{token}`.
3. QUANDO API retornar token de criação ou regeneração, ENTÃO sistema SHALL gerar QR Code PNG localmente e permitir baixá-lo.
4. QUANDO número estiver vazio, ENTÃO sistema SHALL mostrar erro no campo e não enviar requisição.
5. QUANDO selecionar “Gerar e baixar QR” em mesa já cadastrada, ENTÃO sistema SHALL avisar que acesso anterior será invalidado, gerar novo QR Code e baixar PNG.

### P1: Gerenciar mesa cadastrada

Como administrador, quero editar número e estado da mesa para manter operação correta.

1. QUANDO selecionar editar, ENTÃO sistema SHALL preencher formulário com mesa selecionada.
2. QUANDO salvar edição, ENTÃO sistema SHALL atualizar número e estado exibidos.
3. QUANDO regenerar acesso, ENTÃO sistema SHALL pedir confirmação, invalidar link anterior e disponibilizar novo link para cópia.
4. QUANDO desativar mesa, ENTÃO sistema SHALL indicar estado por texto e não apenas cor.

### P1: Acessar gestão de mesas

Como administrador, quero acessar Mesas pela navegação para encontrá-la durante operação.

1. QUANDO abrir Admin, ENTÃO navegação SHALL incluir item “Mesas”.
2. QUANDO acessar `/admin/tables`, ENTÃO sistema SHALL carregar mesas pelo endpoint administrativo no servidor.

## Casos de borda

- Quando não houver mesas, mostrar estado vazio com orientação de cadastro.
- Quando cópia falhar, mostrar mensagem de erro recuperável.
- Quando criação, edição ou regeneração falhar, manter dados do formulário/lista e explicar falha por toast/erro visível.

## Rastreabilidade

| ID | Requisito | Status |
| --- | --- | --- |
| TABLE-01 | Criar mesa com validação | Implemented |
| TABLE-02 | Editar número e estado | Implemented |
| TABLE-03 | Regenerar e copiar link | Implemented |
| TABLE-04 | Rota e navegação Admin | Implemented |
| TABLE-05 | Gerar e baixar QR Code | Implemented |
