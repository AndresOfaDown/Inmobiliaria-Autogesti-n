import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import ProfileModal from '../../components/ProfileModal';
import { Edit3 } from 'lucide-react';
import './Propiedades.css';

const MiPerfil = () => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Avatar por defecto incrustado si no hay foto
  const defaultAvatar = `https://ui-avatars.com/api/?name=${user?.first_name || 'U'}+${user?.last_name || 'X'}&background=0ea5e9&color=fff&size=200`;

  return (
    <div className="propiedades-page" style={{ paddingTop: '20px' }}>
      
      <div className="propiedades-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="propiedad-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'var(--color-text)', margin: 0 }}>Datos Personales</h2>
            <button
              onClick={() => setIsEditModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'var(--color-primary, #0284c7)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              <Edit3 size={16} />
              Editar Perfil
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
            
            {/* Foto de Perfil */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <img 
                src={user?.foto || defaultAvatar} 
                alt="Avatar de Perfil" 
                style={{ 
                  width: '140px', 
                  height: '140px', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  border: '3px solid var(--color-border)'
                }} 
              />
            </div>

            <div>
              <strong style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Nombre Completo</strong>
              <div style={{ fontSize: '1.05rem', color: 'var(--color-text)', fontWeight: '500' }}>{user?.first_name} {user?.last_name}</div>
            </div>
            
            <div>
              <strong style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Correo Electrónico</strong>
              <div style={{ fontSize: '1.05rem', color: 'var(--color-text)' }}>{user?.email}</div>
            </div>
            
            {user?.ci && (
              <div>
                <strong style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Cédula</strong>
                <div style={{ fontSize: '1.05rem', color: 'var(--color-text)' }}>{user?.ci}</div>
              </div>
            )}

            {user?.telefono && (
              <div>
                <strong style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Teléfono</strong>
                <div style={{ fontSize: '1.05rem', color: 'var(--color-text)' }}>{user?.telefono}</div>
              </div>
            )}
            
            {user?.direccion && (
              <div>
                <strong style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Dirección</strong>
                <div style={{ fontSize: '1.05rem', color: 'var(--color-text)' }}>{user?.direccion}</div>
              </div>
            )}

            {user?.fecha_nacimiento && (
              <div>
                <strong style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Fecha de Nacimiento</strong>
                <div style={{ fontSize: '1.05rem', color: 'var(--color-text)' }}>
                  {new Date(user.fecha_nacimiento).toLocaleDateString()}
                </div>
              </div>
            )}

            <div>
              <strong style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Rol</strong>
              <span style={{ textTransform: 'capitalize', background: 'rgba(14,165,233,0.1)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                {user?.rol === 'admin' ? 'Administrador' : 'Usuario'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default MiPerfil;
