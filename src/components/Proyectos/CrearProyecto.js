import React, { useState } from 'react';
import { crearProyecto } from '../../services/firebase';
import styles from './CrearProyecto.module.css';

const CrearProyecto = ({ usuario, onProyectoCreado, onCancelar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'empresa'
  });
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setError('Por favor ingresa un nombre para el proyecto');
      return;
    }

    // Verificar que tenemos un usuario válido con UID
    if (!usuario || !usuario.uid) {
      setError('Error: Usuario no válido. Por favor, inicie sesión nuevamente.');
      return;
    }

    setCreando(true);
    setError('');
    
    try {
      console.log('Creando proyecto para usuario:', usuario.uid);
      const nuevoProyecto = await crearProyecto(usuario.uid, {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        tipo: formData.tipo
      });
      
      console.log('Proyecto creado exitosamente:', nuevoProyecto);
      onProyectoCreado(nuevoProyecto);
      
    } catch (error) {
      console.error('Error creando proyecto:', error);
      setError('Error al crear el proyecto. Intenta nuevamente.');
    } finally {
      setCreando(false);
    }
  };

  // Función para volver al login
  const handleVolverAlLogin = () => {
    localStorage.removeItem('contaapp_usuario');
    window.location.reload();
  };

  // Si no hay usuario válido, mostrar pantalla de error
  if (!usuario || !usuario.uid) {
    return (
      <div className={styles.contenedorCrearProyecto}>
        <div className={styles.tarjetaError}>
          <div className={styles.iconoErrorGrande}>🔐</div>
          <h1 className={styles.tituloError}>Sesión No Válida</h1>
          <p className={styles.descripcionError}>
            No se pudo verificar su identidad. Es posible que su sesión haya expirado.
          </p>
          
          <div className={styles.detallesError}>
            <div className={styles.detalle}>
              <strong>Problema detectado:</strong> Usuario sin ID válido
            </div>
            <div className={styles.detalle}>
              <strong>Email:</strong> {usuario?.email || 'No disponible'}
            </div>
          </div>

          <div className={styles.contenedorBotonesError}>
            <button
              className={styles.btnVolverLogin}
              onClick={handleVolverAlLogin}
            >
              Volver al Login
            </button>
            <button
              className={styles.btnReintentar}
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>

          <div className={styles.consejosError}>
            <h4>Soluciones posibles:</h4>
            <ul>
              <li>Cierre completamente el navegador y vuelva a abrirlo</li>
              <li>Limpie la caché del navegador</li>
              <li>Verifique su conexión a internet</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contenedorCrearProyecto}>
      <div className={styles.tarjetaCrearProyecto}>
        <button 
          className={styles.btnVolver}
          onClick={onCancelar}
          disabled={creando}
        >
          ← Volver a Proyectos
        </button>

        <div className={styles.cabeceraCrear}>
          <h1>Crear Nuevo Proyecto</h1>
          <p>Comienza un nuevo proyecto contable desde cero</p>
        </div>

        {error && (
          <div className={styles.contenedorError}>
            <div className={styles.iconoError}>⚠️</div>
            <span className={styles.textoError}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formularioCrear}>
          <div className={styles.grupoInput}>
            <label htmlFor="nombre" className={styles.etiqueta}>
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={styles.input}
              placeholder="Ej: Mi Empresa S.A. de C.V."
              required
              disabled={creando}
              maxLength={100}
            />
            <div className={styles.contadorCaracteres}>
              {formData.nombre.length}/100 caracteres
            </div>
          </div>

          <div className={styles.grupoInput}>
            <label htmlFor="tipo" className={styles.etiqueta}>
              Tipo de Proyecto
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className={styles.select}
              disabled={creando}
            >
              <option value="empresa">Empresa</option>
              <option value="personal">Personal</option>
              <option value="freelance">Freelance</option>
              <option value="comercio">Comercio</option>
              <option value="servicios">Servicios</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className={styles.grupoInput}>
            <label htmlFor="descripcion" className={styles.etiqueta}>
              Descripción (Opcional)
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className={styles.textarea}
              placeholder="Describe el propósito de este proyecto, industria, o información relevante..."
              rows="4"
              disabled={creando}
              maxLength={500}
            />
            <div className={styles.contadorCaracteres}>
              {formData.descripcion.length}/500 caracteres
            </div>
          </div>

          <div className={styles.infoUsuario}>
            <div className={styles.usuarioInfo}>
              <strong>Usuario:</strong> {usuario?.email || 'No identificado'}
            </div>
            <div className={styles.usuarioInfo}>
              <strong>ID:</strong> {usuario?.uid ? `${usuario.uid.substring(0, 8)}...` : 'No disponible'}
            </div>
          </div>

          <div className={styles.contenedorBotones}>
            <button
              type="button"
              onClick={onCancelar}
              className={styles.btnCancelar}
              disabled={creando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnCrear}
              disabled={creando || !formData.nombre.trim()}
            >
              {creando ? (
                <>
                  <div className={styles.spinnerPequeño}></div>
                  Creando Proyecto...
                </>
              ) : (
                'Crear Proyecto'
              )}
            </button>
          </div>
        </form>

        <div className={styles.consejos}>
          <h4>Consejos para nombrar tu proyecto:</h4>
          <ul>
            <li>Usa un nombre descriptivo y fácil de recordar</li>
            <li>Incluye el año fiscal si es relevante</li>
            <li>Ej: "Mi Empresa 2024", "Consultoría XYZ", "Tienda Online"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CrearProyecto;