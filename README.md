Inmobiliaria Autogestión
Plataforma de gestión inmobiliaria con backend Django REST Framework y frontend React + Vite.

🏗️ Estructura del Proyecto
/Proyecto
├── /Backend          # Django REST Framework API
│   ├── /config       # Configuración principal (settings, urls)
│   ├── /usuarios     # 🔴 Gestión de usuarios, roles, agenda, notificaciones
│   ├── /inmuebles    # 🟢 Propiedades, contratos, multimedia, comisiones
│   
│
└── /Frontend         # React + Vite (JSX)
    └── /src
        ├── /components   # Button, Modal, Navbar
        ├── /config       # Variables de entorno y constantes
        ├── /features     # Lógica por dominio (auth, etc.)
        ├── /hooks        # Custom hooks (useAuth)
        ├── /layouts      # AdminLayout, UserLayout, AuthLayout
        ├── /pages        # Admin/, User/, Public/
        ├── /services     # API (Axios), authService, userService
        ├── /store        # Estado global (Zustand)
        ├── /styles       # CSS global y variables
        └── /utils        # Validaciones y formateo
🚀 Inicio Rápido
Backend
cd Backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
API disponible en: http://localhost:8000/api/

Frontend
cd Frontend
npm install
npm run dev
App disponible en: http://localhost:5173/

🔐 Autenticación
JWT (SimpleJWT) con access y refresh tokens
Endpoints: POST /api/token/, POST /api/token/refresh/
📡 Endpoints principales
Componente	Base URL
Usuarios	/api/usuarios/
Inmuebles	/api/inmuebles/
Pagos	/api/pagos/
