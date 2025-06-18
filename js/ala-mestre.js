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

// Espera o login do usuário
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "index.html";
  } else {
    carregarFichasDoSistemaHeroi(user.uid);
  }
});

async function carregarFichasDoSistemaHeroi(uid) {
  const container = document.getElementById("listaFichas");
  container.innerHTML = "<p>Carregando fichas...</p>";

  try {
    const fichasRef = collection(db, "fichas");
    const snapshot = await getDocs(fichasRef);

    const fichasHerois = [];

    snapshot.forEach((docSnap) => {
      const id = docSnap.id;

      // Verifica se é uma ficha do sistema Ficha-Heróis
      if (id.startsWith(uid + "_")) {
        fichasHerois.push({ id, ...docSnap.data() });
      }
    });

    if (fichasHerois.length === 0) {
      container.innerHTML = "<p>Nenhuma ficha do sistema Ficha-Heróis encontrada.</p>";
      return;
    }

    container.innerHTML = "";
    fichasHerois.forEach((ficha) => {
      const div = document.createElement("div");
      div.className = "ficha";
      div.innerHTML = `
        <strong>ID:</strong> ${ficha.id}<br>
        <strong>Nome:</strong> ${ficha.nome || "Sem nome"}<br>
        <button onclick="abrirFicha('${ficha.id}')">📄 Abrir Ficha</button>
        <button onclick="deletarFicha('${ficha.id}')">🗑️ Excluir</button>
        <hr>
      `;
      container.appendChild(div);
    });

  } catch (e) {
    console.error("Erro ao carregar fichas:", e);
    container.innerHTML = "<p>Erro ao buscar fichas.</p>";
  }
}

window.abrirFicha = function (id) {
  // ✅ Redireciona corretamente para Ficha.html agora
  window.open(`Ficha.html?personagemId=${encodeURIComponent(id)}`, "_blank");
};

window.deletarFicha = async function (id) {
  if (!confirm(`Tem certeza que deseja excluir a ficha ${id}?`)) return;

  try {
    await deleteDoc(doc(db, "fichas", id));
    alert("Ficha excluída com sucesso.");
    const user = auth.currentUser;
    if (user) {
      carregarFichasDoSistemaHeroi(user.uid); // Recarrega a lista
    }
  } catch (e) {
    console.error("Erro ao excluir ficha:", e);
    alert("Erro ao excluir a ficha.");
  }
};