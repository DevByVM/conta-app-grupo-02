import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import './LibroVentas.css';

const LibroVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [nuevaVenta, setNuevaVenta] = useState({
    fecha: new Date().toISOString().split('T')[0],
    cliente: '',
    nFactura: '',
    descripcion: '',
    monto: '',
    iva: 0,
    total: 0
  });
  const [cargando, setCargando] = useState(false);
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });

  const mostrarNotificacion = (mensaje, tipo = 'exito') => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ mostrar: false, mensaje: '', tipo: '' }), 4000);
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      setCargando(true);
      const q = query(collection(db, 'transacciones'), where('tipo', '==', 'venta'));
      const querySnapshot = await getDocs(q);
      const ventasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVentas(ventasData);
    } catch (error) {
      console.error('Error cargando ventas:', error);
      mostrarNotificacion('Error al cargar el libro de ventas', 'error');
    } finally {
      setCargando(false);
    }
  };

  const calcularTotales = (monto) => {
    const montoNum = parseFloat(monto) || 0;
    const iva = montoNum * 0.13;
    const total = montoNum + iva;
    
    setNuevaVenta({
      ...nuevaVenta,
      monto: monto,
      iva: iva,
      total: total
    });
  };

  const registrarVenta = async (e) => {
    e.preventDefault();
    
    if (nuevaVenta.cliente && nuevaVenta.nFactura && nuevaVenta.monto) {
      try {
        await addDoc(collection(db, 'transacciones'), {
          ...nuevaVenta,
          tipo: 'venta',
          monto: parseFloat(nuevaVenta.monto),
          iva: parseFloat(nuevaVenta.iva),
          total: parseFloat(nuevaVenta.total),
          timestamp: new Date()
        });

        setNuevaVenta({
          fecha: new Date().toISOString().split('T')[0],
          cliente: '',
          nFactura: '',
          descripcion: '',
          monto: '',
          iva: 0,
          total: 0
        });

        await cargarVentas();
        mostrarNotificacion('Venta registrada exitosamente en el libro contable');
      } catch (error) {
        console.error('Error registrando venta:', error);
        mostrarNotificacion('Error al registrar la venta', 'error');
      }
    }
  };

  const totalGeneral = ventas.reduce((sum, venta) => sum + venta.total, 0);
  const ivaGeneral = ventas.reduce((sum, venta) => sum + venta.iva, 0);
  const baseGeneral = ventas.reduce((sum, venta) => sum + venta.monto, 0);

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-SV');
  };

  return (
    <div className="libro-ventas">
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
            <h1 className="titulo-principal">Libro de Ventas</h1>
            <p className="subtitulo">Registro contable de ventas con IVA 13% - El Salvador</p>
          </div>
          <div className="resumen-cabecera">
            <div className="indicador-total">
              <span className="etiqueta-indicador">Total General</span>
              <span className="valor-indicador">{formatearMoneda(totalGeneral)}</span>
            </div>
          </div>
        </div>

        <div className="layout-contenido">
          {/* Panel de Nueva Venta */}
          <div className="panel-formulario">
            <div className="cabecera-panel">
              <h2 className="titulo-panel">
                <svg className="icono-panel" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Registrar Nueva Venta
              </h2>
            </div>
            
            <form onSubmit={registrarVenta} className="formulario-venta">
              <div className="grupo-campos">
                <div className="campo-formulario">
                  <label className="etiqueta-formulario">Fecha de Venta</label>
                  <input
                    type="date"
                    className="input-formulario"
                    value={nuevaVenta.fecha}
                    onChange={(e) => setNuevaVenta({...nuevaVenta, fecha: e.target.value})}
                    required
                  />
                </div>

                <div className="campo-formulario">
                  <label className="etiqueta-formulario">Número de Factura</label>
                  <input
                    type="text"
                    className="input-formulario"
                    placeholder="001-001-0000001"
                    value={nuevaVenta.nFactura}
                    onChange={(e) => setNuevaVenta({...nuevaVenta, nFactura: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="campo-formulario">
                <label className="etiqueta-formulario">Cliente</label>
                <input
                  type="text"
                  className="input-formulario"
                  placeholder="Nombre o razón social del cliente"
                  value={nuevaVenta.cliente}
                  onChange={(e) => setNuevaVenta({...nuevaVenta, cliente: e.target.value})}
                  required
                />
              </div>

              <div className="campo-formulario">
                <label className="etiqueta-formulario">Descripción</label>
                <textarea
                  className="textarea-formulario"
                  placeholder="Productos o servicios vendidos..."
                  rows="2"
                  value={nuevaVenta.descripcion}
                  onChange={(e) => setNuevaVenta({...nuevaVenta, descripcion: e.target.value})}
                />
              </div>

              <div className="panel-totales">
                <div className="campo-formulario">
                  <label className="etiqueta-formulario">Monto Base</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-formulario input-monto"
                    placeholder="0.00"
                    value={nuevaVenta.monto}
                    onChange={(e) => calcularTotales(e.target.value)}
                    required
                  />
                </div>

                <div className="desglose-impuestos">
                  <div className="item-impuesto">
                    <span className="etiqueta-impuesto">IVA 13%</span>
                    <span className="valor-impuesto">{formatearMoneda(nuevaVenta.iva)}</span>
                  </div>
                  
                  <div className="separador-impuestos"></div>
                  
                  <div className="item-total">
                    <span className="etiqueta-total">Total a Facturar</span>
                    <span className="valor-total">{formatearMoneda(nuevaVenta.total)}</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primario btn-registrar"
                disabled={!nuevaVenta.cliente || !nuevaVenta.nFactura || !nuevaVenta.monto}
              >
                <svg className="btn-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span className="btn-texto">Registrar Venta</span>
              </button>
            </form>
          </div>

          {/* Panel de Ventas Registradas */}
          <div className="panel-lista">
            <div className="cabecera-panel">
              <h2 className="titulo-panel">
                <svg className="icono-panel" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Ventas Registradas
              </h2>
              <div className="contador-ventas">
                <span className="badge-contador">{ventas.length}</span>
              </div>
            </div>
            
            <div className="contenedor-lista">
              {cargando ? (
                <div className="estado-cargando">
                  <div className="spinner-elegante"></div>
                  <p className="texto-cargando">Cargando registro de ventas</p>
                </div>
              ) : (
                <>
                  {ventas.length === 0 ? (
                    <div className="estado-vacio">
                      <div className="icono-vacio">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                      <h3 className="titulo-vacio">No hay ventas registradas</h3>
                      <p className="descripcion-vacio">Comience registrando su primera transacción de venta</p>
                    </div>
                  ) : (
                    <>
                      <div className="lista-ventas">
                        {ventas.map((venta) => (
                          <div key={venta.id} className="tarjeta-venta">
                            <div className="venta-cabecera">
                              <div className="venta-info">
                                <span className="venta-fecha">{formatearFecha(venta.fecha)}</span>
                                <span className="venta-factura">{venta.nFactura}</span>
                              </div>
                              <div className="venta-total">
                                {formatearMoneda(venta.total)}
                              </div>
                            </div>
                            
                            <div className="venta-cliente">{venta.cliente}</div>
                            
                            {venta.descripcion && (
                              <div className="venta-descripcion">{venta.descripcion}</div>
                            )}
                            
                            <div className="venta-desglose">
                              <div className="item-desglose">
                                <span>Base:</span>
                                <span>{formatearMoneda(venta.monto)}</span>
                              </div>
                              <div className="item-desglose">
                                <span>IVA:</span>
                                <span className="texto-iva">{formatearMoneda(venta.iva)}</span>
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
                          <span className="resumen-etiqueta">Total IVA</span>
                          <span className="resumen-valor texto-iva">{formatearMoneda(ivaGeneral)}</span>
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

export default LibroVentas;