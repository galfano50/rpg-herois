//=====================================================
//              ALA DO MESTRE
//=====================================================

import {
    auth,
    db,
    isFirebaseInitialized,
    getFirebaseInstances
}
from "./firebase-config.js";

import{

    collection,
    getDocs,
    deleteDoc,
    doc

}
from
"https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import{

    onAuthStateChanged

}
from
"https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";



//=====================================================
//              VARIÁVEIS GLOBAIS
//=====================================================

let usuarioAtual=null;

let todasFichas=[];

let fichasExibidas=[];



//=====================================================
//              ALERTA
//=====================================================

function alerta(msg,cor="#4b7f52"){

    const div=document.createElement("div");

    div.className="alerta-rpg";

    div.innerHTML=msg;

    div.style.background=cor;

    document.body.appendChild(div);

    setTimeout(()=>{

        div.style.opacity="0";

        setTimeout(()=>{

            div.remove();

        },500);

    },2500);

}



//=====================================================
//              LOADING
//=====================================================

function loading(valor){

    const el=document.getElementById("loadingState");

    if(!el) return;

    el.style.display=

        valor

        ?"block"

        :"none";

}



//=====================================================
//              ESTADO VAZIO
//=====================================================

function vazio(valor){

    const el=document.getElementById("emptyState");

    if(!el) return;

    el.style.display=

        valor

        ?"block"

        :"none";

}



//=====================================================
//          TOTAL DE PERSONAGENS
//=====================================================

function atualizarTotal(){

    const total=

        document.getElementById("totalFichas");

    if(total)

        total.textContent=fichasExibidas.length;

}



//=====================================================
//          DATA DA ÚLTIMA ATUALIZAÇÃO
//=====================================================

function atualizarData(){

    const campo=

        document.getElementById(

            "ultimaAtualizacao"

        );

    if(!campo) return;

    campo.textContent=

        new Date()

        .toLocaleString(

            "pt-BR"

        );

}



//=====================================================
//          CARREGAR FICHAS FIREBASE
//=====================================================

async function listarFichas(){

    loading(true);

    vazio(false);

    todasFichas=[];

    fichasExibidas=[];

    try{

        if(!isFirebaseInitialized()){

            getFirebaseInstances();

        }

        const consulta=

            await getDocs(

                collection(

                    db,

                    "fichas"

                )

            );

        consulta.forEach(doc=>{

            const dados=

                doc.data();

            if(

                dados.uid===

                usuarioAtual.uid

            ){

                todasFichas.push({

                    id:doc.id,

                    ...dados

                });

            }

        });

        todasFichas.sort(

            (a,b)=>

            new Date(

                b.dataSalvamento

            )-

            new Date(

                a.dataSalvamento

            )

        );

        fichasExibidas=[

            ...todasFichas

        ];

        loading(false);

        if(

            fichasExibidas.length===0

        ){

            vazio(true);

            atualizarTotal();

            return;

        }

        desenharCards();

    }

    catch(erro){

        console.error(erro);

        loading(false);

        vazio(true);

        alerta(

            "Erro ao carregar fichas",

            "#8b3030"

        );

    }

}

//=====================================================
//          DESENHAR TODOS OS CARDS
//=====================================================

function desenharCards(){

    const lista =
        document.getElementById("listaFichas");

    if(!lista) return;

    lista.innerHTML = "";

    fichasExibidas.forEach(ficha=>{

        lista.appendChild(

            criarCard(ficha)

        );

    });

    atualizarTotal();

    atualizarData();

}



//=====================================================
//          CRIAR CARD
//=====================================================

function criarCard(ficha){

    const card =
        document.createElement("div");

    card.className = "card-personagem";

    const poderes =
        ficha.poderesSelecionados
        ? ficha.poderesSelecionados.length
        : 0;

    const mochila =
        contarPrefixo(ficha,"mochila_");

    const pericias =
        contarPrefixo(ficha,"pericia_");

    const arsenal =
        contarPrefixo(ficha,"arma");

    card.innerHTML = `

        <div class="titulo-card">

            ${ficha.nome || "Sem Nome"}

        </div>

        <div class="subtitulo-card">

            ${ficha.raca || "-"}

            •

            ${ficha.classe || "-"}

        </div>

        <div class="linha-card">

            <span>Nível</span>

            <strong>${ficha.nivel || 1}</strong>

        </div>

        <div class="linha-card">

            <span>Vida</span>

            <strong>${ficha.vida || 0}</strong>

        </div>

        <div class="linha-card">

            <span>Energia</span>

            <strong>${ficha.energia || 0}</strong>

        </div>

        <div class="linha-card">

            <span>XP</span>

            <strong>${ficha.xp || 0}</strong>

        </div>

        <hr>

        <div class="linha-card">

            <span>Poderes</span>

            <strong>${poderes}</strong>

        </div>

        <div class="linha-card">

            <span>Perícias</span>

            <strong>${pericias}</strong>

        </div>

        <div class="linha-card">

            <span>Mochila</span>

            <strong>${mochila}</strong>

        </div>

        <div class="linha-card">

            <span>Arsenal</span>

            <strong>${arsenal}</strong>

        </div>

        <hr>

        <div class="linha-card pequena">

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
                onclick="deletarFicha('${ficha.id}')">

                Excluir

            </button>

        </div>

    `;

    return card;

}



//=====================================================
//          CONTAR CAMPOS
//=====================================================

function contarPrefixo(obj,prefixo){

    let total = 0;

    Object.keys(obj).forEach(chave=>{

        if(

            chave.startsWith(prefixo)

            &&

            obj[chave]

            &&

            obj[chave]!=""

        ){

            total++;

        }

    });

    return total;

}



//=====================================================
//          DATA FORMATADA
//=====================================================

function formatarData(data){

    if(!data) return "";

    return new Date(data)

        .toLocaleDateString(

            "pt-BR",

            {

                day:"2-digit",

                month:"2-digit",

                year:"numeric",

                hour:"2-digit",

                minute:"2-digit"

            }

        );

}



//=====================================================
//          PESQUISAR PERSONAGEM
//=====================================================

window.pesquisarFicha = function(){

    const texto =

        document

        .getElementById(

            "pesquisa"

        )

        ?.value

        .toLowerCase()

        ||"";

    fichasExibidas =

        todasFichas.filter(f=>{

            return (

                (f.nome||"")

                .toLowerCase()

                .includes(texto)

            );

        });

    desenharCards();

}



//=====================================================
//          ORDENAR
//=====================================================

window.ordenarFichas=function(tipo){

    switch(tipo){

        case "nome":

            fichasExibidas.sort(

                (a,b)=>

                (a.nome||"")

                .localeCompare(

                    b.nome||""

                )

            );

        break;

        case "nivel":

            fichasExibidas.sort(

                (a,b)=>

                Number(

                    b.nivel||0

                )

                -

                Number(

                    a.nivel||0

                )

            );

        break;

        default:

            fichasExibidas.sort(

                (a,b)=>

                new Date(

                    b.dataSalvamento

                )

                -

                new Date(

                    a.dataSalvamento

                )

            );

    }

    desenharCards();

}

//=====================================================
//              RESUMO DA FICHA
//=====================================================

window.mostrarResumo=function(id){

    const ficha=

        todasFichas.find(

            f=>f.id===id

        );

    if(!ficha) return;

    let html=`

        <div class="resumo-ficha">

        <div class="titulo-resumo">

            ${ficha.nome||"Sem Nome"}

        </div>

        <div class="subtitulo-resumo">

            ${ficha.raca||"-"} •
            ${ficha.classe||"-"}

        </div>

    `;



//=====================================================
//              ATRIBUTOS
//=====================================================

    html+=`

        <div class="secao-resumo">

            <h3>Atributos</h3>

            <div class="grid-resumo">

    `;

    [

        "forca",

        "constituicao",

        "destreza",

        "agilidade",

        "inteligencia",

        "percepcao",

        "vontade",

        "carisma"

    ].forEach(att=>{

        html+=`

            <div>

                <strong>

                ${capitalizar(att)}

                </strong>

                <span>

                ${ficha[att]||0}

                </span>

            </div>

        `;

    });

    html+=`

            </div>

        </div>

    `;


//=====================================================
//              STATUS
//=====================================================

    html+=`

        <div class="secao-resumo">

            <h3>Status</h3>

            <div class="grid-resumo">

                <div>

                    Vida

                    <span>${ficha.vida||0}</span>

                </div>

                <div>

                    Energia

                    <span>${ficha.energia||0}</span>

                </div>

                <div>

                    XP

                    <span>${ficha.xp||0}</span>

                </div>

                <div>

                    Nível

                    <span>${ficha.nivel||1}</span>

                </div>

            </div>

        </div>

    `;


//=====================================================
//              PODERES
//=====================================================

    html+=`

        <div class="secao-resumo">

        <h3>Poderes</h3>

    `;

    if(ficha.poderesSelecionados){

        ficha.poderesSelecionados.forEach(p=>{

            if(p.marcado){

                html+=`

                    <div>

                    ⚔ ${p.poder}

                    </div>

                `;

            }

        });

    }

    html+=`

        </div>

    `;


//=====================================================
//              PERÍCIAS
//=====================================================

    html+=`

        <div class="secao-resumo">

        <h3>Perícias</h3>

    `;

    Object.keys(ficha).forEach(chave=>{

        if(

            chave.startsWith(

                "pericia_"

            )

            &&

            ficha[chave]

        ){

            html+=`

                <div>

                ✔ ${ficha[chave]}

                </div>

            `;

        }

    });

    html+=`

        </div>

    `;


//=====================================================
//              MOCHILA
//=====================================================

    html+=`

        <div class="secao-resumo">

        <h3>Mochila</h3>

    `;

    Object.keys(ficha).forEach(chave=>{

        if(

            chave.startsWith(

                "mochila_"

            )

            &&

            ficha[chave]

        ){

            html+=`

                <div>

                🎒 ${ficha[chave]}

                </div>

            `;

        }

    });

    html+=`

        </div>

    `;


//=====================================================
//              ARSENAL
//=====================================================

    html+=`

        <div class="secao-resumo">

        <h3>Arsenal</h3>

    `;

    [

        "primaria",

        "secundaria",

        "item1",

        "item2",

        "item3",

        "item4",

        "item5"

    ].forEach(item=>{

        if(ficha[item]){

            html+=`

                <div>

                ⚔ ${ficha[item]}

                </div>

            `;

        }

    });

    html+=`

        </div>

    `;


//=====================================================
//              APRIMORAMENTOS
//=====================================================

    html+=`

        <div class="secao-resumo">

        <h3>Aprimoramentos</h3>

    `;

    [

        "aprimoramento1",

        "aprimoramento2"

    ].forEach(item=>{

        if(ficha[item]){

            html+=`

                <p>

                ${ficha[item]}

                </p>

            `;

        }

    });

    html+=`

        </div>

    `;


//=====================================================
//              PERSONALIDADE
//=====================================================

    html+=`

        <div class="secao-resumo">

            <h3>Características</h3>

            <p>

            <strong>Positivo:</strong>

            ${ficha.positivo||"-"}

            </p>

            <p>

            <strong>Negativo:</strong>

            ${ficha.negativo||"-"}

            </p>

        </div>

    `;


//=====================================================
//              HISTÓRIA
//=====================================================

    html+=`

        <div class="secao-resumo">

            <h3>História</h3>

            <p>

            ${ficha.historia||""}

            </p>

        </div>

    `;

    html+=`

        <button

            class="botao-fechar"

            onclick="fecharResumo()">

            Fechar

        </button>

        </div>

    `;

    const modal=

        document.getElementById(

            "modalResumo"

        );

    modal.innerHTML=html;

    modal.style.display="flex";

}



//=====================================================
//              FECHAR RESUMO
//=====================================================

window.fecharResumo=function(){

    document

        .getElementById(

            "modalResumo"

        )

        .style.display="none";

}



//=====================================================
//              CAPITALIZAR
//=====================================================

function capitalizar(txt){

    return txt.charAt(0)

        .toUpperCase()

        +

        txt.slice(1);

}

// ========================================
// ABRIR FICHA
// ========================================

window.abrirFicha = function (personagemId) {

    window.location.href =
        `Ficha.html?personagemId=${encodeURIComponent(personagemId)}`;

};


// ========================================
// EXCLUIR FICHA
// ========================================

window.excluirFicha = async function (personagemId, nome) {

    if (
        !confirm(
            `Excluir a ficha "${nome}"?\n\nEssa ação não poderá ser desfeita.`
        )
    ) return;

    try {

        await deleteDoc(
            doc(db, "fichas", personagemId)
        );

        mostrarMensagem(
            "Ficha excluída com sucesso!",
            "success"
        );

        listarFichas();

    }

    catch (erro) {

        console.error(erro);

        mostrarMensagem(
            "Erro ao excluir ficha.",
            "error"
        );

    }

};


// ========================================
// ATUALIZAR LISTA
// ========================================

window.refreshFichas = function () {

    listarFichas();

};


// ========================================
// LOGOUT
// ========================================

window.logout = async function () {

    try {

        const modulo =
            await import("./auth.js");

        await modulo.logout();

    }

    catch {

        window.location.href = "index.html";

    }

};


// ========================================
// MENSAGEM FLUTUANTE
// ========================================

function mostrarMensagem(texto, tipo = "success") {

    const div =
        document.createElement("div");

    div.className =
        `mensagem-flutuante ${tipo}`;

    div.innerHTML = texto;

    document.body.appendChild(div);

    setTimeout(() => {

        div.classList.add("mostrar");

    }, 50);

    setTimeout(() => {

        div.classList.remove("mostrar");

        setTimeout(() => {

            div.remove();

        }, 400);

    }, 2500);

}


// ========================================
// AUTENTICAÇÃO
// ========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "index.html";

        return;

    }

    usuarioAtual = user;

    await listarFichas();

});


// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const botaoAtualizar =
        document.getElementById("btnAtualizar");

    if (botaoAtualizar) {

        botaoAtualizar.onclick =
            refreshFichas;

    }

});

//====================================================
// ABRIR FICHA
//====================================================

window.abrirFicha = function (id) {

    window.location.href =
        `Ficha.html?personagemId=${encodeURIComponent(id)}`;

};


//====================================================
// DUPLICAR FICHA
//====================================================

window.duplicarFicha = async function (id) {

    try {

        const snap =
            await getDoc(doc(db,"fichas",id));

        if(!snap.exists()){

            alert("Ficha não encontrada.");
            return;

        }

        const dados = snap.data();

        delete dados.dataSalvamento;

        dados.nome =
            (dados.nome || "Personagem")
            + " (Cópia)";

        dados.timestamp =
            Date.now();

        dados.dataSalvamento =
            new Date().toISOString();

        const novoId =
            crypto.randomUUID();

        await setDoc(

            doc(db,"fichas",novoId),

            dados

        );

        listarFichas(currentUser);

    }

    catch(e){

        console.error(e);

        alert("Erro ao duplicar ficha.");

    }

};


//====================================================
// DELETAR FICHA
//====================================================

window.deletarFicha = async function(id){

    if(

        !confirm(
            "Excluir esta ficha permanentemente?"
        )

    ) return;

    try{

        await deleteDoc(

            doc(db,"fichas",id)

        );

        listarFichas(currentUser);

    }

    catch(e){

        console.error(e);

        alert("Erro ao excluir.");

    }

};


//====================================================
// ATUALIZAR LISTA
//====================================================

window.refreshFichas = function(){

    listarFichas(currentUser);

};


//====================================================
// LOGOUT
//====================================================

window.logout = async function(){

    try{

        const authModule =
            await import("./auth.js");

        await authModule.logout();

    }

    catch{

        location.href="index.html";

    }

};


//====================================================
// LOGIN
//====================================================

onAuthStateChanged(

    auth,

    user=>{

        if(!user){

            location.href="index.html";

            return;

        }

        currentUser=user;

        listarFichas(user);

    }

);