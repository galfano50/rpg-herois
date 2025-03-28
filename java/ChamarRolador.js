// Importando os módulos do Firebase via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Configuração do Firebase (Bar do Truta RPG Online)
const firebaseConfig = {
  apiKey: "AIzaSyD_vM-tbAj_Gc2gv1XBa6GMOYpe9zNSv7s",
  authDomain: "bar-do-truta-rpg-online.firebaseapp.com",
  databaseURL: "https://bar-do-truta-rpg-online-default-rtdb.firebaseio.com",
  projectId: "bar-do-truta-rpg-online",
  storageBucket: "bar-do-truta-rpg-online.appspot.com",
  messagingSenderId: "109187771317",
  appId: "1:109187771317:web:13add20ef2fa8da2da07fc"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/**
 * Função para rolar os dados.
 * Calcula o resultado com base no input do usuário e envia o resultado para o Firebase.
 */
export function rollDice() {
    const input = document.getElementById("diceInput").value.replace(/\s+/g, "");
    const resultDiv = document.getElementById("result");
    
    if (!input) {
        alert("Digite uma rolagem válida, como 2d6+3!");
        return;
    }

    const diceRegex = /(-?\d*)d(\d+)/g;
    const numberRegex = /([-+]?\d+)/g;
    let total = 0;
    let rolls = [];

    let match;
    while ((match = diceRegex.exec(input)) !== null) {
        let count = match[1] ? parseInt(match[1]) : 1;
        let sides = parseInt(match[2]);

        if (sides <= 0) {
            alert("Número de lados do dado inválido!");
            return;
        }

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

    // Opcional: salva localmente se precisar de fallback
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