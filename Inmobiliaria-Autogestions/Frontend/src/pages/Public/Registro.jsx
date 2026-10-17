import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import api from '../../services/api'; 
import './Login.css'; 

const Registro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    telefono: '',
    ci: '',
    fecha_nacimiento: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validación mayores de 18 años
    const today = new Date();
    const minBirthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];
    
    if (formData.fecha_nacimiento && formData.fecha_nacimiento > minBirthDate) {
      setError('Debes ser mayor de 18 años para poder registrarte.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/usuarios/registro/', formData);
      setSuccess('¡Registro exitoso! Redirigiendo al login...');
      
      // Esperamos 2 segundos y lo mandamos al login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError('Error al registrar. Verifica los datos o intenta con otro usuario.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login" id="register-page">
      <form className="login__form" onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', color: 'white', marginBottom: '1.5rem' }}>Crear Cuenta</h2>
        
        {error && <div className="login__error">{error}</div>}
        {success && <div style={{ background: '#10b981', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>{success}</div>}

        {/* El campo username fue erradicado, nos basamos puramente en email */}

        {/* Fila: Nombre y Apellido */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="login__field" style={{ flex: 1 }}>
            <label htmlFor="first_name" className="login__label">Nombre</label>
            <input id="first_name" type="text" className="login__input" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div className="login__field" style={{ flex: 1 }}>
            <label htmlFor="last_name" className="login__label">Apellido</label>
            <input id="last_name" type="text" className="login__input" value={formData.last_name} onChange={handleChange} required />
          </div>
        </div>

        <div className="login__field">
          <label htmlFor="email" className="login__label">Correo Electrónico</label>
          <input id="email" type="email" className="login__input" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="login__field">
          <label htmlFor="password" className="login__label">Contraseña</label>
          <input id="password" type="password" className="login__input" value={formData.password} onChange={handleChange} required minLength="8" />
        </div>

        {/* Fila: Cédula y Teléfono */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="login__field" style={{ flex: 1 }}>
            <label htmlFor="ci" className="login__label">Cédula</label>
            <input id="ci" type="text" className="login__input" value={formData.ci} onChange={handleChange} />
          </div>
          <div className="login__field" style={{ flex: 1 }}>
            <label htmlFor="telefono" className="login__label">Teléfono</label>
            <input id="telefono" type="tel" className="login__input" value={formData.telefono} onChange={handleChange} />
          </div>
        </div>

        <div className="login__field">
          <label htmlFor="fecha_nacimiento" className="login__label">Fecha de Nacimiento</label>
          <input 
            id="fecha_nacimiento" 
            type="date" 
            className="login__input" 
            value={formData.fecha_nacimiento} 
            onChange={handleChange} 
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            style={{ colorScheme: 'dark' }} 
            required
          />
        </div>

        <Button type="submit" fullWidth loading={loading} style={{ marginTop: '10px' }}>
          Registrarse
        </Button>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
            Inicia sesión aquí
          </Link>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: '0.85rem', color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Volver al Inicio
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Registro;