import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import './Dashboard.css';

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState({
    totalCuentas: 0,
    totalVentas: 0,
    totalCompras: 0,
    totalTransacciones: 0,
    ivaGenerado: 0,
    ivaPagado: 0,
    saldoGeneral: 0,
    cuentasActivas: 0,
    cuentasPasivas: 0
  });
  const [cargando, setCargando] = useState(true);
  const [ultimasTransacciones, setUltimasTransacciones] = useState([]);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);

      const cuentasSnapshot = await getDocs(collection(db, 'cuentas'));
      const cuentasData = cuentasSnapshot.docs.map(doc => doc.data());
      
      const transaccionesSnapshot = await getDocs(collection(db, 'transacciones'));
      const transaccionesData = transaccionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const ventas = transaccionesData.filter(t => t.tipo === 'venta');
      const compras = transaccionesData.filter(t => t.tipo === 'compra');
      
      const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
      const totalCompras = compras.reduce((sum, c) => sum + c.total, 0);
      const ivaGenerado = ventas.reduce((sum, v) => sum + v.iva, 0);
      const ivaPagado = compras.reduce((sum, c) => sum + c.iva, 0);

      const cuentasActivas = cuentasData.filter(c => c.tipo === 'Activo').length;
      const cuentasPasivas = cuentasData.filter(c => c.tipo === 'Pasivo').length;

      const ultimas = transaccionesData
        .sort((a, b) => new Date(b.timestamp?.toDate()) - new Date(a.timestamp?.toDate()))
        .slice(0, 5);

      setEstadisticas({
        totalCuentas: cuentasData.length,
        totalVentas,
        totalCompras,
        totalTransacciones: transaccionesData.length,
        ivaGenerado,
        ivaPagado,
        saldoGeneral: totalVentas - totalCompras,
        cuentasActivas,
        cuentasPasivas
      });

      setUltimasTransacciones(ultimas);

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setCargando(false);
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

  const obtenerIconoTipo = (tipo) => {
    if (tipo === 'venta') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      );
    } else {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      );
    }
  };

  const obtenerColorTipo = (tipo) => {
    return tipo === 'venta' ? 'var(--dashboard-color-venta)' : 'var(--dashboard-color-compra)';
  };

  if (cargando) {
    return (
      <div className="dashboard">
        <div className="estado-cargando">
          <div className="spinner-elegante"></div>
          <p className="texto-cargando">Cargando panel de control</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="contenedor-principal">
        <div className="cabecera-seccion">
          <div className="titulo-grupo">
            <h1 className="titulo-principal">Panel de Control</h1>
            <p className="subtitulo">Vista general integral del estado financiero empresarial</p>
          </div>
          <div className="estado-actualizacion">
            <span className="badge-actualizado">Actualizado en tiempo real</span>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid-metricas">
          <div className="tarjeta-metrica metrica-ventas">
            <div className="contenido-metrica">
              <div className="texto-metrica">
                <span className="valor-metrica">{formatearMoneda(estadisticas.totalVentas)}</span>
                <span className="etiqueta-metrica">Total Ventas</span>
                <span className="tendencia-metrica">
                  {estadisticas.totalVentas > 0 ? 'Tendencia positiva' : 'Comience a registrar ventas'}
                </span>
              </div>
              <div className="icono-metrica">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="tarjeta-metrica metrica-compras">
            <div className="contenido-metrica">
              <div className="texto-metrica">
                <span className="valor-metrica">{formatearMoneda(estadisticas.totalCompras)}</span>
                <span className="etiqueta-metrica">Total Compras</span>
                <span className="tendencia-metrica">
                  IVA Pagado: {formatearMoneda(estadisticas.ivaPagado)}
                </span>
              </div>
              <div className="icono-metrica">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="tarjeta-metrica metrica-cuentas">
            <div className="contenido-metrica">
              <div className="texto-metrica">
                <span className="valor-metrica">{estadisticas.totalCuentas}</span>
                <span className="etiqueta-metrica">Cuentas Activas</span>
                <span className="tendencia-metrica">
                  {estadisticas.cuentasActivas} Activas • {estadisticas.cuentasPasivas} Pasivas
                </span>
              </div>
              <div className="icono-metrica">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className={`tarjeta-metrica ${
            estadisticas.saldoGeneral >= 0 ? 'metrica-utilidad' : 'metrica-perdida'
          }`}>
            <div className="contenido-metrica">
              <div className="texto-metrica">
                <span className="valor-metrica">{formatearMoneda(Math.abs(estadisticas.saldoGeneral))}</span>
                <span className="etiqueta-metrica">Resultado Neto</span>
                <span className="tendencia-metrica">
                  {estadisticas.saldoGeneral >= 0 ? 'Utilidad operativa' : 'Pérdida operativa'}
                </span>
              </div>
              <div className="icono-metrica">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="layout-contenido">
          {/* Panel de Análisis Financiero */}
          <div className="panel-analisis">
            <div className="cabecera-panel">
              <h2 className="titulo-panel">
                <svg className="icono-panel" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                Análisis Financiero Detallado
              </h2>
            </div>
            
            <div className="contenido-analisis">
              <div className="grid-estadisticas">
                <div className="tarjeta-estadistica">
                  <div className="icono-estadistica estadistica-transacciones">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                  </div>
                  <div className="contenido-estadistica">
                    <span className="valor-estadistica">{estadisticas.totalTransacciones}</span>
                    <span className="etiqueta-estadistica">Total Transacciones</span>
                  </div>
                </div>

                <div className="tarjeta-estadistica">
                  <div className="icono-estadistica estadistica-iva-generado">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div className="contenido-estadistica">
                    <span className="valor-estadistica">{formatearMoneda(estadisticas.ivaGenerado)}</span>
                    <span className="etiqueta-estadistica">IVA Generado</span>
                  </div>
                </div>

                <div className="tarjeta-estadistica">
                  <div className="icono-estadistica estadistica-iva-pagado">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div className="contenido-estadistica">
                    <span className="valor-estadistica">{formatearMoneda(estadisticas.ivaPagado)}</span>
                    <span className="etiqueta-estadistica">IVA Pagado</span>
                  </div>
                </div>
              </div>

              {/* Gráfico Comparativo */}
              <div className="seccion-grafico">
                <h3 className="titulo-seccion">Comparativo Ventas vs Compras</h3>
                <div className="contenedor-grafico">
                  <div className="barra-comparativa">
                    <div className="etiqueta-barra">Ventas</div>
                    <div className="contenedor-barra">
                      <div 
                        className="barra-progreso barra-ventas"
                        style={{width: `${(estadisticas.totalVentas / (estadisticas.totalVentas + estadisticas.totalCompras)) * 100 || 0}%`}}
                      >
                        <span className="texto-barra">{formatearMoneda(estadisticas.totalVentas)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="barra-comparativa">
                    <div className="etiqueta-barra">Compras</div>
                    <div className="contenedor-barra">
                      <div 
                        className="barra-progreso barra-compras"
                        style={{width: `${(estadisticas.totalCompras / (estadisticas.totalVentas + estadisticas.totalCompras)) * 100 || 0}%`}}
                      >
                        <span className="texto-barra">{formatearMoneda(estadisticas.totalCompras)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado de Resultados */}
              <div className="seccion-estado-resultados">
                <h3 className="titulo-seccion">Estado de Resultados Consolidado</h3>
                <div className="tabla-resultados">
                  <div className="fila-resultado">
                    <span className="concepto-resultado">Ingresos por Ventas</span>
                    <span className="monto-resultado monto-ingreso">{formatearMoneda(estadisticas.totalVentas)}</span>
                  </div>
                  <div className="fila-resultado">
                    <span className="concepto-resultado">Costos y Gastos Operativos</span>
                    <span className="monto-resultado monto-gasto">{formatearMoneda(estadisticas.totalCompras)}</span>
                  </div>
                  <div className="fila-resultado fila-total">
                    <span className="concepto-resultado">Resultado Neto del Ejercicio</span>
                    <span className={`monto-resultado ${
                      estadisticas.saldoGeneral >= 0 ? 'monto-utilidad' : 'monto-perdida'
                    }`}>
                      {formatearMoneda(estadisticas.saldoGeneral)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Actividad Reciente */}
          <div className="panel-actividad">
            <div className="cabecera-panel">
              <h2 className="titulo-panel">
                <svg className="icono-panel" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Actividad Reciente
              </h2>
              <div className="contador-actividad">
                <span className="badge-contador">{ultimasTransacciones.length}</span>
              </div>
            </div>
            
            <div className="contenido-actividad">
              {ultimasTransacciones.length === 0 ? (
                <div className="estado-vacio">
                  <div className="icono-vacio">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <h3 className="titulo-vacio">No hay actividad reciente</h3>
                  <p className="descripcion-vacio">Las transacciones aparecerán aquí</p>
                </div>
              ) : (
                <div className="lista-actividad">
                  {ultimasTransacciones.map((transaccion) => (
                    <div key={transaccion.id} className="tarjeta-actividad">
                      <div 
                        className="icono-actividad"
                        style={{ backgroundColor: obtenerColorTipo(transaccion.tipo) }}
                      >
                        {obtenerIconoTipo(transaccion.tipo)}
                      </div>
                      <div className="contenido-actividad">
                        <div className="titulo-actividad">
                          {transaccion.tipo === 'venta' ? transaccion.cliente : transaccion.proveedor}
                        </div>
                        <div className="detalle-actividad">
                          <span className="fecha-actividad">{formatearFecha(transaccion.fecha)}</span>
                          <span className="monto-actividad">{formatearMoneda(transaccion.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="pie-actividad">
                <div className="info-sistema">
                  <span className="etiqueta-sistema">Sistema actualizado al</span>
                  <span className="fecha-sistema">{new Date().toLocaleDateString('es-SV')}</span>
                </div>
                <button 
                  className="btn-actualizar"
                  onClick={cargarEstadisticas}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Actualizar Datos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Información del Proyecto */}
        <div className="panel-proyecto">
          <div className="contenido-proyecto">
            <h3 className="titulo-proyecto">Proyecto de Sistema Contable - Grupo 02</h3>
            <div className="grid-proyecto">
              <div className="item-proyecto">
                <div className="valor-proyecto">6</div>
                <span className="etiqueta-proyecto">Módulos Implementados</span>
              </div>
              <div className="item-proyecto">
                <div className="valor-proyecto">100%</div>
                <span className="etiqueta-proyecto">Funcionalidades Completas</span>
              </div>
              <div className="item-proyecto">
                <div className="valor-proyecto">☁️</div>
                <span className="etiqueta-proyecto">Cloud Firebase</span>
              </div>
              <div className="item-proyecto">
                <div className="valor-proyecto">🇸🇻</div>
                <span className="etiqueta-proyecto">Normativa Local SV</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;