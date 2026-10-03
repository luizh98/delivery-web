# Resumo: data do pedido nos modais

Data e hora adicionadas no cabeçalho do modal compartilhado por Pedidos e Cozinha.
Usa createdAt, com fallback para o histórico RECEIVED quando ausente. Formato pt-BR
no fuso do navegador, consistente com os filtros existentes. Valor ausente ou inválido
exibe Data indisponível.

Verificação: build, lint do componente, 24 testes existentes e 5 verificações de datas
aprovados. Lint geral encontra 3 erros e 1 aviso preexistentes em arquivos não alterados.

Commit: `feat(admin): show order date in orders and kitchen modals`.
Destino autorizado: origin/staging, com deploy automático no Easypanel.
Resultado do deploy será acompanhado após publicar este registro.
