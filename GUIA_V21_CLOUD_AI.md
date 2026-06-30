# Guia V21 Cloud AI — Ramalho Finance

## O que esta versão adiciona

- Login com Google via Firebase Authentication.
- Cloud Function `analyzeStatement`.
- Envio de PDF para OpenAI pelo backend.
- O frontend nunca guarda a chave da OpenAI.
- O app local continua funcionando mesmo antes da configuração.

## Passo 1 — Criar projeto Firebase

1. Acesse Firebase Console.
2. Crie um projeto.
3. Em Authentication, habilite Google.
4. Crie um app Web.
5. Copie o `firebaseConfig`.

## Passo 2 — Configurar frontend

Abra `firebase-config.js` e cole os dados reais do Firebase.

## Passo 3 — Preparar Cloud Functions

No terminal:

```bash
cd functions
npm install
```

Crie `functions/.env`:

```env
OPENAI_API_KEY=sua_chave_openai
OPENAI_MODEL=gpt-4.1-mini
```

## Passo 4 — Deploy

Na raiz do projeto:

```bash
firebase login
firebase use SEU_PROJECT_ID
firebase deploy --only functions
```

Depois publique o frontend no GitHub Pages ou use:

```bash
firebase deploy --only hosting
```

## Importante

Cloud Functions pode exigir plano Blaze no Firebase.
