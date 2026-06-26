// js/ala-mestre.js

import {
    auth,
    db,
    isFirebaseInitialized,
    getFirebaseInstances
} from "./firebase-config.js";

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

let usuarioAtual = null;
let todasAsFichas = [];
let fichasFiltradas = [];

// ===============================
// AUTENTICAÇÃO
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        alert("Você precisa estar logado para acessar a Ala do Mestre.");
        window.location.href = "index.html";
        return;
    }

    usuarioAtual = user;

    await carregarFichas();

});

// ===============================
// CARREGAR FICHAS
// ===============================

async function carregarFichas() {

    mostrarLoading(true);
    mostrarVazio(false);

    todasAsFichas = [];
    fichasFiltradas = [];

    try {

        if (!isFirebaseInitialized()) {
            const firebase = getFirebaseInstances();

            if (!firebase.auth || !firebase.db) {
                mostrarAlerta("Erro ao iniciar Firebase.", "error");
                mostrarLoading(false);
                return;
            }
        }

        const q = query(
            collection(db, "fichas"),
            where("uid", "==", usuarioAtual.uid)
        );

        const snap = await getDocs(q);

        snap.forEach(documento => {

            todasAsFichas.push({
                id: documento.id,
                ...documento.data()
            });

        });

        ordenarArray(todasAsFichas, "data");

        fichasFiltradas = [...todasAsFichas];

        desenharFichas();

    } catch (erro) {

        console.error("Erro ao carregar fichas:", erro);
        mostrarAlerta("Erro ao carregar fichas.", "error");

    } finally {

        mostrarLoading(false);

    }

}

// ===============================
// DESENHAR FICHAS
// ===============================

function desenharFichas() {

    const lista = document.getElementById("listaFichas");

    if (!lista) return;

    lista.innerHTML = "";

    atualizarTotal();
    atualizarData();

    if (fichasFiltradas.length === 0) {
        mostrarVazio(true);
        return;
    }

    mostrarVazio(false);

    fichasFiltradas.forEach(ficha => {

        const card = criarCardFicha(ficha);
        lista.appendChild(card);

    });

}

// ===============================
// CARD DA FICHA
// ===============================

function criarCardFicha(ficha) {

    const card = document.createElement("article");
    card.className = "card-personagem";

    const poderes = contarPoderes(ficha);
    const pericias = contarPericias(ficha);
    const mochila = contarMochila(ficha);
    const arsenal = contarArsenal(ficha);

    card.innerHTML = `
        <div class="titulo-card">
            ${escapar(ficha.nome || "Sem Nome")}
        </div>

        <div class="subtitulo-card">
            ${escapar(ficha.raca || "Raça indefinida")}
            •
            ${escapar(ficha.classe || "Classe indefinida")}
        </div>

        <div class="linha-card">
            <span>⭐ Nível</span>
            <strong>${escapar(ficha.nivel || "1")}</strong>
        </div>

        <div class="linha-card">
            <span>❤ Vida</span>
            <strong>${escapar(ficha.vida || "0")}</strong>
        </div>

        <div class="linha-card">
            <span>🔷 Energia</span>
            <strong>${escapar(ficha.energia || "0")}</strong>
        </div>

        <div class="linha-card">
            <span>🏆 XP</span>
            <strong>${escapar(ficha.xp || "0")}</strong>
        </div>

        <div class="linha-card">
            <span>🛡 IP Cinético</span>
            <strong>${escapar(ficha.indice_protecao || "0")}</strong>
        </div>

        <div class="linha-card">
            <span>🛡 IP Balístico</span>
            <strong>${escapar(ficha.indice_protecao2 || "0")}</strong>
        </div>

        <hr>

        <div class="linha-card">
            <span>✨ Poderes</span>
            <strong>${poderes}</strong>
        </div>

        <div class="linha-card">
            <span>✦ Perícias</span>
            <strong>${pericias}</strong>
        </div>

        <div class="linha-card">
            <span>🎒 Mochila</span>
            <strong>${mochila}</strong>
        </div>

        <div class="linha-card">
            <span>⚔ Arsenal</span>
            <strong>${arsenal}</strong>
        </div>

        <div class="linha-card pequena">
            Última atualização:
            ${formatarData(ficha.dataSalvamento)}
        </div>

        <div class="acoes-card">

            <button
                class="botao-card"
                onclick="abrirFicha('${ficha.id}')">
                Abrir
            </button>

            <button
                class="botao-card"
                onclick="mostrarResumo('${ficha.id}')">
                Resumo
            </button>

            <button
                class="botao-card perigo"
                onclick="deletarFicha('${ficha.id}', '${escaparAspas(ficha.nome || "Sem Nome")}')">
                Excluir
            </button>

        </div>
    `;

    return card;

}

// ===============================
// FILTRAR
// ===============================

window.filtrarFichas = function () {

    const pesquisa = document
        .getElementById("pesquisaFicha")
        ?.value
        .toLowerCase()
        .trim() || "";

    const classe = document
        .getElementById("filtroClasse")
        ?.value || "";

    const raca = document
        .getElementById("filtroRaca")
        ?.value || "";

    fichasFiltradas = todasAsFichas.filter(ficha => {

        const nomeOk =
            (ficha.nome || "")
            .toLowerCase()
            .includes(pesquisa);

        const classeOk =
            !classe || ficha.classe === classe;

        const racaOk =
            !raca || ficha.raca === raca;

        return nomeOk && classeOk && racaOk;

    });

    const ordenarPor =
        document.getElementById("ordenarPor")?.value || "data";

    ordenarArray(fichasFiltradas, ordenarPor);

    desenharFichas();

};

// ===============================
// ORDENAR
// ===============================

window.ordenarFichas = function () {

    const tipo =
        document.getElementById("ordenarPor")?.value || "data";

    ordenarArray(fichasFiltradas, tipo);

    desenharFichas();

};

function ordenarArray(array, tipo) {

    if (tipo === "nome") {

        array.sort((a, b) =>
            (a.nome || "").localeCompare(b.nome || "")
        );

    } else if (tipo === "nivel") {

        array.sort((a, b) =>
            Number(b.nivel || 0) - Number(a.nivel || 0)
        );

    } else if (tipo === "classe") {

        array.sort((a, b) =>
            (a.classe || "").localeCompare(b.classe || "")
        );

    } else if (tipo === "raca") {

        array.sort((a, b) =>
            (a.raca || "").localeCompare(b.raca || "")
        );

    } else {

        array.sort((a, b) =>
            Number(b.timestamp || 0) - Number(a.timestamp || 0)
        );

    }

}

// ===============================
// RESUMO
// ===============================

window.mostrarResumo = function (id) {

    const ficha =
        todasAsFichas.find(item => item.id === id);

    if (!ficha) return;

    const modal =
        document.getElementById("modalResumo");

    const conteudo =
        document.getElementById("conteudoResumo");

    if (!modal || !conteudo) return;

    conteudo.innerHTML = montarResumo(ficha);

    modal.style.display = "flex";

};

window.fecharResumo = function () {

    const modal =
        document.getElementById("modalResumo");

    if (modal) {
        modal.style.display = "none";
    }

};

function montarResumo(ficha) {

    return `
        <div class="titulo-resumo">
            ${escapar(ficha.nome || "Sem Nome")}
        </div>

        <div class="subtitulo-resumo">
            ${escapar(ficha.raca || "-")}
            •
            ${escapar(ficha.classe || "-")}
        </div>

        ${secaoStatus(ficha)}

        ${secaoAtributos(ficha)}

        ${secaoPoderes(ficha)}

        ${secaoPericias(ficha)}

        ${secaoMochila(ficha)}

        ${secaoArsenal(ficha)}

        ${secaoTexto("Aprimoramentos", [
            ficha.aprimoramento1,
            ficha.aprimoramento2
        ])}

        ${secaoCaracteristicas(ficha)}

        ${secaoTexto("Golpes / Técnicas", [
            ficha.historia
        ])}
    `;

}

function secaoStatus(ficha) {

    return `
        <section class="secao-resumo">
            <h3>Status</h3>

            <div class="grid-resumo">
                ${linhaResumo("Nível", ficha.nivel || 1)}
                ${linhaResumo("Vida", ficha.vida || 0)}
                ${linhaResumo("Energia", ficha.energia || 0)}
                ${linhaResumo("XP", ficha.xp || 0)}
                ${linhaResumo("IP Cinético", ficha.indice_protecao || 0)}
                ${linhaResumo("IP Balístico", ficha.indice_protecao2 || 0)}
                ${linhaResumo("Heróicos", ficha.p_heroi || 0)}
                ${linhaResumo("Vilanescos", ficha.p_vilao || 0)}
            </div>
        </section>
    `;

}

function secaoAtributos(ficha) {

    const atributos = [
        ["Força", ficha.forca],
        ["Constituição", ficha.constituicao],
        ["Destreza", ficha.destreza],
        ["Agilidade", ficha.agilidade],
        ["Inteligência", ficha.inteligencia],
        ["Percepção", ficha.percepcao],
        ["Vontade", ficha.vontade],
        ["Carisma", ficha.carisma]
    ];

    return `
        <section class="secao-resumo">
            <h3>Atributos</h3>

            <div class="grid-resumo">
                ${atributos
                    .map(([nome, valor]) => linhaResumo(nome, valor || 0))
                    .join("")}
            </div>
        </section>
    `;

}

function secaoPoderes(ficha) {

    let html = "";

    if (Array.isArray(ficha.poderesSelecionados)) {

        const marcados =
            ficha.poderesSelecionados.filter(p => p.marcado);

        html = marcados
            .map(p => `<p>✦ ${escapar(p.poder)}</p>`)
            .join("");

    }

    if (!html) {
        html = "<p>Nenhum poder registrado.</p>";
    }

    return `
        <section class="secao-resumo">
            <h3>Poderes</h3>
            ${html}
        </section>
    `;

}

function secaoPericias(ficha) {

    let html = "";

    if (Array.isArray(ficha.pericias)) {

        html = ficha.pericias
            .filter(p => p.nome || p.pontos)
            .map(p => `
                <p>
                    ✦ ${escapar(p.nome || "Perícia")}
                    ${p.pontos ? ` — ${escapar(p.pontos)}` : ""}
                </p>
            `)
            .join("");

    }

    if (!html) {
        html = "<p>Nenhuma perícia registrada.</p>";
    }

    return `
        <section class="secao-resumo">
            <h3>Perícias</h3>
            ${html}
        </section>
    `;

}

function secaoMochila(ficha) {

    let itens = [];

    if (Array.isArray(ficha.mochila)) {

        itens = ficha.mochila
            .map(item => item.nome || item)
            .filter(Boolean);

    }

    for (let i = 1; i <= 20; i++) {
        if (ficha[`mochila${i}`]) itens.push(ficha[`mochila${i}`]);
        if (ficha[`mochila_${i}`]) itens.push(ficha[`mochila_${i}`]);
    }

    const html = itens.length
        ? itens.map(item => `<p>🎒 ${escapar(item)}</p>`).join("")
        : "<p>Mochila vazia.</p>";

    return `
        <section class="secao-resumo">
            <h3>Mochila</h3>
            ${html}
        </section>
    `;

}

function secaoArsenal(ficha) {

    const itens = [
        ["Arma Primária", ficha.primaria],
        ["Arma Secundária", ficha.secundaria],
        ["Armadura", ficha.armadura],
        ["Item 1", ficha.item1],
        ["Item 2", ficha.item2],
        ["Item 3", ficha.item3],
        ["Item 4", ficha.item4],
        ["Item 5", ficha.item5]
    ].filter(([, valor]) => valor);

    const html = itens.length
        ? itens
            .map(([nome, valor]) =>
                `<p><strong>${escapar(nome)}:</strong> ${escapar(valor)}</p>`
            )
            .join("")
        : "<p>Nenhum equipamento registrado.</p>";

    return `
        <section class="secao-resumo">
            <h3>Arsenal e Equipamentos</h3>
            ${html}
        </section>
    `;

}

function secaoTexto(titulo, textos) {

    const html = textos
        .filter(Boolean)
        .map(texto => `<p>${escapar(texto)}</p>`)
        .join("");

    return `
        <section class="secao-resumo">
            <h3>${escapar(titulo)}</h3>
            ${html || "<p>Nada registrado.</p>"}
        </section>
    `;

}

function secaoCaracteristicas(ficha) {

    return `
        <section class="secao-resumo">
            <h3>Características</h3>

            <p>
                <strong>Positivo:</strong>
                ${escapar(ficha.positivo || "-")}
            </p>

            <p>
                <strong>Negativo:</strong>
                ${escapar(ficha.negativo || "-")}
            </p>
        </section>
    `;

}

function linhaResumo(nome, valor) {

    return `
        <div>
            <strong>${escapar(nome)}</strong>
            <span>${escapar(valor)}</span>
        </div>
    `;

}

// ===============================
// ABRIR / EXCLUIR / ATUALIZAR
// ===============================

window.abrirFicha = function (id) {

    window.location.href =
        `Ficha.html?personagemId=${encodeURIComponent(id)}`;

};

window.deletarFicha = async function (id, nome) {

    const confirmar = confirm(
        `Tem certeza que deseja excluir a ficha "${nome}"?\n\nEssa ação não pode ser desfeita.`
    );

    if (!confirmar) return;

    try {

        await deleteDoc(
            doc(db, "fichas", id)
        );

        mostrarAlerta("Ficha excluída com sucesso!", "success");

        await carregarFichas();

    } catch (erro) {

        console.error("Erro ao excluir ficha:", erro);
        mostrarAlerta("Erro ao excluir ficha.", "error");

    }

};

window.refreshFichas = async function () {

    await carregarFichas();

};

window.logout = async function () {

    try {

        const authModule =
            await import("./auth.js");

        await authModule.logout();

    } catch (erro) {

        console.error("Erro ao sair:", erro);
        window.location.href = "index.html";

    }

};

// ===============================
// CONTADORES
// ===============================

function contarPoderes(ficha) {

    if (!Array.isArray(ficha.poderesSelecionados)) return 0;

    return ficha.poderesSelecionados
        .filter(p => p.marcado)
        .length;

}

function contarPericias(ficha) {

    if (Array.isArray(ficha.pericias)) {
        return ficha.pericias
            .filter(p => p.nome || p.pontos)
            .length;
    }

    return 0;

}

function contarMochila(ficha) {

    if (Array.isArray(ficha.mochila)) {
        return ficha.mochila
            .filter(item => item.nome || item)
            .length;
    }

    let total = 0;

    for (let i = 1; i <= 20; i++) {
        if (ficha[`mochila${i}`]) total++;
        if (ficha[`mochila_${i}`]) total++;
    }

    return total;

}

function contarArsenal(ficha) {

    const campos = [
        "primaria",
        "secundaria",
        "armadura",
        "item1",
        "item2",
        "item3",
        "item4",
        "item5"
    ];

    return campos.filter(campo => ficha[campo]).length;

}

// ===============================
// ESTADOS / ALERTAS
// ===============================

function mostrarLoading(valor) {

    const loading = document.getElementById("loadingState");

    if (loading) {
        loading.style.display = valor ? "block" : "none";
    }

}

function mostrarVazio(valor) {

    const vazio = document.getElementById("emptyState");

    if (vazio) {
        vazio.style.display = valor ? "block" : "none";
    }

}

function atualizarTotal() {

    const total = document.getElementById("totalFichas");

    if (total) {
        total.textContent = fichasFiltradas.length;
    }

}

function atualizarData() {

    const data = document.getElementById("ultimaAtualizacao");

    if (data) {
        data.textContent = new Date().toLocaleString("pt-BR");
    }

}

function mostrarAlerta(mensagem, tipo = "info") {

    const alerta = document.createElement("div");

    alerta.className = `alerta-rpg ${tipo}`;
    alerta.textContent = mensagem;

    document.body.appendChild(alerta);

    setTimeout(() => {
        alerta.classList.add("sumir");

        setTimeout(() => {
            alerta.remove();
        }, 500);

    }, 3000);

}

// ===============================
// SEGURANÇA / FORMATAÇÃO
// ===============================

function formatarData(data) {

    if (!data) return "--";

    try {

        return new Date(data).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

    } catch {
        return "--";
    }

}

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
        .replaceAll("'", "\\'")
        .replaceAll('"', "&quot;");

}