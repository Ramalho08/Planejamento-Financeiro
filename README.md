# R💰 Ramalho Finance Pro V5

Versão profissional com visual futurista, responsiva para notebook, desktop e celular.

## Funções
- Dashboard animado
- Partículas tecnológicas no fundo
- Login local
- Login com Google preparado via Firebase
- Receitas/despesas
- Categorias personalizadas
- Recorrências mensais
- Histórico mensal automático
- Metas financeiras
- Score financeiro
- Insights inteligentes
- Gráficos com Chart.js e fallback
- Exportação CSV
- Backup/restauração JSON
- PDF via impressão do navegador
- PWA instalável
- Compatível com GitHub Pages

## Firebase
Eu não consigo criar o Firebase dentro da sua conta. Para ativar:

1. Acesse https://console.firebase.google.com/
2. Crie um projeto
3. Vá em Authentication
4. Ative Google
5. Crie um app Web
6. Copie o objeto firebaseConfig
7. Cole no arquivo firebase-config.js
8. Altere `window.FIREBASE_ENABLED = false` para `true`

## GitHub Pages
1. Crie o repositório `ramalho-finance`
2. Envie os arquivos
3. Vá em Settings > Pages
4. Selecione Deploy from branch
5. Branch main e pasta /root
