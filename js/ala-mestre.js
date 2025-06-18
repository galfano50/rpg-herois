import { app, db, auth } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "index.html";
  } else {
    listarFichas(user);
  }
});

async function listarFichas(user) {
  const container = document.getElementById("listaFichas");
  container.innerHTML = "<p>Carregando fichas...</p>";

  try {
    const fichasRef = collection(db, "fichas");
    const q = query(fichasRef, where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p>Nenhuma ficha encontrada.</p>";
      return;
    }

    container.innerHTML = "";
    querySnapshot.forEach((docSnap) => {
      const idCompleto = docSnap.id;

      // 👉 FILTRO: mostra apenas fichas criadas no modelo Ficha-Heróis (com ID contendo "_")
      if (!idCompleto.includes("_")) return;

      const dados = docSnap.data();

      const div = document.createElement("div");
      div.className = "ficha";
      div.innerHTML = `
        <strong>ID:</strong> ${idCompleto}<br>
        <strong>Nome:</strong> ${dados.nome || "Sem nome"}<br>
        <button onclick="abrirFicha('${idCompleto}')">📄 Abrir Ficha</button>
        <button onclick="deletarFicha('${idCompleto}')">🗑️ Excluir</button>
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
  // Abre corretamente no seu sistema ficha-herois
  window.open(`Ficha-Heróis.html?personagemId=${encodeURIComponent(id)}`, "_blank");
};

window.deletarFicha = async function (idCompleto) {
  if (!confirm(`Tem certeza que deseja excluir a ficha ${idCompleto}?`)) return;

  try {
    await deleteDoc(doc(db, "fichas", idCompleto));
    alert("Ficha excluída com sucesso.");
    const user = auth.currentUser;
    if (user) {
      listarFichas(user);
    }
  } catch (e) {
    console.error("Erro ao excluir ficha:", e);
    alert("Erro ao excluir a ficha.");
  }
};