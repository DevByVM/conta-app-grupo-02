// Importar Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAUF6QVCDzxXwbym0vH_z8rpPNRH26LM4k",
  authDomain: "conta-app-gp02.firebaseapp.com",
  projectId: "conta-app-gp02",
  storageBucket: "conta-app-gp02.firebasestorage.app",
  messagingSenderId: "942075202637",
  appId: "1:942075202637:web:0a96a542edaf263c252004"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener la base de datos y autentificacion
export const db = getFirestore(app);
export const auth = getAuth(app);

// Exportar todas las funciones de Firestore y Auth
export { 
  collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged
};