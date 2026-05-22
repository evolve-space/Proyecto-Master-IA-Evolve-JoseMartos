# SRM Compras — API Reference

**URL base (desarrollo):** `http://127.0.0.1:8000`  
**Formato:** todos los endpoints aceptan y devuelven `application/json`

---

## Autenticación (JWT)

La API usa **JSON Web Tokens**. El flujo es:

1. Hacer `POST /api/login` con email y password → recibes un `token`
2. En todas las demás peticiones incluir la cabecera:
    ```
    Authorization: Bearer <token>
    ```

El único endpoint público (sin token) es `POST /api/login`.

---

### POST /api/login

Obtiene el token de acceso.

**Body**

```json
{
    "email": "superadmin@srm.local",
    "password": "superadmin""
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

Devuelve los datos del usuario autenticado.

**Respuesta 200**

```json
{
    "id": 1,
    "nombre": "Admin Principal",
    "email": "superadmin@srm.local",
    "tipo": "superadmin",
    "roles": ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_USER"]
}
```

> **Valores de `tipo`:** `superadmin` | `admin` | `normal`

---

## Usuarios — /api/usuarios

### GET /api/usuarios

**Respuesta 200**

```json
[
    {
        "id": 1,
        "nombre": "Admin Principal",
        "email": "superadmin@srm.local",
        "tipo": "superadmin"
    },
    {
        "id": 2,
        "nombre": "Maria Garcia",
        "email": "maria@srm.local",
        "tipo": "admin"
    },
    {
        "id": 3,
        "nombre": "Carlos Lopez",
        "email": "carlos@srm.local",
        "tipo": "normal"
    }
]
```

### GET /api/usuarios/{id}

**Respuesta 200** — objeto usuario (misma estructura que el listado)

### POST /api/usuarios

**Body**

```json
{
    "nombre": "Nuevo Usuario",
    "email": "nuevo@srm.local",
    "password": "secreto123",
    "tipo": "normal"
}
```

> Todos los campos son **obligatorios**. `email` debe ser unico.
> `tipo`: `superadmin` | `admin` | `normal`

**Respuesta 201** — objeto usuario creado (sin campo `password`)

### PATCH /api/usuarios/{id}

Envia solo los campos que quieres modificar.

```json
{ "tipo": "admin" }
```

```json
{ "password": "nuevo_secreto" }
```

**Respuesta 200** — objeto usuario actualizado

### DELETE /api/usuarios/{id}

**Respuesta 204** — sin contenido

---

## Proveedores — /api/proveedores

### GET /api/proveedores

**Respuesta 200**

```json
[
    {
        "id": 1,
        "nombre": "Quimtec S.A.",
        "cifNif": "A12345678",
        "telefono": "+34 91 234 5678",
        "web": "www.quimtec.es",
        "actividad": "Quimica industrial",
        "direccionFacturacion": "Calle Mayor 10, 28001 Madrid",
        "tipo": "Fabricante",
        "certificaciones": "BIO, HALAL",
        "contactoPrincipal": "Juan Perez",
        "formaPago": 30,
        "email": "compras@quimtec.es",
        "movil": "+34 600 111 222",
        "incoterm": "CIF",
        "documentacion": true,
        "observaciones": null
    }
]
```

### GET /api/proveedores/{id}

**Respuesta 200** — objeto proveedor (misma estructura)

### POST /api/proveedores

**Body**

```json
{
    "nombre": "Nuevo Proveedor S.L.",
    "cifNif": "B11223344",
    "telefono": "+34 93 000 0000",
    "web": "www.ejemplo.com",
    "actividad": "Alimentacion",
    "direccionFacturacion": "Calle Test 1, Barcelona",
    "tipo": "Fabricante",
    "certificaciones": "FOOD",
    "contactoPrincipal": "Nombre Apellido",
    "formaPago": 60,
    "email": "info@ejemplo.com",
    "movil": "+34 600 000 000",
    "incoterm": "EXW",
    "documentacion": true,
    "observaciones": null
}
```

> Campo **obligatorio**: `nombre`
> `tipo`: `Fabricante` | `Distribuidor`
> `formaPago`: `30` | `60` | `75` (dias)
> `incoterm`: `EXW` | `CIF` | `CIP` | `CFR`

**Respuesta 201** — objeto proveedor creado

### PATCH /api/proveedores/{id}

```json
{ "telefono": "+34 91 999 9999", "formaPago": 30 }
```

**Respuesta 200** — objeto proveedor actualizado

### DELETE /api/proveedores/{id}

**Respuesta 204** — sin contenido

---

## Contratos — /api/contratos

### GET /api/contratos

**Respuesta 200**

```json
[
    {
        "id": 1,
        "fecha": "2025-01-15",
        "numeroContrato": "CONT-2025-001",
        "producto": "Acido citrico anhidro",
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

### GET /api/contratos/{id}

**Respuesta 200** — objeto contrato (misma estructura)

### POST /api/contratos

**Body**

```json
{
    "proveedorId": 1,
    "fecha": "2026-01-01",
    "numeroContrato": "CONT-2026-001",
    "producto": "Lecitina de soja",
    "precio": "3.80",
    "grado": "HALAL",
    "cantidad": "20000",
    "cantidadPedida": "0",
    "cantidadPendiente": "20000",
    "fechaCaducidad": "2027-01-01",
    "documentacion": false,
    "observaciones": null
}
```

> Campo **obligatorio**: `proveedorId`
> `grado`: `BIO` | `HALAL` | `KOSHER` | `FOOD`
> Fechas en formato `YYYY-MM-DD`

**Respuesta 201** — objeto contrato creado

### PATCH /api/contratos/{id}

```json
{ "cantidadPedida": "10000", "cantidadPendiente": "10000" }
```

**Respuesta 200** — objeto contrato actualizado

### DELETE /api/contratos/{id}

**Respuesta 204** — sin contenido

---

## Importaciones — /api/importaciones

### GET /api/importaciones

**Respuesta 200**

```json
[
    {
        "id": 1,
        "fechaDuaAlbaran": "2025-02-10",
        "fechaFactura": "2025-02-08",
        "proveedorId": 1,
        "proveedorNombre": "Quimtec S.A.",
        "producto": "Acido citrico anhidro",
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

### GET /api/importaciones/{id}

**Respuesta 200** — objeto importacion (misma estructura)

### POST /api/importaciones

**Body**

```json
{
    "proveedorId": 2,
    "fechaDuaAlbaran": "2026-03-10",
    "fechaFactura": "2026-03-08",
    "producto": "Extracto de vainilla BIO",
    "cantidad": "500",
    "importeEur": "22500.00",
    "aranceles": "0.00",
    "costeDespacho": "380.00",
    "gastoImpKg": "0.76",
    "costeKg": "45.76",
    "importeUsd": "24412.50",
    "tipoCambio": "1.0850",
    "forwarderer": "DHL Global",
    "incoterm": "EXW",
    "documentacion": true,
    "observaciones": null
}
```

> Campo **obligatorio**: `proveedorId`
> `incoterm`: `EXW` | `CIF` | `CIP` | `CFR`

**Respuesta 201** — objeto importacion creado

### PATCH /api/importaciones/{id}

Envia solo los campos a modificar. **Respuesta 200**

### DELETE /api/importaciones/{id}

**Respuesta 204** — sin contenido

---

## Ofertas — /api/ofertas

### GET /api/ofertas

**Respuesta 200**

```json
[
    {
        "id": 1,
        "fecha": "2025-12-01",
        "proveedorId": 1,
        "proveedorNombre": "Quimtec S.A.",
        "producto": "Acido citrico anhidro",
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

### GET /api/ofertas/{id}

**Respuesta 200** — objeto oferta (misma estructura)

### POST /api/ofertas

**Body**

```json
{
    "proveedorId": 3,
    "fecha": "2026-04-01",
    "producto": "Lecitina de soja HALAL",
    "grado": "Food Grade",
    "cantidad": "10000",
    "precio": "3.65",
    "moneda": "EUR",
    "incoterm": "CFR",
    "muestra": false,
    "tipo": "Contrato",
    "documentacion": true,
    "observaciones": null
}
```

> Campo **obligatorio**: `proveedorId`
> `grado`: `Food Grade` | `Feed Grade` | `Reach`
> `moneda`: `EUR` | `USD`
> `incoterm`: `EXW` | `CIF` | `CIP` | `CFR`
> `tipo`: `Contrato` | `Pedido`

**Respuesta 201** — objeto oferta creado

### PATCH /api/ofertas/{id}

Envia solo los campos a modificar. **Respuesta 200**

### DELETE /api/ofertas/{id}

**Respuesta 204** — sin contenido

---

## Muestras — /api/muestras

### GET /api/muestras

**Respuesta 200**

```json
[
    {
        "id": 1,
        "fecha": "2025-11-10",
        "proveedorId": 1,
        "proveedorNombre": "Quimtec S.A.",
        "estado": "Analisis",
        "idLote": "LOT-2025-QT-001",
        "producto": "Acido citrico anhidro",
        "grado": "FOOD",
        "documentacion": true,
        "observaciones": null,
        "usuarioId": 2,
        "usuarioNombre": "Maria Garcia"
    }
]
```

### GET /api/muestras/{id}

**Respuesta 200** — objeto muestra (misma estructura)

### POST /api/muestras

**Body**

```json
{
    "proveedorId": 1,
    "usuarioId": 2,
    "fecha": "2026-04-15",
    "estado": "Pendiente",
    "idLote": "LOT-2026-001",
    "producto": "Acido citrico anhidro",
    "grado": "FOOD",
    "documentacion": false,
    "observaciones": "Primera muestra del lote"
}
```

> Campo **obligatorio**: `proveedorId`
> `usuarioId`: opcional
> `estado`: `Compra` | `Analisis` | `Pendiente`
> `grado`: `BIO` | `HALAL` | `KOSHER` | `FOOD`

**Respuesta 201** — objeto muestra creado

### PATCH /api/muestras/{id}

```json
{ "estado": "Analisis", "usuarioId": 3 }
```

**Respuesta 200** — objeto muestra actualizado

### DELETE /api/muestras/{id}

**Respuesta 204** — sin contenido

---

## Codigos de respuesta

| Codigo | Significado                              |
| ------ | ---------------------------------------- |
| `200`  | OK — operacion completada                |
| `201`  | Created — recurso creado                 |
| `204`  | No Content — eliminado correctamente     |
| `400`  | Bad Request — faltan campos obligatorios |
| `401`  | Unauthorized — token invalido o ausente  |
| `404`  | Not Found — recurso no encontrado        |

---

## Resumen de endpoints

| Metodo   | Endpoint                  | Descripcion                     |
| -------- | ------------------------- | ------------------------------- |
| `POST`   | `/api/login`              | **Publico** — obtener token JWT |
| `GET`    | `/api/me`                 | Usuario autenticado             |
| `GET`    | `/api/usuarios`           | Listar usuarios                 |
| `GET`    | `/api/usuarios/{id}`      | Ver usuario                     |
| `POST`   | `/api/usuarios`           | Crear usuario                   |
| `PATCH`  | `/api/usuarios/{id}`      | Editar usuario                  |
| `DELETE` | `/api/usuarios/{id}`      | Eliminar usuario                |
| `GET`    | `/api/proveedores`        | Listar proveedores              |
| `GET`    | `/api/proveedores/{id}`   | Ver proveedor                   |
| `POST`   | `/api/proveedores`        | Crear proveedor                 |
| `PATCH`  | `/api/proveedores/{id}`   | Editar proveedor                |
| `DELETE` | `/api/proveedores/{id}`   | Eliminar proveedor              |
| `GET`    | `/api/contratos`          | Listar contratos                |
| `GET`    | `/api/contratos/{id}`     | Ver contrato                    |
| `POST`   | `/api/contratos`          | Crear contrato                  |
| `PATCH`  | `/api/contratos/{id}`     | Editar contrato                 |
| `DELETE` | `/api/contratos/{id}`     | Eliminar contrato               |
| `GET`    | `/api/importaciones`      | Listar importaciones            |
| `GET`    | `/api/importaciones/{id}` | Ver importacion                 |
| `POST`   | `/api/importaciones`      | Crear importacion               |
| `PATCH`  | `/api/importaciones/{id}` | Editar importacion              |
| `DELETE` | `/api/importaciones/{id}` | Eliminar importacion            |
| `GET`    | `/api/ofertas`            | Listar ofertas                  |
| `GET`    | `/api/ofertas/{id}`       | Ver oferta                      |
| `POST`   | `/api/ofertas`            | Crear oferta                    |
| `PATCH`  | `/api/ofertas/{id}`       | Editar oferta                   |
| `DELETE` | `/api/ofertas/{id}`       | Eliminar oferta                 |
| `GET`    | `/api/muestras`           | Listar muestras                 |
| `GET`    | `/api/muestras/{id}`      | Ver muestra                     |
| `POST`   | `/api/muestras`           | Crear muestra                   |
| `PATCH`  | `/api/muestras/{id}`      | Editar muestra                  |
| `DELETE` | `/api/muestras/{id}`      | Eliminar muestra                |

---

## Ejemplo de integracion React

```js
const API = "http://localhost:8000/api";

// 1. Login y guardar token
const { token } = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        email: "superadmin@srm.local",
        password: "superadmin",
    }),
}).then((r) => r.json());

localStorage.setItem("token", token);

// 2. Helper para peticiones autenticadas
const authFetch = (url, opts = {}) =>
    fetch(url, {
        ...opts,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...opts.headers,
        },
    });

// 3. Obtener usuario actual
const me = await authFetch(`${API}/me`).then((r) => r.json());

// 4. Listar proveedores
const proveedores = await authFetch(`${API}/proveedores`).then((r) => r.json());

// 5. Crear un contrato
const nuevoContrato = await authFetch(`${API}/contratos`, {
    method: "POST",
    body: JSON.stringify({
        proveedorId: 1,
        numeroContrato: "CONT-2026-005",
        producto: "Glucosa en polvo",
        precio: "2.20",
        grado: "FOOD",
        cantidad: "10000",
        cantidadPedida: "0",
        cantidadPendiente: "10000",
        fechaCaducidad: "2027-06-01",
        documentacion: true,
    }),
}).then((r) => r.json());

// 6. Actualizar estado de una muestra
await authFetch(`${API}/muestras/3`, {
    method: "PATCH",
    body: JSON.stringify({ estado: "Compra" }),
});

// 7. Eliminar una oferta
await authFetch(`${API}/ofertas/2`, { method: "DELETE" });
```

---

## Usuarios de prueba

> Disponibles tras ejecutar `php bin/console app:load-sample-data` en el servidor.

| Email                  | Password     | Tipo       |
| ---------------------- | ------------ | ---------- |
| `superadmin@srm.local` | `superadmin` | superadmin |
| `maria@srm.local`      | `admin123`   | admin      |
| `carlos@srm.local`     | `user123`    | normal     |

---

## CORS

El backend acepta peticiones del frontend en `localhost` (cualquier puerto) por defecto en desarrollo.
Para produccion, ajustar la variable `CORS_ALLOW_ORIGIN` en el servidor.
