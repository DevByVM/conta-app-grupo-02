import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  setDoc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Exportar funciones comunes de Firebase
export {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  setDoc,
  getDoc,
  updateDoc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

// Gestión de Proyectos

// Crear nuevo proyecto para usuario
export const crearProyecto = async (userId, proyectoData) => {
  try {
    const proyectoId = Date.now().toString();
    const proyectoRef = doc(db, 'usuarios', userId, 'proyectos', proyectoId);
    
    const proyectoCompleto = {
      ...proyectoData,
      id: proyectoId,
      fechaCreacion: new Date(),
      ultimaModificacion: new Date(),
      estado: 'activo'
    };
    
    await setDoc(proyectoRef, proyectoCompleto);
    return proyectoCompleto;
  } catch (error) {
    console.error("Error creando proyecto:", error);
    throw error;
  }
};

// Obtener todos los proyectos de usuario
export const obtenerProyectos = async (userId) => {
  try {
    const proyectosRef = collection(db, 'usuarios', userId, 'proyectos');
    const q = query(proyectosRef, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error obteniendo proyectos:", error);
    if (error.code === 'failed-precondition' || error.code === 'not-found') {
      return [];
    }
    console.log('Error específico:', error.code, error.message);
    return [];
  }
};

// Obtener proyecto específico
export const obtenerProyecto = async (userId, proyectoId) => {
  try {
    const proyectoRef = doc(db, 'usuarios', userId, 'proyectos', proyectoId);
    const proyectoSnap = await getDoc(proyectoRef);
    
    if (proyectoSnap.exists()) {
      return {
        id: proyectoSnap.id,
        ...proyectoSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo proyecto:", error);
    if (error.code === 'not-found') return null;
    throw error;
  }
};

// Actualizar proyecto existente
export const actualizarProyecto = async (userId, proyectoId, datosActualizados) => {
  try {
    const proyectoRef = doc(db, 'usuarios', userId, 'proyectos', proyectoId);
    await updateDoc(proyectoRef, {
      ...datosActualizados,
      ultimaModificacion: new Date()
    });
  } catch (error) {
    console.error("Error actualizando proyecto:", error);
    throw error;
  }
};

// Eliminar proyecto
export const eliminarProyecto = async (userId, proyectoId) => {
  try {
    const proyectoRef = doc(db, 'usuarios', userId, 'proyectos', proyectoId);
    await deleteDoc(proyectoRef);
  } catch (error) {
    console.error("Error eliminando proyecto:", error);
    throw error;
  }
};

// Datos de Proyectos (Cuentas, Transacciones)

// Obtener cuentas de proyecto
export const obtenerCuentasDelProyecto = async (userId, proyectoId) => {
  try {
    const cuentasRef = collection(db, 'usuarios', userId, 'proyectos', proyectoId, 'cuentas');
    const q = query(cuentasRef, orderBy('codigo'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error obteniendo cuentas:", error);
    if (error.code === 'failed-precondition' || error.code === 'not-found') return [];
    throw error;
  }
};

// Agregar cuenta a proyecto
export const agregarCuentaAProyecto = async (userId, proyectoId, cuentaData) => {
  try {
    const cuentasRef = collection(db, 'usuarios', userId, 'proyectos', proyectoId, 'cuentas');
    const cuentaCompleta = {
      ...cuentaData,
      fechaCreacion: new Date()
    };
    
    const docRef = await addDoc(cuentasRef, cuentaCompleta);
    return { id: docRef.id, ...cuentaCompleta };
  } catch (error) {
    console.error("Error agregando cuenta:", error);
    throw error;
  }
};

// Actualizar cuenta específica
export const actualizarCuentaDelProyecto = async (userId, proyectoId, cuentaId, cuentaData) => {
  try {
    const cuentaRef = doc(db, 'usuarios', userId, 'proyectos', proyectoId, 'cuentas', cuentaId);
    await updateDoc(cuentaRef, {
      ...cuentaData,
      ultimaModificacion: new Date()
    });
  } catch (error) {
    console.error("Error actualizando cuenta:", error);
    throw error;
  }
};

// Eliminar cuenta específica
export const eliminarCuentaDelProyecto = async (userId, proyectoId, cuentaId) => {
  try {
    const cuentaRef = doc(db, 'usuarios', userId, 'proyectos', proyectoId, 'cuentas', cuentaId);
    await deleteDoc(cuentaRef);
  } catch (error) {
    console.error("Error eliminando cuenta:", error);
    throw error;
  }
};

// Obtener transacciones de proyecto
export const obtenerTransaccionesDelProyecto = async (userId, proyectoId) => {
  try {
    const transaccionesRef = collection(db, 'usuarios', userId, 'proyectos', proyectoId, 'transacciones');
    const q = query(transaccionesRef, orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error obteniendo transacciones:", error);
    if (error.code === 'failed-precondition' || error.code === 'not-found') return [];
    throw error;
  }
};

// Agregar transacción a proyecto
export const agregarTransaccionAProyecto = async (userId, proyectoId, transaccionData) => {
  try {
    const transaccionesRef = collection(db, 'usuarios', userId, 'proyectos', proyectoId, 'transacciones');
    const transaccionCompleta = {
      ...transaccionData,
      fechaCreacion: new Date(),
      fecha: transaccionData.fecha || new Date()
    };
    
    const docRef = await addDoc(transaccionesRef, transaccionCompleta);
    return { id: docRef.id, ...transaccionCompleta };
  } catch (error) {
    console.error("Error agregando transacción:", error);
    throw error;
  }
};

// Actualizar transacción específica
export const actualizarTransaccionDelProyecto = async (userId, proyectoId, transaccionId, transaccionData) => {
  try {
    const transaccionRef = doc(db, 'usuarios', userId, 'proyectos', proyectoId, 'transacciones', transaccionId);
    await updateDoc(transaccionRef, {
      ...transaccionData,
      ultimaModificacion: new Date()
    });
  } catch (error) {
    console.error("Error actualizando transacción:", error);
    throw error;
  }
};

// Eliminar transacción específica
export const eliminarTransaccionDelProyecto = async (userId, proyectoId, transaccionId) => {
  try {
    const transaccionRef = doc(db, 'usuarios', userId, 'proyectos', proyectoId, 'transacciones', transaccionId);
    await deleteDoc(transaccionRef);
  } catch (error) {
    console.error("Error eliminando transacción:", error);
    throw error;
  }
};

// Libro de Ventas

// Obtener ventas de proyecto
export const obtenerVentasDelProyecto = async (userId, proyectoId) => {
  try {
    const ventasRef = collection(db, 'usuarios', userId, 'proyectos', proyectoId, 'ventas');
    const q = query(ventasRef, orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error obteniendo ventas:", error);
    if (error.code === 'failed-precondition' || error.code === 'not-found') return [];
    throw error;
  }
};

// Agregar venta a proyecto
export const agregarVentaAProyecto = async (userId, proyectoId, ventaData) => {
  try {
    const ventasRef = collection(db, 'usuarios', userId, 'proyectos', proyectoId, 'ventas');
    const ventaCompleta = {
      ...ventaData,
      fechaCreacion: new Date(),
      fecha: ventaData.fecha || new Date()
    };
    
    const docRef = await addDoc(ventasRef, ventaCompleta);
    return { id: docRef.id, ...ventaCompleta };
  } catch (error) {
    console.error("Error agregando venta:", error);
    throw error;
  }
};

// Libro de Compras

// Obtener compras de proyecto
export const obtenerComprasDelProyecto = async (userId, proyectoId) => {
  try {
    const comprasRef = collection(db, 'usuarios', userId, 'proyectos', proyectoId, 'compras');
    const q = query(comprasRef, orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error obteniendo compras:", error);
    if (error.code === 'failed-precondition' || error.code === 'not-found') return [];
    throw error;
  }
};

// Agregar compra a proyecto
export const agregarCompraAProyecto = async (userId, proyectoId, compraData) => {
  try {
    const comprasRef = collection(db, 'usuarios', userId, 'proyectos', proyectoId, 'compras');
    const compraCompleta = {
      ...compraData,
      fechaCreacion: new Date(),
      fecha: compraData.fecha || new Date()
    };
    
    const docRef = await addDoc(comprasRef, compraCompleta);
    return { id: docRef.id, ...compraCompleta };
  } catch (error) {
    console.error("Error agregando compra:", error);
    throw error;
  }
};

// Funciones Utilitarias

// Verificar si usuario tiene proyectos
export const usuarioTieneProyectos = async (userId) => {
  try {
    const proyectos = await obtenerProyectos(userId);
    return proyectos.length > 0;
  } catch (error) {
    console.error("Error verificando proyectos:", error);
    return false;
  }
};

// Obtener estadísticas de proyecto
export const obtenerEstadisticasProyecto = async (userId, proyectoId) => {
  try {
    const [cuentas, transacciones, ventas, compras] = await Promise.all([
      obtenerCuentasDelProyecto(userId, proyectoId),
      obtenerTransaccionesDelProyecto(userId, proyectoId),
      obtenerVentasDelProyecto(userId, proyectoId),
      obtenerComprasDelProyecto(userId, proyectoId)
    ]);

    return {
      totalCuentas: cuentas.length,
      totalTransacciones: transacciones.length,
      totalVentas: ventas.length,
      totalCompras: compras.length,
      ultimaTransaccion: transacciones[0]?.fecha || null,
      fechaCreacionProyecto: (await obtenerProyecto(userId, proyectoId))?.fechaCreacion
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    throw error;
  }
};

export default app;