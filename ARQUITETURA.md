# Arquitetura

## Módulos

- `app.js`: inicialização
- `core.js`: estado centralizado
- `storage.js`: persistência local
- `navigation.js`: abas e menu
- `dashboard.js`: dashboard
- `transactions.js`: lançamentos
- `wallets.js`: carteiras
- `goals.js`: metas
- `reports.js`: relatórios
- `ai.js`: IA local
- `cloud.js`: preparação Cloud
- `architecture.js`: documentação visual
- `settings.js`: configurações
- `utils.js`: funções auxiliares

## Princípio

Novos recursos devem ser adicionados em módulos separados, sem alterar `navigation.js` e `core.js` sem necessidade.
