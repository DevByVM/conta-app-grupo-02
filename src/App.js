import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import CatalogoCuentas from './components/CatalogoCuentas/CatalogoCuentas';
import LibroVentas from './components/LibroVentas/LibroVentas';
import LibroCompras from './components/LibroCompras/LibroCompras';
import LibroDiario from './components/LibroDiario/LibroDiario';
import LibroMayor from './components/LibroMayor/LibroMayor';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [paginaActual, setPaginaActual] = useState('dashboard');
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('contaapp_usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  const handleLogin = (success, usuarioInfo) => {
    if (success && usuarioInfo) {
      setUsuario(usuarioInfo);
      localStorage.setItem('contaapp_usuario', JSON.stringify(usuarioInfo));
      setPaginaActual('dashboard');
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('contaapp_usuario');
    setPaginaActual('dashboard');
    setMenuAbierto(false);
  };

  const renderizarContenido = () => {
    switch(paginaActual) {
      case 'dashboard':
        return <Dashboard />;
      case 'catalogo':
        return <CatalogoCuentas />;
      case 'ventas':
        return <LibroVentas />;
      case 'compras':
        return <LibroCompras />;
      case 'diario':
        return <LibroDiario />;
      case 'mayor':
        return <LibroMayor />;
      default:
        return <Dashboard />;
    }
  };

  const obtenerIconoPagina = (pagina) => {
    const iconos = {
      'dashboard': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      ),
      'catalogo': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      ),
      'ventas': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      'compras': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      ),
      'diario': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
      ),
      'mayor': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      )
    };
    return iconos[pagina] || iconos.dashboard;
  };

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {/* Navegación Principal */}
      <nav className="navegacion-principal">
        <div className="contenedor-navegacion">
          <div className="marca-app">
            <button 
              className="btn-marca"
              onClick={() => setPaginaActual('dashboard')}
            >
              <div className="icono-marca">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <span className="texto-marca">ContaApp</span>
            </button>
          </div>

          {/* Menú para desktop */}
          <div className="menu-desktop">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'catalogo', label: 'Catálogo' },
              { key: 'ventas', label: 'Ventas' },
              { key: 'compras', label: 'Compras' },
              { key: 'diario', label: 'Diario' },
              { key: 'mayor', label: 'Mayor' }
            ].map((item) => (
              <button
                key={item.key}
                className={`btn-nav ${paginaActual === item.key ? 'btn-nav-activo' : ''}`}
                onClick={() => {
                  setPaginaActual(item.key);
                  setMenuAbierto(false);
                }}
              >
                {obtenerIconoPagina(item.key)}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Usuario y controles */}
          <div className="controles-usuario">
            <div className="dropdown-usuario">
              <button className="btn-usuario">
                <div className="avatar-usuario">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <span className="email-usuario">{usuario.email}</span>
                <svg className="icono-dropdown" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              <div className="menu-dropdown">
                <div className="info-usuario">
                  <div className="nombre-usuario">{usuario.email}</div>
                  <div className="rol-usuario">
                    {usuario.rol || 'Usuario Contable'}
                  </div>
                  <div className="estado-sesion">Sesión activa</div>
                </div>
                <div className="separador-menu"></div>
                <button 
                  className="btn-cerrar-sesion"
                  onClick={handleLogout}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Botón menú móvil */}
            <button 
              className="btn-menu-mobile"
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                {menuAbierto ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {menuAbierto && (
          <div className="menu-mobile">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'catalogo', label: 'Catálogo' },
              { key: 'ventas', label: 'Ventas' },
              { key: 'compras', label: 'Compras' },
              { key: 'diario', label: 'Diario' },
              { key: 'mayor', label: 'Mayor' }
            ].map((item) => (
              <button
                key={item.key}
                className={`btn-nav-mobile ${paginaActual === item.key ? 'btn-nav-mobile-activo' : ''}`}
                onClick={() => {
                  setPaginaActual(item.key);
                  setMenuAbierto(false);
                }}
              >
                {obtenerIconoPagina(item.key)}
                <span>{item.label}</span>
              </button>
            ))}
            
            <div className="separador-mobile"></div>
            
            <button 
              className="btn-cerrar-sesion-mobile"
              onClick={handleLogout}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Cerrar Sesión
            </button>
          </div>
        )}
      </nav>

      {/* Contenido Principal */}
      <main className="contenido-principal">
        {renderizarContenido()}
      </main>

      {/* Footer */}
      <footer className="footer-app">
        <div className="contenedor-footer">
          <div className="info-footer">
            <div className="marca-footer">
              <h3>ContaApp</h3>
              <p>Sistema Contable Integral</p>
            </div>
            <div className="descripcion-footer">
              Desarrollado para pequeñas y medianas empresas de El Salvador
            </div>
          </div>
          <div className="derechos-footer">
            <span>Grupo 02 © 2025 - Proyecto Académico - Todos los derechos reservados</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;