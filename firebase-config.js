// Configuração opcional do Firebase para login com Google.
// 1. Acesse https://firebase.google.com/
// 2. Crie um projeto
// 3. Ative Authentication > Google
// 4. Cole sua configuração real abaixo
// 5. Descomente os imports e o código real

export async function signInWithGoogle(){
  throw new Error('Firebase não configurado.');
}

export async function signOutGoogle(){
  return null;
}

export function onUserChange(callback){
  callback(null);
}

/*
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_ID",
  appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function signInWithGoogle(){
  return signInWithPopup(auth, provider);
}

export function signOutGoogle(){
  return signOut(auth);
}

export function onUserChange(callback){
  return onAuthStateChanged(auth, callback);
}
*/
