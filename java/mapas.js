document.addEventListener("DOMContentLoaded", function() {
  const mapaSelect = document.getElementById('mapaSelect');
  const mapaContainer = document.getElementById('mapaContainer');

  mapaSelect.addEventListener('change', function() {
    const mapa = mapaSelect.value;
    
    // Limpa o container antes de exibir a nova imagem
    mapaContainer.innerHTML = '';

    if (mapa) {
      // Cria uma nova imagem
      const img = document.createElement('img');
      img.src = `imagens/${mapa}.jpg`;
      img.alt = mapa.charAt(0).toUpperCase() + mapa.slice(1);
      
      // Exibe a imagem no container
      mapaContainer.appendChild(img);
    }
  });
});