// auth.js - Sistema de autenticação Firebase
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { auth, db, isFirebaseInitialized, getFirebaseInstances } from './firebase-config.js';

// Função para verificar se o usuário está autenticado
function verificarAutenticacao() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Função para verificar se o usuário está logado e redirecionar se necessário
async function verificarLogin() {
  const user = await verificarAutenticacao();
  if (!user) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// Função para verificar se o usuário NÃO está logado e redirecionar se necessário
async function verificarNaoLogado() {
  const user = await verificarAutenticacao();
  if (user) {
    window.location.href = "home.html";
    return false;
  }
  return true;
}

// Função para exibir mensagens (compatível com Bootstrap)
function exibirMensagem(msg, tipo = "info", tempo = 5000) {
  // Se estiver em uma página com Bootstrap, usar alertas Bootstrap
  const mensagemEl = document.getElementById("mensagem");
  if (mensagemEl) {
    mensagemEl.textContent = msg;
    mensagemEl.className = `alert alert-${tipo === "erro" ? "danger" : tipo === "sucesso" ? "success" : "info"} d-block`;
    
    if (tempo > 0) {
      setTimeout(() => {
        mensagemEl.className = "alert d-none";
      }, tempo);
    }
  } else {
    // Fallback para alertas simples
    console.log(`[${tipo.toUpperCase()}] ${msg}`);
    if (tipo === "erro") {
      alert(`Erro: ${msg}`);
    }
  }
}

async function register(email, password) {
  if (!email || !password) {
    throw new Error("Preencha todos os campos.");
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Criar documento do usuário no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      email: user.email,
      uid: user.uid,
      criadoEm: new Date().toISOString(),
      ultimoLogin: new Date().toISOString()
    });

    // Mostrar mensagem de sucesso
    exibirMensagem("Usuário registrado com sucesso!", "sucesso");

    // Redirecionar após um breve delay
    setTimeout(() => {
      window.location.href = "home.html";
    }, 1500);

  } catch (error) {
    let errorMessage;
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "O email já está em uso.";
        break;
      case "auth/invalid-email":
        errorMessage = "Email inválido.";
        break;
      case "auth/weak-password":
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Erro de conexão. Verifique sua internet.";
        break;
      default:
        errorMessage = "Erro ao registrar: " + error.message;
    }
    throw new Error(errorMessage);
  }
}

async function login(email, password) {
  if (!email || !password) {
    throw new Error("Preencha todos os campos para login.");
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Atualizar último login no Firestore
    try {
      await setDoc(doc(db, "usuarios", user.uid), {
        email: user.email,
        uid: user.uid,
        ultimoLogin: new Date().toISOString()
      }, { merge: true });
    } catch (firestoreError) {
      console.warn("Erro ao atualizar último login:", firestoreError);
    }

    // Mostrar mensagem de sucesso
    exibirMensagem("Login realizado com sucesso!", "sucesso");

    // Redirecionar após um breve delay
    setTimeout(() => {
      window.location.href = "home.html";
    }, 1500);

  } catch (error) {
    let errorMessage;
    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "Usuário não encontrado.";
        break;
      case "auth/wrong-password":
        errorMessage = "Senha incorreta.";
        break;
      case "auth/invalid-email":
        errorMessage = "Email inválido.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Muitas tentativas. Tente novamente em alguns minutos.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Erro de conexão. Verifique sua internet.";
        break;
      default:
        errorMessage = "Erro ao fazer login: " + error.message;
    }
    throw new Error(errorMessage);
  }
}

async function logout() {
  try {
    await signOut(auth);
    exibirMensagem("Logout realizado com sucesso!", "sucesso");
    
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    exibirMensagem("Erro ao fazer logout: " + error.message, "erro");
  }
}

// Função para obter dados do usuário atual
function getCurrentUser() {
  return auth.currentUser;
}

// Função para verificar se há um usuário logado
function isLoggedIn() {
  return !!auth.currentUser;
}

// Função para obter o UID do usuário atual
function getCurrentUserId() {
  return auth.currentUser?.uid;
}

// Listener para mudanças no estado de autenticação
function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export { 
  register, 
  login, 
  logout, 
  verificarAutenticacao, 
  verificarLogin, 
  verificarNaoLogado,
  getCurrentUser,
  isLoggedIn,
  getCurrentUserId,
  onAuthStateChange,
  exibirMensagem
};