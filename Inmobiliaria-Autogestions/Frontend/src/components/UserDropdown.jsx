import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import ProfileModal from './ProfileModal';
import useStore from '../store/store';
import './UserDropdown.css';

const UserDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);

  const handleThemeCycle = (e) => {
    e.stopPropagation();
    let nextTheme = 'light';
    if (theme === 'system') nextTheme = 'light';
    else if (theme === 'light') nextTheme = 'dark';
    else if (theme === 'dark') nextTheme = 'system';
    setTheme(nextTheme);
  };

  // Cerrar el dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    logout();
  };

  const openProfile = () => {
    setIsOpen(false);
    setIsProfileModalOpen(true);
  };

  // Avatar por defecto incrustado si no hay foto
  const defaultAvatar = `https://ui-avatars.com/api/?name=${user?.first_name || 'U'}+${user?.last_name || 'X'}&background=0ea5e9&color=fff&size=100`;

  return (
    <>
      <div className="user-dropdown" ref={dropdownRef}>
        <button 
          className="user-dropdown__trigger" 
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', paddingLeft: '6px' }}>
            {user?.first_name} {user?.last_name}
          </span>
          <img 
            src={user?.foto || defaultAvatar} 
            alt="Avatar del usuario" 
            className="user-dropdown__avatar" 
          />
        </button>

        {isOpen && (
          <div className="user-dropdown__menu">
            <div className="user-dropdown__header">
              <span className="user-dropdown__name">
                {user?.first_name} {user?.last_name}
              </span>
              <span className="user-dropdown__email">
                {user?.email}
              </span>
            </div>
            
            <ul className="user-dropdown__list">
              <li className="user-dropdown__item">
                <button className="user-dropdown__btn" onClick={openProfile}>
                  <svg className="user-dropdown__icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mi Perfil
                </button>
              </li>

              <li className="user-dropdown__item">
                <button className="user-dropdown__btn" onClick={handleThemeCycle}>
                  {theme === 'system' && <Monitor size={16} className="user-dropdown__icon" />}
                  {theme === 'light' && <Sun size={16} className="user-dropdown__icon" />}
                  {theme === 'dark' && <Moon size={16} className="user-dropdown__icon" />}
                  Tema: {theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Oscuro'}
                </button>
              </li>
              
              <div className="user-dropdown__divider"></div>
              
              <li className="user-dropdown__item">
                <button className="user-dropdown__btn user-dropdown__btn--logout" onClick={handleLogoutClick}>
                  <svg className="user-dropdown__icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
};

export default UserDropdown;
