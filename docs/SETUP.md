# ⚙️ Guía de Instalación y Configuración

## Requisitos Previos

- **Node.js** v18 o superior → [nodejs.org](https://nodejs.org)
- **npm** v9 o superior (incluido con Node.js)
- **Git** → [git-scm.com](https://git-scm.com)

Verificar versiones:
```bash
node --version   # v18+
npm --version    # v9+
git --version
```

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/tienda-online.git
cd tienda-online
```

---

### 2. Backend

```bash
cd backend
npm install
```

**Variables de entorno** — copiar el ejemplo y editar si es necesario:
```bash
cp .env.example .env
```

Contenido de `backend/.env`:
```env
PORT=3001
JWT_SECRET=cambia_esto_por_un_secreto_seguro
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Crear la base de datos y cargar datos:**
```bash
npm run migrate   # Crea las tablas en database.sqlite
npm run seed      # Inserta categorías, productos y usuarios de prueba
```

**Iniciar el servidor:**
```bash
npm run dev       # Desarrollo con hot-reload (nodemon)
npm start         # Producción
```

El servidor queda disponible en: **http://localhost:3001**

---

### 3. Frontend

```bash
cd frontend
npm install
```

**Variables de entorno:**
```bash
cp .env.example .env   # si existe, o crear manualmente
```

Contenido de `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_NAME=Mi Tienda
```

**Iniciar la app:**
```bash
npm run dev       # Desarrollo
npm run build     # Build de producción (genera /dist)
npm run preview   # Preview del build
```

La app queda disponible en: **http://localhost:5173**

---

## Scripts disponibles

### Backend (`cd backend`)

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia con nodemon (hot-reload) |
| `npm start` | Inicia en modo producción |
| `npm run migrate` | Ejecuta migraciones pendientes |
| `npm run migrate:undo` | Revierte todas las migraciones |
| `npm run seed` | Carga datos de prueba |

### Frontend (`cd frontend`)

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Genera build de producción |
| `npm run preview` | Preview del build generado |

---

## Estructura de la Base de Datos

La base de datos SQLite se genera automáticamente en `backend/database.sqlite` al ejecutar las migraciones. No requiere instalación de ningún servidor de base de datos.

Para reiniciar la base de datos desde cero:
```bash
cd backend
npm run migrate:undo
npm run migrate
npm run seed
```

---

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@tienda.com | Admin1234 |
| Usuario | maria.garcia@ejemplo.com | Usuario1234 |
| Usuario | carlos.rodriguez@ejemplo.com | Usuario1234 |

---

## Solución de Problemas

**Puerto ocupado:**
```bash
# Cambiar PORT en backend/.env
PORT=3002
```

**Reiniciar base de datos:**
```bash
cd backend
rm database.sqlite
npm run migrate
npm run seed
```

**Limpiar node_modules:**
```bash
rm -rf node_modules
npm install
```
