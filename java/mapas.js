document.addEventListener("DOMContentLoaded", function () {

    const mapaSelect = document.getElementById("mapaSelect");
    const mapaContainer = document.getElementById("mapaContainer");

    mapaSelect.addEventListener("change", function () {

        const mapa = this.value;

        // Limpa o container
        mapaContainer.innerHTML = "";

        if (!mapa) return;

        // Cria a imagem
        const img = document.createElement("img");

        img.alt = this.options[this.selectedIndex].text;

        // Primeiro tenta PNG
        img.src = `imagens/${mapa}.png`;

        // Se não existir PNG, tenta JPG
        img.onerror = function () {

            this.onerror = function () {

                mapaContainer.innerHTML = `
                    <p style="color:red;">
                        Mapa não encontrado.
                    </p>
                `;

            };

            this.src = `imagens/${mapa}.jpg`;

        };

        mapaContainer.appendChild(img);

    });

});
