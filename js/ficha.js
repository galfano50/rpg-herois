// ficha.js corrigido e integrado com Firebase
import { app, db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "index.html";
  } else {
    currentUser = user;
    const params = new URLSearchParams(window.location.search);
    const personagemId = params.get("personagemId");
    if (personagemId) {
      const inputId = document.getElementById('personagemId');
      if (inputId) inputId.value = personagemId;
      carregarFicha(`${user.uid}_${personagemId}`);
    }
  }
});

window.salvarFicha = async function () {
  const id = document.getElementById('personagemId')?.value.trim();
  if (!id || !currentUser) return alert("Informe o ID do personagem e esteja logado.");

  const docId = `${currentUser.uid}_${id}`;

  const getVal = (id) => document.getElementById(id)?.value || "";
  const getTxt = (id) => document.getElementById(id)?.textContent || "";

  const ficha = {
    uid: currentUser.uid,
    nome: getVal('nome'),
    raca: getVal('raca'),
    classe: getVal('classe'),
    individualidade: getVal('individualidade'),
    alcunha: getVal('alcunha'),
    patente: getVal('patente'),
    estilo: getVal('estilo'),
    idade: getVal('idade'),
    altura: getVal('altura'),
    nivel: getVal('nivel'),
    xp: getVal('xp'),
    vida: getVal('vida'),
    energia: getVal('energia'),
    danoSofrido: getVal('danoSofrido'),
    gasto1: getVal('gasto1'),
    pontos: getTxt('pontos'),
    pontos2: getTxt('pontos2'),
    stamina2: getVal('stamina2'),
    gasto3: getVal('gasto3'),
    forca: getVal('forca'),
    constituicao: getVal('constituicao'),
    destreza: getVal('destreza'),
    velocidade: getVal('velocidade'),
    dano: getVal('dano'),
    armadura: getVal('armadura'),
    iniciativa: getVal('iniciativa'),
    sabedoria: getVal('sabedoria'),
    percepcao: getVal('percepcao'),
    espirito: getVal('espirito'),
    concentracao: getVal('concentracao'),
    precisao: getVal('precisao'),
    recuperacao: getVal('recuperacao'),
    nado: getVal('nado'),
    voo: getVal('voo'),
    primaria: getVal('primaria'),
    secundaria: getVal('secundaria'),
    item1: getVal('item1'),
    item2: getVal('item2'),
    item3: getVal('item3'),
    item4: getVal('item4'),
    item5: getVal('item5'),
    item6: getVal('item6'),
    item7: getVal('item7'),
    golpes1: getVal('golpes1'),
    golpes2: getVal('golpes2'),
    golpes3: getVal('golpes3'),
    soma1: getTxt('soma1'), soma2: getTxt('soma2'), soma3: getTxt('soma3'),
    soma4: getTxt('soma4'), soma5: getTxt('soma5'), soma6: getTxt('soma6'),
    soma7: getTxt('soma7'), soma8: getTxt('soma8'), soma9: getTxt('soma9'),
    soma10: getTxt('soma10'), soma11: getTxt('soma11'), soma12: getTxt('soma12'),
    soma13: getTxt('soma13'), soma14: getTxt('soma14'), soma15: getTxt('soma15'),
    bonusRaca: getTxt('bonusRaca'),
    hakiAvancado: {
      grauPercepcao: getVal('grauPercepcao'), focoPercepcao: getVal('focoPercepcao'), premonicao: getVal('premonicao'), previsao: getVal('previsao'), verFuturo: getVal('verFuturo'),
      grauArmamento: getVal('grauArmamento'), focoArmamento: getVal('focoArmamento'), ofensivo: getVal('ofensivo'), defensivo: getVal('defensivo'), avancadoArmamento: getVal('avancadoArmamento'),
      grauRei: getVal('grauRei'), focoRei: getVal('focoRei'), ordem: getVal('ordem'), presenca: getVal('presenca'), avancadoRei: getVal('avancadoRei')
    },
    fruta: {},
    haki: {},
    extra: {}
  };

  for (let i = 1; i <= 15; i++) ficha.fruta[`poder${i}`] = getVal(`poder${i}`);
  for (let i = 1; i <= 8; i++) ficha.haki[`haki${i}`] = getVal(`haki${i}`);
  for (let i = 1; i <= 15; i++) ficha.extra[`extra${i}`] = getVal(`extra${i}`);

  ficha.atributosBase = {};
  document.querySelectorAll('.atributos input[type="number"]').forEach(input => {
    ficha.atributosBase[input.id] = input.getAttribute('data-base') || '0';
  });

  ficha.pericias = Array.from(document.querySelectorAll("#pericias-body tr")).map(row => {
    const inputs = row.querySelectorAll("input");
    return { nome: inputs[0]?.value || '', pontos: inputs[1]?.value || '' };
  });

  ficha.mochila = Array.from(document.querySelectorAll(".mochila-section textarea")).map(el => ({ nome: el.value }));

  ficha.akumaDetalhado = Array.from(document.querySelectorAll('.akuma-no-mi input')).map(i => i.value);
  const pontosRestantes = getTxt('pontosRestantesAkuma');
  if (pontosRestantes) ficha.akumaDetalhado.push(`__pontos__:${pontosRestantes}`);

  try {
    await setDoc(doc(db, "fichas", docId), ficha);
    alert("Ficha salva com sucesso!");
  } catch (e) {
    console.error("Erro ao salvar:", e);
    alert("Erro ao salvar a ficha.");
  }
};

async function carregarFicha(docId) {
  try {
    const docRef = doc(db, "fichas", docId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const dados = snap.data();

    for (const key in dados) {
      if (["fruta", "haki", "extra", "hakiAvancado", "atributosBase", "pericias", "mochila", "akumaDetalhado"].includes(key)) continue;
      const el = document.getElementById(key);
      if (el && dados[key] !== undefined) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
          el.value = dados[key];
        } else {
          el.textContent = dados[key];
        }
      }
    }

    if (dados.fruta) {
      for (const key in dados.fruta) {
        const el = document.getElementById(key);
        if (el) el.value = dados.fruta[key];
      }
    }
    if (dados.haki) {
      for (const key in dados.haki) {
        const el = document.getElementById(key);
        if (el) el.value = dados.haki[key];
      }
    }
    if (dados.extra) {
      for (const key in dados.extra) {
        const el = document.getElementById(key);
        if (el) el.value = dados.extra[key];
      }
    }
    if (dados.hakiAvancado) {
      for (const key in dados.hakiAvancado) {
        const el = document.getElementById(key);
        if (el) el.value = dados.hakiAvancado[key];
      }
    }
    if (dados.atributosBase) {
      for (const id in dados.atributosBase) {
        const el = document.getElementById(id);
        if (el) el.setAttribute("data-base", dados.atributosBase[id]);
      }
    }
    if (dados.pericias) {
      const tbody = document.getElementById("pericias-body");
      tbody.innerHTML = "";
      dados.pericias.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td><input value="${p.nome}"/></td><td><input value="${p.pontos}"/></td>`;
        tbody.appendChild(tr);
      });
    }
    if (dados.mochila) {
      const mochilas = document.querySelectorAll(".mochila-section textarea");
      dados.mochila.forEach((m, i) => {
        if (mochilas[i]) mochilas[i].value = m.nome;
      });
    }
    if (dados.akumaDetalhado) {
      const inputs = document.querySelectorAll('.akuma-no-mi input');
      dados.akumaDetalhado.forEach((v, i) => {
        if (inputs[i]) inputs[i].value = v.startsWith('__pontos__') ? '' : v;
      });
      const pontosAkuma = dados.akumaDetalhado.find(x => x.startsWith('__pontos__'));
      if (pontosAkuma) {
        const el = document.getElementById("pontosRestantesAkuma");
        if (el) el.textContent = pontosAkuma.split(':')[1];
      }
    }
  } catch (e) {
    console.error("Erro ao carregar ficha:", e);
    alert("Erro ao carregar a ficha.");
  }
}

window.carregarFicha = carregarFicha;
