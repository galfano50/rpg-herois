// Este script substitui o uso do localStorage por Firestore (Firebase)
import { auth, db, isFirebaseInitialized, getFirebaseInstances } from './firebase-config.js';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

let usuarioLogado = null;
let personagemId = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "index.html";
  } else {
    usuarioLogado = user;
    const urlParams = new URLSearchParams(window.location.search);
    personagemId = urlParams.get("personagemId") || crypto.randomUUID();
    
    // Aguarda o DOM estar pronto antes de carregar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', carregarFichaFirebase);
    } else {
      carregarFichaFirebase();
    }
  }
});

async function salvarFichaFirebase() {
  try {

      // Verificar Firebase

      if (!isFirebaseInitialized()) {

          const {
              auth: authInstance,
              db: dbInstance
          } = getFirebaseInstances();

          if (!authInstance || !dbInstance) {

              showAlert(
                  "Erro: Firebase não foi inicializado corretamente.",
                  "error"
              );

              return;
          }

      }

      if (!usuarioLogado) {

          alert(
              "Você precisa estar logado para salvar a ficha."
          );

          return;
      }

      // =========================
      // OBJETO PRINCIPAL
      // =========================

      const ficha = {

          uid: usuarioLogado.uid,

          personagemId: personagemId,

          dataSalvamento:
              new Date().toISOString(),

          timestamp:
              Date.now()

      };

      // =========================
      // CAMPOS DA FICHA
      // =========================

      document
          .querySelectorAll(
              "input, textarea, select"
          )
          .forEach(el => {

              if (!el.id) return;

              // Não salvar campo do rolador

              if (el.id === "diceInput")
                  return;

              ficha[el.id] = el.value;

          });

      // =========================
      // PONTOS RESTANTES
      // =========================

      const pontos =
          document.getElementById(
              "pontos"
          );

      if (pontos) {

          ficha.pontos =
              parseInt(
                  pontos.textContent
                  .replace(/\D/g, "")
              ) || 0;

      }

      // =========================
      // PODERES MARCADOS
      // =========================

      ficha.poderesSelecionados = [];

      document
          .querySelectorAll(
              ".poder-checkbox"
          )
          .forEach(cb => {

              ficha.poderesSelecionados.push({

                  poder:
                      cb.value,

                  marcado:
                      cb.checked

              });

          });

      // =========================
      // CAMPOS DOS PODERES
      // =========================

      ficha.camposPoderes = [];

      document
          .querySelectorAll(
              ".campo-poder"
          )
          .forEach(campo => {

              ficha.camposPoderes.push({

                  poder:
                      campo.dataset.poder || "",

                  atributo:
                      campo.dataset.atributo || "",

                  campo:
                      campo.dataset.campo || "",

                  valor:
                      campo.value || 0

              });

          });

      // =========================
      // GRAUS
      // =========================

      ficha.grausPoderes = [];

      document
          .querySelectorAll(
              "[id^='grau_']"
          )
          .forEach(el => {

              ficha.grausPoderes.push({

                  id:
                      el.id,

                  valor:
                      el.value

              });

          });

      // =========================
      // DADOS
      // =========================

      ficha.dadosPoderes = [];

      document
          .querySelectorAll(
              "[id^='dado_']"
          )
          .forEach(el => {

              ficha.dadosPoderes.push({

                  id:
                      el.id,

                  valor:
                      el.value

              });

          });

      // =========================
      // FEEDBACK VISUAL
      // =========================

      const saveBtn =
          document.querySelector(
              'button[onclick="salvarFichaFirebase()"]'
          );

      let textoOriginal = "";

      if (saveBtn) {

          textoOriginal =
              saveBtn.innerHTML;

          saveBtn.innerHTML =
              '<i class="fas fa-spinner fa-spin me-2"></i>Salvando...';

          saveBtn.disabled = true;

      }

      // =========================
      // SALVAR FIRESTORE
      // =========================

      await setDoc(

          doc(
              db,
              "usuarios",
              usuarioLogado.uid,
              "personagens",
              personagemId
          ),

          ficha

      );

      // =========================
      // SUCESSO
      // =========================

      if (saveBtn) {

          saveBtn.innerHTML =
              textoOriginal;

          saveBtn.disabled = false;

      }

      showAlert(
          "Ficha salva com sucesso!",
          "success"
      );

  }

  catch (error) {

      console.error(
          "Erro ao salvar ficha:",
          error
      );

      showAlert(
          "Erro ao salvar ficha: "
          + error.message,
          "error"
      );

  }
}

async function carregarFichaFirebase() {
  try {

      if (!isFirebaseInitialized()) {

          const {
              auth: authInstance,
              db: dbInstance
          } = getFirebaseInstances();

          if (!authInstance || !dbInstance) {

              showAlert(
                  "Erro: Firebase não foi inicializado corretamente.",
                  "error"
              );

              return;
          }

      }

      if (!usuarioLogado) {

          alert(
              "Você precisa estar logado para carregar a ficha."
          );

          return;

      }

      const docRef = doc(
          db,
          "usuarios",
          usuarioLogado.uid,
          "personagens",
          personagemId
      );

      const snap = await getDoc(docRef);

      if (!snap.exists()) {

          showAlert(
              "Ficha ainda não cadastrada.",
              "info"
          );

          return;

      }

      const ficha = snap.data();

      // =========================
      // CAMPOS NORMAIS
      // =========================

      Object.entries(ficha)
          .forEach(([chave, valor]) => {

              if (

                  chave === "uid" ||
                  chave === "personagemId" ||
                  chave === "timestamp" ||
                  chave === "dataSalvamento" ||

                  chave === "poderesSelecionados" ||
                  chave === "camposPoderes" ||
                  chave === "grausPoderes" ||
                  chave === "dadosPoderes"

              ) return;

              const el =
                  document.getElementById(chave);

              if (!el) return;

              if (

                  el.tagName === "INPUT" ||
                  el.tagName === "TEXTAREA" ||
                  el.tagName === "SELECT"

              ) {

                  el.value =
                      valor ?? "";

              }

          });

      // =========================
      // RECRIAR CLASSE
      // =========================

      if (ficha.classe) {

          document.getElementById(
              "classe"
          ).value = ficha.classe;

          carregarClasse();

      }

      // =========================
      // RECRIAR RAÇA
      // =========================

      if (ficha.raca) {

          document.getElementById(
              "raca"
          ).value = ficha.raca;

          carregarRaca();

      }

      // Aguarda renderização

      setTimeout(() => {

          // =========================
          // CHECKBOXES DOS PODERES
          // =========================

          if (ficha.poderesSelecionados) {

              ficha.poderesSelecionados
                  .forEach(p => {

                      document
                          .querySelectorAll(
                              ".poder-checkbox"
                          )
                          .forEach(cb => {

                              if (
                                  cb.value === p.poder
                              ) {

                                  cb.checked =
                                      p.marcado;

                              }

                          });

                  });

          }

          atualizarPainelClasseRaca();

          setTimeout(() => {

              // =========================
              // CAMPOS DOS PODERES
              // =========================

              if (ficha.camposPoderes) {

                  const campos =
                      document.querySelectorAll(
                          ".campo-poder"
                      );

                  ficha.camposPoderes
                      .forEach((item, index) => {

                          if (
                              campos[index]
                          ) {

                              campos[index].value =
                                  item.valor;

                          }

                      });

              }

              // =========================
              // GRAUS
              // =========================

              if (ficha.grausPoderes) {

                  ficha.grausPoderes
                      .forEach(grau => {

                          const el =
                              document.getElementById(
                                  grau.id
                              );

                          if (el) {

                              el.value =
                                  grau.valor;

                          }

                      });

              }

              // =========================
              // DADOS
              // =========================

              if (ficha.dadosPoderes) {

                  ficha.dadosPoderes
                      .forEach(dado => {

                          const el =
                              document.getElementById(
                                  dado.id
                              );

                          if (el) {

                              el.value =
                                  dado.valor;

                          }

                      });

              }

              atualizarNivel();

          }, 200);

      }, 200);

      showAlert(
          "Ficha carregada com sucesso!",
          "success"
      );

  }

  catch (error) {

      console.error(
          "Erro ao carregar ficha:",
          error
      );

      showAlert(
          "Erro ao carregar ficha: "
          + error.message,
          "error"
      );

  }
}

function resetarFicha() {

    if (
        !confirm(
            "Tem certeza que deseja resetar toda a ficha?"
        )
    ) {
        return;
    }

    try {

        // ==========================
        // LIMPA TODOS OS CAMPOS
        // ==========================

        document
            .querySelectorAll(
                "input, textarea, select"
            )
            .forEach(el => {

                // Campos readonly
                if (el.hasAttribute("readonly")) {

                    return;

                }

                if (
                    el.type === "checkbox"
                ) {

                    el.checked = false;

                }
                else if (
                    el.tagName === "SELECT"
                ) {

                    el.selectedIndex = 0;

                }
                else {

                    el.value = "";

                }

            });

        // ==========================
        // VALORES PADRÃO
        // ==========================

        document.getElementById(
            "nivel"
        ).value = 1;

        document.getElementById(
            "forca"
        ).value = 0;

        document.getElementById(
            "constituicao"
        ).value = 0;

        document.getElementById(
            "destreza"
        ).value = 0;

        document.getElementById(
            "agilidade"
        ).value = 0;

        document.getElementById(
            "inteligencia"
        ).value = 0;

        document.getElementById(
            "percepcao"
        ).value = 0;

        document.getElementById(
            "vontade"
        ).value = 0;

        document.getElementById(
            "carisma"
        ).value = 0;

        document.getElementById(
            "extra11"
        ).value = 0;

        document.getElementById(
            "extra12"
        ).value = 0;

        // ==========================
        // LIMPA ÁREAS DINÂMICAS
        // ==========================

        const dadosClasse =
            document.getElementById(
                "dadosClasse"
            );

        if (dadosClasse) {

            dadosClasse.innerHTML =
                "Selecione uma classe.";

        }

        const listaPoderes =
            document.getElementById(
                "listaPoderes"
            );

        if (listaPoderes) {

            listaPoderes.innerHTML =
                "Nenhum poder selecionado.";

        }

        const listaPoderesClasse =
            document.getElementById(
                "listaPoderesClasse"
            );

        if (listaPoderesClasse) {

            listaPoderesClasse.innerHTML =
                "";

        }

        // ==========================
        // RECALCULA
        // ==========================

        atualizarNivel();

        if (
            typeof atualizarAtributos
            === "function"
        ) {

            atualizarAtributos();

        }

        // ==========================
        // FEEDBACK
        // ==========================

        showAlert(
            "Ficha resetada com sucesso!",
            "success"
        );

    }
    catch (erro) {

        console.error(
            "Erro ao resetar:",
            erro
        );

        showAlert(
            "Erro ao resetar ficha.",
            "error"
        );

    }

}

function showAlert(mensagem, tipo = "info") {

    const alerta = document.createElement("div");

    alerta.className = `alerta-rpg ${tipo}`;

    alerta.innerHTML = mensagem;

    document.body.appendChild(alerta);

    setTimeout(() => {

        alerta.classList.add("sumir");

        setTimeout(() => {

            alerta.remove();

        }, 500);

    }, 3000);

}

// ========================================
// FUNÇÕES GLOBAIS
// ========================================

window.salvarFichaFirebase =
    salvarFichaFirebase;

window.carregarFichaFirebase =
    carregarFichaFirebase;

window.resetarFicha =
    resetarFicha;

window.showAlert =
    showAlert;