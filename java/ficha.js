// Função para atualizar os dados no Firebase
function atualizarFirebase() {
    const nome = document.getElementById('nome').value;
    const raca = document.getElementById('raca').value;
    const classe = document.getElementById('classe').value;
    const nivel = parseInt(document.getElementById('nivel').value);
    const vida = parseInt(document.getElementById('vida').value);
    const energia = parseInt(document.getElementById('energia').value);
    const indiceProtecao = parseInt(document.getElementById('indice_protecao').value);
    const xp = parseInt(document.getElementById('xp').value);
    const pHeroi = parseInt(document.getElementById('p_heroi').value);
    const pVilao = parseInt(document.getElementById('p_vilao').value);
    const danoSofrido = parseInt(document.getElementById('extra11').value);
    const gastoEnergia = parseInt(document.getElementById('extra12').value);

    // Atualizando os dados no Firebase
    const heroRef = ref(db, 'herois/' + nome);  // Usando nome como chave única para o herói
    set(heroRef, {
        nome,
        raca,
        classe,
        nivel,
        vida,
        energia,
        indice_protecao,
        xp,
        p_heroi: pHeroi,
        p_vilao: pVilao,
        dano_sofrido: danoSofrido,
        gasto_energia: gastoEnergia
    });
}

// Função para calcular os valores de Vida e Energia baseados no nível e outros valores
function atualizarValores() {
    const nivel = parseInt(document.getElementById('nivel').value);
    const vida = nivel * 10; // Exemplo de cálculo de vida
    const energia = nivel * 5; // Exemplo de cálculo de energia
    document.getElementById('vida').value = vida;
    document.getElementById('energia').value = energia;
}

// Função que atualiza os pontos após dano sofrido e gasto de energia
function modificarPontos() {
    let pontosRestantes = 81; // Exemplo de pontos iniciais

    // Atributos
    const forca = parseInt(document.getElementById('forca').value);
    const constituicao = parseInt(document.getElementById('constituicao').value);
    const destreza = parseInt(document.getElementById('destreza').value);
    const agilidade = parseInt(document.getElementById('agilidade').value);
    const inteligencia = parseInt(document.getElementById('inteligencia').value);
    const percepcao = parseInt(document.getElementById('percepcao').value);
    const vontade = parseInt(document.getElementById('vontade').value);
    const carisma = parseInt(document.getElementById('carisma').value);

    // Extras
    const extra1 = parseInt(document.getElementById('extra1').value);
    const extra2 = parseInt(document.getElementById('extra2').value);
    const extra3 = parseInt(document.getElementById('extra3').value);
    const extra4 = parseInt(document.getElementById('extra4').value);
    const extra5 = parseInt(document.getElementById('extra5').value);
    const extra6 = parseInt(document.getElementById('extra6').value);
    const extra7 = parseInt(document.getElementById('extra7').value);
    const extra8 = parseInt(document.getElementById('extra8').value);
    const extra9 = parseInt(document.getElementById('extra9').value);
    const extra10 = parseInt(document.getElementById('extra10').value);

    // Poderes
    const poder1 = parseInt(document.getElementById('poder1').value);
    const poder2 = parseInt(document.getElementById('poder2').value);
    const poder3 = parseInt(document.getElementById('poder3').value);
    const poder4 = parseInt(document.getElementById('poder4').value);
    const poder5 = parseInt(document.getElementById('poder5').value);
    const poder6 = parseInt(document.getElementById('poder6').value);
    const poder7 = parseInt(document.getElementById('poder7').value);
    const poder8 = parseInt(document.getElementById('poder8').value);
    const poder9 = parseInt(document.getElementById('poder9').value);

    // Calcular o total de pontos usados e ajustar os pontos restantes
    const totalAtributos = forca + constituicao + destreza + agilidade + inteligencia + percepcao + vontade + carisma;
    const totalExtras = extra1 + extra2 + extra3 + extra4 + extra5 + extra6 + extra7 + extra8 + extra9 + extra10;
    const totalPoderes = poder1 + poder2 + poder3 + poder4 + poder5 + poder6 + poder7 + poder8 + poder9;

    // Atualizar os totais
    document.getElementById('soma1').textContent = forca + extra1 + poder1;
    document.getElementById('soma2').textContent = constituicao + extra2 + poder2;
    document.getElementById('soma3').textContent = destreza + extra3 + poder3;
    document.getElementById('soma4').textContent = agilidade + extra4 + poder4;
    document.getElementById('soma5').textContent = inteligencia + extra5 + poder5;
    document.getElementById('soma6').textContent = percepcao + extra6 + poder6;
    document.getElementById('soma7').textContent = vontade + extra7 + poder7;
    document.getElementById('soma8').textContent = carisma + extra8 + poder8;

    // Atualizar os pontos restantes
    pontosRestantes -= (totalAtributos + totalExtras + totalPoderes);
    document.getElementById('pontos').textContent = 'Pontos: ' + pontosRestantes;

    // Certificar-se de que o valor não passe de zero
    pontosRestantes = Math.max(pontosRestantes, 0);
}

// Função para atualizar vida e energia
function atualizarVidaEnergia() {
    const dano = parseInt(document.getElementById('extra9').value);
    const gastoEnergia = parseInt(document.getElementById('extra10').value);
    const vida = parseInt(document.getElementById('vida').value) - dano;
    const energia = parseInt(document.getElementById('energia').value) - gastoEnergia;

    document.getElementById('vida').value = vida;
    document.getElementById('energia').value = energia;

    // Atualiza no Firebase após modificações
    atualizarFirebase();
}

// Adicionando eventos aos inputs para garantir que o Firebase seja atualizado sempre
document.getElementById('forca').addEventListener('input', modificarPontos);
document.getElementById('constituicao').addEventListener('input', modificarPontos);
document.getElementById('destreza').addEventListener('input', modificarPontos);
document.getElementById('agilidade').addEventListener('input', modificarPontos);
document.getElementById('inteligencia').addEventListener('input', modificarPontos);
document.getElementById('percepcao').addEventListener('input', modificarPontos);
document.getElementById('vontade').addEventListener('input', modificarPontos);
document.getElementById('carisma').addEventListener('input', modificarPontos);
document.getElementById('extra1').addEventListener('input', modificarPontos);
document.getElementById('extra2').addEventListener('input', modificarPontos);
document.getElementById('extra3').addEventListener('input', modificarPontos);
document.getElementById('extra4').addEventListener('input', modificarPontos);
document.getElementById('extra5').addEventListener('input', modificarPontos);
document.getElementById('extra6').addEventListener('input', modificarPontos);
document.getElementById('extra7').addEventListener('input', modificarPontos);
document.getElementById('extra8').addEventListener('input', modificarPontos);
document.getElementById('extra9').addEventListener('input', () => {
    modificarPontos();
    atualizarVidaEnergia();
});
document.getElementById('extra10').addEventListener('input', () => {
    modificarPontos();
    atualizarVidaEnergia();
});
document.getElementById('poder1').addEventListener('input', modificarPontos);
document.getElementById('poder2').addEventListener('input', modificarPontos);
document.getElementById('poder3').addEventListener('input', modificarPontos);
document.getElementById('poder4').addEventListener('input', modificarPontos);
document.getElementById('poder5').addEventListener('input', modificarPontos);
document.getElementById('poder6').addEventListener('input', modificarPontos);
document.getElementById('poder7').addEventListener('input', () => {
    modificarPontos();
    atualizarVidaEnergia();
});
document.getElementById('poder8').addEventListener('input', modificarPontos);
document.getElementById('poder9').addEventListener('input', () => {
    modificarPontos();
    atualizarVidaEnergia();
});

// Função para atualizar os dados no Firebase, incluindo aprimoramentos e características
function atualizarIndividualidades() {
    const aprimoramento1 = document.getElementById('aprimoramento1').value;
    const aprimoramento2 = document.getElementById('Aprimoramento2').value;
    const aprimoramento3 = document.getElementById('aprimoramento3').value;
    const aprimoramento4 = document.getElementById('aprimoramento4').value;
    const positivo = document.getElementById('positivo').value;
    const negativo = document.getElementById('negativo').value;
    const historia = document.getElementById('historia').value;
    const primaria = document.getElementById('primaria').value;
    const secundaria = document.getElementById('secundaria').value;

    // Atualizando os dados no Firebase
    const heroRef = ref(db, 'herois/' + nome); // Usando o nome como chave
    set(heroRef, {
        aprimoramento1,
        aprimoramento2,
        aprimoramento3,
        aprimoramento4,
        positivo,
        negativo,
        historia,
        armas: {
            primaria,
            secundaria
        }
    });
}

// Adicionando eventos para atualizar os dados sempre que uma mudança for feita
document.getElementById('aprimoramento1').addEventListener('input', atualizarIndividualidades);
document.getElementById('Aprimoramento2').addEventListener('input', atualizarIndividualidades);
document.getElementById('aprimoramento3').addEventListener('input', atualizarIndividualidades);
document.getElementById('aprimoramento4').addEventListener('input', atualizarIndividualidades);
document.getElementById('positivo').addEventListener('input', atualizarIndividualidades);
document.getElementById('negativo').addEventListener('input', atualizarIndividualidades);
document.getElementById('historia').addEventListener('input', atualizarIndividualidades);
document.getElementById('primaria').addEventListener('input', atualizarIndividualidades);
document.getElementById('secundaria').addEventListener('input', atualizarIndividualidades);

// Função para atualizar os dados de status no Firebase
function atualizarStatus() {
    const power1 = document.getElementById('power1').value;
    const power2 = document.getElementById('power2').value;
    const power3 = document.getElementById('power3').value;
    const power4 = document.getElementById('power4').value;
    const power5 = document.getElementById('power5').value;
    const golpes = document.getElementById('golpes').value;
    const item1 = document.getElementById('item1').value;
    const item2 = document.getElementById('item2').value;
    const item3 = document.getElementById('item3').value;
    const item4 = document.getElementById('item4').value;
    const item5 = document.getElementById('item5').value;

    // Atualizando os dados no Firebase
    const heroRef = ref(db, 'herois/' + nome); // Usando o nome como chave
    set(heroRef, {
        poderes: {
            power1,
            power2,
            power3,
            power4,
            power5
        },
        golpes,
        itens: {
            item1,
            item2,
            item3,
            item4,
            item5
        }
    });
}

// Adicionando eventos para atualizar os dados sempre que uma mudança for feita
document.getElementById('power1').addEventListener('input', atualizarStatus);
document.getElementById('power2').addEventListener('input', atualizarStatus);
document.getElementById('power3').addEventListener('input', atualizarStatus);
document.getElementById('power4').addEventListener('input', atualizarStatus);
document.getElementById('power5').addEventListener('input', atualizarStatus);
document.getElementById('golpes').addEventListener('input', atualizarStatus);
document.getElementById('item1').addEventListener('input', atualizarStatus);
document.getElementById('item2').addEventListener('input', atualizarStatus);
document.getElementById('item3').addEventListener('input', atualizarStatus);
document.getElementById('item4').addEventListener('input', atualizarStatus);
document.getElementById('item5').addEventListener('input', atualizarStatus);

// Função para salvar a ficha no Firebase
function salvarFicha() {
    const pericias = [];
    const mochila = [];
    
    // Coletando dados das perícias
    const periciaInputs = document.querySelectorAll('.pericia-section input');
    for (let i = 0; i < periciaInputs.length; i += 3) {
        const pericia = periciaInputs[i].value;
        const attAtrelado = periciaInputs[i + 1].value;
        const pts = periciaInputs[i + 2].value;
        pericias.push({ pericia, attAtrelado, pts });
    }

    // Coletando dados da mochila
    const mochilaInputs = document.querySelectorAll('.mochila-section textarea');
    mochilaInputs.forEach(input => {
        mochila.push(input.value);
    });

    // Salvando as informações no Firebase
    const heroRef = ref(db, 'herois/' + nome);
    set(heroRef, {
        pericias,
        mochila
    }).then(() => {
        alert('Ficha salva com sucesso!');
    }).catch(error => {
        alert('Erro ao salvar ficha: ' + error.message);
    });
}

// Função para carregar a ficha do Firebase
function carregarFicha() {
    const heroRef = ref(db, 'herois/' + nome);
    get(heroRef).then(snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();

            // Preenchendo as perícias
            const pericias = data.pericias || [];
            const periciaInputs = document.querySelectorAll('.pericia-section input');
            pericias.forEach((pericia, index) => {
                periciaInputs[index * 3].value = pericia.pericia;
                periciaInputs[index * 3 + 1].value = pericia.attAtrelado;
                periciaInputs[index * 3 + 2].value = pericia.pts;
            });

            // Preenchendo a mochila
            const mochila = data.mochila || [];
            const mochilaInputs = document.querySelectorAll('.mochila-section textarea');
            mochila.forEach((item, index) => {
                mochilaInputs[index].value = item;
            });

            alert('Ficha carregada com sucesso!');
        } else {
            alert('Ficha não encontrada!');
        }
    }).catch(error => {
        alert('Erro ao carregar ficha: ' + error.message);
    });
}

// Função para resetar a ficha
function resetarFicha() {
    // Resetando as perícias
    const periciaInputs = document.querySelectorAll('.pericia-section input');
    periciaInputs.forEach(input => {
        input.value = '';
    });

    // Resetando a mochila
    const mochilaInputs = document.querySelectorAll('.mochila-section textarea');
    mochilaInputs.forEach(input => {
        input.value = '';
    });

    alert('Ficha resetada!');
}
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}


