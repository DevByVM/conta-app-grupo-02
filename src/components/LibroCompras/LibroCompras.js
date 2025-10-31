import React, { useState, useEffect, useCallback } from 'react';
import { 
  obtenerComprasDelProyecto, 
  agregarCompraAProyecto,
  actualizarCompraDelProyecto,
  eliminarCompraDelProyecto
} from '../../services/firebase';
import './LibroCompras.css';

const LibroCompras = ({ proyecto, usuario }) => {
  const [compras, setCompras] = useState([]);
  const [nuevaCompra, setNuevaCompra] = useState({
    fecha: new Date().toISOString().split('T')[0],
    proveedor: '',
    nFactura: '',
    descripcion: '',
    monto: '',
    iva: 0,
    total: 0,
    tipoGasto: 'Compra'
  });
  const [cargando, setCargando] = useState(false);
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });
  const [errores, setErrores] = useState({
    fecha: '',
    proveedor: '',
    nFactura: '',
    monto: '',
    descripcion: ''
  });
  const [editando, setEditando] = useState(false);
  const [compraEditando, setCompraEditando] = useState(null);

  const mostrarNotificacion = (mensaje, tipo = 'exito') => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ mostrar: false, mensaje: '', tipo: '' }), 4000);
  };

  // ========== VALIDACIONES ==========
  const validarFecha = (fecha) => {
    if (!fecha) {
      setErrores(prev => ({ ...prev, fecha: 'La fecha es requerida' }));
      return false;
    }

    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada > hoy) {
      setErrores(prev => ({ ...prev, fecha: 'La fecha no puede ser futura' }));
      return false;
    }
    
    const fechaMinima = new Date('2020-01-01');
    if (fechaSeleccionada < fechaMinima) {
      setErrores(prev => ({ ...prev, fecha: 'La fecha no puede ser anterior a 2020' }));
      return false;
    }
    
    setErrores(prev => ({ ...prev, fecha: '' }));
    return true;
  };

  const validarProveedor = (proveedor) => {
    proveedor = proveedor.trim();
    
    if (proveedor.length > 0 && proveedor.length < 2) {
      setErrores(prev => ({ ...prev, proveedor: 'El nombre debe tener al menos 2 caracteres' }));
      return false;
    }
    
    if (proveedor.length > 100) {
      setErrores(prev => ({ ...prev, proveedor: 'El nombre no puede exceder 100 caracteres' }));
      return false;
    }
    
    setErrores(prev => ({ ...prev, proveedor: '' }));
    return true;
  };

  const validarNumeroFactura = (nFactura) => {
    nFactura = nFactura.trim();
    
    if (nFactura.length === 0) {
      setErrores(prev => ({ ...prev, nFactura: '' }));
      return true; // Permitir vacío para que el required lo maneje
    }
    
    // Validar que solo contenga números y guiones
    const soloNumerosYGuiones = /^[\d-]+$/;
    if (!soloNumerosYGuiones.test(nFactura)) {
      setErrores(prev => ({ ...prev, nFactura: 'Solo se permiten números y guiones (-)' }));
      return false;
    }
    
    if (nFactura.length < 3) {
      setErrores(prev => ({ ...prev, nFactura: 'El número de factura debe tener al menos 3 caracteres' }));
      return false;
    }
    
    if (nFactura.length > 20) {
      setErrores(prev => ({ ...prev, nFactura: 'El número de factura no puede exceder 20 caracteres' }));
      return false;
    }
    
    // Validar unicidad (excepto si estamos editando la misma compra)
    const facturaExiste = compras.some(compra => 
      compra.nFactura === nFactura && compra.id !== compraEditando?.id
    );
    if (facturaExiste) {
      setErrores(prev => ({ ...prev, nFactura: 'Este número de factura ya existe en el proyecto' }));
      return false;
    }
    
    setErrores(prev => ({ ...prev, nFactura: '' }));
    return true;
  };

  const validarMonto = (monto) => {
    if (monto === '' || monto === null || monto === undefined) {
      setErrores(prev => ({ ...prev, monto: '' }));
      return true;
    }
    
    const montoNum = parseFloat(monto);
    
    if (isNaN(montoNum)) {
      setErrores(prev => ({ ...prev, monto: 'Debe ingresar un monto válido' }));
      return false;
    }
    
    if (montoNum <= 0) {
      setErrores(prev => ({ ...prev, monto: 'El monto debe ser mayor a 0' }));
      return false;
    }
    
    if (montoNum > 1000000) {
      setErrores(prev => ({ ...prev, monto: 'El monto no puede exceder $1,000,000' }));
      return false;
    }
    
    setErrores(prev => ({ ...prev, monto: '' }));
    return true;
  };

  const validarDescripcion = (descripcion) => {
    if (descripcion.length > 500) {
      setErrores(prev => ({ ...prev, descripcion: 'La descripción no puede exceder 500 caracteres' }));
      return false;
    }
    
    setErrores(prev => ({ ...prev, descripcion: '' }));
    return true;
  };

  // ========== MANEJADORES DE CAMBIO ==========
  const handleFechaChange = (e) => {
    const valor = e.target.value;
    setNuevaCompra({...nuevaCompra, fecha: valor});
    validarFecha(valor);
  };

  const handleProveedorChange = (e) => {
    const valor = e.target.value;
    setNuevaCompra({...nuevaCompra, proveedor: valor});
    validarProveedor(valor);
  };

  const handleNumeroFacturaChange = (e) => {
    let valor = e.target.value;
    
    // Solo permitir números y guiones
    valor = valor.replace(/[^\d-]/g, '');
    
    // Limitar longitud máxima
    if (valor.length > 20) {
      return;
    }
    
    setNuevaCompra({...nuevaCompra, nFactura: valor});
    validarNumeroFactura(valor);
  };

  const handleMontoChange = (e) => {
    const valor = e.target.value;
    
    if (valor && !/^\d*\.?\d*$/.test(valor)) {
      return;
    }
    
    validarMonto(valor);
    calcularTotales(valor);
  };

  const handleDescripcionChange = (e) => {
    const valor = e.target.value;
    setNuevaCompra({...nuevaCompra, descripcion: valor});
    validarDescripcion(valor);
  };

  const cargarCompras = useCallback(async () => {
    try {
      setCargando(true);
      console.log('Cargando compras para proyecto:', {
        usuario: usuario?.uid,
        proyecto: proyecto?.id,
        proyectoNombre: proyecto?.nombre
      });
      
      const comprasData = await obtenerComprasDelProyecto(usuario.uid, proyecto.id);
      console.log('Compras cargadas:', comprasData);
      setCompras(comprasData);
    } catch (error) {
      console.error('Error cargando compras:', error);
      mostrarNotificacion('Error al cargar el libro de compras', 'error');
    } finally {
      setCargando(false);
    }
  }, [usuario, proyecto]);

  useEffect(() => {
    if (proyecto && usuario) {
      cargarCompras();
    }
  }, [proyecto, usuario, cargarCompras]);

  const calcularTotales = (monto) => {
    const montoNum = parseFloat(monto) || 0;
    const iva = montoNum * 0.13;
    const total = montoNum + iva;
    
    setNuevaCompra(prev => ({
      ...prev,
      monto: monto,
      iva: iva,
      total: total
    }));
  };

  const limpiarFormulario = () => {
    setNuevaCompra({
      fecha: new Date().toISOString().split('T')[0],
      proveedor: '',
      nFactura: '',
      descripcion: '',
      monto: '',
      iva: 0,
      total: 0,
      tipoGasto: 'Compra'
    });
    setErrores({
      fecha: '',
      proveedor: '',
      nFactura: '',
      monto: '',
      descripcion: ''
    });
    setEditando(false);
    setCompraEditando(null);
  };

  const registrarCompra = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const fechaValida = validarFecha(nuevaCompra.fecha);
    const proveedorValido = validarProveedor(nuevaCompra.proveedor);
    const facturaValida = validarNumeroFactura(nuevaCompra.nFactura);
    const montoValido = validarMonto(nuevaCompra.monto);
    const descripcionValida = validarDescripcion(nuevaCompra.descripcion);
    
    if (!fechaValida || !proveedorValido || !facturaValida || !montoValido || !descripcionValida) {
      mostrarNotificacion('Por favor corrija los errores en el formulario', 'error');
      return;
    }
    
    if (nuevaCompra.proveedor && nuevaCompra.nFactura && nuevaCompra.monto) {
      try {
        if (editando && compraEditando) {
          // ACTUALIZAR COMPRA EXISTENTE
          await actualizarCompraDelProyecto(usuario.uid, proyecto.id, compraEditando.id, {
            fecha: nuevaCompra.fecha,
            proveedor: nuevaCompra.proveedor.trim(),
            nFactura: nuevaCompra.nFactura.trim(),
            descripcion: nuevaCompra.descripcion.trim(),
            monto: parseFloat(nuevaCompra.monto),
            iva: parseFloat(nuevaCompra.iva),
            total: parseFloat(nuevaCompra.total),
            tipoGasto: nuevaCompra.tipoGasto,
            tipo: 'compra'
          });
          
          mostrarNotificacion('Compra actualizada exitosamente');
        } else {
          // CREAR NUEVA COMPRA
          await agregarCompraAProyecto(usuario.uid, proyecto.id, {
            ...nuevaCompra,
            tipo: 'compra',
            proveedor: nuevaCompra.proveedor.trim(),
            nFactura: nuevaCompra.nFactura.trim(),
            descripcion: nuevaCompra.descripcion.trim(),
            monto: parseFloat(nuevaCompra.monto),
            iva: parseFloat(nuevaCompra.iva),
            total: parseFloat(nuevaCompra.total),
            timestamp: new Date()
          });
          
          mostrarNotificacion('Compra registrada exitosamente');
        }

        limpiarFormulario();
        await cargarCompras();
      } catch (error) {
        console.error('Error guardando compra:', error);
        mostrarNotificacion('Error al guardar la compra', 'error');
      }
    }
  };

  const iniciarEdicion = (compra) => {
    setEditando(true);
    setCompraEditando(compra);
    setNuevaCompra({
      fecha: compra.fecha,
      proveedor: compra.proveedor,
      nFactura: compra.nFactura,
      descripcion: compra.descripcion || '',
      monto: compra.monto.toString(),
      iva: compra.iva,
      total: compra.total,
      tipoGasto: compra.tipoGasto || 'Compra'
    });
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    limpiarFormulario();
    mostrarNotificacion('Edición cancelada', 'info');
  };

  const eliminarCompra = async (compra) => {
    if (window.confirm(`¿Está seguro de eliminar la compra de ${compra.proveedor} por ${formatearMoneda(compra.total)}?`)) {
      try {
        await eliminarCompraDelProyecto(usuario.uid, proyecto.id, compra.id);
        await cargarCompras();
        mostrarNotificacion('Compra eliminada exitosamente');
      } catch (error) {
        console.error('Error eliminando compra:', error);
        mostrarNotificacion('Error al eliminar la compra', 'error');
      }
    }
  };

  const totalGeneral = compras.reduce((sum, compra) => sum + compra.total, 0);
  const ivaGeneral = compras.reduce((sum, compra) => sum + compra.iva, 0);
  const baseGeneral = compras.reduce((sum, compra) => sum + compra.monto, 0);

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-SV');
  };

  const obtenerColorTipoGasto = (tipo) => {
    const colores = {
      'Compra': 'var(--compras-color-compra)',
      'Servicio': 'var(--compras-color-servicio)',
      'Gasto': 'var(--compras-color-gasto)',
      'Activo': 'var(--compras-color-activo)',
      'Otro': 'var(--compras-color-otro)'
    };
    return colores[tipo] || 'var(--compras-color-texto)';
  };

  // Mostrar mensaje si no hay proyecto seleccionado
  if (!proyecto || !usuario) {
    return (
      <div className="libro-compras">
        <div className="estado-vacio">
          <div className="icono-vacio">🛒</div>
          <h3 className="titulo-vacio">Selecciona un proyecto</h3>
          <p className="descripcion-vacio">
            Para gestionar el libro de compras, primero selecciona un proyecto
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="libro-compras">
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
            <h1 className="titulo-principal">Libro de Compras</h1>
            <p className="subtitulo">
              Proyecto: <strong>{proyecto.nombre}</strong> - Registro contable de compras y gastos con IVA 13%
            </p>
            <div className="proyecto-info">
              <span className="proyecto-badge">Proyecto: {proyecto.nombre}</span>
              <span className="usuario-badge">Usuario: {usuario.email}</span>
            </div>
          </div>
          <div className="resumen-cabecera">
            <div className="indicador-total">
              <span className="etiqueta-indicador">Total General</span>
              <span className="valor-indicador">{formatearMoneda(totalGeneral)}</span>
            </div>
          </div>
        </div>

        <div className="layout-contenido">
          {/* Panel de Nueva Compra */}
          <div className="panel-formulario">
            <div className="cabecera-panel">
              <h2 className="titulo-panel">
                <svg className="icono-panel" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                {editando ? 'Editar Compra' : 'Registrar Nueva Compra'}
              </h2>
              <span className="proyecto-indicador">en {proyecto.nombre}</span>
            </div>

            {editando && (
              <div className="alerta-edicion">
                <span>✏️ Editando compra de <strong>{compraEditando?.proveedor}</strong></span>
                <button type="button" onClick={cancelarEdicion} className="btn-cancelar-edicion">
                  Cancelar
                </button>
              </div>
            )}
            
            <form onSubmit={registrarCompra} className="formulario-compra">
              <div className="grupo-campos">
                <div className="campo-formulario">
                  <label className="etiqueta-formulario">Fecha de Compra</label>
                  <input
                    type="date"
                    className={`input-formulario ${errores.fecha ? 'input-error' : ''}`}
                    value={nuevaCompra.fecha}
                    onChange={handleFechaChange}
                    max={new Date().toISOString().split('T')[0]}
                    min="2020-01-01"
                    required
                  />
                  {errores.fecha && (
                    <span className="texto-error">{errores.fecha}</span>
                  )}
                </div>

                <div className="campo-formulario">
                  <label className="etiqueta-formulario">Número de Factura</label>
                  <input
                    type="text"
                    className={`input-formulario ${errores.nFactura ? 'input-error' : ''}`}
                    placeholder="001-001-0000001"
                    value={nuevaCompra.nFactura}
                    onChange={handleNumeroFacturaChange}
                    maxLength="20"
                    inputMode="numeric"
                    required
                  />
                  {errores.nFactura ? (
                    <span className="texto-error">{errores.nFactura}</span>
                  ) : (
                    <span className="texto-ayuda">Solo números y guiones. Ej: 001-001-0000001 (3-20 caracteres)</span>
                  )}
                </div>
              </div>

              <div className="campo-formulario">
                <label className="etiqueta-formulario">Proveedor</label>
                <input
                  type="text"
                  className={`input-formulario ${errores.proveedor ? 'input-error' : ''}`}
                  placeholder="Nombre del proveedor o establecimiento"
                  value={nuevaCompra.proveedor}
                  onChange={handleProveedorChange}
                  maxLength="100"
                  required
                />
                {errores.proveedor ? (
                  <span className="texto-error">{errores.proveedor}</span>
                ) : (
                  <span className="texto-ayuda">Nombre del proveedor (2-100 caracteres)</span>
                )}
              </div>

              <div className="campo-formulario">
                <label className="etiqueta-formulario">Tipo de Gasto</label>
                <select
                  className="select-formulario"
                  value={nuevaCompra.tipoGasto}
                  onChange={(e) => setNuevaCompra({...nuevaCompra, tipoGasto: e.target.value})}
                >
                  <option value="Compra">Compra de Mercadería</option>
                  <option value="Servicio">Servicio Profesional</option>
                  <option value="Gasto">Gasto Operativo</option>
                  <option value="Activo">Activo Fijo</option>
                  <option value="Otro">Otro Gasto</option>
                </select>
              </div>

              <div className="campo-formulario">
                <label className="etiqueta-formulario">Descripción</label>
                <textarea
                  className={`textarea-formulario ${errores.descripcion ? 'input-error' : ''}`}
                  placeholder="Descripción del producto o servicio adquirido..."
                  rows="2"
                  value={nuevaCompra.descripcion}
                  onChange={handleDescripcionChange}
                  maxLength="500"
                />
                {errores.descripcion ? (
                  <span className="texto-error">{errores.descripcion}</span>
                ) : (
                  <span className="texto-ayuda">{nuevaCompra.descripcion.length}/500 caracteres</span>
                )}
              </div>

              <div className="panel-totales">
                <div className="campo-formulario">
                  <label className="etiqueta-formulario">Monto Base</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={`input-formulario input-monto ${errores.monto ? 'input-error' : ''}`}
                    placeholder="0.00"
                    value={nuevaCompra.monto}
                    onChange={handleMontoChange}
                    required
                  />
                  {errores.monto ? (
                    <span className="texto-error">{errores.monto}</span>
                  ) : (
                    <span className="texto-ayuda">Monto sin IVA (máximo $1,000,000)</span>
                  )}
                </div>

                <div className="desglose-impuestos">
                  <div className="item-impuesto">
                    <span className="etiqueta-impuesto">IVA 13%</span>
                    <span className="valor-impuesto">{formatearMoneda(nuevaCompra.iva)}</span>
                  </div>
                  
                  <div className="separador-impuestos"></div>
                  
                  <div className="item-total">
                    <span className="etiqueta-total">Total a Pagar</span>
                    <span className="valor-total">{formatearMoneda(nuevaCompra.total)}</span>
                  </div>
                </div>
              </div>

              <div className="grupo-botones-formulario">
                <button 
                  type="submit" 
                  className={`btn-primario btn-registrar ${editando ? 'btn-actualizar' : ''}`}
                  disabled={!nuevaCompra.proveedor || !nuevaCompra.nFactura || !nuevaCompra.monto}
                >
                  <svg className="btn-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    {editando ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    )}
                  </svg>
                  <span className="btn-texto">{editando ? 'Actualizar Compra' : 'Registrar Compra'}</span>
                </button>
                
                {editando && (
                  <button 
                    type="button" 
                    onClick={cancelarEdicion}
                    className="btn-secundario"
                  >
                    <svg className="btn-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <span className="btn-texto">Cancelar</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Panel de Compras Registradas */}
          <div className="panel-lista">
            <div className="cabecera-panel">
              <h2 className="titulo-panel">
                <svg className="icono-panel" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Compras del Proyecto
              </h2>
              <div className="contador-compras">
                <span className="badge-contador">{compras.length}</span>
              </div>
            </div>
            
            <div className="contenedor-lista">
              {cargando ? (
                <div className="estado-cargando">
                  <div className="spinner-elegante"></div>
                  <p className="texto-cargando">Cargando registro de compras del proyecto...</p>
                </div>
              ) : (
                <>
                  {compras.length === 0 ? (
                    <div className="estado-vacio">
                      <div className="icono-vacio">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                      <h3 className="titulo-vacio">No hay compras en este proyecto</h3>
                      <p className="descripcion-vacio">Comience registrando la primera compra en este proyecto</p>
                    </div>
                  ) : (
                    <>
                      <div className="lista-compras">
                        {compras.map((compra) => (
                          <div key={compra.id} className={`tarjeta-compra ${editando && compraEditando?.id === compra.id ? 'compra-editando' : ''}`}>
                            <div className="compra-cabecera">
                              <div className="compra-info">
                                <span className="compra-fecha">{formatearFecha(compra.fecha)}</span>
                                <span className="compra-factura">{compra.nFactura}</span>
                              </div>
                              <div className="compra-total">
                                {formatearMoneda(compra.total)}
                              </div>
                            </div>
                            
                            <div className="compra-proveedor">{compra.proveedor}</div>
                            
                            <div className="compra-detalles">
                              <span 
                                className="badge-tipo-gasto"
                                style={{ backgroundColor: obtenerColorTipoGasto(compra.tipoGasto) }}
                              >
                                {compra.tipoGasto}
                              </span>
                            </div>
                            
                            {compra.descripcion && (
                              <div className="compra-descripcion">{compra.descripcion}</div>
                            )}
                            
                            <div className="compra-desglose">
                              <div className="item-desglose">
                                <span>Base:</span>
                                <span>{formatearMoneda(compra.monto)}</span>
                              </div>
                              <div className="item-desglose">
                                <span>IVA:</span>
                                <span className="texto-iva">{formatearMoneda(compra.iva)}</span>
                              </div>
                            </div>

                            {/* Botones de Acción */}
                            <div className="compra-acciones">
                              <button 
                                className="btn-accion btn-editar"
                                onClick={() => iniciarEdicion(compra)}
                                title="Editar compra"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                                Editar
                              </button>
                              <button 
                                className="btn-accion btn-eliminar"
                                onClick={() => eliminarCompra(compra)}
                                title="Eliminar compra"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Resumen General */}
                      <div className="resumen-general">
                        <div className="resumen-item">
                          <span className="resumen-etiqueta">Total Base</span>
                          <span className="resumen-valor">{formatearMoneda(baseGeneral)}</span>
                        </div>
                        <div className="resumen-item">
                          <span className="resumen-etiqueta">Crédito Fiscal</span>
                          <span className="resumen-valor texto-credito">{formatearMoneda(ivaGeneral)}</span>
                        </div>
                        <div className="resumen-item resumen-total">
                          <span className="resumen-etiqueta">Total General</span>
                          <span className="resumen-valor texto-total">{formatearMoneda(totalGeneral)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibroCompras;