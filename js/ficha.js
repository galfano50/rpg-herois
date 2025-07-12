// Este script substitui o uso do localStorage por Firestore (Firebase)
import { auth, db, isFirebaseInitialized, getFirebaseInstances } from './firebase-config.js';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

let usuarioLogado = null;
let personagemId = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "index.html";
  } else {
    usuarioLogado = user;
    const urlParams = new URLSearchParams(window.location.search);
    personagemId = urlParams.get("personagemId") || crypto.randomUUID();
    
    // Aguarda o DOM estar pronto antes de carregar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', carregarFichaFirebase);
    } else {
      carregarFichaFirebase();
    }
  }
});

async function salvarFichaFirebase() {
  try {
    // Verificar se o Firebase está inicializado
    if (!isFirebaseInitialized()) {
      const { auth: authInstance, db: dbInstance } = getFirebaseInstances();
      if (!authInstance || !dbInstance) {
        showAlert('Erro: Firebase não foi inicializado corretamente.', 'error');
        return;
      }
    }

    if (!usuarioLogado) {
      alert("Você precisa estar logado para salvar a ficha.");
      return;
    }

    const ficha = { 
      uid: usuarioLogado.uid,
      personagemId: personagemId,
      dataSalvamento: new Date().toISOString()
    };

    // Campos principais
    const campos = [
      'nome','raca','classe','nivel','vida','energia','indice_protecao','xp','p_heroi','p_vilao',
      'extra11','extra12','pontos','forca','constituicao','destreza','agilidade','inteligencia',
      'percepcao','vontade','carisma','extra1','extra2','extra3','extra4','extra5','extra6',
      'extra7','extra8','extra9','extra10','poder1','poder2','poder3','poder4','poder5','poder6',
      'poder7','poder8','poder9','soma1','soma2','soma3','soma4','soma5','soma6','soma7','soma8',
      'aprimoramento1','aprimoramento2','aprimoramento3','aprimoramento4','positivo','negativo',
      'historia','primaria','secundaria','power1','power2','power3','power4','power5',
      'item1','item2','item3','item4','item5','golpes'
    ];

    campos.forEach(campo => {
      const el = document.getElementById(campo);
      if (el) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
          ficha[campo] = el.value || '';
        } else {
          ficha[campo] = el.textContent || '';
        }
      }
    });

    // Perícias - usando o novo ID da tabela
    const skillsTableBody = document.getElementById('skillsTableBody');
    ficha.pericias = [];

    if (skillsTableBody) {
      const rows = skillsTableBody.querySelectorAll('tr');
      rows.forEach((row) => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 3) {
          ficha.pericias.push({
            nome: inputs[0]?.value || '',
            att_atrelado: inputs[1]?.value || '',
            pontos: inputs[2]?.value || ''
          });
        }
      });
    }

    // Mochila - usando o novo ID da tabela
    const backpackTableBody = document.getElementById('backpackTableBody');
    ficha.mochila = [];

    if (backpackTableBody) {
      const rows = backpackTableBody.querySelectorAll('tr');
      rows.forEach((row) => {
        const textarea = row.querySelector('textarea');
        if (textarea) {
          ficha.mochila.push({ nome: textarea.value || '' });
        }
      });
    }

    await setDoc(doc(db, "fichas", personagemId), ficha);
    
    // Mostrar feedback visual
    const saveBtn = document.querySelector('button[onclick="salvarFichaFirebase()"]');
    if (saveBtn) {
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Salvando...';
      saveBtn.disabled = true;
      
      setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        showAlert('Ficha salva com sucesso!', 'success');
      }, 1000);
    }
  } catch (error) {
    console.error('Erro ao salvar ficha:', error);
    showAlert('Erro ao salvar ficha: ' + error.message, 'error');
  }
}

async function carregarFichaFirebase() {
  try {
    // Verificar se o Firebase está inicializado
    if (!isFirebaseInitialized()) {
      const { auth: authInstance, db: dbInstance } = getFirebaseInstances();
      if (!authInstance || !dbInstance) {
        showAlert('Erro: Firebase não foi inicializado corretamente.', 'error');
        return;
      }
    }

    if (!usuarioLogado) {
      alert("Você precisa estar logado para carregar a ficha.");
      return;
    }

    const docRef = doc(db, "fichas", personagemId);
    const snap = await getDoc(docRef);
    
    if (!snap.exists()) {
      showAlert("Ficha ainda não cadastrada.", 'info');
      return;
    }
    
    const ficha = snap.data();

    // Carregar campos principais
    for (const [chave, valor] of Object.entries(ficha)) {
      if (chave === 'pericias' || chave === 'mochila' || chave === 'uid' || chave === 'personagemId' || chave === 'dataSalvamento') {
        continue; // Pula campos especiais
      }
      
      const el = document.getElementById(chave);
      if (el) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
          el.value = valor || '';
        } else {
          el.textContent = valor || '';
        }
      }
    }

    // Carregar perícias
    if (ficha.pericias && Array.isArray(ficha.pericias)) {
      const skillsTableBody = document.getElementById('skillsTableBody');
      if (skillsTableBody) {
        const rows = skillsTableBody.querySelectorAll('tr');
        ficha.pericias.forEach((p, i) => {
          const row = rows[i];
          if (row) {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 3) {
              inputs[0].value = p.nome || '';
              inputs[1].value = p.att_atrelado || '';
              inputs[2].value = p.pontos || '';
            }
          }
        });
      }
    }

    // Carregar mochila
    if (ficha.mochila && Array.isArray(ficha.mochila)) {
      const backpackTableBody = document.getElementById('backpackTableBody');
      if (backpackTableBody) {
        const rows = backpackTableBody.querySelectorAll('tr');
        ficha.mochila.forEach((item, i) => {
          const row = rows[i];
          if (row) {
            const textarea = row.querySelector('textarea');
            if (textarea) {
              textarea.value = item.nome || '';
            }
          }
        });
      }
    }

    // Atualizar cálculos
    if (typeof modificarPontos === 'function') {
      modificarPontos();
    }
    if (typeof atualizarValores === 'function') {
      atualizarValores();
    }

    showAlert("Ficha carregada com sucesso!", 'success');
  } catch (error) {
    console.error('Erro ao carregar ficha:', error);
    showAlert('Erro ao carregar ficha: ' + error.message, 'error');
  }
}

function resetarFicha() {
  if (confirm("Tem certeza que deseja resetar toda a ficha? Esta ação não pode ser desfeita.")) {
    try {
      const campos = [
        'nome','raca','classe','nivel','vida','energia','indice_protecao','xp','p_heroi','p_vilao',
        'extra11','extra12','pontos','forca','constituicao','destreza','agilidade','inteligencia',
        'percepcao','vontade','carisma','extra1','extra2','extra3','extra4','extra5','extra6',
        'extra7','extra8','extra9','extra10','poder1','poder2','poder3','poder4','poder5','poder6',
        'poder7','poder8','poder9','soma1','soma2','soma3','soma4','soma5','soma6','soma7','soma8',
        'aprimoramento1','aprimoramento2','aprimoramento3','aprimoramento4','positivo','negativo',
        'historia','primaria','secundaria','power1','power2','power3','power4','power5',
        'item1','item2','item3','item4','item5','golpes'
      ];

      campos.forEach(campo => {
        const el = document.getElementById(campo);
        if (el) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.value = '';
          } else {
            el.textContent = '';
          }
        }
      });

      // Limpar tabelas
      const skillsTableBody = document.getElementById('skillsTableBody');
      if (skillsTableBody) {
        skillsTableBody.querySelectorAll('input').forEach(el => el.value = '');
      }

      const backpackTableBody = document.getElementById('backpackTableBody');
      if (backpackTableBody) {
        backpackTableBody.querySelectorAll('textarea').forEach(t => t.value = '');
      }

      // Resetar valores padrão
      const nivelEl = document.getElementById('nivel');
      if (nivelEl) {
        nivelEl.value = '1';
      }

      // Atualizar cálculos
      if (typeof modificarPontos === 'function') {
        modificarPontos();
      }
      if (typeof atualizarValores === 'function') {
        atualizarValores();
      }

      showAlert("Ficha resetada com sucesso!", 'success');
    } catch (error) {
      console.error('Erro ao resetar ficha:', error);
      showAlert('Erro ao resetar ficha: ' + error.message, 'error');
    }
  }
}

// Função para mostrar alertas personalizados
function showAlert(message, type = 'info') {
  // Criar elemento de alerta
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
  alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  // Adicionar ao body
  document.body.appendChild(alertDiv);

  // Remover automaticamente após 5 segundos
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

// Exporta funções globais
window.salvarFichaFirebase = salvarFichaFirebase;
window.carregarFichaFirebase = carregarFichaFirebase;
window.resetarFicha = resetarFicha;