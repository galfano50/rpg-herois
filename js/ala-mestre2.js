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
    doc
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
    const status = document.getElementById("statusMestre");

    if (!lista) {
        console.error("Elemento #listaFichas não encontrado.");
        return;
    }

    lista.innerHTML = "";

    if (status) {
        status.style.display = "block";
        status.innerHTML = "Carregando fichas...";
    }

    try {

        if (!isFirebaseInitialized()) {

            const firebase = getFirebaseInstances();

            if (!firebase.auth || !firebase.db) {
                throw new Error("Firebase não inicializado.");
            }

        }

        const snap = await getDocs(
            collection(
                db,
                "usuarios",
                usuarioLogado.uid,
                "personagens"
            )
        );

        const fichas = [];

        snap.forEach(docSnap => {

            fichas.push({
                id: docSnap.id,
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
                status.innerHTML = "Nenhuma ficha encontrada.";
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
        <h2 class="section-title">
            ${escapar(ficha.nome || "Sem Nome")}
        </h2>

        <div class="ficha-linha">
            <span class="ficha-label">Raça</span>
            <strong>${escapar(ficha.raca || "-")}</strong>
        </div>

        <div class="ficha-linha">
            <span class="ficha-label">Classe</span>
            <strong>${escapar(ficha.classe || "-")}</strong>
        </div>

        <div class="ficha-linha">
            <span class="ficha-label">Nível</span>
            <strong>${escapar(ficha.nivel || "1")}</strong>
        </div>

        <div class="ficha-linha">
            <span class="ficha-label">Vida</span>
            <strong>${escapar(ficha.vida || "0")}</strong>
        </div>

        <div class="ficha-linha">
            <span class="ficha-label">Energia</span>
            <strong>${escapar(ficha.energia || "0")}</strong>
        </div>

        <div class="ficha-linha">
            <span class="ficha-label">XP</span>
            <strong>${escapar(ficha.xp || "0")}</strong>
        </div>

        <div class="acoes-ficha">
            <button
                class="btn-rpg"
                onclick="abrirFicha('${ficha.id}')">
                Abrir
            </button>

            <button
                class="btn-rpg"
                onclick="excluirFicha('${ficha.id}', '${escaparAspas(ficha.nome || "Sem Nome")}')">
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

window.excluirFicha = async function(id, nome) {

    const confirmar = confirm(
        `Deseja excluir a ficha "${nome}"?`
    );

    if (!confirmar) return;

    try {

        await deleteDoc(
            doc(
                db,
                "usuarios",
                usuarioLogado.uid,
                "personagens",
                id
            )
        );

        alert("Ficha excluída com sucesso.");

        carregarFichasMestre();

    } catch (erro) {

        console.error("Erro ao excluir:", erro);

        alert("Erro ao excluir ficha: " + erro.message);

    }

};

window.carregarFichasMestre =
    carregarFichasMestre;

window.refreshFichas =
    carregarFichasMestre;

window.logout = function() {

    window.location.href = "index.html";

};

function escapar(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

function escaparAspas(valor) {

    return String(valor ?? "")
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll('"', "&quot;");

}