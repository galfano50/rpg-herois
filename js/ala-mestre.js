import { app, db, auth } from './firebase-config.js';
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Garante que o mestre esteja logado antes de acessar
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "index.html";
  } else {
    listarFichas(); // sem filtro por UID
  }
});

async function listarFichas() {
  const container = document.getElementById("listaFichas");
  container.innerHTML = "<p>Carregando fichas...</p>";

  try {
    const fichasRef = collection(db, "fichas");
    const querySnapshot = await getDocs(fichasRef);

    if (querySnapshot.empty) {
      container.innerHTML = "<p>Nenhuma ficha encontrada.</p>";
      return;
    }

    container.innerHTML = "";
    querySnapshot.forEach((docSnap) => {
      const dados = docSnap.data();
      const personagemId = docSnap.id;

      const div = document.createElement("div");
      div.className = "ficha";
      div.innerHTML = `
        <strong>ID:</strong> ${personagemId}<br>
        <strong>Nome:</strong> ${dados.nome || "Sem nome"}<br>
        <strong>Classe:</strong> ${dados.classe || "?"}<br>
        <strong>Raça:</strong> ${dados.raca || "?"}<br>
        <strong>Nível:</strong> ${dados.nivel || "?"}<br>
        <strong>Criado por (UID):</strong> ${dados.uid || "?"}<br>
        <button onclick="abrirFicha('${personagemId}')">📄 Abrir Ficha</button>
        <button onclick="deletarFicha('${docSnap.id}')">🗑️ Excluir</button>
        <hr>
      `;
      container.appendChild(div);
    });
  } catch (e) {
    console.error("Erro ao listar fichas:", e);
    container.innerHTML = "<p>Erro ao buscar fichas.</p>";
  }
}

window.abrirFicha = function (id) {
  window.open(`Ficha.html?personagemId=${encodeURIComponent(id)}`, "_blank");
};

window.deletarFicha = async function (idCompleto) {
  if (!confirm(`Tem certeza que deseja excluir a ficha "${idCompleto}"?`)) return;

  try {
    await deleteDoc(doc(db, "fichas", idCompleto));
    alert("Ficha excluída com sucesso.");
    listarFichas();
  } catch (e) {
    console.error("Erro ao excluir ficha:", e);
    alert("Erro ao excluir a ficha.");
  }
};
