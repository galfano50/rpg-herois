// teste-firebase.js
// ======================================================
// Testes de conexão com Firebase / Firestore
// ======================================================

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
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

//======================================================
// TESTE DE CONEXÃO
//======================================================

async function testarConexaoFirebase(){

    console.clear();

    console.log("====================================");
    console.log("TESTE DE CONEXÃO FIREBASE");
    console.log("====================================");

    try{

        if(!isFirebaseInitialized()){

            const firebase =
                getFirebaseInstances();

            if(!firebase.auth || !firebase.db){

                console.error("Firebase não inicializado.");

                return false;

            }

        }

        console.log("✔ Firebase inicializado.");

        const fichasRef =
            collection(db,"fichas");

        const resultado =
            await getDocs(fichasRef);

        console.log(
            "✔ Firestore conectado."
        );

        console.log(
            "Documentos:",
            resultado.size
        );

        return true;

    }catch(e){

        console.error(e);

        return false;

    }

}

//======================================================
// TESTE DE LOGIN
//======================================================

async function testarAutenticacao(){

    console.log("");
    console.log("====================================");
    console.log("AUTENTICAÇÃO");
    console.log("====================================");

    if(auth.currentUser){

        console.log(
            "✔ Usuário:",
            auth.currentUser.email
        );

        console.log(
            "UID:",
            auth.currentUser.uid
        );

        return auth.currentUser;

    }

    console.warn("Nenhum usuário logado.");

    return null;

}

//======================================================
// BUSCAR FICHAS DO USUÁRIO
//======================================================

async function testarBuscaFichas(user){

    console.log("");
    console.log("====================================");
    console.log("BUSCA DE FICHAS");
    console.log("====================================");

    try{

        const q =
            query(
                collection(db,"fichas"),
                where("uid","==",user.uid)
            );

        const snap =
            await getDocs(q);

        console.log(
            "Fichas encontradas:",
            snap.size
        );

        snap.forEach(docSnap=>{

            const f =
                docSnap.data();

            console.log("----------------------");

            console.log(
                "Documento:",
                docSnap.id
            );

            console.log(
                "Nome:",
                f.nome
            );

            console.log(
                "Raça:",
                f.raca
            );

            console.log(
                "Classe:",
                f.classe
            );

            console.log(
                "Nível:",
                f.nivel
            );

            console.log(
                "Último salvamento:",
                f.dataSalvamento
            );

        });

        return snap;

    }catch(e){

        console.error(e);

        return null;

    }

}

//======================================================
// CRIAR FICHA DE TESTE
//======================================================

async function criarFichaTeste(user){

    console.log("");
    console.log("====================================");
    console.log("CRIANDO FICHA TESTE");
    console.log("====================================");

    try{

        const id =
            crypto.randomUUID();

        const ficha={

            uid:user.uid,

            personagemId:id,

            nome:"Personagem Teste",

            raca:"Humano",

            classe:"Mutante",

            nivel:1,

            vida:20,

            energia:10,

            forca:5,
            constituicao:5,
            destreza:5,
            agilidade:5,
            inteligencia:5,
            percepcao:5,
            vontade:5,
            carisma:5,

            poderesSelecionados:[],

            camposPoderes:[],

            grausPoderes:[],

            dadosPoderes:[],

            dataSalvamento:
                new Date().toISOString(),

            timestamp:
                Date.now()

        };

        await setDoc(

            doc(db,"fichas",id),

            ficha

        );

        console.log(
            "✔ Ficha criada."
        );

        console.log(
            "ID:",
            id
        );

        return id;

    }catch(e){

        console.error(e);

        return null;

    }

}

//======================================================
// LER UMA FICHA
//======================================================

async function testarLeitura(id){

    console.log("");
    console.log("====================================");
    console.log("LER FICHA");
    console.log("====================================");

    try{

        const snap =
            await getDoc(
                doc(db,"fichas",id)
            );

        if(!snap.exists()){

            console.warn(
                "Ficha inexistente."
            );

            return;

        }

        console.log(snap.data());

    }catch(e){

        console.error(e);

    }

}

//======================================================
// EXECUTAR TODOS OS TESTES
//======================================================

async function executarTestes(){

    const ok =
        await testarConexaoFirebase();

    if(!ok)return;

    const user =
        await testarAutenticacao();

    if(!user)return;

    const fichas =
        await testarBuscaFichas(user);

    if(!fichas || fichas.empty){

        console.log("");
        console.log(
            "Nenhuma ficha encontrada."
        );

        const id =
            await criarFichaTeste(user);

        if(id){

            await testarLeitura(id);

        }

    }

    console.log("");
    console.log("====================================");
    console.log("TESTES FINALIZADOS");
    console.log("====================================");

}

//======================================================
// EXPORTAÇÃO
//======================================================

window.testarFirebase =
    executarTestes;

window.testarLeitura =
    testarLeitura;

setTimeout(()=>{

    console.log(
        "Use window.testarFirebase() para executar os testes."
    );

},1000);