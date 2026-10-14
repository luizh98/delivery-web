# Paginação do desempenho

O dashboard ativo solicita 10 itens ou opcionais por página. Anterior/Próxima substituem a rolagem infinita; o ranking não acumula registros. Trocar tipo mantém a seção aberta e reinicia a página; trocar período reinicia a página e preserva o carregamento progressivo dos relatórios.

O carregamento de seções posteriores não refaz a requisição do ranking. Requisições canceladas não alteram registros, erro ou carregamento. Uma falha permite tentar novamente a mesma página.

Validação: 40 testes, TypeScript e build aprovados. Detector Impeccable sem ocorrências. Demais regras de lint aprovadas; dois erros anteriores de estado em effects permanecem. Inspeção visual em navegador pendente. Alterações anteriores do usuário preservadas.
