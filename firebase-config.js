/*
CONFIGURAÇÃO FIREBASE
Eu não consigo criar seu projeto Firebase sem acessar sua conta.
Para ativar o login com Google:
1. Entre em https://console.firebase.google.com/
2. Crie um projeto
3. Vá em Authentication > Sign-in method > Google > Enable
4. Vá em Project settings > Your apps > Web app
5. Copie o firebaseConfig
6. Cole abaixo e altere FIREBASE_ENABLED para true
*/
window.FIREBASE_ENABLED = false;

window.firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY",
  authDomain: "COLE_SEU_AUTH_DOMAIN",
  projectId: "COLE_SEU_PROJECT_ID",
  storageBucket: "COLE_SEU_STORAGE_BUCKET",
  messagingSenderId: "COLE_SEU_MESSAGING_SENDER_ID",
  appId: "COLE_SEU_APP_ID"
};
