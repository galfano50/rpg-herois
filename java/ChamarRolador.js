// Importando os módulos do Firebase via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Configuração do Firebase (substitua pelos seus dados do Firebase Console)
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
 * Função para rolar os dados.
 * Calcula o resultado com base no input do usuário e envia o resultado para o Firebase.
 */
export function rollDice() {
    // Recupera e formata o valor do input
    const input = document.getElementById("diceInput").value.replace(/\s+/g, "");
    const resultDiv = document.getElementById("result");
    const diceRegex = /(-?\d*)d(\d+)/g;
    const numberRegex = /([-+]?\d+)/g;
    let total = 0;
    let rolls = [];

    let match;
    while ((match = diceRegex.exec(input)) !== null) {
        let count = match[1] ? parseInt(match[1]) : 1;
        let sides = parseInt(match[2]);

        for (let i = 0; i < Math.abs(count); i++) {
            let roll = Math.floor(Math.random() * sides) + 1;
            rolls.push(count < 0 ? -roll : roll);
            total += count < 0 ? -roll : roll;
        }
    }

    // Processa números isolados
    input.replace(diceRegex, "+").match(numberRegex)?.forEach(num => {
        let parsedNum = parseInt(num);
        total += parsedNum;
        rolls.push(parsedNum);
    });

    const resultadoText = `Rolagens: ${rolls.join(", ")} | Total: ${total}`;
    resultDiv.textContent = resultadoText;
    resultDiv.classList.add("show");

    // Envia o resultado para o Firebase usando push para criar um novo registro
    const rolagemRef = ref(db, 'rolagens');
    push(rolagemRef, {
      resultado: resultadoText,
      timestamp: Date.now()
    });

    // Opcional: também salva localmente se precisar de fallback
    localStorage.setItem('dadoResultado', resultadoText);

    setTimeout(() => {
        resultDiv.classList.remove("show");
    }, 3000);
}

/**
 * Função para monitorar novas rolagens em tempo real.
 * O callback será chamado sempre que uma nova rolagem for adicionada no Firebase.
 */
export function monitorarRolagens(callback) {
    const rolagemRef = ref(db, 'rolagens');
    onChildAdded(rolagemRef, (snapshot) => {
        const data = snapshot.val();
        if (callback) {
            callback(data);
        }
    });
}

/**
 * Função para exibir o resultado armazenado no localStorage.
 * (Opcional – caso você queira usar como fallback)
 */
export function exibirResultado() {
    const resultado = localStorage.getItem('dadoResultado');
    if (resultado) {
        const resultDiv = document.getElementById('resultadoDado');
        if (resultDiv) {
            resultDiv.textContent = `Última rolagem: ${resultado}`;
            localStorage.removeItem('dadoResultado');
        } else {
            console.error('Elemento com id="resultadoDado" não encontrado!');
        }
    } else {
        console.log('Nenhum resultado armazenado no localStorage.');
    }
}