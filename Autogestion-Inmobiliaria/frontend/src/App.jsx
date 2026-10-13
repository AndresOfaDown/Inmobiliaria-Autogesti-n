import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminDashboard from './pages/AdminDashboard';
import UsuarioDashboard from './pages/UsuarioDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import heroBg from './assets/hero-bg.jpg';
import './App.css';

function LandingPage() {
  const { isAuthenticated, role } = useAuthStore();

  return (
    <div className="landing-page">
      {/* Background */}
      <div className="landing-bg">
        <img src={heroBg} alt="Condominio Residencial" className="landing-bg-img" />
        <div className="landing-overlay" />
      </div>

      {/* Navbar */}
      <nav className="landing-nav" id="navbar">
        <div className="nav-brand">
          <svg
            className="nav-logo"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="nav-name">Autogestión Inmobiliaria</span>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <Link
              to={role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/usuario'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20"
            >
              Ir a mi Panel ({role === 'ADMIN' ? 'Administrador' : 'Usuario'})
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Content */}
      <main className="landing-content">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="badge-dot" />
            Plataforma Inmobiliaria SAIPI
          </div>
          <h1 className="hero-title">
            Tu hogar ideal,<br />
            <span className="hero-highlight">a un clic de distancia</span>
          </h1>
          <p className="hero-subtitle">
            Administra tus propiedades, contratos y arriendos desde un solo lugar.
            Accede a tu cuenta para comenzar.
          </p>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Propiedades</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">1.2K</span>
              <span className="stat-label">Clientes</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">98%</span>
              <span className="stat-label">Satisfacción</span>
            </div>
          </div>
        </div>

        {/* Hero Form con registro e inicio de sesión integrados */}
        <div className="hero-form">
          <AuthForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 Autogestión Inmobiliaria SAIPI. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página principal con formulario integrado */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/registro" element={<Navigate to="/" replace />} />
        <Route path="/verificar-correo" element={<VerifyEmailPage />} />

        {/* Dashboard de Administrador */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Dashboard de Usuario Inmobiliario Unificado */}
        <Route
          path="/dashboard/usuario"
          element={
            <ProtectedRoute allowedRoles={['USUARIO', 'ADMIN']}>
              <UsuarioDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirecciones de compatibilidad para rutas anteriores */}
        <Route path="/dashboard/propietario" element={<Navigate to="/dashboard/usuario" replace />} />
        <Route path="/dashboard/inquilino" element={<Navigate to="/dashboard/usuario" replace />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
