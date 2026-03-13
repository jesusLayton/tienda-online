# 📡 Documentación de la API

**Base URL:** `http://localhost:3001/api/v1`
**Formato:** JSON
**Autenticación:** Bearer Token (JWT)

---

## Formato de Respuesta

### Éxito
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error
```json
{
  "success": false,
  "error": "Descripción del error",
  "code": "ERROR_CODE"
}
```

---

## 🔐 Autenticación

### POST /auth/register
Registrar un nuevo usuario.

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "MiPassword1"
}
```

**Respuesta 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 4, "name": "Juan Pérez", "email": "juan@ejemplo.com", "role": "user" },
    "token": "eyJ..."
  },
  "message": "Usuario registrado exitosamente"
}
```

---

### POST /auth/login
Iniciar sesión.

**Body:**
```json
{
  "email": "admin@tienda.com",
  "password": "Admin1234"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "Administrador", "email": "admin@tienda.com", "role": "admin" },
    "token": "eyJ..."
  },
  "message": "Inicio de sesión exitoso"
}
```

---

### GET /auth/me
Obtener perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Respuesta 200:**
```json
{
  "success": true,
  "data": { "id": 1, "name": "Administrador", "email": "admin@tienda.com", "role": "admin" }
}
```

---

## 📦 Productos

### GET /products
Listar productos con filtros opcionales.

**Headers:** `Authorization: Bearer <token>`

**Query params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| page | number | Página (default: 1) |
| limit | number | Resultados por página (default: 10, max: 100) |
| search | string | Búsqueda en nombre y descripción |
| category | string | ID o slug de categoría |
| min_price | number | Precio mínimo |
| max_price | number | Precio máximo |
| sort | string | Campo de orden (default: createdAt) |
| order | string | ASC o DESC (default: DESC) |

**Respuesta 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Smartphone Samsung",
      "slug": "smartphone-samsung",
      "price": 449.99,
      "stock": 25,
      "is_active": true,
      "category": { "id": 1, "name": "Electrónica", "slug": "electronica" }
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 20, "totalPages": 2 }
}
```

---

### GET /products/:id
Obtener producto por ID.

**Headers:** `Authorization: Bearer <token>`

---

### POST /products _(admin)_
Crear producto.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Nuevo Producto",
  "description": "Descripción del producto",
  "price": 99.99,
  "stock": 50,
  "category_id": 1,
  "image_url": "https://ejemplo.com/imagen.jpg",
  "is_active": true
}
```

---

### PUT /products/:id _(admin)_
Actualizar producto. Acepta los mismos campos que POST (todos opcionales).

---

### DELETE /products/:id _(admin)_
Eliminar producto.

---

## 🗂️ Categorías

### GET /categories
Listar todas las categorías (público, no requiere token).

**Respuesta 200:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Electrónica", "slug": "electronica", "description": "..." }
  ]
}
```

---

### POST /categories _(admin)_
Crear categoría.

**Body:**
```json
{
  "name": "Nueva Categoría",
  "description": "Descripción opcional",
  "image_url": "https://ejemplo.com/imagen.jpg"
}
```

---

### PUT /categories/:id _(admin)_
Actualizar categoría.

---

### DELETE /categories/:id _(admin)_
Eliminar categoría.

---

## 🛒 Pedidos

### GET /orders
Listar pedidos del usuario autenticado. Admin ve todos.

**Headers:** `Authorization: Bearer <token>`

**Query params:** `page`, `limit`, `status`

---

### GET /orders/:id
Detalle de un pedido. El usuario solo puede ver los suyos.

---

### POST /orders
Crear un nuevo pedido.

**Body:**
```json
{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 5, "quantity": 1 }
  ],
  "shipping_address": {
    "street": "Calle Mayor 123",
    "city": "Madrid",
    "postal_code": "28001",
    "country": "España"
  }
}
```

---

### PUT /orders/:id/status _(admin)_
Actualizar estado del pedido.

**Body:**
```json
{
  "status": "processing"
}
```

**Estados válidos:** `pending` → `processing` → `shipped` → `delivered` / `cancelled`

---

## 👥 Usuarios

### GET /users _(admin)_
Listar usuarios con paginación.

**Query params:** `page`, `limit`, `search`, `role`

---

### GET /users/:id
Obtener usuario por ID. El usuario solo puede ver su propio perfil.

---

### PUT /users/:id
Actualizar usuario. El usuario solo puede editar su propio perfil. Solo admin puede cambiar el `role`.

**Body:**
```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo@email.com",
  "password": "NuevaPassword1",
  "role": "admin"
}
```

---

### DELETE /users/:id _(admin)_
Eliminar usuario. No es posible eliminar la propia cuenta.

---

## ⚠️ Códigos de Error

| Código | Descripción |
|--------|-------------|
| NO_TOKEN | Token no proporcionado |
| INVALID_TOKEN | Token inválido o expirado |
| FORBIDDEN | Sin permisos suficientes |
| NOT_FOUND | Recurso no encontrado |
| VALIDATION_ERROR | Error de validación en los datos |
| EMAIL_TAKEN | El email ya está registrado |
| INVALID_CREDENTIALS | Email o contraseña incorrectos |
| INSUFFICIENT_STOCK | Stock insuficiente para el pedido |
| CANNOT_DELETE_SELF | No puedes eliminarte a ti mismo |
