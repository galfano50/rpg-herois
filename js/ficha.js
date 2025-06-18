// Este script substitui o uso do localStorage por Firestore (Firebase)
import { auth, db } from './firebase-config.js';
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
    carregarFichaFirebase();
  }
});

async function salvarFichaFirebase() {
  const ficha = { uid: usuarioLogado.uid };

  // Campos principais
  const campos = [
    'nome','raca','classe','nivel','vida','energia','indice_protecao','xp','p_heroi','p_vilao',
    'extra11','extra12','pontos','forca','constituicao','destreza','agilidade','inteligencia',
    'percepcao','vontade','carisma','extra1','extra2','extra3','extra4','extra5','extra6',
    'extra7','extra8','extra9','extra10','poder1','poder2','poder3','poder4','poder5','poder6',
    'poder7','poder8','poder9','poder10','poder11','poder12','poder13','poder14','poder15',
    'soma1','soma2','soma3','soma4','soma5','soma6','soma7','soma8',
    'aprimoramento1','aprimoramento2','aprimoramento3','aprimoramento4','positivo','negativo',
    'historia','primaria','secundaria','power1','power2','power3','power4','power5',
    'item1','item2','item3','item4','item5','golpes'
  ];

  campos.forEach(campo => {
    const el = document.getElementById(campo);
    ficha[campo] = el ? el.value || el.textContent : '';
  });

  // Perícias
  ficha.pericias = Array.from(document.querySelectorAll('.pericia-section')).map(section => {
    const inputs = section.querySelectorAll('input');
    return {
      nome: inputs[0]?.value || '',
      att_atrelado: inputs[1]?.value || '',
      pontos: inputs[2]?.value || ''
    };
  });

  // Mochila
  ficha.mochila = Array.from(document.querySelectorAll('.mochila-section textarea')).map(t => ({ nome: t.value || '' }));

  await setDoc(doc(db, "fichas", personagemId), ficha);
  alert("Ficha salva com sucesso no Firestore!");
}

async function carregarFichaFirebase() {
  const docRef = doc(db, "fichas", personagemId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    alert("Ficha ainda não cadastrada.");
    return;
  }
  const ficha = snap.data();

  for (const [chave, valor] of Object.entries(ficha)) {
    const el = document.getElementById(chave);
    if (el) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
        el.value = valor;
      } else {
        el.textContent = valor;
      }
    }
  }

  if (ficha.pericias) {
    document.querySelectorAll('.pericia-section').forEach((section, i) => {
      const inputs = section.querySelectorAll('input');
      const p = ficha.pericias[i] || {};
      if (inputs.length >= 3) {
        inputs[0].value = p.nome || '';
        inputs[1].value = p.att_atrelado || '';
        inputs[2].value = p.pontos || '';
      }
    });
  }

  if (ficha.mochila) {
    document.querySelectorAll('.mochila-section textarea').forEach((t, i) => {
      t.value = ficha.mochila[i]?.nome || '';
    });
  }

  alert("Ficha carregada do Firestore!");
}

function resetarFicha() {
  const campos = [
    'nome','raca','classe','nivel','vida','energia','indice_protecao','xp','p_heroi','p_vilao',
    'extra11','extra12','pontos','forca','constituicao','destreza','agilidade','inteligencia',
    'percepcao','vontade','carisma','extra1','extra2','extra3','extra4','extra5','extra6',
    'extra7','extra8','extra9','extra10','poder1','poder2','poder3','poder4','poder5','poder6',
    'poder7','poder8','poder9','poder10','poder11','poder12','poder13','poder14','poder15',
    'soma1','soma2','soma3','soma4','soma5','soma6','soma7','soma8',
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

  document.querySelectorAll('.pericia-section input').forEach(el => el.value = '');
  document.querySelectorAll('.mochila-section textarea').forEach(t => t.value = '');

  alert("Todos os campos da ficha foram limpos.");
}

// Exporta funções globais
window.salvarFichaFirebase = salvarFichaFirebase;
window.carregarFichaFirebase = carregarFichaFirebase;
window.resetarFicha = resetarFicha;
