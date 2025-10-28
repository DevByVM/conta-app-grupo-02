import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './CatalogoCuentas.css';

const CatalogoCuentas = () => {
  const [cuentas, setCuentas] = useState([]);
  const [nuevaCuenta, setNuevaCuenta] = useState({
    codigo: '',
    nombre: '',
    tipo: 'Activo'
  });
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });

  const mostrarNotificacion = (mensaje, tipo = 'exito') => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ mostrar: false, mensaje: '', tipo: '' }), 4000);
  };

  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    try {
      setCargando(true);
      const querySnapshot = await getDocs(collection(db, 'cuentas'));
      const cuentasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCuentas(cuentasData);
    } catch (error) {
      console.error('Error cargando cuentas:', error);
      mostrarNotificacion('Error al cargar el catálogo de cuentas', 'error');
    } finally {
      setCargando(false);
    }
  };

  const agregarCuenta = async (e) => {
    e.preventDefault();
    
    if (nuevaCuenta.codigo && nuevaCuenta.nombre) {
      try {
        await addDoc(collection(db, 'cuentas'), {
          codigo: nuevaCuenta.codigo,
          nombre: nuevaCuenta.nombre,
          tipo: nuevaCuenta.tipo,
          fechaCreacion: new Date()
        });
        
        setNuevaCuenta({
          codigo: '',
          nombre: '',
          tipo: 'Activo'
        });
        
        await cargarCuentas();
        mostrarNotificacion('Cuenta agregada exitosamente al catálogo');
      } catch (error) {
        console.error('Error agregando cuenta:', error);
        mostrarNotificacion('Error al registrar la cuenta', 'error');
      }
    }
  };

  const confirmarEliminacion = (cuenta) => {
    const modal = document.createElement('div');
    modal.className = 'modal-confirmacion';
    modal.innerHTML = `
      <div class="modal-contenido">
        <div class="modal-icono">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h3>Confirmar Eliminación</h3>
        <p>¿Está seguro de eliminar la cuenta <strong>${cuenta.codigo} - ${cuenta.nombre}</strong>?</p>
        <div class="modal-acciones">
          <button class="btn-cancelar">Cancelar</button>
          <button class="btn-confirmar">Eliminar</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const btnCancelar = modal.querySelector('.btn-cancelar');
    const btnConfirmar = modal.querySelector('.btn-confirmar');
    
    const cerrarModal = () => {
      document.body.removeChild(modal);
    };
    
    btnCancelar.onclick = cerrarModal;
    btnConfirmar.onclick = async () => {
      try {
        await deleteDoc(doc(db, 'cuentas', cuenta.id));
        await cargarCuentas();
        mostrarNotificacion('Cuenta eliminada exitosamente');
        cerrarModal();
      } catch (error) {
        console.error('Error eliminando cuenta:', error);
        mostrarNotificacion('Error al eliminar la cuenta', 'error');
        cerrarModal();
      }
    };
    
    modal.onclick = (e) => {
      if (e.target === modal) cerrarModal();
    };
  };

  const cuentasFiltradas = filtroTipo === 'todos' 
    ? cuentas 
    : cuentas.filter(cuenta => cuenta.tipo === filtroTipo);

  const estadisticas = {
    Activo: cuentas.filter(c => c.tipo === 'Activo').length,
    Pasivo: cuentas.filter(c => c.tipo === 'Pasivo').length,
    Patrimonio: cuentas.filter(c => c.tipo === 'Patrimonio').length,
    Ingreso: cuentas.filter(c => c.tipo === 'Ingreso').length,
    Gasto: cuentas.filter(c => c.tipo === 'Gasto').length
  };

  const obtenerColorTipo = (tipo) => {
    const colores = {
      Activo: 'var(--catalogo-color-activo)',
      Pasivo: 'var(--catalogo-color-pasivo)', 
      Patrimonio: 'var(--catalogo-color-patrimonio)',
      Ingreso: 'var(--catalogo-color-ingreso)',
      Gasto: 'var(--catalogo-color-gasto)'
    };
    return colores[tipo] || 'var(--catalogo-color-texto)';
  };

  if (cargando) {
    return (
      <div className="catalogo-cuentas">
        <div className="cargando-contenedor">
          <div className="spinner-elegante"></div>
          <p className="texto-cargando">Cargando catálogo de cuentas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="catalogo-cuentas">
      {/* Notificación */}
      {notificacion.mostrar && (
        <div className={`notificacion ${notificacion.tipo}`}>
          <div className="notificacion-contenido">
            <span className="notificacion-mensaje">{notificacion.mensaje}</span>
            <button 
              className="notificacion-cerrar"
              onClick={() => setNotificacion({ mostrar: false, mensaje: '', tipo: '' })}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="contenedor-principal">
        <div className="cabecera-seccion">
          <div className="titulo-grupo">
            <h1 className="titulo-principal">Catálogo de Cuentas Contables</h1>
            <p className="subtitulo">Sistema de gestión del plan de cuentas - El Salvador</p>
          </div>
          <div className="contador-total">
            <span className="badge-total">{cuentas.length} cuentas</span>
          </div>
        </div>

        {/* Panel de Estadísticas */}
        <div className="panel-estadisticas">
          {Object.entries(estadisticas).map(([tipo, cantidad]) => (
            <div key={tipo} className="tarjeta-estadistica">
              <div 
                className="icono-estadistica" 
                style={{ backgroundColor: obtenerColorTipo(tipo) }}
              >
                <span className="cantidad">{cantidad}</span>
              </div>
              <span className="tipo-cuenta">{tipo}</span>
            </div>
          ))}
        </div>

        <div className="layout-contenido">
          {/* Formulario Nueva Cuenta */}
          <div className="panel-formulario">
            <div className="cabecera-panel">
              <h2 className="titulo-panel">Registrar Nueva Cuenta</h2>
            </div>
            <form onSubmit={agregarCuenta} className="formulario-cuenta">
              <div className="grupo-formulario">
                <label className="etiqueta-formulario">Código de Cuenta</label>
                <input
                  type="text"
                  className="input-formulario"
                  placeholder="Ej: 1101, 2101, 5101"
                  value={nuevaCuenta.codigo}
                  onChange={(e) => setNuevaCuenta({...nuevaCuenta, codigo: e.target.value})}
                  required
                />
                <span className="texto-ayuda">Código numérico único para la cuenta</span>
              </div>

              <div className="grupo-formulario">
                <label className="etiqueta-formulario">Nombre de la Cuenta</label>
                <input
                  type="text"
                  className="input-formulario"
                  placeholder="Ej: Caja General, Bancos, Ventas"
                  value={nuevaCuenta.nombre}
                  onChange={(e) => setNuevaCuenta({...nuevaCuenta, nombre: e.target.value})}
                  required
                />
              </div>

              <div className="grupo-formulario">
                <label className="etiqueta-formulario">Tipo de Cuenta</label>
                <select
                  className="select-formulario"
                  value={nuevaCuenta.tipo}
                  onChange={(e) => setNuevaCuenta({...nuevaCuenta, tipo: e.target.value})}
                >
                  <option value="Activo">Activo</option>
                  <option value="Pasivo">Pasivo</option>
                  <option value="Patrimonio">Patrimonio</option>
                  <option value="Ingreso">Ingreso</option>
                  <option value="Gasto">Gasto</option>
                </select>
              </div>

              <button type="submit" className="btn-primario">
                <span className="btn-texto">Agregar Cuenta</span>
                <svg className="btn-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
            </form>
          </div>

          {/* Lista de Cuentas */}
          <div className="panel-lista">
            <div className="cabecera-panel">
              <h2 className="titulo-panel">Lista de Cuentas</h2>
              <div className="filtros">
                <select 
                  className="select-filtro"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="Activo">Activos</option>
                  <option value="Pasivo">Pasivos</option>
                  <option value="Patrimonio">Patrimonio</option>
                  <option value="Ingreso">Ingresos</option>
                  <option value="Gasto">Gastos</option>
                </select>
              </div>
            </div>
            
            <div className="contenedor-tabla">
              {cuentasFiltradas.length === 0 ? (
                <div className="estado-vacio">
                  <div className="icono-vacio">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <h3 className="titulo-vacio">No hay cuentas registradas</h3>
                  <p className="descripcion-vacio">Comience agregando su primera cuenta contable</p>
                </div>
              ) : (
                <div className="tabla-contenedor">
                  <table className="tabla-cuentas">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th className="texto-centrado">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuentasFiltradas.map((cuenta) => (
                        <tr key={cuenta.id} className="fila-cuenta">
                          <td>
                            <span className="codigo-cuenta">{cuenta.codigo}</span>
                          </td>
                          <td className="nombre-cuenta">{cuenta.nombre}</td>
                          <td>
                            <span 
                              className="badge-tipo"
                              style={{ 
                                backgroundColor: obtenerColorTipo(cuenta.tipo),
                                color: 'var(--color-fondo)'
                              }}
                            >
                              {cuenta.tipo}
                            </span>
                          </td>
                          <td className="acciones-celda">
                            <button
                              className="btn-eliminar"
                              onClick={() => confirmarEliminacion(cuenta)}
                              title="Eliminar cuenta"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                              <span>Eliminar</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogoCuentas;