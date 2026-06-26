// teste-regras.js - Script para testar as regras de segurança do Firestore
import { app, db, auth, isFirebaseInitialized, getFirebaseInstances } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Função para testar criação de ficha
async function testarCriacaoFicha(user) {
  console.log('\n=== TESTE: CRIAÇÃO DE FICHA ===');
  
  try {
    const testId = 'teste-criacao-' + Date.now();
    const fichaTeste = {
      uid: user.uid, // ✅ Correto: uid do usuário logado
      nome: 'Personagem de Teste - Criação',
      raca: 'Humano',
      classe: 'Guerreiro',
      nivel: '1',
      dataSalvamento: new Date().toISOString()
    };
    
    await setDoc(doc(db, "fichas", testId), fichaTeste);
    console.log('✅ Criação de ficha bem-sucedida');
    return testId;
  } catch (error) {
    console.error('❌ Erro na criação de ficha:', error);
    return null;
  }
}

// Função para testar leitura de ficha própria
async function testarLeituraFichaPropria(user, fichaId) {
  console.log('\n=== TESTE: LEITURA DE FICHA PRÓPRIA ===');
  
  try {
    const docRef = doc(db, "fichas", fichaId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ Leitura de ficha própria bem-sucedida');
      console.log(`   Nome: ${data.nome}`);
      console.log(`   UID: ${data.uid}`);
      return true;
    } else {
      console.log('⚠️ Ficha não encontrada');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro na leitura de ficha própria:', error);
    return false;
  }
}

// Função para testar tentativa de leitura de ficha de outro usuário
async function testarLeituraFichaOutroUsuario(user) {
  console.log('\n=== TESTE: TENTATIVA DE LEITURA DE FICHA DE OUTRO USUÁRIO ===');
  
  try {
    // Tentar ler uma ficha que não pertence ao usuário
    const fichaRef = collection(db, "fichas");
    const q = query(fichaRef, where("uid", "!=", user.uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const outraFicha = querySnapshot.docs[0];
      console.log('⚠️ Tentando ler ficha de outro usuário...');
      
      try {
        const docRef = doc(db, "fichas", outraFicha.id);
        await getDoc(docRef);
        console.log('❌ ERRO: Conseguiu ler ficha de outro usuário (regra violada)');
        return false;
      } catch (error) {
        if (error.code === 'permission-denied') {
          console.log('✅ CORRETO: Negou acesso a ficha de outro usuário');
          return true;
        } else {
          console.error('❌ Erro inesperado:', error);
          return false;
        }
      }
    } else {
      console.log('ℹ️ Não há fichas de outros usuários para testar');
      return true;
    }
  } catch (error) {
    console.error('❌ Erro no teste de leitura de ficha de outro usuário:', error);
    return false;
  }
}

// Função para testar criação de ficha com UID incorreto
async function testarCriacaoFichaUIDIncorreto(user) {
  console.log('\n=== TESTE: CRIAÇÃO DE FICHA COM UID INCORRETO ===');
  
  try {
    const testId = 'teste-uid-incorreto-' + Date.now();
    const fichaTeste = {
      uid: 'uid-falso-123', // ❌ Incorreto: uid que não pertence ao usuário
      nome: 'Personagem com UID Incorreto',
      raca: 'Humano',
      classe: 'Guerreiro',
      nivel: '1',
      dataSalvamento: new Date().toISOString()
    };
    
    await setDoc(doc(db, "fichas", testId), fichaTeste);
    console.log('❌ ERRO: Conseguiu criar ficha com UID incorreto (regra violada)');
    return false;
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.log('✅ CORRETO: Negou criação de ficha com UID incorreto');
      return true;
    } else {
      console.error('❌ Erro inesperado:', error);
      return false;
    }
  }
}

// Função para testar busca de fichas do usuário
async function testarBuscaFichasUsuario(user) {
  console.log('\n=== TESTE: BUSCA DE FICHAS DO USUÁRIO ===');
  
  try {
    const fichasRef = collection(db, "fichas");
    const q = query(
      fichasRef, 
      where("uid", "==", user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`✅ Busca de fichas bem-sucedida: ${querySnapshot.size} fichas encontradas`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   📄 ${data.nome} (ID: ${doc.id})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro na busca de fichas:', error);
    return false;
  }
}

// Função principal para testar todas as regras
async function testarRegrasCompletas() {
  console.log('🔒 INICIANDO TESTES DAS REGRAS DE SEGURANÇA\n');
  
  // Verificar se o usuário está autenticado
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ Usuário não autenticado. Faça login primeiro.');
    return;
  }
  
  console.log(`👤 Usuário autenticado: ${user.uid}`);
  
  let testesPassaram = 0;
  let totalTestes = 0;
  
  // Teste 1: Criação de ficha
  totalTestes++;
  const fichaId = await testarCriacaoFicha(user);
  if (fichaId) {
    testesPassaram++;
  }
  
  // Teste 2: Leitura de ficha própria
  if (fichaId) {
    totalTestes++;
    if (await testarLeituraFichaPropria(user, fichaId)) {
      testesPassaram++;
    }
  }
  
  // Teste 3: Busca de fichas do usuário
  totalTestes++;
  if (await testarBuscaFichasUsuario(user)) {
    testesPassaram++;
  }
  
  // Teste 4: Tentativa de leitura de ficha de outro usuário
  totalTestes++;
  if (await testarLeituraFichaOutroUsuario(user)) {
    testesPassaram++;
  }
  
  // Teste 5: Tentativa de criação com UID incorreto
  totalTestes++;
  if (await testarCriacaoFichaUIDIncorreto(user)) {
    testesPassaram++;
  }
  
  // Resultado final
  console.log('\n📊 RESULTADO DOS TESTES');
  console.log(`✅ Testes que passaram: ${testesPassaram}/${totalTestes}`);
  
  if (testesPassaram === totalTestes) {
    console.log('🎉 TODAS AS REGRAS ESTÃO FUNCIONANDO CORRETAMENTE!');
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM. Verifique as regras.');
  }
  
  // Limpar ficha de teste criada
  if (fichaId) {
    try {
      await deleteDoc(doc(db, "fichas", fichaId));
      console.log('🧹 Ficha de teste removida');
    } catch (error) {
      console.log('⚠️ Não foi possível remover ficha de teste:', error.message);
    }
  }
}

// Exportar função para uso global
window.testarRegras = testarRegrasCompletas;

// Executar automaticamente se solicitado
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('🔒 Script de teste de regras carregado. Use window.testarRegras() para testar.');
  }, 1000);
} 