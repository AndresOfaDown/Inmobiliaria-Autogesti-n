import { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import useAuth from '../hooks/useAuth';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
    ci: user?.ci || '',
    nacimiento: user?.nacimiento || '',
  });

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(user?.foto || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        ci: user.ci || '',
        nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : (user.nacimiento || ''),
      });
      setFotoPreview(user.foto || null);
      setFotoFile(null);
    }
  }, [isOpen, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      // Generar preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Usamos FormData porque puede haber imagen
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      
      if (fotoFile) {
        data.append('foto', fotoFile);
      }

      await updateUser(data);
      onClose(); // Cerrar al tener éxito
    } catch (err) {
      console.error(err);
      setError('Hubo un error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Avatar por defecto incrustado si no hay foto
  const defaultAvatar = `https://ui-avatars.com/api/?name=${user?.first_name || 'U'}+${user?.last_name || 'X'}&background=0ea5e9&color=fff&size=200`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mi Perfil">
      <div className="profile-modal">
        {error && (
          <div style={{ padding: '10px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div className="profile-modal__header">
          <div 
            className="profile-modal__avatar-container" 
            onClick={() => fileInputRef.current?.click()}
          >
            <img 
              src={fotoPreview || defaultAvatar} 
              alt="Avatar" 
              className="profile-modal__avatar" 
            />
            <div className="profile-modal__avatar-overlay">
              Cambiar
            </div>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="profile-modal__file-input" 
          />
          <h3 style={{ margin: '0', color: 'var(--color-text)' }}>
            {user?.email}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '600' }}>
            {user?.rol === 'admin' ? 'ADMINISTRADOR' : 'USUARIO'}
          </p>
        </div>

        <form className="profile-modal__form" onSubmit={handleSubmit}>
          <div className="profile-modal__row">
            <div className="profile-modal__field">
              <label className="profile-modal__label">Nombre</label>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name} 
                onChange={handleInputChange} 
                className="profile-modal__input" 
                disabled 
              />
            </div>
            <div className="profile-modal__field">
              <label className="profile-modal__label">Apellido</label>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name} 
                onChange={handleInputChange} 
                className="profile-modal__input" 
                disabled 
              />
            </div>
          </div>

          <div className="profile-modal__row">
            <div className="profile-modal__field">
              <label className="profile-modal__label">Cédula</label>
              <input 
                type="text" 
                name="ci" 
                value={formData.ci} 
                onChange={handleInputChange} 
                className="profile-modal__input" 
                disabled 
              />
            </div>
            <div className="profile-modal__field">
              <label className="profile-modal__label">Teléfono</label>
              <input 
                type="text" 
                name="telefono" 
                value={formData.telefono} 
                onChange={handleInputChange} 
                className="profile-modal__input" 
              />
            </div>
          </div>

          <div className="profile-modal__field">
            <label className="profile-modal__label">Dirección</label>
            <input 
              type="text" 
              name="direccion" 
              value={formData.direccion} 
              onChange={handleInputChange} 
              className="profile-modal__input" 
            />
          </div>

          <div className="profile-modal__field">
            <label className="profile-modal__label">Fecha de Nacimiento</label>
            <input 
              type="date" 
              name="nacimiento" 
              value={formData.nacimiento} 
              onChange={handleInputChange} 
              className="profile-modal__input" 
              disabled
            />
          </div>

          <div className="profile-modal__actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ProfileModal;
