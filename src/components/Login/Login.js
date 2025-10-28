import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [credenciales, setCredenciales] = useState({
    email: '',
    password: ''
  });
  const [cargando, setCargando] = useState(false);
  const [modo, setModo] = useState('login');
  const [mensaje, setMensaje] = useState('');

  const [usuarios] = useState([
    { email: 'admin@contaapp.com', password: '123456', rol: 'Administrador' },
    { email: 'contador@contaapp.com', password: '123456', rol: 'Contador' },
    { email: 'usuario@contaapp.com', password: '123456', rol: 'Usuario' }
  ]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!credenciales.email || !credenciales.password) {
      setMensaje('Por favor ingresa email y contraseña');
      return;
    }

    const usuarioValido = usuarios.find(
      user => user.email === credenciales.email && user.password === credenciales.password
    );

    if (usuarioValido) {
      setCargando(true);
      setMensaje('Iniciando sesión...');
      
      setTimeout(() => {
        onLogin(true, { email: credenciales.email, rol: usuarioValido.rol });
        setCargando(false);
      }, 1000);
    } else {
      setMensaje('Credenciales incorrectas. ¿Necesitas crear una cuenta?');
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    
    if (!credenciales.email || !credenciales.password) {
      setMensaje('Por favor ingresa email y contraseña');
      return;
    }

    if (credenciales.password.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const usuarioExistente = usuarios.find(user => user.email === credenciales.email);
    
    if (usuarioExistente) {
      setMensaje('Este email ya está registrado. Inicia sesión en su lugar.');
      return;
    }

    setCargando(true);
    setMensaje('Creando tu cuenta...');

    setTimeout(() => {
      const nuevoUsuario = {
        email: credenciales.email,
        password: credenciales.password,
        rol: 'Usuario'
      };
      
      setMensaje('¡Cuenta creada exitosamente! Iniciando sesión...');
      
      setTimeout(() => {
        onLogin(true, { email: credenciales.email, rol: 'Usuario' });
        setCargando(false);
      }, 1000);
    }, 1500);
  };

  const usarCredencialDemo = (demo) => {
    setCredenciales({
      email: demo.email,
      password: demo.password
    });
    setMensaje(`Usando credenciales de ${demo.rol}`);
  };

  const cambiarModo = () => {
    setModo(modo === 'login' ? 'registro' : 'login');
    setMensaje('');
    setCredenciales({ email: '', password: '' });
  };

  const obtenerTipoMensaje = () => {
    if (mensaje.includes('Iniciando sesión') || mensaje.includes('Creando tu cuenta') || mensaje.includes('¡Cuenta creada')) {
      return 'exito';
    } else if (mensaje.includes('incorrectas') || mensaje.includes('ya está registrado') || mensaje.includes('al menos 6 caracteres')) {
      return 'error';
    } else if (mensaje.includes('Por favor ingresa')) {
      return 'advertencia';
    }
    return 'info';
  };

  return (
    <div id="login-page">
      {/* Fondo estático */}
      <div className="login-fondo">
        <div className="forma-decorativa forma-1"></div>
        <div className="forma-decorativa forma-2"></div>
      </div>

      <div className="login-contenedor">
        <div className="login-tarjeta">
          {/* Header */}
          <div className="login-cabecera">
            <div className="logo-principal">
              <div className="logo-icono">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="logo-texto">
                <h1 className="logo-titulo">ContaApp</h1>
                <span className="logo-badge">Grupo 02</span>
              </div>
            </div>
            
            <div className="login-titulos">
              <h2 className="titulo-principal">
                {modo === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
              </h2>
              <p className="subtitulo">
                {modo === 'login' 
                  ? 'Ingrese a su sistema contable' 
                  : 'Comience a gestionar sus finanzas'
                }
              </p>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={modo === 'login' ? handleLogin : handleRegistro} className="login-formulario">
            <div className="grupo-formulario">
              <label className="etiqueta-superior">Correo Electrónico</label>
              <div className="contenedor-input">
                <input
                  type="email"
                  className="input-formulario"
                  placeholder="correo@ejemplo.com"
                  value={credenciales.email}
                  onChange={(e) => setCredenciales({...credenciales, email: e.target.value})}
                  required
                />
                <span className="icono-input">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 6L12 13L2 6" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="grupo-formulario">
              <label className="etiqueta-superior">
                {modo === 'login' ? 'Contraseña' : 'Contraseña'}
              </label>
              <div className="contenedor-input">
                <input
                  type="password"
                  className="input-formulario"
                  placeholder={modo === 'login' ? "Ingresa tu contraseña" : "Crea una contraseña segura"}
                  value={credenciales.password}
                  onChange={(e) => setCredenciales({...credenciales, password: e.target.value})}
                  required
                />
                <span className="icono-input">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12C2 12 5 6 12 6C19 6 22 12 22 12C22 12 19 18 12 18C5 18 2 12 2 12Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
              {modo === 'registro' && (
                <div className="texto-ayuda">
                  🔒 Mínimo 6 caracteres para mayor seguridad
                </div>
              )}
            </div>

            {/* Mensaje de estado */}
            {mensaje && (
              <div className={`notificacion ${obtenerTipoMensaje()}`}>
                <div className="notificacion-contenido">
                  <div className="notificacion-icono"></div>
                  <span className="notificacion-texto">{mensaje}</span>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <button 
              type="submit" 
              className={`btn-principal ${cargando ? 'cargando' : ''}`}
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <div className="spinner-btn"></div>
                  <span>
                    {modo === 'login' ? 'Iniciando Sesión...' : 'Creando Cuenta...'}
                  </span>
                </>
              ) : (
                <>
                  <span className="btn-icono">
                    {modo === 'login' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5v14m-7-7h14" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span>
                    {modo === 'login' ? 'Ingresar al Sistema' : 'Crear Mi Cuenta'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Cambio entre modos */}
          <div className="cambio-modo">
            <p className="texto-cambio">
              {modo === 'login' ? '¿Primera vez aquí?' : '¿Ya tienes una cuenta?'}
            </p>
            <button 
              className="btn-secundario"
              onClick={cambiarModo}
              disabled={cargando}
            >
              {modo === 'login' ? 'Crear una cuenta' : 'Iniciar sesión'}
            </button>
          </div>

          {/* Separador */}
          {modo === 'login' && <div className="separador"><span>o prueba con</span></div>}

          {/* Cuentas de demostración */}
          {modo === 'login' && (
            <div className="demo-contenedor">
              <h3 className="demo-titulo">Acceso Rápido</h3>
              <p className="demo-descripcion">
                Prueba el sistema con estas cuentas preconfiguradas
              </p>
              <div className="demo-grid">
                <button
                  type="button"
                  className="tarjeta-demo"
                  onClick={() => usarCredencialDemo(usuarios[0])}
                  disabled={cargando}
                >
                  <div className="demo-icono">👑</div>
                  <div className="demo-contenido">
                    <strong className="demo-rol">Administrador</strong>
                    <span className="demo-email">admin@contaapp.com</span>
                  </div>
                  <div className="demo-badge">Probar</div>
                </button>
                
                <button
                  type="button"
                  className="tarjeta-demo"
                  onClick={() => usarCredencialDemo(usuarios[1])}
                  disabled={cargando}
                >
                  <div className="demo-icono">📊</div>
                  <div className="demo-contenido">
                    <strong className="demo-rol">Contador</strong>
                    <span className="demo-email">contador@contaapp.com</span>
                  </div>
                  <div className="demo-badge">Probar</div>
                </button>
                
                <button
                  type="button"
                  className="tarjeta-demo"
                  onClick={() => usarCredencialDemo(usuarios[2])}
                  disabled={cargando}
                >
                  <div className="demo-icono">👤</div>
                  <div className="demo-contenido">
                    <strong className="demo-rol">Usuario</strong>
                    <span className="demo-email">usuario@contaapp.com</span>
                  </div>
                  <div className="demo-badge">Probar</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="login-footer">
          <div className="footer-contenido">
            <span className="footer-texto">
              Sistema Contable Integral • Grupo 02 © 2025
            </span>
            <span className="footer-subtexto">
              Proyecto Académico - Todos los derechos reservados
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Login;