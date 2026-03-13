# CLAUDE.md — Tienda Online CRUD (Multi-Agente)

## 🏗️ Descripción del Proyecto
CRUD completo de una tienda online con gestión de productos, categorías, usuarios y pedidos.
Stack: **React + Vite** (frontend) · **Node.js + Express + PostgreSQL** (backend)

---

## 👥 Agentes y Responsabilidades

### 🎨 AGENTE FRONTEND
- **Directorio exclusivo:** `frontend/`
- **Tareas:** Componentes React, páginas, estilos, llamadas a la API, rutas del cliente
- **NO tocar:** Nada dentro de `backend/`

### ⚙️ AGENTE BACKEND
- **Directorio exclusivo:** `backend/`
- **Tareas:** Endpoints REST, modelos de base de datos, autenticación, validaciones, migraciones
- **NO tocar:** Nada dentro de `frontend/`

---

## 📁 Estructura del Proyecto

```
tienda-online/
├── CLAUDE.md                  ← Este archivo (compartido, no editar sin consenso)
├── API_CONTRACT.md            ← Contrato de API (leer antes de implementar)
├── .env.example               ← Variables de entorno de referencia
│
├── frontend/                  ← 🎨 SOLO AGENTE FRONTEND
│   ├── src/
│   │   ├── components/        ← Componentes reutilizables
│   │   ├── pages/             ← Páginas principales
│   │   ├── services/          ← Llamadas fetch/axios a la API
│   │   ├── hooks/             ← Custom hooks
│   │   ├── context/           ← Estado global (Context API)
│   │   └── assets/            ← Imágenes, íconos
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/                   ← ⚙️ SOLO AGENTE BACKEND
    ├── src/
    │   ├── routes/            ← Definición de rutas Express
    │   ├── controllers/       ← Lógica de negocio
    │   ├── models/            ← Modelos Sequelize/Prisma
    │   ├── middleware/        ← Auth, validación, errores
    │   └── config/            ← DB, env, cors
    ├── migrations/            ← Migraciones de base de datos
    ├── seed/                  ← Datos iniciales
    └── package.json
```

---

## 📋 Contrato de API (API_CONTRACT.md)

> ⚠️ **REGLA CRÍTICA:** Antes de implementar cualquier endpoint o llamada a la API,
> ambos agentes deben leer `API_CONTRACT.md`. Si necesitas un endpoint que no existe,
> añádelo al contrato PRIMERO (en un bloque `## PENDIENTE`) y avisa al otro agente.

### Base URL
```
http://localhost:3001/api/v1
```

### Autenticación
```
Header: Authorization: Bearer <token>
```

### Endpoints definidos

#### 🔐 Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/login` | Login → devuelve JWT |
| GET | `/auth/me` | Perfil del usuario autenticado |

#### 📦 Productos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/products` | Listar productos (con filtros y paginación) |
| GET | `/products/:id` | Obtener producto por ID |
| POST | `/products` | Crear producto (admin) |
| PUT | `/products/:id` | Actualizar producto (admin) |
| DELETE | `/products/:id` | Eliminar producto (admin) |

#### 🗂️ Categorías
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/categories` | Listar categorías |
| POST | `/categories` | Crear categoría (admin) |
| PUT | `/categories/:id` | Actualizar categoría (admin) |
| DELETE | `/categories/:id` | Eliminar categoría (admin) |

#### 🛒 Pedidos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/orders` | Mis pedidos (usuario) |
| GET | `/orders/:id` | Detalle de pedido |
| POST | `/orders` | Crear pedido |
| PUT | `/orders/:id/status` | Actualizar estado (admin) |

#### 👥 Usuarios (Admin)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/users` | Listar usuarios (admin) |
| PUT | `/users/:id` | Actualizar usuario |
| DELETE | `/users/:id` | Eliminar usuario (admin) |

### Formato de respuesta estándar
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Formato de error estándar
```json
{
  "success": false,
  "error": "Mensaje de error",
  "code": "ERROR_CODE"
}
```

---

## 🗄️ Modelos de Base de Datos

### users
```sql
id, email, password_hash, name, role (user|admin),
created_at, updated_at
```

### categories
```sql
id, name, slug, description, image_url,
created_at, updated_at
```

### products
```sql
id, name, slug, description, price, stock,
image_url, category_id (FK), is_active,
created_at, updated_at
```

### orders
```sql
id, user_id (FK), status (pending|processing|shipped|delivered|cancelled),
total, shipping_address, created_at, updated_at
```

### order_items
```sql
id, order_id (FK), product_id (FK),
quantity, unit_price
```

---

## ⚙️ Variables de Entorno

### Backend (`backend/.env`)
```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/tienda_db
JWT_SECRET=tu_secret_muy_seguro
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_NAME=Mi Tienda
```

---

## 🚦 Reglas de Coordinación

### Para evitar conflictos

1. **Cada agente trabaja SOLO en su directorio.** No hay excepciones.
2. **CLAUDE.md y API_CONTRACT.md son de solo lectura.** Si necesitas un cambio, proponlo como comentario `## PROPUESTA:` al final del archivo.
3. **Hacer commit frecuente** con mensajes claros:
   - Frontend: `feat(frontend): agregar página de productos`
   - Backend: `feat(backend): endpoint GET /products con paginación`
4. **Si necesitas datos de prueba**, usa el endpoint GET correspondiente. El backend provee un seed en `backend/seed/`.

### Puertos
| Servicio | Puerto |
|----------|--------|
| Frontend (Vite) | 5173 |
| Backend (Express) | 3001 |
| PostgreSQL | 5432 |

### CORS
El backend ya tiene CORS configurado para aceptar peticiones desde `http://localhost:5173`.

---

## 📋 Checklist de Implementación

### Agente Backend — Orden sugerido
- [ ] Setup inicial Express + estructura de carpetas
- [ ] Configurar PostgreSQL + Sequelize/Prisma
- [ ] Migraciones de todas las tablas
- [ ] Seed con datos de prueba (5 categorías, 20 productos)
- [ ] Middleware de autenticación JWT
- [ ] Rutas y controladores: Auth
- [ ] Rutas y controladores: Productos (CRUD completo)
- [ ] Rutas y controladores: Categorías (CRUD completo)
- [ ] Rutas y controladores: Pedidos
- [ ] Rutas y controladores: Usuarios (admin)
- [ ] Manejo global de errores
- [ ] Validación de inputs (Joi o express-validator)

### Agente Frontend — Orden sugerido
- [ ] Setup inicial Vite + React + React Router
- [ ] Configurar Axios con interceptores (token automático)
- [ ] Context de autenticación (AuthContext)
- [ ] Páginas: Login y Registro
- [ ] Navbar con estado de sesión
- [ ] Página: Listado de productos con filtros
- [ ] Página: Detalle de producto
- [ ] Página: Carrito de compras (estado local)
- [ ] Página: Checkout → crear pedido
- [ ] Página: Mis pedidos
- [ ] Panel Admin: CRUD de productos
- [ ] Panel Admin: CRUD de categorías
- [ ] Panel Admin: Gestión de pedidos
- [ ] Manejo global de errores de API

---

## 🔧 Comandos de Inicio Rápido

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run migrate
npm run seed
npm run dev        # Inicia en puerto 3001

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev        # Inicia en puerto 5173
```

---

## 📌 Notas Importantes

- El **agente backend** debe tener el servidor corriendo antes de que el frontend haga llamadas reales.
- Mientras el backend no esté listo, el **agente frontend** puede usar **mock data** en los services.
- Usar `console.log` mínimo en producción; preferir un logger como `morgan` en backend.
- Las imágenes de productos se manejan por URL externa (no subida de archivos en esta versión).