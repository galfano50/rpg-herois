// firebase-config.js
// Configuração centralizada do Firebase para toda a aplicação

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Configuração do projeto Firebase
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

// Instâncias do Firebase
let app;
let auth;
let db;
let realtimeDb;

// Inicializa todos os serviços usados pelo projeto
function initializeFirebase() {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
    }

    if (!auth) {
      auth = getAuth(app);
    }

    if (!db) {
      db = getFirestore(app);
    }

    if (!realtimeDb) {
      realtimeDb = getDatabase(app);
    }

    console.log("Firebase inicializado com sucesso.");

    return true;
  } catch (error) {
    console.error(
      "Erro ao inicializar o Firebase:",
      error
    );

    return false;
  }
}

// Verifica se todos os serviços foram inicializados
function isFirebaseInitialized() {
  return Boolean(
    app &&
    auth &&
    db &&
    realtimeDb
  );
}

// Retorna as instâncias do Firebase
function getFirebaseInstances() {
  if (!isFirebaseInitialized()) {
    console.warn(
      "Firebase não inicializado. Tentando inicializar..."
    );

    initializeFirebase();
  }

  return {
    app,
    auth,
    db,
    realtimeDb
  };
}

// Inicialização automática ao carregar o módulo
initializeFirebase();

// Exportações para os demais arquivos do projeto
export {
  app,
  auth,
  db,
  realtimeDb,
  initializeFirebase,
  isFirebaseInitialized,
  getFirebaseInstances
};