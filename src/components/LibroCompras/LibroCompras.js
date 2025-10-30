import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import './LibroCompras.css';

const LibroCompras = () => {
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

  const mostrarNotificacion = (mensaje, tipo = 'exito') => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ mostrar: false, mensaje: '', tipo: '' }), 4000);
  };

  useEffect(() => {
    cargarCompras();
  }, []);

  const cargarCompras = async () => {
    try {
      setCargando(true);
      const q = query(collection(db, 'transacciones'), where('tipo', '==', 'compra'));
      const querySnapshot = await getDocs(q);
      const comprasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompras(comprasData);
    } catch (error) {
      console.error('Error cargando compras:', error);
      mostrarNotificacion('Error al cargar el libro de compras', 'error');
    } finally {
      setCargando(false);
    }
  };

  const calcularTotales = (monto) => {
    const montoNum = parseFloat(monto) || 0;
    const iva = montoNum * 0.13;
    const total = montoNum + iva;
    
    setNuevaCompra({
      ...nuevaCompra,
      monto: monto,
      iva: iva,
      total: total
    });
  };

  const validarFormulario = () => {
    const errores = [];
    
    if (!/^\d{3}-\d{3}-\d{7}$/.test(nuevaCompra.nFactura)) {
      errores.push('Número de factura con formato inválido');
    }
    
    if (parseFloat(nuevaCompra.monto) <= 0) {
      errores.push('El monto debe ser mayor a 0');
    }
    
    if (nuevaCompra.proveedor.length < 3) {
      errores.push('El nombre del proveedor debe tener al menos 3 caracteres');
    }
    
    if (nuevaCompra.fecha > new Date().toISOString().split('T')[0]) {
      errores.push('No se permiten fechas futuras');
    }
    
    return errores;
  };

  const registrarCompra = async (e) => {
    e.preventDefault();
    
    const errores = validarFormulario();
    if (errores.length > 0) {
      mostrarNotificacion(errores.join(', '), 'error');
      return;
    }
    
    if (nuevaCompra.proveedor && nuevaCompra.nFactura && nuevaCompra.monto) {
      try {
        await addDoc(collection(db, 'transacciones'), {
          ...nuevaCompra,
          tipo: 'compra',
          monto: parseFloat(nuevaCompra.monto),
          iva: parseFloat(nuevaCompra.iva),
          total: parseFloat(nuevaCompra.total),
          timestamp: new Date()
        });

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

        await cargarCompras();
        mostrarNotificacion('Compra registrada exitosamente en el libro contable');
      } catch (error) {
        console.error('Error registrando compra:', error);
        mostrarNotificacion('Error al registrar la compra', 'error');
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
            <p className="subtitulo">Registro contable de compras y gastos con IVA 13% - El Salvador</p>
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
                Registrar Nueva Compra
              </h2>
            </div>
            
            <form onSubmit={registrarCompra} className="formulario-compra">
              <div className="grupo-campos">
                <div className="campo-formulario">
                  <label className="etiqueta-formulario">Fecha de Compra</label>
                  <input
                    type="date"
                    className="input-formulario"
                    value={nuevaCompra.fecha}
                    max={new Date().toISOString().split('T')[0]} // No permite fechas futuras
                    onChange={(e) => setNuevaCompra({...nuevaCompra, fecha: e.target.value})}
                    required
                  />
                  {nuevaCompra.fecha > new Date().toISOString().split('T')[0] && (
                    <span className="mensaje-error" style={{color: 'red', fontSize: '12px'}}>
                      No se permiten fechas futuras
                    </span>
                  )}
                </div>

                <div className="campo-formulario">
                  <label className="etiqueta-formulario">Número de Factura</label>
                  <input
                    type="text"
                    className="input-formulario"
                    placeholder="001-001-0000001"
                    value={nuevaCompra.nFactura}
                    onChange={(e) => {
                      const valor = e.target.value;
                      // Validar formato: XXX-XXX-XXXXXXX
                      if (/^[\d-]*$/.test(valor) && valor.length <= 15) {
                        setNuevaCompra({...nuevaCompra, nFactura: valor});
                      }
                    }}
                    pattern="^\d{3}-\d{3}-\d{7}$"
                    title="Formato: 001-001-0000001 (3 dígitos-3 dígitos-7 dígitos)"
                    required
                  />
                  {nuevaCompra.nFactura && !/^\d{3}-\d{3}-\d{7}$/.test(nuevaCompra.nFactura) && (
                    <span className="mensaje-error" style={{color: 'red', fontSize: '12px'}}>
                      Formato inválido. Use: 001-001-0000001
                    </span>
                  )}
                </div>
              </div>

              <div className="campo-formulario">
                <label className="etiqueta-formulario">Proveedor</label>
                <input
                  type="text"
                  className="input-formulario"
                  placeholder="Nombre del proveedor o establecimiento"
                  value={nuevaCompra.proveedor}
                  onChange={(e) => setNuevaCompra({...nuevaCompra, proveedor: e.target.value})}
                  minLength="3"
                  required
                />
                {nuevaCompra.proveedor && nuevaCompra.proveedor.length < 3 && (
                  <span className="mensaje-error" style={{color: 'red', fontSize: '12px'}}>
                    Mínimo 3 caracteres requeridos
                  </span>
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
                  className="textarea-formulario"
                  placeholder="Descripción del producto o servicio adquirido..."
                  rows="2"
                  value={nuevaCompra.descripcion}
                  onChange={(e) => setNuevaCompra({...nuevaCompra, descripcion: e.target.value})}
                />
              </div>

              <div className="panel-totales">
                <div className="campo-formulario">
                  <label className="etiqueta-formulario">Monto Base</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input-formulario input-monto"
                    placeholder="0.00"
                    value={nuevaCompra.monto}
                    onChange={(e) => {
                      const valor = e.target.value;
                      // Validar que sea positivo
                      if (parseFloat(valor) >= 0 || valor === '') {
                        calcularTotales(valor);
                      }
                    }}
                    required
                  />
                  {nuevaCompra.monto && parseFloat(nuevaCompra.monto) <= 0 && (
                    <span className="mensaje-error" style={{color: 'red', fontSize: '12px'}}>
                      El monto debe ser mayor a 0
                    </span>
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

              <button 
                type="submit" 
                className="btn-primario btn-registrar"
                disabled={
                  !nuevaCompra.proveedor || 
                  !nuevaCompra.nFactura || 
                  !nuevaCompra.monto ||
                  !/^\d{3}-\d{3}-\d{7}$/.test(nuevaCompra.nFactura) ||
                  parseFloat(nuevaCompra.monto) <= 0 ||
                  nuevaCompra.proveedor.length < 3 ||
                  nuevaCompra.fecha > new Date().toISOString().split('T')[0]
                }
              >
                <svg className="btn-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span className="btn-texto">Registrar Compra</span>
              </button>
            </form>
          </div>

          {/* Panel de Compras Registradas */}
          <div className="panel-lista">
            <div className="cabecera-panel">
              <h2 className="titulo-panel">
                <svg className="icono-panel" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Compras Registradas
              </h2>
              <div className="contador-compras">
                <span className="badge-contador">{compras.length}</span>
              </div>
            </div>
            
            <div className="contenedor-lista">
              {cargando ? (
                <div className="estado-cargando">
                  <div className="spinner-elegante"></div>
                  <p className="texto-cargando">Cargando registro de compras</p>
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
                      <h3 className="titulo-vacio">No hay compras registradas</h3>
                      <p className="descripcion-vacio">Comience registrando su primera transacción de compra</p>
                    </div>
                  ) : (
                    <>
                      <div className="lista-compras">
                        {compras.map((compra) => (
                          <div key={compra.id} className="tarjeta-compra">
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
