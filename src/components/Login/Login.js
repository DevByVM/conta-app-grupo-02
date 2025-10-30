import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../../services/firebase';
import './Login.css';

const Login = ({ onLogin }) => {
  const [credenciales, setCredenciales] = useState({
    email: '',
    password: ''
  });
  const [cargando, setCargando] = useState(false);
  const [modo, setModo] = useState('login');
  const [mensaje, setMensaje] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!credenciales.email || !credenciales.password) {
      setMensaje('Por favor ingrese email y contraseña');
      return;
    }

    setCargando(true);
    setMensaje('Iniciando sesión...');

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credenciales.email, 
        credenciales.password
      );
      
      const user = userCredential.user;
      setMensaje('¡Sesión iniciada correctamente!');
      
      const rol = await determinarRolUsuario(user.uid);
      
      setTimeout(() => {
        onLogin(true, { 
          email: user.email, 
          rol: rol,
          uid: user.uid
        });
        setCargando(false);
      }, 1000);
      
    } catch (error) {
      setCargando(false);
      
      if (error.code === 'auth/user-not-found') {
        setMensaje('Usuario no encontrado. ¿Necesita crear una cuenta?');
      } else if (error.code === 'auth/wrong-password') {
        setMensaje('Contraseña incorrecta. Intente nuevamente.');
      } else if (error.code === 'auth/invalid-email') {
        setMensaje('El formato del email es inválido.');
      } else {
        setMensaje('Error al iniciar sesión. Intente nuevamente.');
      }
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    
    if (!credenciales.email || !credenciales.password) {
      setMensaje('Por favor ingrese email y contraseña');
      return;
    }

    if (credenciales.password.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);
    setMensaje('Creando su cuenta...');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credenciales.email,
        credenciales.password
      );
      
      const user = userCredential.user;
      setMensaje('¡Cuenta creada exitosamente! Iniciando sesión...');
      
      setTimeout(() => {
        onLogin(true, { 
          email: user.email, 
          rol: 'Usuario',
          uid: user.uid
        });
        setCargando(false);
      }, 1000);
      
    } catch (error) {
      setCargando(false);
      
      if (error.code === 'auth/email-already-in-use') {
        setMensaje('Este email ya está registrado. Inicie sesión en su lugar.');
      } else if (error.code === 'auth/weak-password') {
        setMensaje('La contraseña es demasiado débil.');
      } else if (error.code === 'auth/invalid-email') {
        setMensaje('El formato del email es inválido.');
      } else {
        setMensaje('Error al crear la cuenta. Intente nuevamente.');
      }
    }
  };

  const determinarRolUsuario = async (uid) => {
    const usuariosDemo = {
      'admin@contaapp.com': 'Administrador',
      'contador@contaapp.com': 'Contador', 
      'usuario@contaapp.com': 'Usuario'
    };
    
    return usuariosDemo[credenciales.email] || 'Usuario';
  };

  const usarCredencialDemo = async (demo) => {
    try {
      setCargando(true);
      setMensaje(`Iniciando sesión como ${demo.rol}...`);
      
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          demo.email,
          demo.password
        );
        
        const user = userCredential.user;
        setMensaje(`¡Bienvenido ${demo.rol}!`);
        
        setTimeout(() => {
          onLogin(true, { 
            email: user.email, 
            rol: demo.rol,
            uid: user.uid
          });
          setCargando(false);
        }, 1000);
        
      } catch (loginError) {
        if (loginError.code === 'auth/user-not-found') {
          setMensaje(`Creando cuenta ${demo.rol}...`);
          
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            demo.email,
            demo.password
          );
          
          const user = userCredential.user;
          setMensaje(`Cuenta ${demo.rol} creada. Iniciando sesión...`);
          
          setTimeout(() => {
            onLogin(true, { 
              email: user.email, 
              rol: demo.rol,
              uid: user.uid
            });
            setCargando(false);
          }, 1000);
          
        } else {
          throw loginError;
        }
      }
      
    } catch (error) {
      setCargando(false);
      console.error('Error con cuenta demo:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setMensaje('Esta cuenta demo ya existe. Intente iniciar sesión manualmente.');
      } else if (error.code === 'auth/network-request-failed') {
        setMensaje('Error de conexión. Verifique su internet.');
      } else {
        setMensaje('Error con la cuenta demo. Intente con otro usuario.');
      }
    }
  };

  const cambiarModo = () => {
    setModo(modo === 'login' ? 'registro' : 'login');
    setMensaje('');
    setCredenciales({ email: '', password: '' });
  };

  const obtenerTipoMensaje = () => {
    if (mensaje.includes('Iniciando sesión') || mensaje.includes('Creando su cuenta') || mensaje.includes('¡Cuenta creada') || mensaje.includes('correctamente') || mensaje.includes('Bienvenido')) {
      return 'exito';
    } else if (mensaje.includes('incorrecta') || mensaje.includes('ya está registrado') || mensaje.includes('al menos 6 caracteres') || mensaje.includes('Error')) {
      return 'error';
    } else if (mensaje.includes('Por favor ingrese')) {
      return 'advertencia';
    }
    return 'info';
  };

  const usuariosDemo = [
    { email: 'admin@contaapp.com', password: '123456', rol: 'Administrador' },
    { email: 'contador@contaapp.com', password: '123456', rol: 'Contador' },
    { email: 'usuario@contaapp.com', password: '123456', rol: 'Usuario' }
  ];

  return (
    <div id="login-page">
      <div className="login-fondo">
        <div className="forma-decorativa forma-1"></div>
        <div className="forma-decorativa forma-2"></div>
      </div>

      <div className="login-contenedor">
        <div className="login-tarjeta">
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
              <label className="etiqueta-superior">Contraseña</label>
              <div className="contenedor-input">
                <input
                  type="password"
                  className="input-formulario"
                  placeholder={modo === 'login' ? "Ingrese su contraseña" : "Cree una contraseña segura"}
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
                  Mínimo 6 caracteres para mayor seguridad
                </div>
              )}
            </div>

            {mensaje && (
              <div className={`notificacion ${obtenerTipoMensaje()}`}>
                <div className="notificacion-contenido">
                  <div className="notificacion-icono"></div>
                  <span className="notificacion-texto">{mensaje}</span>
                </div>
              </div>
            )}

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

          <div className="cambio-modo">
            <p className="texto-cambio">
              {modo === 'login' ? '¿Primera vez aquí?' : '¿Ya tiene una cuenta?'}
            </p>
            <button 
              className="btn-secundario"
              onClick={cambiarModo}
              disabled={cargando}
            >
              {modo === 'login' ? 'Crear una cuenta' : 'Iniciar sesión'}
            </button>
          </div>

          {modo === 'login' && <div className="separador"><span>o pruebe con</span></div>}

          {modo === 'login' && (
            <div className="demo-contenedor">
              <h3 className="demo-titulo">Acceso Rápido</h3>
              <p className="demo-descripcion">
                Pruebe el sistema con estas cuentas preconfiguradas
              </p>
              <div className="demo-grid">
                <button
                  type="button"
                  className="tarjeta-demo"
                  onClick={() => usarCredencialDemo(usuariosDemo[0])}
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
                  onClick={() => usarCredencialDemo(usuariosDemo[1])}
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
                  onClick={() => usarCredencialDemo(usuariosDemo[2])}
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