/**
 * Firebase Configuration
 *
 * MODO DE DESARROLLO (por defecto):
 * La app usa localStorage como backend simulado (mockService)
 * Funciona 100% en GitHub Pages sin configuración
 *
 * MODO PRODUCCIÓN (opcional):
 * Para usar Firebase real, configura las variables abajo
 * y cambia USE_MOCK_SERVICE a false
 */

// ========================================
// CONFIGURACIÓN: Cambia esto a false para usar Firebase real
// ========================================
export const USE_MOCK_SERVICE = false;

// ========================================
// Configuración de Firebase (solo si USE_MOCK_SERVICE = false)
// ========================================
// Obtén estos valores en: Firebase Console -> Project Settings -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyAOQOcVK7Vwv09243CkTDNGg8tCx_BsE6Y",
  authDomain: "enunanota-508cc.firebaseapp.com",
  projectId: "enunanota-508cc",
  storageBucket: "enunanota-508cc.firebasestorage.app",
  messagingSenderId: "269765831206",
  appId: "1:269765831206:web:fe8543da4430686d0bd4e7",
  measurementId: "G-BGPWLX3KRM"
};

// ========================================
// Inicialización (no modificar)
// ========================================
let app = null;
let db = null;
let auth = null;

if (!USE_MOCK_SERVICE) {
  try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const { getAuth } = await import('firebase/auth');

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    console.log('✅ Firebase inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    console.log('💡 Tip: Verifica tu configuración en src/firebase/config.js');
  }
} else {
  console.log('🔧 Modo desarrollo: usando localStorage (mock service)');
  console.log('💡 Para usar Firebase real, cambia USE_MOCK_SERVICE a false en src/firebase/config.js');
}

export { app, db, auth };
export default app;
