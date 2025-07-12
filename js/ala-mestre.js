// ala-mestre.js - Sistema de gerenciamento de fichas para o mestre
import { app, db, auth, isFirebaseInitialized, getFirebaseInstances } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

let currentUser = null;

// Função para mostrar/esconder estados de loading
function showLoading(show = true) {
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  const listaFichas = document.getElementById('listaFichas');
  
  if (show) {
    loadingState.classList.remove('d-none');
    emptyState.classList.add('d-none');
    listaFichas.classList.add('d-none');
  } else {
    loadingState.classList.add('d-none');
  }
}

// Função para mostrar estado vazio
function showEmptyState() {
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  const listaFichas = document.getElementById('listaFichas');
  
  loadingState.classList.add('d-none');
  emptyState.classList.remove('d-none');
  listaFichas.classList.add('d-none');
}

// Função para mostrar lista de fichas
function showFichasList() {
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  const listaFichas = document.getElementById('listaFichas');
  
  loadingState.classList.add('d-none');
  emptyState.classList.add('d-none');
  listaFichas.classList.remove('d-none');
}

// Função para atualizar contador de fichas
function updateFichasCount(count) {
  const totalFichas = document.getElementById('totalFichas');
  if (totalFichas) {
    totalFichas.textContent = count;
  }
}

// Função para formatar data
function formatDate(dateString) {
  if (!dateString) return 'Data não disponível';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Data inválida';
  }
}

// Função para criar card de ficha
function createFichaCard(docSnap, user) {
  const dados = docSnap.data();
  const personagemId = docSnap.id;
  
  // Extrair informações básicas
  const nome = dados.nome || "Sem nome";
  const raca = dados.raca || "Não definida";
  const classe = dados.classe || "Não definida";
  const nivel = dados.nivel || "1";
  const dataSalvamento = formatDate(dados.dataSalvamento);
  
  // Calcular estatísticas
  const vida = dados.vida || "0";
  const energia = dados.energia || "0";
  const xp = dados.xp || "0";
  
  const col = document.createElement("div");
  col.className = "col-md-6 col-lg-4 mb-4";
  
  col.innerHTML = `
    <div class="ficha-card">
      <div class="ficha-info">
        <h5 class="mb-3">
          <i class="fas fa-user me-2"></i>${nome}
        </h5>
        
        <div class="row mb-3">
          <div class="col-6">
            <small class="text-muted">Raça</small><br>
            <strong>${raca}</strong>
          </div>
          <div class="col-6">
            <small class="text-muted">Classe</small><br>
            <strong>${classe}</strong>
          </div>
        </div>
        
        <div class="row mb-3">
          <div class="col-4">
            <small class="text-muted">Nível</small><br>
            <strong>${nivel}</strong>
          </div>
          <div class="col-4">
            <small class="text-muted">Vida</small><br>
            <strong>${vida}</strong>
          </div>
          <div class="col-4">
            <small class="text-muted">Energia</small><br>
            <strong>${energia}</strong>
          </div>
        </div>
        
        <div class="mb-3">
          <small class="text-muted">XP</small><br>
          <strong>${xp}</strong>
        </div>
        
        <div class="mb-3">
          <small class="text-muted">Última atualização</small><br>
          <small>${dataSalvamento}</small>
        </div>
      </div>
      
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-master" onclick="abrirFicha('${personagemId}')">
          <i class="fas fa-eye me-2"></i>Ver Ficha
        </button>
        <button class="btn btn-master btn-danger-master" onclick="deletarFicha('${personagemId}', '${nome}')">
          <i class="fas fa-trash me-2"></i>Excluir
        </button>
      </div>
    </div>
  `;
  
  return col;
}

// Função principal para listar fichas
async function listarFichas(user) {
  showLoading(true);
  
  try {
    // Verificar se o Firebase está inicializado
    if (!isFirebaseInitialized()) {
      const { auth: authInstance, db: dbInstance } = getFirebaseInstances();
      if (!authInstance || !dbInstance) {
        showEmptyState();
        console.error('Firebase não foi inicializado corretamente.');
        return;
      }
    }

    const fichasRef = collection(db, "fichas");
    const q = query(
      fichasRef, 
      where("uid", "==", user.uid),
      orderBy("dataSalvamento", "desc")
    );
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      showEmptyState();
      updateFichasCount(0);
      return;
    }

    const container = document.getElementById("listaFichas");
    container.innerHTML = "";
    
    querySnapshot.forEach((docSnap) => {
      const card = createFichaCard(docSnap, user);
      container.appendChild(card);
    });
    
    showFichasList();
    updateFichasCount(querySnapshot.size);
    
  } catch (error) {
    console.error("Erro ao listar fichas:", error);
    showEmptyState();
    
    // Mostrar alerta de erro
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
      <i class="fas fa-exclamation-triangle me-2"></i>
      Erro ao carregar fichas: ${error.message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
  }
}

// Função para abrir ficha (global)
window.abrirFicha = function (id) {
  window.open(`Ficha.html?personagemId=${encodeURIComponent(id)}`, "_blank");
};

// Função para deletar ficha (global)
window.deletarFicha = async function (id, nome) {
  const confirmacao = confirm(`Tem certeza que deseja excluir a ficha "${nome}"?\n\nEsta ação não pode ser desfeita.`);
  
  if (!confirmacao) return;

  try {
    // Verificar se o Firebase está inicializado
    if (!isFirebaseInitialized()) {
      const { auth: authInstance, db: dbInstance } = getFirebaseInstances();
      if (!authInstance || !dbInstance) {
        alert('Erro: Firebase não foi inicializado corretamente.');
        return;
      }
    }

    await deleteDoc(doc(db, "fichas", id));
    
    // Mostrar mensagem de sucesso
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
      <i class="fas fa-check-circle me-2"></i>
      Ficha "${nome}" excluída com sucesso!
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Recarregar lista
    if (currentUser) {
      listarFichas(currentUser);
    }
    
  } catch (error) {
    console.error("Erro ao excluir ficha:", error);
    
    // Mostrar alerta de erro
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
      <i class="fas fa-exclamation-triangle me-2"></i>
      Erro ao excluir ficha: ${error.message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
  }
};

// Função para logout (global)
window.logout = async function() {
  try {
    const { logout } = await import('./auth.js');
    await logout();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    window.location.href = 'index.html';
  }
};

// Listener para mudanças no estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "index.html";
  } else {
    currentUser = user;
    listarFichas(user);
  }
});