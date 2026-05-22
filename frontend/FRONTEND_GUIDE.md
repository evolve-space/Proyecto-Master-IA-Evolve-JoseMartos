# SRM Compras — Guía de integración para el Frontend

**URL base (desarrollo):** `http://127.0.0.1:8000`  
**Formato:** todos los endpoints aceptan y devuelven `application/json`

---

## 1. Autenticación (JWT)

La API usa **JSON Web Tokens**. El flujo es:

1. Llamar a `POST /api/login` con email y password → recibes un `token`
2. En **todas** las demás peticiones añadir la cabecera:
    ```
    Authorization: Bearer <token>
    ```

El único endpoint **público** (sin token) es `POST /api/login`.

---

### POST /api/login

**Body**

```json
{
    "email": "admin@srm.local",
    "password": "admin123"
}
```

**Respuesta 200**

```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

**Respuesta 401** — credenciales incorrectas

```json
{
    "code": 401,
    "message": "Invalid credentials."
}
```

---

### GET /api/me

Devuelve los datos del usuario con sesión activa.

**Respuesta 200**

```json
{
    "id": 1,
    "nombre": "Admin Principal",
    "email": "admin@srm.local",
    "tipo": "superadmin",
    "roles": ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_USER"]
}
```

> **Valores de `tipo`:** `superadmin` | `admin` | `normal`

---

## 2. Helper de fetch recomendado

```js
const API = "http://localhost:8000/api";

// Guarda el token tras el login
localStorage.setItem("token", token);

// Úsalo en todas las peticiones autenticadas
const authFetch = (url, opts = {}) =>
    fetch(url, {
        ...opts,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...opts.headers,
        },
    });
```

---

## 3. Usuarios — /api/usuarios

### GET /api/usuarios — Listar todos

```js
const usuarios = await authFetch(`${API}/usuarios`).then((r) => r.json());
```

**Respuesta 200**

```json
[
    {
        "id": 1,
        "nombre": "Admin Principal",
        "email": "admin@srm.local",
        "tipo": "superadmin"
    },
    {
        "id": 2,
        "nombre": "María García",
        "email": "maria@srm.local",
        "tipo": "admin"
    },
    {
        "id": 3,
        "nombre": "Carlos López",
        "email": "carlos@srm.local",
        "tipo": "normal"
    }
]
```

### GET /api/usuarios/{id} — Ver uno

**Respuesta 200** — misma estructura que cada elemento del listado

### POST /api/usuarios — Crear

```js
await authFetch(`${API}/usuarios`, {
    method: "POST",
    body: JSON.stringify({
        nombre: "Nuevo Usuario", // obligatorio
        email: "nuevo@srm.local", // obligatorio, único
        password: "secreto123", // obligatorio (el servidor lo hashea)
        tipo: "normal", // obligatorio: superadmin | admin | normal
    }),
});
```

**Respuesta 201** — objeto usuario creado (sin `password`)

### PATCH /api/usuarios/{id} — Editar

Envía solo los campos que quieres modificar:

```js
await authFetch(`${API}/usuarios/3`, {
    method: "PATCH",
    body: JSON.stringify({ tipo: "admin" }),
});
```

**Campos editables:** `nombre`, `email`, `password`, `tipo`  
**Respuesta 200** — objeto usuario actualizado

### DELETE /api/usuarios/{id} — Eliminar

```js
await authFetch(`${API}/usuarios/3`, { method: "DELETE" });
```

**Respuesta 204** — sin contenido

---

## 4. Proveedores — /api/proveedores

### GET /api/proveedores — Listar todos

**Respuesta 200**

```json
[
    {
        "id": 1,
        "nombre": "Quimtec S.A.",
        "cifNif": "A12345678",
        "telefono": "+34 91 234 5678",
        "web": "www.quimtec.es",
        "actividad": "Química industrial",
        "direccionFacturacion": "Calle Mayor 10, 28001 Madrid",
        "tipo": "Fabricante",
        "certificaciones": "BIO, HALAL",
        "contactoPrincipal": "Juan Pérez",
        "formaPago": 30,
        "email": "compras@quimtec.es",
        "movil": "+34 600 111 222",
        "incoterm": "CIF",
        "documentacion": true,
        "observaciones": null
    }
]
```

### GET /api/proveedores/{id} — Ver uno

**Respuesta 200** — misma estructura

### POST /api/proveedores — Crear

```js
await authFetch(`${API}/proveedores`, {
    method: "POST",
    body: JSON.stringify({
        nombre: "Nuevo Proveedor S.L.", // obligatorio
        cifNif: "B11223344",
        telefono: "+34 93 000 0000",
        web: "www.ejemplo.com",
        actividad: "Alimentación",
        direccionFacturacion: "Calle Test 1, Barcelona",
        tipo: "Fabricante", // Fabricante | Distribuidor
        certificaciones: "FOOD",
        contactoPrincipal: "Nombre Apellido",
        formaPago: 60, // 30 | 60 | 75 (días)
        email: "info@ejemplo.com",
        movil: "+34 600 000 000",
        incoterm: "EXW", // EXW | CIF | CIP | CFR
        documentacion: true,
        observaciones: null,
    }),
});
```

**Respuesta 201** — objeto proveedor creado

### PATCH /api/proveedores/{id} — Editar

```js
await authFetch(`${API}/proveedores/1`, {
    method: "PATCH",
    body: JSON.stringify({ formaPago: 30, telefono: "+34 91 999 9999" }),
});
```

**Respuesta 200** — objeto proveedor actualizado

### DELETE /api/proveedores/{id} — Eliminar

**Respuesta 204** — sin contenido

---

## 5. Contratos — /api/contratos

### GET /api/contratos — Listar todos

**Respuesta 200**

```json
[
    {
        "id": 1,
        "fecha": "2025-01-15",
        "numeroContrato": "CONT-2025-001",
        "producto": "Ácido cítrico anhidro",
        "proveedorId": 1,
        "proveedorNombre": "Quimtec S.A.",
        "precio": "1.2500",
        "grado": "FOOD",
        "cantidad": "50000.000",
        "cantidadPedida": "20000.000",
        "cantidadPendiente": "30000.000",
        "fechaCaducidad": "2025-12-31",
        "documentacion": true,
        "observaciones": null
    }
]
```

### GET /api/contratos/{id} — Ver uno

**Respuesta 200** — misma estructura

### POST /api/contratos — Crear

```js
await authFetch(`${API}/contratos`, {
    method: "POST",
    body: JSON.stringify({
        proveedorId: 1, // obligatorio
        fecha: "2026-01-01", // YYYY-MM-DD
        numeroContrato: "CONT-2026-001",
        producto: "Lecitina de soja",
        precio: "3.80",
        grado: "HALAL", // BIO | HALAL | KOSHER | FOOD
        cantidad: "20000",
        cantidadPedida: "0",
        cantidadPendiente: "20000",
        fechaCaducidad: "2027-01-01",
        documentacion: false,
        observaciones: null,
    }),
});
```

**Respuesta 201** — objeto contrato creado

### PATCH /api/contratos/{id} — Editar

```js
await authFetch(`${API}/contratos/1`, {
    method: "PATCH",
    body: JSON.stringify({
        cantidadPedida: "10000",
        cantidadPendiente: "10000",
    }),
});
```

**Respuesta 200** — objeto contrato actualizado

### DELETE /api/contratos/{id} — Eliminar

**Respuesta 204** — sin contenido

---

## 6. Importaciones — /api/importaciones

### GET /api/importaciones — Listar todas

**Respuesta 200**

```json
[
    {
        "id": 1,
        "fechaDuaAlbaran": "2025-02-10",
        "fechaFactura": "2025-02-08",
        "proveedorId": 1,
        "proveedorNombre": "Quimtec S.A.",
        "producto": "Ácido cítrico anhidro",
        "cantidad": "10000.000",
        "importeEur": "12500.00",
        "aranceles": "3.50",
        "costeDespacho": "850.00",
        "gastoImpKg": "0.0935",
        "costeKg": "1.3435",
        "importeUsd": "13562.50",
        "tipoCambio": "1.0850",
        "forwarderer": "Kuehne+Nagel",
        "incoterm": "CIF",
        "documentacion": true,
        "observaciones": null
    }
]
```

### GET /api/importaciones/{id} — Ver una

**Respuesta 200** — misma estructura

### POST /api/importaciones — Crear

```js
await authFetch(`${API}/importaciones`, {
    method: "POST",
    body: JSON.stringify({
        proveedorId: 2, // obligatorio
        fechaDuaAlbaran: "2026-03-10", // YYYY-MM-DD
        fechaFactura: "2026-03-08",
        producto: "Extracto de vainilla BIO",
        cantidad: "500",
        importeEur: "22500.00",
        aranceles: "0.00",
        costeDespacho: "380.00",
        gastoImpKg: "0.76",
        costeKg: "45.76",
        importeUsd: "24412.50",
        tipoCambio: "1.0850",
        forwarderer: "DHL Global",
        incoterm: "EXW", // EXW | CIF | CIP | CFR
        documentacion: true,
        observaciones: null,
    }),
});
```

**Respuesta 201** — objeto importación creado

### PATCH /api/importaciones/{id} — Editar

Envía solo los campos a modificar. **Respuesta 200**

### DELETE /api/importaciones/{id} — Eliminar

**Respuesta 204** — sin contenido

---

## 7. Ofertas — /api/ofertas

### GET /api/ofertas — Listar todas

**Respuesta 200**

```json
[
    {
        "id": 1,
        "fecha": "2025-12-01",
        "proveedorId": 1,
        "proveedorNombre": "Quimtec S.A.",
        "producto": "Ácido cítrico anhidro",
        "grado": "Food Grade",
        "cantidad": "25000.000",
        "precio": "1.1800",
        "moneda": "EUR",
        "incoterm": "CIF",
        "muestra": false,
        "tipo": "Contrato",
        "documentacion": true,
        "observaciones": null
    }
]
```

### GET /api/ofertas/{id} — Ver una

**Respuesta 200** — misma estructura

### POST /api/ofertas — Crear

```js
await authFetch(`${API}/ofertas`, {
    method: "POST",
    body: JSON.stringify({
        proveedorId: 3, // obligatorio
        fecha: "2026-04-01",
        producto: "Lecitina de soja HALAL",
        grado: "Food Grade", // Food Grade | Feed Grade | Reach
        cantidad: "10000",
        precio: "3.65",
        moneda: "EUR", // EUR | USD
        incoterm: "CFR", // EXW | CIF | CIP | CFR
        muestra: false,
        tipo: "Contrato", // Contrato | Pedido
        documentacion: true,
        observaciones: null,
    }),
});
```

**Respuesta 201** — objeto oferta creado

### PATCH /api/ofertas/{id} — Editar

Envía solo los campos a modificar. **Respuesta 200**

### DELETE /api/ofertas/{id} — Eliminar

**Respuesta 204** — sin contenido

---

## 8. Muestras — /api/muestras

### GET /api/muestras — Listar todas

**Respuesta 200**

```json
[
    {
        "id": 1,
        "fecha": "2025-11-10",
        "proveedorId": 1,
        "proveedorNombre": "Quimtec S.A.",
        "estado": "Análisis",
        "idLote": "LOT-2025-QT-001",
        "producto": "Ácido cítrico anhidro",
        "grado": "FOOD",
        "documentacion": true,
        "observaciones": null,
        "usuarioId": 2,
        "usuarioNombre": "María García"
    }
]
```

### GET /api/muestras/{id} — Ver una

**Respuesta 200** — misma estructura

### POST /api/muestras — Crear

```js
await authFetch(`${API}/muestras`, {
    method: "POST",
    body: JSON.stringify({
        proveedorId: 1, // obligatorio
        usuarioId: 2, // opcional
        fecha: "2026-04-15",
        estado: "Pendiente", // Compra | Análisis | Pendiente
        idLote: "LOT-2026-001",
        producto: "Ácido cítrico anhidro",
        grado: "FOOD", // BIO | HALAL | KOSHER | FOOD
        documentacion: false,
        observaciones: "Primera muestra del lote",
    }),
});
```

**Respuesta 201** — objeto muestra creado

### PATCH /api/muestras/{id} — Editar

```js
await authFetch(`${API}/muestras/3`, {
    method: "PATCH",
    body: JSON.stringify({ estado: "Análisis", usuarioId: 3 }),
});
```

**Respuesta 200** — objeto muestra actualizado

### DELETE /api/muestras/{id} — Eliminar

**Respuesta 204** — sin contenido

---

## 9. Resumen de endpoints

| Método   | Endpoint                  | Auth | Descripción          |
| -------- | ------------------------- | ---- | -------------------- |
| `POST`   | `/api/login`              | No   | Obtener token JWT    |
| `GET`    | `/api/me`                 | Sí   | Usuario autenticado  |
| `GET`    | `/api/usuarios`           | Sí   | Listar usuarios      |
| `GET`    | `/api/usuarios/{id}`      | Sí   | Ver usuario          |
| `POST`   | `/api/usuarios`           | Sí   | Crear usuario        |
| `PATCH`  | `/api/usuarios/{id}`      | Sí   | Editar usuario       |
| `DELETE` | `/api/usuarios/{id}`      | Sí   | Eliminar usuario     |
| `GET`    | `/api/proveedores`        | Sí   | Listar proveedores   |
| `GET`    | `/api/proveedores/{id}`   | Sí   | Ver proveedor        |
| `POST`   | `/api/proveedores`        | Sí   | Crear proveedor      |
| `PATCH`  | `/api/proveedores/{id}`   | Sí   | Editar proveedor     |
| `DELETE` | `/api/proveedores/{id}`   | Sí   | Eliminar proveedor   |
| `GET`    | `/api/contratos`          | Sí   | Listar contratos     |
| `GET`    | `/api/contratos/{id}`     | Sí   | Ver contrato         |
| `POST`   | `/api/contratos`          | Sí   | Crear contrato       |
| `PATCH`  | `/api/contratos/{id}`     | Sí   | Editar contrato      |
| `DELETE` | `/api/contratos/{id}`     | Sí   | Eliminar contrato    |
| `GET`    | `/api/importaciones`      | Sí   | Listar importaciones |
| `GET`    | `/api/importaciones/{id}` | Sí   | Ver importación      |
| `POST`   | `/api/importaciones`      | Sí   | Crear importación    |
| `PATCH`  | `/api/importaciones/{id}` | Sí   | Editar importación   |
| `DELETE` | `/api/importaciones/{id}` | Sí   | Eliminar importación |
| `GET`    | `/api/ofertas`            | Sí   | Listar ofertas       |
| `GET`    | `/api/ofertas/{id}`       | Sí   | Ver oferta           |
| `POST`   | `/api/ofertas`            | Sí   | Crear oferta         |
| `PATCH`  | `/api/ofertas/{id}`       | Sí   | Editar oferta        |
| `DELETE` | `/api/ofertas/{id}`       | Sí   | Eliminar oferta      |
| `GET`    | `/api/muestras`           | Sí   | Listar muestras      |
| `GET`    | `/api/muestras/{id}`      | Sí   | Ver muestra          |
| `POST`   | `/api/muestras`           | Sí   | Crear muestra        |
| `PATCH`  | `/api/muestras/{id}`      | Sí   | Editar muestra       |
| `DELETE` | `/api/muestras/{id}`      | Sí   | Eliminar muestra     |

---

## 10. Códigos de respuesta

| Código | Significado                                       |
| ------ | ------------------------------------------------- |
| `200`  | OK — operación completada                         |
| `201`  | Created — recurso creado correctamente            |
| `204`  | No Content — eliminado correctamente              |
| `400`  | Bad Request — falta un campo obligatorio          |
| `401`  | Unauthorized — token inválido, expirado o ausente |
| `404`  | Not Found — el recurso con ese ID no existe       |

---

## 11. Usuarios de prueba

> Disponibles tras ejecutar `php bin/console app:load-sample-data` en el servidor.

| Email              | Password   | Tipo       | Roles                                   |
| ------------------ | ---------- | ---------- | --------------------------------------- |
| `admin@srm.local`  | `admin123` | superadmin | ROLE_SUPER_ADMIN, ROLE_ADMIN, ROLE_USER |
| `maria@srm.local`  | `admin123` | admin      | ROLE_ADMIN, ROLE_USER                   |
| `carlos@srm.local` | `user123`  | normal     | ROLE_USER                               |

---

## 12. Notas importantes

- **Fechas** — siempre en formato `YYYY-MM-DD` (string)
- **Números decimales** — se devuelven como string (`"1.2500"`), envíalos como string o number
- **Relaciones** — los endpoints devuelven tanto el ID como el nombre del recurso relacionado (`proveedorId` + `proveedorNombre`, `usuarioId` + `usuarioNombre`)
- **PATCH vs PUT** — ambos funcionan, pero se recomienda `PATCH` enviando solo los campos a cambiar
- **Token JWT** — tiene una caducidad (1 hora por defecto). Si recibes un 401 en una ruta protegida, vuelve a hacer login
- **CORS** — el servidor acepta peticiones desde `localhost` en cualquier puerto durante el desarrollo
