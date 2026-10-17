import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

/**
 * Layout limpio para pantallas de autenticación (Login/Registro).
 */
const AuthLayout = () => {
  return (
    <div className="auth-layout" id="auth-layout">
      <div className="auth-layout__bg" />
      <div className="auth-layout__card">
        <div className="auth-layout__header">
          <span className="auth-layout__icon"></span>
          <h1 className="auth-layout__title">Autogestión Inmobiliaria</h1>
          <p className="auth-layout__subtitle">Plataforma de gestión de propiedades</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
