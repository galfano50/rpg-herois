// firebase-config.js - Configuração centralizada do Firebase
// Este arquivo gerencia a inicialização e configuração do Firebase para toda a aplicação
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCMWxGtooYe7UXzFop_FfCKu-M4ima5vMc",
  authDomain: "hospedagem-rpg.firebaseapp.com",
  databaseURL: "https://hospedagem-rpg-default-rtdb.firebaseio.com",
  projectId: "hospedagem-rpg",
  storageBucket: "hospedagem-rpg.appspot.com",
  messagingSenderId: "834126719159",
  appId: "1:834126719159:web:f605f39f967f9bd2498532",
  measurementId: "G-41LQB57W3X"
};

// Variáveis globais para instâncias do Firebase
let app, auth, db;

// Função para inicializar o Firebase com tratamento de erros
function initializeFirebase() {
  try {
    // Inicializar o app do Firebase
    app = initializeApp(firebaseConfig);
    
    // Inicializar Authentication
    auth = getAuth(app);
    
    // Inicializar Firestore
    db = getFirestore(app);
    
    console.log('Firebase inicializado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    return false;
  }
}

// Função para verificar se o Firebase está inicializado
function isFirebaseInitialized() {
  return app && auth && db;
}

// Função para obter instâncias do Firebase (com verificação)
function getFirebaseInstances() {
  if (!isFirebaseInitialized()) {
    console.warn('Firebase não foi inicializado. Tentando inicializar...');
    initializeFirebase();
  }
  
  return { app, auth, db };
}

// Inicializar Firebase automaticamente quando o módulo for carregado
initializeFirebase();

// Exportar instâncias e funções úteis
export { 
  app, 
  auth, 
  db, 
  initializeFirebase, 
  isFirebaseInitialized, 
  getFirebaseInstances 
};