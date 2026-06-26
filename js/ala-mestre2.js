import {
    auth,
    db,
    isFirebaseInitialized,
    getFirebaseInstances
} from "./firebase-config.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

let usuarioLogado = null;

onAuthStateChanged(auth, user => {
    if (!user) {
        alert("Você precisa estar logado.");
        window.location.href = "index.html";
        return;
    }

    usuarioLogado = user;
    carregarFichasMestre();
});

async function carregarFichasMestre() {
    const lista = document.getElementById("listaFichas");
    const total = document.getElementById("totalFichas");
    const status =
        document.getElementById("statusMestre") ||
        document.getElementById("loadingState");

    if (!lista) {
        console.error("Não achei o elemento #listaFichas no HTML.");
        return;
    }

    lista.innerHTML = "";

    if (status) {
        status.style.display = "block";
        status.innerHTML = "Carregando fichas...";
    }

    try {
        if (!isFirebaseInitialized()) {
            getFirebaseInstances();
        }

        let fichas = [];

        // CAMINHO NOVO: usuarios/{uid}/personagens
        const snapNovo = await getDocs(
            collection(
                db,
                "usuarios",
                usuarioLogado.uid,
                "personagens"
            )
        );

        snapNovo.forEach(docSnap => {
            fichas.push({
                id: docSnap.id,
                origem: "novo",
                ...docSnap.data()
            });
        });

        // CAMINHO ANTIGO: fichas where uid == usuario
        const qAntigo = query(
            collection(db, "fichas"),
            where("uid", "==", usuarioLogado.uid)
        );

        const snapAntigo = await getDocs(qAntigo);

        snapAntigo.forEach(docSnap => {
            fichas.push({
                id: docSnap.id,
                origem: "antigo",
                ...docSnap.data()
            });
        });

        fichas.sort((a, b) =>
            Number(b.timestamp || 0) - Number(a.timestamp || 0)
        );

        if (total) {
            total.textContent = fichas.length;
        }

        if (fichas.length === 0) {
            if (status) {
                status.innerHTML = "Nenhuma ficha encontrada no Firebase.";
            }
            return;
        }

        if (status) {
            status.style.display = "none";
        }

        fichas.forEach(ficha => {
            lista.appendChild(criarCardFicha(ficha));
        });

    } catch (erro) {
        console.error("Erro ao carregar fichas:", erro);

        if (status) {
            status.innerHTML =
                "Erro ao carregar fichas: " + erro.message;
        }
    }
}

function criarCardFicha(ficha) {
    const card = document.createElement("div");
    card.className = "bloco-rpg card-ficha-mestre";

    card.innerHTML = `
        <h2 class="section-title">${ficha.nome || "Sem Nome"}</h2>

        <div class="ficha-linha">
            <span class="ficha-label">Raça</span>
            <strong>${ficha.raca || "-"}</strong>
        </div>

        <div class="ficha-linha">
            <span class="ficha-label">Classe</span>
            <strong>${ficha.classe || "-"}</strong>
        </div>

        <div class="ficha-linha">
            <span class="ficha-label">Nível</span>
            <strong>${ficha.nivel || "1"}</strong>
        </div>

        <div class="ficha-linha">
            <span class="ficha-label">Vida</span>
            <strong>${ficha.vida || "0"}</strong>
        </div>

        <div class="ficha-linha">
            <span class="ficha-label">Energia</span>
            <strong>${ficha.energia || "0"}</strong>
        </div>

        <div class="acoes-ficha">
            <button class="btn-rpg" onclick="abrirFicha('${ficha.id}')">
                Abrir
            </button>

            <button class="btn-rpg" onclick="excluirFicha('${ficha.id}', '${ficha.origem}')">
                Excluir
            </button>
        </div>
    `;

    return card;
}

window.abrirFicha = function(id) {
    window.location.href =
        "Ficha.html?personagemId=" + encodeURIComponent(id);
};

window.excluirFicha = async function(id, origem) {
    if (!confirm("Deseja excluir esta ficha?")) return;

    if (origem === "novo") {
        await deleteDoc(
            doc(db, "usuarios", usuarioLogado.uid, "personagens", id)
        );
    } else {
        await deleteDoc(
            doc(db, "fichas", id)
        );
    }

    carregarFichasMestre();
};

window.carregarFichasMestre = carregarFichasMestre;
window.refreshFichas = carregarFichasMestre;
window.logout = function() {
    window.location.href = "index.html";
};