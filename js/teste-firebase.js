// teste-firebase.js - Script para testar a conexão com o Firebase
import { app, db, auth, isFirebaseInitialized, getFirebaseInstances } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Função para testar a conexão com o Firebase
async function testarConexaoFirebase() {
  console.log('=== TESTE DE CONEXÃO FIREBASE ===');
  
  try {
    // Verificar inicialização
    if (!isFirebaseInitialized()) {
      console.log('❌ Firebase não inicializado');
      const { auth: authInstance, db: dbInstance } = getFirebaseInstances();
      if (!authInstance || !dbInstance) {
        console.log('❌ Falha ao obter instâncias do Firebase');
        return false;
      }
    }
    
    console.log('✅ Firebase inicializado com sucesso');
    
    // Testar acesso à coleção
    const fichasRef = collection(db, "fichas");
    console.log('✅ Referência da coleção criada');
    
    // Tentar buscar documentos
    const querySnapshot = await getDocs(fichasRef);
    console.log('✅ Acesso à coleção funcionando');
    console.log(`📊 Total de documentos na coleção: ${querySnapshot.size}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error);
    return false;
  }
}

// Função para testar autenticação
async function testarAutenticacao() {
  console.log('\n=== TESTE DE AUTENTICAÇÃO ===');
  
  try {
    const user = auth.currentUser;
    if (user) {
      console.log('✅ Usuário já autenticado:', user.uid);
      return user;
    } else {
      console.log('⚠️ Usuário não autenticado');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro no teste de autenticação:', error);
    return null;
  }
}

// Função para testar busca de fichas
async function testarBuscaFichas(user) {
  console.log('\n=== TESTE DE BUSCA DE FICHAS ===');
  
  try {
    const fichasRef = collection(db, "fichas");
    const q = query(
      fichasRef, 
      where("uid", "==", user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`📊 Fichas encontradas para o usuário: ${querySnapshot.size}`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 Ficha ID: ${doc.id}`);
      console.log(`   Nome: ${data.nome || 'Sem nome'}`);
      console.log(`   UID: ${data.uid}`);
      console.log(`   Data: ${data.dataSalvamento || 'Sem data'}`);
    });
    
    return querySnapshot;
  } catch (error) {
    console.error('❌ Erro na busca de fichas:', error);
    return null;
  }
}

// Função para criar uma ficha de teste
async function criarFichaTeste(user) {
  console.log('\n=== CRIANDO FICHA DE TESTE ===');
  
  try {
    const testId = 'teste-' + Date.now();
    const fichaTeste = {
      uid: user.uid,
      nome: 'Personagem de Teste',
      raca: 'Humano',
      classe: 'Guerreiro',
      nivel: '1',
      vida: '100',
      energia: '50',
      xp: '0',
      dataSalvamento: new Date().toISOString()
    };
    
    await setDoc(doc(db, "fichas", testId), fichaTeste);
    console.log('✅ Ficha de teste criada com sucesso');
    console.log(`📄 ID da ficha: ${testId}`);
    
    return testId;
  } catch (error) {
    console.error('❌ Erro ao criar ficha de teste:', error);
    return null;
  }
}

// Função para executar todos os testes
async function executarTestes() {
  console.log('🚀 Iniciando testes do Firebase...\n');
  
  // Teste 1: Conexão
  const conexaoOk = await testarConexaoFirebase();
  if (!conexaoOk) {
    console.log('❌ Teste de conexão falhou');
    return;
  }
  
  // Teste 2: Autenticação
  const user = await testarAutenticacao();
  if (!user) {
    console.log('❌ Usuário não autenticado');
    console.log('💡 Faça login primeiro e depois execute os testes novamente');
    return;
  }
  
  // Teste 3: Busca de fichas
  const fichas = await testarBuscaFichas(user);
  
  // Teste 4: Criar ficha de teste (se não houver fichas)
  if (!fichas || fichas.size === 0) {
    console.log('\n📝 Nenhuma ficha encontrada, criando ficha de teste...');
    const testId = await criarFichaTeste(user);
    if (testId) {
      // Testar busca novamente
      await testarBuscaFichas(user);
    }
  }
  
  console.log('\n✅ Todos os testes concluídos!');
}

// Função para limpar fichas de teste
async function limparFichasTeste(user) {
  console.log('\n=== LIMPANDO FICHAS DE TESTE ===');
  
  try {
    const fichasRef = collection(db, "fichas");
    const q = query(
      fichasRef, 
      where("uid", "==", user.uid),
      where("nome", "==", "Personagem de Teste")
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`🗑️ Encontradas ${querySnapshot.size} fichas de teste para remover`);
    
    // Nota: Para deletar, você precisaria implementar a função deleteDoc
    // Por segurança, apenas listamos as fichas de teste
    
    querySnapshot.forEach((doc) => {
      console.log(`📄 Ficha de teste ID: ${doc.id}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao limpar fichas de teste:', error);
  }
}

// Exportar funções para uso global
window.testarFirebase = executarTestes;
window.limparFichasTeste = limparFichasTeste;

// Executar testes automaticamente se o script for carregado
if (typeof window !== 'undefined') {
  // Aguardar um pouco para o Firebase inicializar
  setTimeout(() => {
    console.log('🔧 Script de teste carregado. Use window.testarFirebase() para executar os testes.');
  }, 1000);
} 