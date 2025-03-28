// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD_vM-tbAj_Gc2gv1XBa6GMOYpe9zNSv7s",
  authDomain: "bar-do-truta-rpg-online.firebaseapp.com",
  databaseURL: "https://bar-do-truta-rpg-online-default-rtdb.firebaseio.com",
  projectId: "bar-do-truta-rpg-online",
  storageBucket: "bar-do-truta-rpg-online.firebasestorage.app",
  messagingSenderId: "109187771317",
  appId: "1:109187771317:web:13add20ef2fa8da2da07fc"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Manipula o formulário de login
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;
      const mensagem = document.getElementById("mensagem");

      auth.signInWithEmailAndPassword(email, senha)
        .then((userCredential) => {
          mensagem.style.color = "green";
          mensagem.textContent = "Login bem-sucedido!";
          setTimeout(() => {
            window.location.href = "home.html"; // Redireciona para a página inicial
          }, 2000);
        })
        .catch((error) => {
          mensagem.style.color = "red";
          mensagem.textContent = "Erro: " + error.message;
        });
    });
  }
});

// Verifica se o usuário está autenticado
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Usuário logado:", user.email);
  } else {
    console.log("Nenhum usuário logado.");
  }
});
