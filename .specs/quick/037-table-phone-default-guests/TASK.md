# Contato com máscara e abertura com uma pessoa

**Data:** 2026-11-19

## Requisitos

- Telefone no formulário de abertura/contato usa máscara brasileira existente, aceitando fixo com 10 dígitos e celular com 11, ambos com DDD; payload continua normalizado.
- `Total de pessoas` inicia em `1` para mesa e comanda. Usuário pode editar; dados de visitas abertas não são sobrescritos.
- Preservar validação, retorno/cancelamento, vínculo de mesa física, idempotência e permissões.

## Execução

1. Reutilizar `formatBrazilianPhoneInput` no formulário existente e ajustar valor inicial.
2. Verificar manipuladores reais de input/envio, valor padrão e regressões, tipos, lint e build.
3. Publicar staging e executar Wiser QCA após 60 segundos, sem consultar deploy ou salvar evidências locais.

## Auditoria

Nenhuma nova gravação: payload usa endpoints existentes e mantém contexto/autoria. Quantidade só é enviada na abertura; visitas existentes mantêm contagem. Integrações da API validam trabalhos de impressão e histórico; máscara é somente apresentação.

## Validação local

242 testes web, TypeScript, lint dos arquivos alterados, build Next com webpack e detector Impeccable aprovados. Regressores executam manipuladores reais de digitação/envio, confirmam padrão de uma pessoa nos dois tipos e mantêm validação/contagem editável. API complementar: 585 testes com Mongo isolado e build aprovados. QCA será executado na staging após publicação; resultado informado no chat, sem evidências locais.
