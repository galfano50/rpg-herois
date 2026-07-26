import {
    auth,
    realtimeDb
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    ref,
    set,
    remove,
    onValue,
    onDisconnect,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const SALA_ID = "sala-geral";

let usuarioAtual = null;
let referenciaUsuarioOnline = null;
let monitorOnlineIniciado = false;

document.addEventListener("DOMContentLoaded", iniciarBatalha);

function iniciarBatalha() {
    atualizarStatusConexao(false);

    onAuthStateChanged(auth, async usuario => {
        if (!usuario) {
            mostrarMensagem("Você precisa estar conectado para entrar na batalha.");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1800);
            return;
        }

        usuarioAtual = usuario;

        await registrarJogadorOnline(usuario);

        observarJogadoresOnline();

        observarConexaoFirebase();
    });
}

async function registrarJogadorOnline(usuario) {
    referenciaUsuarioOnline = ref(
        realtimeDb,
        `salas/${SALA_ID}/online/${usuario.uid}`
    );

    const nomeJogador =
        usuario.displayName ||
        obterNomePeloEmail(usuario.email) ||
        "Jogador";

    const dadosOnline = {
        uid: usuario.uid,
        nome: nomeJogador,
        email: usuario.email || "",
        avatar: usuario.photoURL || "",
        status: "online",
        entrouEm: serverTimestamp(),
        ultimaAtividade: serverTimestamp()
    };

    try {
        await onDisconnect(referenciaUsuarioOnline).remove();

        await set(
            referenciaUsuarioOnline,
            dadosOnline
        );
    } catch (erro) {
        console.error(
            "Erro ao registrar jogador online:",
            erro
        );

        mostrarMensagem(
            "Não foi possível registrar sua presença na sala."
        );
    }
}

function observarJogadoresOnline() {
    if (monitorOnlineIniciado) {
        return;
    }

    monitorOnlineIniciado = true;

    const jogadoresRef = ref(
        realtimeDb,
        `salas/${SALA_ID}/online`
    );

    onValue(
        jogadoresRef,
        snapshot => {
            const jogadores = [];

            snapshot.forEach(item => {
                const jogador = item.val();

                if (jogador) {
                    jogadores.push(jogador);
                }
            });

            jogadores.sort((a, b) => {
                const nomeA = a.nome || "";
                const nomeB = b.nome || "";

                return nomeA.localeCompare(
                    nomeB,
                    "pt-BR"
                );
            });

            renderizarJogadoresOnline(jogadores);
        },
        erro => {
            console.error(
                "Erro ao carregar jogadores online:",
                erro
            );

            mostrarErroListaOnline();
        }
    );
}

function renderizarJogadoresOnline(jogadores) {
    const lista = document.getElementById(
        "listaJogadoresOnline"
    );

    const contador = document.getElementById(
        "contadorOnline"
    );

    if (!lista || !contador) {
        return;
    }

    const quantidade = jogadores.length;

    contador.textContent =
        quantidade === 1
            ? "1 jogador conectado"
            : `${quantidade} jogadores conectados`;

    if (quantidade === 0) {
        lista.innerHTML = `
            <div class="lista-vazia">
                <i class="fas fa-user-slash"></i>
                <p>Nenhum jogador está conectado.</p>
            </div>
        `;

        return;
    }

    lista.innerHTML = "";

    jogadores.forEach(jogador => {
        const card = criarCardJogador(jogador);

        lista.appendChild(card);
    });
}

function criarCardJogador(jogador) {
    const card = document.createElement("div");

    card.className = "jogador-online";

    const avatar = document.createElement("div");

    avatar.className = "avatar-jogador";

    if (jogador.avatar) {
        const imagem = document.createElement("img");

        imagem.src = jogador.avatar;
        imagem.alt = `Avatar de ${jogador.nome || "Jogador"}`;

        imagem.onerror = () => {
            avatar.innerHTML = "";
            avatar.textContent = obterInicial(
                jogador.nome
            );
        };

        avatar.appendChild(imagem);
    } else {
        avatar.textContent = obterInicial(
            jogador.nome
        );
    }

    const dados = document.createElement("div");

    dados.className = "dados-jogador";

    const nome = document.createElement("span");

    nome.className = "nome-jogador";
    nome.textContent = jogador.nome || "Jogador";

    const status = document.createElement("span");

    status.className = "status-jogador";
    status.textContent = "Online";

    dados.appendChild(nome);
    dados.appendChild(status);

    card.appendChild(avatar);
    card.appendChild(dados);

    if (
        usuarioAtual &&
        jogador.uid === usuarioAtual.uid
    ) {
        const selo = document.createElement("span");

        selo.className = "selo-voce";
        selo.textContent = "VOCÊ";

        card.appendChild(selo);
    }

    return card;
}

function observarConexaoFirebase() {
    const conexaoRef = ref(
        realtimeDb,
        ".info/connected"
    );

    onValue(conexaoRef, snapshot => {
        const conectado =
            snapshot.val() === true;

        atualizarStatusConexao(conectado);

        if (
            conectado &&
            usuarioAtual &&
            referenciaUsuarioOnline
        ) {
            onDisconnect(
                referenciaUsuarioOnline
            ).remove();
        }
    });
}

function atualizarStatusConexao(conectado) {
    const indicador = document.getElementById(
        "indicadorConexao"
    );

    const texto = document.getElementById(
        "textoConexao"
    );

    if (!indicador || !texto) {
        return;
    }

    indicador.classList.toggle(
        "online",
        conectado
    );

    indicador.classList.toggle(
        "offline",
        !conectado
    );

    texto.textContent =
        conectado
            ? "Conectado à mesa"
            : "Sem conexão";
}

function mostrarErroListaOnline() {
    const lista = document.getElementById(
        "listaJogadoresOnline"
    );

    const contador = document.getElementById(
        "contadorOnline"
    );

    if (contador) {
        contador.textContent =
            "Não foi possível carregar";
    }

    if (lista) {
        lista.innerHTML = `
            <div class="lista-vazia">
                <i class="fas fa-triangle-exclamation"></i>
                <p>Erro ao carregar os jogadores online.</p>
            </div>
        `;
    }
}

function obterNomePeloEmail(email) {
    if (!email) {
        return "";
    }

    const parteInicial = email.split("@")[0];

    return parteInicial
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, letra =>
            letra.toUpperCase()
        );
}

function obterInicial(nome) {
    const nomeTratado =
        String(nome || "J").trim();

    return nomeTratado
        .charAt(0)
        .toUpperCase();
}

function mostrarMensagem(texto) {
    const mensagem = document.getElementById(
        "mensagemSistema"
    );

    if (!mensagem) {
        return;
    }

    mensagem.textContent = texto;
    mensagem.classList.add("ativa");

    setTimeout(() => {
        mensagem.classList.remove("ativa");
    }, 4000);
}

window.addEventListener("beforeunload", () => {
    if (referenciaUsuarioOnline) {
        remove(referenciaUsuarioOnline)
            .catch(() => {});
    }
});