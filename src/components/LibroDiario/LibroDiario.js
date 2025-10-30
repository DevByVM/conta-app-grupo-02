import React, { useState, useEffect } from 'react';
import { 
  obtenerTransaccionesDelProyecto 
} from '../../services/firebase';
import './LibroDiario.css';

const LibroDiario = ({ proyecto, usuario }) => {
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    if (proyecto && usuario) {
      cargarTransacciones();
    } else {
      setCargando(false);
    }
  }, [proyecto, usuario]);

  const cargarTransacciones = async () => {
    try {
      setCargando(true);
      console.log('Cargando transacciones para proyecto:', {
        usuario: usuario?.uid,
        proyecto: proyecto?.id,
        proyectoNombre: proyecto?.nombre
      });
      
      const transaccionesData = await obtenerTransaccionesDelProyecto(usuario.uid, proyecto.id);
      console.log('Transacciones cargadas:', transaccionesData);
      setTransacciones(transaccionesData);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const transaccionesFiltradas = transacciones.filter(transaccion => {
    const cumpleTipo = filtroTipo === 'todos' || transaccion.tipo === filtroTipo;
    
    let cumpleFecha = true;
    if (fechaInicio) {
      cumpleFecha = cumpleFecha && transaccion.fecha >= fechaInicio;
    }
    if (fechaFin) {
      cumpleFecha = cumpleFecha && transaccion.fecha <= fechaFin;
    }
    
    return cumpleTipo && cumpleFecha;
  });

  const totalVentas = transacciones
    .filter(t => t.tipo === 'venta')
    .reduce((sum, t) => sum + t.total, 0);

  const totalCompras = transacciones
    .filter(t => t.tipo === 'compra')
    .reduce((sum, t) => sum + t.total, 0);

  const totalTransacciones = transaccionesFiltradas.length;

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(valor || 0);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-SV', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const obtenerIconoTipo = (tipo) => {
    if (tipo === 'venta') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      );
    } else {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      );
    }
  };

  const obtenerColorTipo = (tipo) => {
    return tipo === 'venta' ? 'var(--diario-color-venta)' : 'var(--diario-color-compra)';
  };

  const obtenerTextoContraparte = (transaccion) => {
    return transaccion.tipo === 'venta' ? transaccion.cliente : transaccion.proveedor;
  };

  const limpiarFiltros = () => {
    setFiltroTipo('todos');
    setFechaInicio('');
    setFechaFin('');
  };

  // Mostrar mensaje si no hay proyecto seleccionado
  if (!proyecto || !usuario) {
    return (
      <div className="libro-diario">
        <div className="estado-vacio">
          <div className="icono-vacio">📒</div>
          <h3 className="titulo-vacio">Selecciona un proyecto</h3>
          <p className="descripcion-vacio">
            Para ver el libro diario, primero selecciona un proyecto
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="libro-diario">
      <div className="contenedor-principal">
        <div className="cabecera-seccion">
          <div className="titulo-grupo">
            <h1 className="titulo-principal">Libro Diario</h1>
            <p className="subtitulo">
              Proyecto: <strong>{proyecto.nombre}</strong> - Registro cronológico integral de transacciones
            </p>
            <div className="proyecto-info">
              <span className="proyecto-badge">Proyecto: {proyecto.nombre}</span>
              <span className="usuario-badge">Usuario: {usuario.email}</span>
            </div>
          </div>
          <div className="resumen-cabecera">
            <div className="indicador-total">
              <span className="etiqueta-indicador">Transacciones Filtradas</span>
              <span className="valor-indicador">{totalTransacciones}</span>
            </div>
          </div>
        </div>

        {/* Panel de Estadísticas y Filtros */}
        <div className="panel-controls">
          <div className="estadisticas-principales">
            <div className="tarjeta-estadistica">
              <div className="icono-estadistica estadistica-ventas">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="contenido-estadistica">
                <span className="valor-estadistica">{formatearMoneda(totalVentas)}</span>
                <span className="etiqueta-estadistica">Total Ventas</span>
              </div>
            </div>

            <div className="tarjeta-estadistica">
              <div className="icono-estadistica estadistica-compras">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div className="contenido-estadistica">
                <span className="valor-estadistica">{formatearMoneda(totalCompras)}</span>
                <span className="etiqueta-estadistica">Total Compras</span>
              </div>
            </div>

            <div className="tarjeta-estadistica">
              <div className="icono-estadistica estadistica-total">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div className="contenido-estadistica">
                <span className="valor-estadistica">{transacciones.length}</span>
                <span className="etiqueta-estadistica">Total Transacciones</span>
              </div>
            </div>
          </div>

          <div className="panel-filtros">
            <div className="cabecera-filtros">
              <h3 className="titulo-filtros">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
                Filtros de Búsqueda
              </h3>
            </div>
            
            <div className="contenido-filtros">
              <div className="campo-filtro">
                <label className="etiqueta-filtro">Tipo de Transacción</label>
                <select 
                  className="select-filtro"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="todos">Todas las transacciones</option>
                  <option value="venta">Solo Ventas</option>
                  <option value="compra">Solo Compras</option>
                </select>
              </div>

              <div className="grupo-fechas">
                <div className="campo-filtro">
                  <label className="etiqueta-filtro">Fecha Inicio</label>
                  <input
                    type="date"
                    className="input-filtro"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>

                <div className="campo-filtro">
                  <label className="etiqueta-filtro">Fecha Fin</label>
                  <input
                    type="date"
                    className="input-filtro"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
              </div>

              {(fechaInicio || fechaFin || filtroTipo !== 'todos') && (
                <button 
                  className="btn-secundario btn-limpiar"
                  onClick={limpiarFiltros}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Transacciones */}
        <div className="panel-transacciones">
          <div className="cabecera-panel">
            <h2 className="titulo-panel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Registro Cronológico del Proyecto
            </h2>
            <div className="contador-transacciones">
              <span className="badge-contador">{transaccionesFiltradas.length}</span>
            </div>
          </div>
          
          <div className="contenedor-lista">
            {cargando ? (
              <div className="estado-cargando">
                <div className="spinner-elegante"></div>
                <p className="texto-cargando">Cargando transacciones del proyecto...</p>
              </div>
            ) : (
              <>
                {transaccionesFiltradas.length === 0 ? (
                  <div className="estado-vacio">
                    <div className="icono-vacio">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <h3 className="titulo-vacio">
                      {transacciones.length === 0 
                        ? 'No hay transacciones en este proyecto' 
                        : 'No hay transacciones que coincidan con los filtros'
                      }
                    </h3>
                    <p className="descripcion-vacio">
                      {transacciones.length === 0 
                        ? 'Comience registrando transacciones en los módulos de Ventas o Compras' 
                        : 'Intente ajustar los criterios de filtrado'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="lista-transacciones">
                    {transaccionesFiltradas.map((transaccion) => (
                      <div key={transaccion.id} className="tarjeta-transaccion">
                        <div className="transaccion-cabecera">
                          <div className="transaccion-info">
                            <span className="transaccion-fecha">{formatearFecha(transaccion.fecha)}</span>
                            <span 
                              className="badge-tipo"
                              style={{ backgroundColor: obtenerColorTipo(transaccion.tipo) }}
                            >
                              {obtenerIconoTipo(transaccion.tipo)}
                              {transaccion.tipo === 'venta' ? 'Venta' : 'Compra'}
                            </span>
                          </div>
                          <div className="transaccion-total">
                            {formatearMoneda(transaccion.total)}
                          </div>
                        </div>
                        
                        <div className="transaccion-detalles">
                          <div className="detalle-principal">
                            <span className="detalle-titulo">
                              {transaccion.tipo === 'venta' ? 'Cliente:' : 'Proveedor:'}
                            </span>
                            <span className="detalle-valor">{obtenerTextoContraparte(transaccion)}</span>
                          </div>
                          
                          <div className="detalle-secundario">
                            <span className="factura-numero">{transaccion.nFactura}</span>
                            {transaccion.tipoGasto && (
                              <span className="tipo-gasto">{transaccion.tipoGasto}</span>
                            )}
                          </div>
                          
                          {transaccion.descripcion && (
                            <div className="detalle-descripcion">
                              {transaccion.descripcion}
                            </div>
                          )}
                        </div>
                        
                        <div className="transaccion-desglose">
                          <div className="item-desglose">
                            <span>Base:</span>
                            <span>{formatearMoneda(transaccion.monto)}</span>
                          </div>
                          <div className="item-desglose">
                            <span>IVA:</span>
                            <span className="texto-iva">{formatearMoneda(transaccion.iva)}</span>
                          </div>
                          <div className="item-desglose item-total">
                            <span>Total:</span>
                            <span 
                              className="texto-total"
                              style={{ color: obtenerColorTipo(transaccion.tipo) }}
                            >
                              {formatearMoneda(transaccion.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibroDiario;