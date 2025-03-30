// Importando os módulos do Firebase via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push, set, get, child } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCMWxGtooYe7UXzFop_FfCKu-M4ima5vMc",
  authDomain: "hospedagem-rpg.firebaseapp.com",
  databaseURL: "https://hospedagem-rpg-default-rtdb.firebaseio.com",
  projectId: "hospedagem-rpg",
  storageBucket: "hospedagem-rpg.firebasestorage.app",
  messagingSenderId: "834126719159",
  appId: "1:834126719159:web:f605f39f967f9bd2498532",
  measurementId: "G-41LQB57W3X"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/**
 * Função para salvar a ficha do herói no Firebase.
 */
export function salvarFicha() {
    const nome = document.getElementById("nomeHeroi").value;
    const classe = document.getElementById("classeHeroi").value;
    const nivel = document.getElementById("nivelHeroi").value;
    const atributos = document.getElementById("atributosHeroi").value;

    if (!nome) {
        alert("O nome do herói é obrigatório!");
        return;
    }

    const fichaRef = ref(db, 'fichas/' + nome);
    set(fichaRef, {
        nome,
        classe,
        nivel,
        atributos,
        timestamp: Date.now()
    }).then(() => {
        alert("Ficha salva com sucesso!");
    }).catch((error) => {
        console.error("Erro ao salvar a ficha:", error);
    });
}

/**
 * Função para carregar uma ficha do Firebase pelo nome do herói.
 */
export function carregarFicha() {
    const nome = document.getElementById("nomeHeroi").value;
    if (!nome) {
        alert("Digite o nome do herói para carregar a ficha!");
        return;
    }

    const fichaRef = ref(db, 'fichas/' + nome);
    get(fichaRef).then((snapshot) => {
        if (snapshot.exists()) {
            const ficha = snapshot.val();
            document.getElementById("classeHeroi").value = ficha.classe || "";
            document.getElementById("nivelHeroi").value = ficha.nivel || "";
            document.getElementById("atributosHeroi").value = ficha.atributos || "";
            alert("Ficha carregada com sucesso!");
        } else {
            alert("Ficha não encontrada!");
        }
    }).catch((error) => {
        console.error("Erro ao carregar a ficha:", error);
    });
}
