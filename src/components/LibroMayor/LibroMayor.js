import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import './LibroMayor.css';

const LibroMayor = () => {
  const [cuentas, setCuentas] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState('');
  const [movimientosFiltrados, setMovimientosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [saldoActual, setSaldoActual] = useState(0);
  const [totalDebe, setTotalDebe] = useState(0);
  const [totalHaber, setTotalHaber] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (cuentaSeleccionada) {
      filtrarMovimientosPorCuenta();
    }
  }, [cuentaSeleccionada, transacciones]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      const cuentasSnapshot = await getDocs(collection(db, 'cuentas'));
      const cuentasData = cuentasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCuentas(cuentasData);

      const transaccionesSnapshot = await getDocs(collection(db, 'transacciones'));
      const transaccionesData = transaccionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransacciones(transaccionesData);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const filtrarMovimientosPorCuenta = () => {
    if (!cuentaSeleccionada) return;

    const cuenta = cuentas.find(c => c.id === cuentaSeleccionada);
    if (!cuenta) return;

    const movimientos = transacciones.map(transaccion => {
      let debe = 0;
      let haber = 0;
      let descripcion = '';

      if (transaccion.tipo === 'venta') {
        if (cuenta.tipo === 'Ingreso') {
          haber = transaccion.total;
          descripcion = `Venta a ${transaccion.cliente}`;
        } else if (cuenta.nombre.includes('Caja') || cuenta.nombre.includes('Banco')) {
          debe = transaccion.total;
          descripcion = `Ingreso por venta ${transaccion.nFactura}`;
        }
      } else if (transaccion.tipo === 'compra') {
        if (cuenta.tipo === 'Gasto') {
          debe = transaccion.total;
          descripcion = `Compra a ${transaccion.proveedor}`;
        } else if (cuenta.nombre.includes('Caja') || cuenta.nombre.includes('Banco')) {
          haber = transaccion.total;
          descripcion = `Pago por compra ${transaccion.nFactura}`;
        }
      }

      return {
        id: transaccion.id,
        fecha: transaccion.fecha,
        descripcion,
        debe,
        haber,
        saldo: 0
      };
    }).filter(mov => mov.debe > 0 || mov.haber > 0);

    let saldoAcumulado = 0;
    const movimientosConSaldo = movimientos.map(mov => {
      if (cuenta.tipo === 'Activo' || cuenta.tipo === 'Gasto') {
        saldoAcumulado += mov.debe - mov.haber;
      } else {
        saldoAcumulado += mov.haber - mov.debe;
      }
      
      return {
        ...mov,
        saldo: saldoAcumulado
      };
    });

    const totalDebeCalc = movimientos.reduce((sum, mov) => sum + mov.debe, 0);
    const totalHaberCalc = movimientos.reduce((sum, mov) => sum + mov.haber, 0);

    setMovimientosFiltrados(movimientosConSaldo);
    setTotalDebe(totalDebeCalc);
    setTotalHaber(totalHaberCalc);
    setSaldoActual(saldoAcumulado);
  };

  const obtenerColorTipoCuenta = (tipo) => {
    const colores = {
      'Activo': 'var(--mayor-color-activo)',
      'Pasivo': 'var(--mayor-color-pasivo)',
      'Patrimonio': 'var(--mayor-color-patrimonio)',
      'Ingreso': 'var(--mayor-color-ingreso)',
      'Gasto': 'var(--mayor-color-gasto)'
    };
    return colores[tipo] || 'var(--mayor-color-texto)';
  };

  const obtenerClaseSaldo = (saldo, tipoCuenta) => {
    if (tipoCuenta === 'Activo' || tipoCuenta === 'Gasto') {
      return saldo >= 0 ? 'saldo-deudor' : 'saldo-acreedor';
    } else {
      return saldo >= 0 ? 'saldo-acreedor' : 'saldo-deudor';
    }
  };

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

  const cuentaActual = cuentas.find(c => c.id === cuentaSeleccionada);

  return (
    <div className="libro-mayor">
      <div className="contenedor-principal">
        <div className="cabecera-seccion">
          <div className="titulo-grupo">
            <h1 className="titulo-principal">Libro Mayor</h1>
            <p className="subtitulo">Movimientos detallados y saldos por cuenta contable</p>
          </div>
          <div className="resumen-cabecera">
            {cuentaSeleccionada && (
              <div className="indicador-saldo">
                <span className="etiqueta-saldo">Saldo Actual</span>
                <span className={`valor-saldo ${obtenerClaseSaldo(saldoActual, cuentaActual?.tipo)}`}>
                  {formatearMoneda(Math.abs(saldoActual))}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="layout-contenido">
          {/* Panel de Selección de Cuenta */}
          <div className="panel-seleccion">
            <div className="cabecera-panel">
              <h2 className="titulo-panel">
                <svg className="icono-panel" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
                Seleccionar Cuenta
              </h2>
            </div>
            
            <div className="contenido-seleccion">
              <div className="campo-seleccion">
                <label className="etiqueta-seleccion">Cuenta Contable</label>
                <select
                  className="select-seleccion"
                  value={cuentaSeleccionada}
                  onChange={(e) => setCuentaSeleccionada(e.target.value)}
                >
                  <option value="">Seleccione una cuenta contable</option>
                  {cuentas.map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {cuenta.codigo} - {cuenta.nombre} ({cuenta.tipo})
                    </option>
                  ))}
                </select>
              </div>

              {cuentaSeleccionada && (
                <div className="info-cuenta">
                  <div className="cabecera-info">
                    <h3 className="titulo-info">Información de la Cuenta</h3>
                  </div>
                  <div className="detalles-cuenta">
                    <div className="detalle-item">
                      <span className="detalle-etiqueta">Código:</span>
                      <span className="detalle-valor codigo-cuenta">{cuentaActual?.codigo}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-etiqueta">Nombre:</span>
                      <span className="detalle-valor">{cuentaActual?.nombre}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-etiqueta">Tipo:</span>
                      <span 
                        className="badge-tipo"
                        style={{ backgroundColor: obtenerColorTipoCuenta(cuentaActual?.tipo) }}
                      >
                        {cuentaActual?.tipo}
                      </span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-etiqueta">Naturaleza:</span>
                      <span className="detalle-valor">
                        {cuentaActual?.tipo === 'Activo' || cuentaActual?.tipo === 'Gasto' 
                          ? 'Deudora' 
                          : 'Acreedora'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel de Resumen y Movimientos */}
          <div className="panel-principal">
            {cuentaSeleccionada ? (
              <>
                {/* Resumen de Totales */}
                <div className="panel-resumen">
                  <div className="tarjeta-total">
                    <div className="icono-total total-debe">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div className="contenido-total">
                      <span className="valor-total">{formatearMoneda(totalDebe)}</span>
                      <span className="etiqueta-total">Total Débito</span>
                    </div>
                  </div>

                  <div className="tarjeta-total">
                    <div className="icono-total total-haber">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                    </div>
                    <div className="contenido-total">
                      <span className="valor-total">{formatearMoneda(totalHaber)}</span>
                      <span className="etiqueta-total">Total Crédito</span>
                    </div>
                  </div>

                  <div className="tarjeta-total tarjeta-saldo">
                    <div className={`icono-total ${obtenerClaseSaldo(saldoActual, cuentaActual?.tipo)}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </div>
                    <div className="contenido-total">
                      <span className={`valor-total ${obtenerClaseSaldo(saldoActual, cuentaActual?.tipo)}`}>
                        {formatearMoneda(Math.abs(saldoActual))}
                      </span>
                      <span className="etiqueta-total">
                        Saldo {obtenerClaseSaldo(saldoActual, cuentaActual?.tipo) === 'saldo-deudor' ? 'Deudor' : 'Acreedor'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lista de Movimientos */}
                <div className="panel-movimientos">
                  <div className="cabecera-panel">
                    <h2 className="titulo-panel">
                      <svg className="icono-panel" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Movimientos de Cuenta
                    </h2>
                    <div className="contador-movimientos">
                      <span className="badge-contador">{movimientosFiltrados.length}</span>
                    </div>
                  </div>
                  
                  <div className="contenedor-lista">
                    {movimientosFiltrados.length === 0 ? (
                      <div className="estado-vacio">
                        <div className="icono-vacio">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>
                        <h3 className="titulo-vacio">No hay movimientos registrados</h3>
                        <p className="descripcion-vacio">
                          Registre transacciones en los módulos de Ventas o Compras para generar movimientos
                        </p>
                      </div>
                    ) : (
                      <div className="lista-movimientos">
                        {movimientosFiltrados.map((movimiento) => (
                          <div key={movimiento.id} className="tarjeta-movimiento">
                            <div className="movimiento-cabecera">
                              <span className="movimiento-fecha">{formatearFecha(movimiento.fecha)}</span>
                              <span className="movimiento-descripcion">{movimiento.descripcion}</span>
                            </div>
                            
                            <div className="movimiento-detalles">
                              <div className="columna-monto">
                                {movimiento.debe > 0 && (
                                  <div className="monto-debe">
                                    <span className="etiqueta-monto">Débito</span>
                                    <span className="valor-monto">{formatearMoneda(movimiento.debe)}</span>
                                  </div>
                                )}
                                {movimiento.haber > 0 && (
                                  <div className="monto-haber">
                                    <span className="etiqueta-monto">Crédito</span>
                                    <span className="valor-monto">{formatearMoneda(movimiento.haber)}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="columna-saldo">
                                <span className="etiqueta-saldo">Saldo</span>
                                <span className={`valor-saldo ${obtenerClaseSaldo(movimiento.saldo, cuentaActual?.tipo)}`}>
                                  {formatearMoneda(Math.abs(movimiento.saldo))}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="estado-seleccion">
                <div className="icono-seleccion">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                </div>
                <h3 className="titulo-seleccion">Seleccione una cuenta contable</h3>
                <p className="descripcion-seleccion">
                  Elija una cuenta del catálogo para visualizar sus movimientos y saldo actual
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibroMayor;