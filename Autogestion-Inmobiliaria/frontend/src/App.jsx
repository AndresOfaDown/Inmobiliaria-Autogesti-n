import AuthForm from './components/AuthForm';
import heroBg from './assets/hero-bg.jpg';
import './App.css';

function App() {
  return (
    <div className="landing-page">
      {/* Background */}
      <div className="landing-bg">
        <img src={heroBg} alt="" className="landing-bg-img" />
        <div className="landing-overlay" />
      </div>

      {/* Navbar */}
      <nav className="landing-nav" id="navbar">
        <div className="nav-brand">
          <svg className="nav-logo" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="nav-name">Autogestión Inmobiliaria</span>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="landing-content">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="badge-dot" />
            Plataforma de Gestión
          </div>
          <h1 className="hero-title">
            Tu hogar ideal,<br />
            <span className="hero-highlight">a un clic de distancia</span>
          </h1>
          <p className="hero-subtitle">
            Administra tus propiedades, contratos y pagos desde un solo lugar.
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

        <div className="hero-form">
          <AuthForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 Autogestión Inmobiliaria. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
