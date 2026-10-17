# SISTEMA DE AUTOGESTIÓN INMOBILIARIA INTELIGENTE (INMOAUTO)

Plataforma integral, moderna y segura para la autogestión de compra, venta, anticrético y alquiler de propiedades inmobiliarias entre propietarios e inquilinos **sin intermediarios abusivos**.

---

## 🚀 STACK TECNOLÓGICO IMPLEMENTADO

- **Backend:** [NestJS](https://nestjs.com/) (TypeScript) + [TypeORM](https://typeorm.io/) + [PostgreSQL 17](https://www.postgresql.org/)
- **WebSockets en Tiempo Real:** `@nestjs/websockets` + Socket.io
- **Seguridad & Auth:** JWT + Passport + Bcrypt + RBAC (`@Roles('admin', 'usuario')`)
- **Inteligencia Artificial:** Servicio Groq / OpenAI LLM + Motor de análisis legal y verificación OCR de Folio Real
- **Blockchain Ledger:** Motor de consenso y auditoría forense con SHA-256, Árboles de Merkle y prueba de inmutabilidad
- **Pasarela de Pagos:** Stripe SDK (Checkout Sessions, Webhooks y cálculo de comisión de plataforma)
- **Frontend:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) + [Zustand](https://github.com/pmndrs/zustand)
- **Recorridos Inmersivos:** [Pannellum 360°](https://pannellum.org/) con Hotspots interactivos de transición entre habitaciones
- **Realidad Aumentada (AR):** Google `<model-viewer>` para modelos `.glb` interactivos y WebXR en smartphones

---

## 👥 ROLES DE USUARIO Y CREDENCIALES PRE-SEMBRADAS (DEMO)

El sistema cuenta con datos pre-sembrados automáticamente para pruebas inmediatas con 1 clic:

| Rol | Correo Electrónico | Contraseña | Descripción |
|---|---|---|---|
| **Administrador** | `admin@inmobiliaria.com` | `admin123` | Métricas financieras globales, ingresos, tasa de comisión, moderación de usuarios y monitoreo del Ledger. |
| **Propietario Demo** | `carlos.propietario@gmail.com` | `user123` | Publicación de inmuebles, subida de fotos/panorámicas 360° y 3D, verificación legal de títulos por IA, redacción y firma de contratos. |
| **Inquilino Demo** | `lucia.inquilino@gmail.com` | `user123` | Exploración de catálogo con filtros, visor 360° y AR 3D, agenda de visitas, firma digital de contratos y pago de alquiler vía Stripe. |

---

## 🏛️ ARQUITECTURA DE MÓDULOS DEL BACKEND (`Backend/src/modules/`)

1. **`usuarios/`**: Autenticación JWT, perfil de usuario, agenda de visitas, notificaciones push/campana, bloqueos entre usuarios y reseñas calificadas.
2. **`inmuebles/`**: CRUD de propiedades, Direcciones normalizadas, Tipos de inmueble, Multimedia (fotos y panorámicas 360° equirrectangulares), Hotspots de transición, Publicaciones activas, Citas de visita presencial y Favoritos.
3. **`contratos/`**: Ciclo de vida contractual (`borrador`, `enviado`, `activo`, `finalizado`), cláusulas de desalojo/mora, firmas digitales de ambas partes y liquidación de comisiones.
4. **`pagos/`**: Integración con Stripe Checkout, confirmación de sesiones, historial de pagos, desglose de comisión de la plataforma y anclaje al bloque inmutable de Blockchain.
5. **`chat/`**: WebSocket Gateway bidireccional en tiempo real, vinculación con recorridos 360°, indicadores de tipeo y mensajes multimedia.
6. **`blockchain/`**: Bloque Génesis, encadenamiento estricto de hashes (`previousHash` -> `hash`), cálculo de raíz Merkle, generación de `TxID` y explorador público de auditoría forense.
7. **`ia/`**: Redactor notarial de contratos con IA y motor de análisis de Folios Reales / Alodiales (OCR + detección de gravámenes, hipotecas y score 0-100).
8. **`seed/`**: Siembra automática en PostgreSQL al iniciar el servidor.

---

## 🖥️ ARQUITECTURA DEL FRONTEND (`Frontend/src/`)

- **`components/Navbar.jsx` & `Footer.jsx`**: Navegación responsive, contador de notificaciones no leídas y cambio de perfil.
- **`components/PannellumViewer.jsx`**: Visor 360° panorámico con hotspots interactivos para navegar entre ambientes (living, terraza, cocina).
- **`components/ModelViewer3D.jsx`**: Renderizado de modelos 3D `.glb` con controles de órbita y botón de Realidad Aumentada (AR).
- **`components/BlockchainAuditTrail.jsx`**: Explorador visual del libro mayor con timeline de bloques, números de bloque, hashes SHA-256, Merkle root y validador de integridad criptográfica en tiempo real.
- **`components/LiveChatModal.jsx`**: Chat instantáneo flotante conectado a Socket.io.
- **`components/ScheduleAppointmentModal.jsx`**: Calendario interactivo para solicitud de visitas.
- **`components/ContractSignModal.jsx`**: Visor de términos legales y firma electrónica con certificado Blockchain.
- **`pages/CatalogPage.jsx`**: Catálogo con filtros avanzados por precio, tipo, ciudad, zona, dormitorios y tipo de oferta.
- **`pages/PropertyDetailPage.jsx`**: Ficha técnica completa con visor de fotos, 360° y AR 3D, badge de verificación legal y reseñas.
- **`pages/UserDashboard.jsx`**: Tablero completo para propietarios e inquilinos (Mis Inmuebles, Mis Contratos, Mis Pagos, Mis Citas, Mensajes).
- **`pages/AdminDashboard.jsx`**: Tablero administrativo con KPIs en tiempo real, ajuste de comisión y moderación.
- **`pages/BlockchainPage.jsx`**: Explorador forense independiente de la cadena de bloques.

---

## 🏃 GUÍA RÁPIDA DE EJECUCIÓN LOCAL

### 1. Backend (NestJS + PostgreSQL)
```bash
cd Backend
# El backend escucha en http://localhost:3001/api
# Conexión TypeORM conectada a postgresql://postgres:61333148@localhost:5432/inmobiliaria_db
npm run start:prod
```

### 2. Frontend (React + Vite)
```bash
cd Frontend
# El frontend está disponible en http://localhost:5173/
npm run dev
```
