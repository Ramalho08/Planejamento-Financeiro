# R💰 Ramalho Finance Pro V4

Aplicativo financeiro pessoal futurista, responsivo e instalável como PWA.

## Funcionalidades

- Dashboard premium responsivo
- Receitas e despesas múltiplas
- Categorias personalizadas
- Despesas recorrentes automáticas
- Histórico mensal
- Metas financeiras
- Projeção de metas
- Score financeiro
- Insights inteligentes
- Gráficos com Chart.js
- Exportação CSV
- Backup e restauração JSON
- PDF via impressão do navegador
- Tema claro/escuro
- PWA instalável no celular e computador
- Login com Google preparado via Firebase

## Como publicar no GitHub Pages

1. Crie um repositório chamado `ramalho-finance`
2. Envie todos os arquivos deste projeto
3. Vá em `Settings > Pages`
4. Em `Source`, escolha `Deploy from a branch`
5. Selecione `main` e `/root`
6. Salve

O site ficará disponível em:

`https://SEU_USUARIO.github.io/ramalho-finance/`

## Como instalar no celular

1. Abra o link no Google Chrome do Android
2. Toque nos três pontinhos
3. Escolha `Instalar aplicativo` ou `Adicionar à tela inicial`

## Como ativar login com Google

1. Acesse Firebase
2. Crie um projeto
3. Ative Authentication > Google
4. Abra `firebase-config.js`
5. Cole as chaves do seu projeto
6. Descomente o bloco indicado

Enquanto o Firebase não for configurado, o aplicativo funciona normalmente em modo local usando `localStorage`.
