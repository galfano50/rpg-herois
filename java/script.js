document.addEventListener("DOMContentLoaded", function () {
  const cadastroForm = document.getElementById("cadastroForm");
  const loginForm = document.getElementById("loginForm");
  const mensagem = document.getElementById("mensagem");
  const usuarioSpan = document.getElementById("usuario");

  // Cadastro
  if (cadastroForm) {
    cadastroForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const login = document.getElementById("login").value;
      const senha = document.getElementById("senha").value;

      if (login && senha) {
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
        if (usuarios[login]) {
          mensagem.textContent = "Usuário já existe!";
          mensagem.style.color = "red";
        } else {
          usuarios[login] = senha;
          localStorage.setItem("usuarios", JSON.stringify(usuarios));
          mensagem.textContent = "Cadastro realizado com sucesso!";
          mensagem.style.color = "green";
        }
      } else {
        mensagem.textContent = "Preencha todos os campos!";
        mensagem.style.color = "red";
      }
    });
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const login = document.getElementById("login").value;
      const senha = document.getElementById("senha").value;

      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

      if (usuarios[login] && usuarios[login] === senha) {
        localStorage.setItem("usuarioLogado", login);
        window.location.href = "home.html";
      } else {
        mensagem.textContent = "Usuário ou senha incorretos!";
        mensagem.style.color = "red";
      }
    });
  }

  // Personalizar a página home
  if (window.location.href.includes("home.html")) {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (usuarioLogado) {
      usuarioSpan.textContent = usuarioLogado;
    } else {
      window.location.href = "login.html"; // Redireciona se o usuário não estiver logado
    }
  }
});