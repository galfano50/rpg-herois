import {
    auth,
    realtimeDb
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
    ref,
    set,
    remove,
    onValue,
    onDisconnect,
    serverTimestamp,
    query,
    limitToLast,
    onChildAdded
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const SALA_ID = "sala-geral";
const LIMITE_ROLAGENS = 50;

let usuarioAtual = null;
let referenciaUsuarioOnline = null;
let monitorOnlineIniciado = false;
let monitorRolagensIniciado = false;
let cancelarMonitorRolagens = null;

document.addEventListener(
    "DOMContentLoaded",
    iniciarBatalha
);

function iniciarBatalha() {
    atualizarStatusConexao(false);

    onAuthStateChanged(
        auth,
        async usuario => {
            if (!usuario) {
                mostrarMensagem(
                    "Você precisa estar conectado para entrar na batalha."
                );

                atualizarStatusRolagens(
                    "Faça login para acompanhar as rolagens.",
                    "erro"
                );

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1800);

                return;
            }

            usuarioAtual = usuario;

            await registrarJogadorOnline(usuario);

            observarJogadoresOnline();
            observarConexaoFirebase();
            observarRolagensDaMesa();
        }
    );
}

/* =========================================================
   JOGADORES ONLINE
========================================================= */

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
        await onDisconnect(
            referenciaUsuarioOnline
        ).remove();

        await set(
            referenciaUsuarioOnline,
            dadosOnline
        );

        console.log(
            "Jogador registrado como online:",
            usuario.uid
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
        imagem.alt =
            `Avatar de ${jogador.nome || "Jogador"}`;

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

/* =========================================================
   ROLAGENS DA MESA
========================================================= */

function observarRolagensDaMesa() {
    if (monitorRolagensIniciado) {
        return;
    }

    const listaRolagens = document.getElementById(
        "listaRolagens"
    );

    if (!listaRolagens) {
        console.warn(
            'Elemento com id "listaRolagens" não encontrado.'
        );

        return;
    }

    monitorRolagensIniciado = true;

    listaRolagens.innerHTML = "";

    atualizarStatusRolagens(
        "Acompanhando as rolagens da sala.",
        "conectado"
    );

    const rolagensRef = ref(
        realtimeDb,
        `salas/${SALA_ID}/rolagens`
    );

    const consultaRolagens = query(
        rolagensRef,
        limitToLast(LIMITE_ROLAGENS)
    );

    cancelarMonitorRolagens = onChildAdded(
        consultaRolagens,
        snapshot => {
            const rolagem = snapshot.val();

            if (!rolagem) {
                return;
            }

            adicionarRolagemAoPainel(
                snapshot.key,
                rolagem
            );
        },
        erro => {
            console.error(
                "Erro ao acompanhar rolagens:",
                erro
            );

            atualizarStatusRolagens(
                "Não foi possível carregar as rolagens.",
                "erro"
            );

            listaRolagens.innerHTML = `
                <div class="rolagens-vazias">
                    <i class="fas fa-triangle-exclamation"></i>
                    <p>Erro ao carregar as rolagens da mesa.</p>
                </div>
            `;
        }
    );
}

function adicionarRolagemAoPainel(
    rolagemId,
    rolagem
) {
    const lista = document.getElementById(
        "listaRolagens"
    );

    if (!lista) {
        return;
    }

    const rolagemExistente = lista.querySelector(
        `[data-rolagem-id="${rolagemId}"]`
    );

    if (rolagemExistente) {
        return;
    }

    removerMensagemRolagensVazias();

    const item = document.createElement("article");

    item.className = "item-rolagem";
    item.dataset.rolagemId = rolagemId;

    if (rolagem.critico === true) {
        item.classList.add("critico");
    }

    if (rolagem.falhaCritica === true) {
        item.classList.add("falha-critica");
    }

    const jogador =
        rolagem.nomeJogador ||
        rolagem.usuarioNome ||
        rolagem.jogador ||
        "Jogador";

    const personagem =
        rolagem.nomePersonagem ||
        rolagem.personagem ||
        "Personagem";

    const descricao =
        rolagem.descricao ||
        rolagem.nomeTeste ||
        rolagem.tipoTeste ||
        "Rolagem de dados";

    const formula =
        rolagem.formula ||
        rolagem.dado ||
        "Dados";

    const resultados = formatarResultadosDados(
        rolagem.resultados ??
        rolagem.dados ??
        rolagem.rolagens
    );

    const total = formatarTotalRolagem(
        rolagem.total ??
        rolagem.resultadoFinal ??
        rolagem.resultado
    );

    const horario = formatarHorarioRolagem(
        rolagem.criadoEm ??
        rolagem.timestamp ??
        rolagem.data
    );

    item.innerHTML = `
        <div class="cabecalho-rolagem">
            <div class="jogador-rolagem">
                <i class="fas fa-user"></i>

                <span>
                    ${escaparHtml(jogador)}
                </span>
            </div>

            <time class="horario-rolagem">
                ${escaparHtml(horario)}
            </time>
        </div>

        <div class="nome-personagem-rolagem">
            ${escaparHtml(personagem)}
        </div>

        <div class="descricao-rolagem">
            ${escaparHtml(descricao)}
        </div>

        <div class="resultado-rolagem">
            <span class="formula-rolagem">
                ${escaparHtml(formula)}
            </span>

            <span class="dados-rolagem">
                ${escaparHtml(resultados)}
            </span>

            <strong class="total-rolagem">
                ${escaparHtml(total)}
            </strong>
        </div>

        ${criarMarcadorEspecial(rolagem)}
    `;

    lista.appendChild(item);

    limitarQuantidadeRolagens();
    rolarPainelParaFinal();
}

function criarMarcadorEspecial(rolagem) {
    if (rolagem.critico === true) {
        return `
            <div class="marcador-rolagem critico">
                <i class="fas fa-star"></i>
                Acerto crítico
            </div>
        `;
    }

    if (rolagem.falhaCritica === true) {
        return `
            <div class="marcador-rolagem falha-critica">
                <i class="fas fa-skull-crossbones"></i>
                Falha crítica
            </div>
        `;
    }

    return "";
}

function formatarResultadosDados(resultados) {
    if (
        resultados === undefined ||
        resultados === null ||
        resultados === ""
    ) {
        return "Resultado individual não informado";
    }

    if (Array.isArray(resultados)) {
        const valores = resultados.map(
            resultado => extrairValorResultado(
                resultado
            )
        );

        return `[${valores.join(", ")}]`;
    }

    if (
        typeof resultados === "object" &&
        resultados !== null
    ) {
        const valores = Object.values(
            resultados
        ).map(
            resultado => extrairValorResultado(
                resultado
            )
        );

        return `[${valores.join(", ")}]`;
    }

    return String(resultados);
}

function extrairValorResultado(resultado) {
    if (
        typeof resultado === "object" &&
        resultado !== null
    ) {
        return (
            resultado.valor ??
            resultado.resultado ??
            resultado.numero ??
            "?"
        );
    }

    return resultado;
}

function formatarTotalRolagem(valor) {
    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        return "?";
    }

    const numero = Number(valor);

    if (Number.isFinite(numero)) {
        return String(numero);
    }

    return String(valor);
}

function formatarHorarioRolagem(valorData) {
    if (!valorData) {
        return "Agora";
    }

    if (
        typeof valorData === "object" &&
        valorData !== null
    ) {
        return "Agora";
    }

    const data = new Date(valorData);

    if (Number.isNaN(data.getTime())) {
        return "Agora";
    }

    return data.toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );
}

function atualizarStatusRolagens(
    mensagem,
    tipo = ""
) {
    const status = document.getElementById(
        "statusRolagens"
    );

    if (!status) {
        return;
    }

    status.textContent = mensagem;
    status.className = "status-rolagens";

    if (tipo) {
        status.classList.add(tipo);
    }
}

function removerMensagemRolagensVazias() {
    const mensagem = document.querySelector(
        "#listaRolagens .rolagens-vazias"
    );

    if (mensagem) {
        mensagem.remove();
    }
}

function limitarQuantidadeRolagens() {
    const lista = document.getElementById(
        "listaRolagens"
    );

    if (!lista) {
        return;
    }

    const itens = lista.querySelectorAll(
        ".item-rolagem"
    );

    if (itens.length <= LIMITE_ROLAGENS) {
        return;
    }

    const quantidadeRemover =
        itens.length - LIMITE_ROLAGENS;

    for (
        let indice = 0;
        indice < quantidadeRemover;
        indice += 1
    ) {
        itens[indice].remove();
    }
}

function rolarPainelParaFinal() {
    const lista = document.getElementById(
        "listaRolagens"
    );

    if (!lista) {
        return;
    }

    lista.scrollTop = lista.scrollHeight;
}

/* =========================================================
   CONEXÃO COM O FIREBASE
========================================================= */

function observarConexaoFirebase() {
    const conexaoRef = ref(
        realtimeDb,
        ".info/connected"
    );

    onValue(
        conexaoRef,
        snapshot => {
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
        }
    );
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

/* =========================================================
   MENSAGENS E ERROS
========================================================= */

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

/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function obterNomePeloEmail(email) {
    if (!email) {
        return "";
    }

    const parteInicial = email.split("@")[0];

    return parteInicial
        .replace(/[._-]+/g, " ")
        .replace(
            /\b\w/g,
            letra => letra.toUpperCase()
        );
}

function obterInicial(nome) {
    const nomeTratado =
        String(nome || "J").trim();

    return nomeTratado
        .charAt(0)
        .toUpperCase();
}

function escaparHtml(valor) {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* =========================================================
   ENCERRAMENTO DA PÁGINA
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {
        if (
            typeof cancelarMonitorRolagens ===
            "function"
        ) {
            cancelarMonitorRolagens();
        }

        if (referenciaUsuarioOnline) {
            remove(
                referenciaUsuarioOnline
            ).catch(() => {});
        }
    }
);