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

// Função de debug para buscar todas as fichas
async function debugBuscarTodasFichas() {
  try {
    console.log('DEBUG: Buscando todas as fichas sem filtro...');
    const fichasRef = collection(db, "fichas");
    const querySnapshot = await getDocs(fichasRef);
    
    console.log('DEBUG: Total de fichas encontradas:', querySnapshot.size);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('DEBUG: Ficha ID:', doc.id, 'UID:', data.uid, 'Nome:', data.nome);
    });
    
    return querySnapshot;
  } catch (error) {
    console.error('DEBUG: Erro ao buscar todas as fichas:', error);
    throw error;
  }
}

// Função principal para listar fichas
async function listarFichas(user) {
  console.log('Iniciando listagem de fichas para usuário:', user.uid);
  showLoading(true);
  
  try {
    // Verificar se o Firebase está inicializado
    if (!isFirebaseInitialized()) {
      console.log('Firebase não inicializado, tentando inicializar...');
      const { auth: authInstance, db: dbInstance } = getFirebaseInstances();
      if (!authInstance || !dbInstance) {
        console.error('Falha ao inicializar Firebase');
        showEmptyState();
        return;
      }
    }

    console.log('Firebase inicializado, buscando fichas...');
    const fichasRef = collection(db, "fichas");
    console.log('Referência da coleção criada');
    
    // Query mais simples possível - apenas buscar todas as fichas
    console.log('Criando query simples...');
    const querySnapshot = await getDocs(fichasRef);
    console.log('Query executada, resultado:', querySnapshot.size, 'documentos');

    if (querySnapshot.empty) {
      console.log('Nenhuma ficha encontrada no banco');
      showEmptyState();
      updateFichasCount(0);
      return;
    }

    // Filtrar no cliente as fichas do usuário atual
    const fichasDoUsuario = querySnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.uid === user.uid;
    });

    console.log('Fichas filtradas para o usuário:', fichasDoUsuario.length);

    if (fichasDoUsuario.length === 0) {
      console.log('Nenhuma ficha encontrada para o usuário');
      
      // Mostrar alerta informativo
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-info alert-dismissible fade show';
      alertDiv.innerHTML = `
        <i class="fas fa-info-circle me-2"></i>
        Existem ${querySnapshot.size} fichas no banco de dados, mas nenhuma pertence ao seu usuário atual (${user.uid}).
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      
      const container = document.querySelector('.container');
      container.insertBefore(alertDiv, container.firstChild);
      
      showEmptyState();
      updateFichasCount(0);
      return;
    }

    console.log('Criando cards para', fichasDoUsuario.length, 'fichas');
    const container = document.getElementById("listaFichas");
    container.innerHTML = "";
    
    // Ordenar os resultados no cliente para mostrar as mais recentes primeiro
    const fichasArray = fichasDoUsuario.map(doc => ({
      id: doc.id,
      data: doc.data()
    })).sort((a, b) => {
      const dateA = new Date(a.data.dataSalvamento || 0);
      const dateB = new Date(b.data.dataSalvamento || 0);
      return dateB - dateA; // Ordem decrescente (mais recente primeiro)
    });
    
    fichasArray.forEach((ficha) => {
      console.log('Processando ficha:', ficha.id, ficha.data);
      const docSnap = {
        id: ficha.id,
        data: () => ficha.data
      };
      const card = createFichaCard(docSnap, user);
      container.appendChild(card);
    });
    
    showFichasList();
    updateFichasCount(fichasArray.length);
    console.log('Listagem concluída com sucesso');
    
  } catch (error) {
    console.error("Erro detalhado ao listar fichas:", error);
    console.error("Stack trace:", error.stack);
    
    // Verificar se é erro de permissão
    if (error.code === 'permission-denied') {
      console.error('Erro de permissão detectado');
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-warning alert-dismissible fade show';
      alertDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        Erro de permissão: Você não tem acesso às fichas. Verifique as regras de segurança do Firestore.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      
      const container = document.querySelector('.container');
      container.insertBefore(alertDiv, container.firstChild);
    }
    
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
  console.log('Abrindo ficha:', id);
  window.open(`Ficha.html?personagemId=${encodeURIComponent(id)}`, "_blank");
};

// Função para deletar ficha (global)
window.deletarFicha = async function (id, nome) {
  const confirmacao = confirm(`Tem certeza que deseja excluir a ficha "${nome}"?\n\nEsta ação não pode ser desfeita.`);
  
  if (!confirmacao) return;

  try {
    console.log('Excluindo ficha:', id);
    
    // Verificar se o Firebase está inicializado
    if (!isFirebaseInitialized()) {
      const { auth: authInstance, db: dbInstance } = getFirebaseInstances();
      if (!authInstance || !dbInstance) {
        alert('Erro: Firebase não foi inicializado corretamente.');
        return;
      }
    }

    await deleteDoc(doc(db, "fichas", id));
    console.log('Ficha excluída com sucesso');
    
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

// Função para refresh das fichas (global)
window.refreshFichas = function() {
  console.log('Refresh solicitado');
  if (currentUser) {
    listarFichas(currentUser);
  } else {
    console.error('Usuário não autenticado');
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
  console.log('Estado de autenticação mudou:', user ? 'Usuário logado' : 'Usuário deslogado');
  
  if (!user) {
    console.log('Usuário não autenticado, redirecionando...');
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "index.html";
  } else {
    console.log('Usuário autenticado:', user.uid);
    currentUser = user;
    listarFichas(user);
  }
});