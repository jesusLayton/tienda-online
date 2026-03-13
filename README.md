# 🛒 Tienda Online — CRUD Full Stack

Aplicación web completa de tienda online con gestión de productos, categorías, usuarios y pedidos.

**Stack:** React + Vite · Node.js + Express · SQLite (Sequelize)

---

## 📸 Funcionalidades

- **Autenticación** JWT con roles (admin / usuario)
- **Productos** — CRUD completo con filtros, búsqueda y paginación
- **Categorías** — Gestión completa (admin)
- **Pedidos** — Crear, consultar y actualizar estado
- **Usuarios** — Panel de administración con CRUD completo
- **Panel Admin** — Gestión centralizada de toda la tienda

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- npm 9+

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/tienda-online.git
cd tienda-online
```

### 2. Configurar el Backend

```bash
cd backend
npm install
npm run migrate      # Crea las tablas en SQLite
npm run seed         # Carga datos de prueba
npm run dev          # Inicia en http://localhost:3001
```

### 3. Configurar el Frontend

```bash
cd frontend
npm install
npm run dev          # Inicia en http://localhost:5173
```

### 4. Abrir la app

- Frontend: http://localhost:5173
- API: http://localhost:3001/api/v1

---

## 🔑 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@tienda.com | Admin1234 |
| Usuario | maria.garcia@ejemplo.com | Usuario1234 |
| Usuario | carlos.rodriguez@ejemplo.com | Usuario1234 |

---

## 📁 Estructura del Proyecto

```
tienda-online/
├── backend/                    # API REST (Node.js + Express + SQLite)
│   ├── src/
│   │   ├── config/             # Configuración DB y entorno
│   │   ├── controllers/        # Lógica de negocio
│   │   ├── middleware/         # Auth, roles, errores
│   │   ├── models/             # Modelos Sequelize
│   │   └── routes/             # Rutas Express
│   ├── migrations/             # Migraciones de base de datos
│   ├── seed/                   # Datos iniciales
│   └── database.sqlite         # Base de datos (generada automáticamente)
│
├── frontend/                   # SPA (React + Vite)
│   └── src/
│       ├── components/         # Componentes reutilizables
│       ├── pages/              # Páginas principales
│       ├── services/           # Llamadas a la API
│       ├── hooks/              # Custom hooks
│       └── context/            # Estado global (AuthContext)
│
├── CLAUDE.md                   # Instrucciones para agentes IA
└── API_CONTRACT.md             # Contrato de API
```

---

## 🗄️ Modelos de Base de Datos

```
users          → id, email, password_hash, name, role, timestamps
categories     → id, name, slug, description, image_url, timestamps
products       → id, name, slug, description, price, stock, image_url, category_id, is_active, timestamps
orders         → id, user_id, status, total, shipping_address, timestamps
order_items    → id, order_id, product_id, quantity, unit_price, timestamps
```

---

## 📡 API Endpoints

Ver documentación completa en [API_CONTRACT.md](./API_CONTRACT.md) o en [docs/API.md](./docs/API.md).

**Base URL:** `http://localhost:3001/api/v1`

| Recurso | Endpoints |
|---------|-----------|
| Auth | POST /auth/register, POST /auth/login, GET /auth/me |
| Productos | GET/POST /products, GET/PUT/DELETE /products/:id |
| Categorías | GET/POST /categories, PUT/DELETE /categories/:id |
| Pedidos | GET/POST /orders, GET /orders/:id, PUT /orders/:id/status |
| Usuarios | GET /users, GET/PUT/DELETE /users/:id |

---

## 🛠️ Tecnologías

### Backend
| Paquete | Uso |
|---------|-----|
| Express 4 | Framework HTTP |
| Sequelize 6 | ORM |
| SQLite3 | Base de datos |
| jsonwebtoken | Autenticación JWT |
| bcryptjs | Hash de contraseñas |
| express-validator | Validación de inputs |
| morgan | Logging HTTP |
| cors | CORS |

### Frontend
| Paquete | Uso |
|---------|-----|
| React 18 | UI |
| Vite | Bundler |
| React Router | Navegación |
| Axios | Peticiones HTTP |

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama: `git checkout -b feat/nueva-funcionalidad`
3. Commit: `git commit -m "feat: descripción del cambio"`
4. Push: `git push origin feat/nueva-funcionalidad`
5. Abrir Pull Request

---

## 📄 Licencia

MIT
