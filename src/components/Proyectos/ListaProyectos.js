import React, { useState, useEffect } from 'react';
import { obtenerProyectos, eliminarProyecto } from '../../services/firebase';
import styles from './ListaProyectos.module.css';

const ListaProyectos = ({ usuario, onSeleccionarProyecto, onCerrar }) => {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargando, setRecargando] = useState(false);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    if (usuario && usuario.uid) {
      cargarProyectosReales();
    } else {
      setError('Usuario no disponible');
      setCargando(false);
    }
  }, [usuario]);

  const cargarProyectosReales = async () => {
    try {
      setCargando(true);
      setRecargando(true);
      setError(null);
      
      const proyectosReales = await obtenerProyectos(usuario.uid);
      setProyectos(proyectosReales);
    } catch (error) {
      console.error('Error cargando proyectos:', error);
      setError(error.message || 'Error al cargar los proyectos');
      setProyectos([]);
    } finally {
      setCargando(false);
      setRecargando(false);
    }
  };

  const handleSeleccionarProyecto = (proyecto) => {
    onSeleccionarProyecto(proyecto);
  };

  const handleCrearNuevo = () => {
    onSeleccionarProyecto('nuevo');
  };

  const handleEliminarProyecto = async (proyecto, e) => {
    e.stopPropagation();
    
    const confirmar = window.confirm(
      `¿Está seguro de que desea eliminar el proyecto "${proyecto.nombre}"?\n\nEsta acción eliminará todos los datos del proyecto y no se puede deshacer.`
    );
    
    if (!confirmar) return;
    
    try {
      setEliminando(proyecto.id);
      
      await eliminarProyecto(usuario.uid, proyecto.id);
      
      // Actualizar la lista localmente
      setProyectos(proyectos.filter(p => p.id !== proyecto.id));
      
      // Mostrar mensaje de éxito
      alert(`Proyecto "${proyecto.nombre}" eliminado correctamente`);
      
    } catch (error) {
      console.error('Error eliminando proyecto:', error);
      alert('Error al eliminar el proyecto. Intente nuevamente.');
    } finally {
      setEliminando(null);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    
    try {
      if (fecha.toDate) {
        return new Date(fecha.toDate()).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      if (fecha instanceof Date) {
        return fecha.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  if (cargando) {
    return (
      <div className={styles.contenedorListaProyectos}>
        <div className={styles.cargandoProyectos}>
          <div className={styles.spinner}></div>
          <p>Cargando tus proyectos...</p>
        </div>
      </div>
    );
  }

  if (error && proyectos.length === 0) {
    return (
      <div className={styles.contenedorListaProyectos}>
        <div className={styles.estadoError}>
          <div className={styles.iconoError}>⚠️</div>
          <h3>Error al cargar proyectos</h3>
          <p>{error}</p>
          <div className={styles.contenedorBotonesError}>
            <button 
              className={styles.btnReintentar}
              onClick={cargarProyectosReales}
            >
              Reintentar
            </button>
            <button 
              className={styles.btnCrearError}
              onClick={handleCrearNuevo}
            >
              Crear Primer Proyecto
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contenedorListaProyectos}>
      <div className={styles.cabeceraProyectos}>
        <h1>Mis Proyectos Contables</h1>
        <p className={styles.subtituloProyectos}>
          {proyectos.length > 0 
            ? `Tienes ${proyectos.length} proyecto${proyectos.length !== 1 ? 's' : ''} contables`
            : 'Comienza creando tu primer proyecto'
          }
        </p>
        {usuario && (
          <div className={styles.infoUsuario}>
            <span className={styles.emailUsuario}>{usuario.email}</span>
            <span className={styles.rolUsuario}>{usuario.rol || 'Usuario'}</span>
          </div>
        )}
      </div>

      <div className={styles.gridProyectos}>
        {proyectos.map(proyecto => (
          <div 
            key={proyecto.id} 
            className={styles.tarjetaProyecto}
          >
            <div 
              className={styles.contenidoPrincipal}
              onClick={() => handleSeleccionarProyecto(proyecto)}
            >
              <div className={styles.iconoProyecto}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3 className={styles.nombreProyecto}>{proyecto.nombre}</h3>
              <p className={styles.descripcionProyecto}>
                {proyecto.descripcion || 'Proyecto contable sin descripción'}
              </p>
              <div className={styles.infoProyecto}>
                <span className={styles.fechaProyecto}>
                  Creado: {formatearFecha(proyecto.fechaCreacion)}
                </span>
              </div>
              <div className={styles.badgesProyecto}>
                <div className={`${styles.badge} ${styles.badgeTipo}`}>
                  {proyecto.tipo || 'Empresa'}
                </div>
                <div className={`${styles.badge} ${styles.badgeEstado}`}>
                  {proyecto.estado || 'Activo'}
                </div>
              </div>
            </div>
            
            <div className={styles.accionesProyecto}>
              <button 
                className={styles.btnAbrir}
                onClick={() => handleSeleccionarProyecto(proyecto)}
              >
                Abrir
              </button>
              <button 
                className={styles.btnEliminar}
                onClick={(e) => handleEliminarProyecto(proyecto, e)}
                disabled={eliminando === proyecto.id}
              >
                {eliminando === proyecto.id ? (
                  <>
                    <div className={styles.spinnerEliminar}></div>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        ))}
        
        <div 
          className={styles.tarjetaNuevoProyecto}
          onClick={handleCrearNuevo}
        >
          <div className={styles.iconoNuevo}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          <h3>Crear Nuevo Proyecto</h3>
          <p>Inicia un proyecto contable desde cero</p>
          <div className={styles.badgeNuevo}>Nuevo</div>
        </div>
      </div>

      {proyectos.length === 0 && !error && (
        <div className={styles.estadoVacio}>
          <div className={styles.iconoVacio}>📁</div>
          <h3>No tienes proyectos aún</h3>
          <p>Crea tu primer proyecto para comenzar a gestionar tu contabilidad</p>
          <button 
            className={styles.btnCrearVacio}
            onClick={handleCrearNuevo}
          >
            + Crear Mi Primer Proyecto
          </button>
        </div>
      )}

      {proyectos.length > 0 && (
        <div className={styles.estadisticas}>
          <div className={styles.estadistica}>
            <span className={styles.numeroEstadistica}>{proyectos.length}</span>
            <span className={styles.textoEstadistica}>
              proyecto{proyectos.length !== 1 ? 's' : ''} total
            </span>
          </div>
          <div className={styles.estadistica}>
            <span className={styles.numeroEstadistica}>
              {proyectos.filter(p => p.estado === 'activo').length}
            </span>
            <span className={styles.textoEstadistica}>activos</span>
          </div>
          <div className={styles.estadistica}>
            <span className={styles.numeroEstadistica}>
              {new Date().getFullYear()}
            </span>
            <span className={styles.textoEstadistica}>año actual</span>
          </div>
        </div>
      )}

      <div className={styles.pieProyectos}>
        <button 
          className={styles.btnVolver}
          onClick={onCerrar}
        >
          ← Volver al Dashboard
        </button>
        <div className={styles.accionesPie}>
          <button 
            className={styles.btnRecargar}
            onClick={cargarProyectosReales}
            disabled={recargando}
          >
            {recargando ? '↻' : '↻'} Actualizar
          </button>
          <span className={styles.contadorProyectos}>
            {proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListaProyectos;