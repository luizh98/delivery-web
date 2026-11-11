# Controles de pessoas para toque

- Abertura e edição de mesa usam botões explícitos de diminuir/aumentar, com alvo de 48×48px e ícones Lucide de 24px. Campo central continua livre para digitação/teclado numérico.
- Cada clique altera uma pessoa no formulário. Mínimo 1, máximo 999; campo vazio inicia em 1 ao aumentar. Limites e estado ocupado desabilitam botões correspondentes.
- Botões não submetem formulário. Abertura e ação Salvar pessoas continuam usando requisições existentes. Contexto/endpoint auditado preservados; nenhuma alteração backend ou nova gravação.
- Escopo: GuestCountField.tsx, styles.ts, integração em StaffTables/index.tsx e testes de componente/fluxo. Verificar cliques, digitação, limites, acessibilidade, 320/390px e desktop, testes, tipos, lint e build antes do push staging.
