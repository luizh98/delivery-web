# Download do instalador Windows

**Data:** 2026-09-28
**Status:** Pronto para homologação; produção pendente

## Objetivo

Permitir que o administrador baixe o instalador Flyfoods Impressão pelo painel de impressoras.

## Requisitos

- **R1:** Publicar `Flyfoods-Impressao-Setup-0.1.13.exe` em URL HTTPS acessível sem conta GCP.
- **R2:** Ativar o botão `Instalador Windows` com link para esse arquivo.
- **R3:** Confirmar resposta HTTP 200, tamanho do arquivo e build do frontend.

## Execução e verificação

1. Arquivo publicado em `gs://delivery-products/installers/Flyfoods-Impressao-Setup-0.1.13.exe` com `Content-Disposition: attachment`.
2. Link público respondeu HTTP 200 e `Content-Length: 4086532`, igual ao arquivo local.
3. Botão alterado em `src/views/AdminPrinter/index.tsx`; build da base de `staging` passou.
4. Lint encontrou erro preexistente em `src/views/AdminPrinter/index.tsx:116` (`react-hooks/set-state-in-effect`).

## Pendente

- Promover o recurso do conector e o botão para `main` quando a homologação for aprovada.
- O instalador 0.1.13 ainda não tem assinatura Authenticode.
