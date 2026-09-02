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
