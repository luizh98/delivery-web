# Administração de Mesas — Tarefas

**Spec:** `.specs/features/admin-tables/spec.md`
**Status:** Ready for manual validation

## Plano

`T1 → T2 → T3 → T4 → T5 → T6`

### T1: Carregar mesas no servidor

**Onde:** `src/services/api/server.ts`
**Requisito:** TABLE-04
**Pronto quando:** função tipada busca `admin/tables` e retorna lista vazia em falha.

### T2: Criar view administrativa

**Onde:** `src/views/AdminTables/index.tsx`
**Requisitos:** TABLE-01, TABLE-02, TABLE-03
**Pronto quando:** view recebe dados iniciais e renderiza manager cliente.

### T3: Criar manager de CRUD

**Onde:** `src/views/AdminTables/TableManager.tsx`
**Requisitos:** TABLE-01, TABLE-02, TABLE-03
**Pronto quando:** valida, cria, edita, ativa/desativa, regenera e copia links; apresenta estados de carregamento/erro.

### T4: Estilizar página operacional

**Onde:** `src/views/AdminTables/styles.ts`
**Requisitos:** TABLE-01, TABLE-02, TABLE-03
**Pronto quando:** layout é responsivo, usa tokens existentes e mantém controles acessíveis.

### T5: Expor rota

**Onde:** `src/app/admin/(protected)/tables/page.tsx`
**Requisito:** TABLE-04
**Pronto quando:** rota renderiza view e evita cache estático.

### T6: Adicionar navegação

**Onde:** `src/layouts/AdminLayout/AdminNavigation.tsx`
**Requisito:** TABLE-04
**Pronto quando:** item “Mesas” aponta para `/admin/tables` com ícone Lucide.

## Verificação

- `npm run lint`
- `npm run build`
- Revisão manual: criar, editar, desativar, regenerar e copiar link.

## Resultado da validação

- `npx tsc --noEmit`: passou.
- `npm run test`: 14 testes passaram.
- Lint dos arquivos alterados: passou; lint global possui erros preexistentes em `AdminDashboard`.
- Build chegou à etapa de fontes e parou ao buscar `Plus Jakarta Sans` no Google Fonts por indisponibilidade de rede.
