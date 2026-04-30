# SRM Compras — Backend API

API REST construida con **Symfony 7** + **Doctrine ORM**.  
URL base en desarrollo: `http://127.0.0.1:8000`

---

## Requisitos previos

| Herramienta | Versión mínima | Descarga                                   |
| ----------- | -------------- | ------------------------------------------ |
| PHP         | 8.2            | https://www.php.net/downloads              |
| Composer    | 2.x            | https://getcomposer.org                    |
| MySQL       | 8.0            | https://dev.mysql.com/downloads/ (o XAMPP) |
| Symfony CLI | última         | https://symfony.com/download               |

> Si usas **XAMPP**, asegúrate de que el servicio MySQL esté activo antes de continuar.

---

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd srm-compras-backend
```

### 2. Instalar dependencias PHP

```bash
composer install
```

### 3. Configurar variables de entorno

Copia el fichero de entorno y edítalo con tus credenciales:

```bash
cp .env .env.local
```

Abre `.env.local` y ajusta la línea de la base de datos:

```env
# MySQL sin contraseña (XAMPP por defecto)
DATABASE_URL="mysql://root:@127.0.0.1:3306/srm_compras?serverVersion=8.0&charset=utf8mb4"

# MySQL con contraseña
DATABASE_URL="mysql://root:TU_CONTRASEÑA@127.0.0.1:3306/srm_compras?serverVersion=8.0&charset=utf8mb4"
```

También configura el origen CORS si vas a conectar un frontend:

```env
# Permite cualquier puerto local (desarrollo)
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
```

### 4. Crear la base de datos

```bash
php bin/console doctrine:database:create
```

### 5. Ejecutar las migraciones

Esto crea todas las tablas necesarias:

```bash
php bin/console doctrine:migrations:migrate
```

Confirma con `yes` cuando lo solicite.

### 6. (Opcional) Cargar datos de muestra

Si quieres tener datos de prueba desde el primer momento (proveedores, contratos, importaciones, ofertas, muestras y usuarios de ejemplo):

```bash
php bin/console app:load-sample-data
```

### 7. Arrancar el servidor

Con Symfony CLI (recomendado):

```bash
symfony server:start
```

O con PHP integrado:

```bash
php -S 127.0.0.1:8000 -t public
```

El servidor quedará disponible en **http://127.0.0.1:8000**.

---

## Verificar que funciona

Una vez arrancado, comprueba que la API responde:

```bash
curl http://127.0.0.1:8000/api/proveedores
```

Debe devolver un array JSON (vacío `[]` si no cargaste datos de muestra, o con datos si ejecutaste el comando anterior).

---

## Resumen de comandos

```bash
composer install                            # instalar dependencias
php bin/console doctrine:database:create    # crear base de datos
php bin/console doctrine:migrations:migrate # crear tablas
php bin/console app:load-sample-data        # (opcional) datos de prueba
symfony server:start                        # arrancar servidor
```

---

---

## Configuración CORS

En el fichero `.env` ajusta el origen permitido para que coincida con la URL de tu frontend React:

```env
# Desarrollo local (cualquier puerto)
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'

# Producción (sustituye por tu dominio)
# CORS_ALLOW_ORIGIN='^https://tu-dominio\.com$'
```

---

## Referencia de endpoints

Todos los endpoints devuelven y aceptan **JSON**. Incluye siempre la cabecera:

```
Content-Type: application/json
```

---

### Proveedores `/api/proveedores`

#### Listar todos

```http
GET /api/proveedores
```

**Respuesta `200`**

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

#### Obtener uno

```http
GET /api/proveedores/{id}
```

#### Crear

```http
POST /api/proveedores
```

**Body**

```json
{
    "nombre": "Nuevo Proveedor S.L.", // obligatorio
    "cifNif": "B11223344",
    "telefono": "+34 93 000 0000",
    "web": "www.ejemplo.com",
    "actividad": "Alimentación",
    "direccionFacturacion": "Calle Test 1, Barcelona",
    "tipo": "Fabricante", // Fabricante | Distribuidor
    "certificaciones": "FOOD",
    "contactoPrincipal": "Nombre Apellido",
    "formaPago": 60, // 30 | 60 | 75
    "email": "info@ejemplo.com",
    "movil": "+34 600 000 000",
    "incoterm": "EXW", // EXW | CIF | CIP | CFR
    "documentacion": true,
    "observaciones": "Notas opcionales"
}
```

**Respuesta `201`** — objeto proveedor creado.

#### Actualizar (envía solo los campos a modificar)

```http
PATCH /api/proveedores/{id}
```

```json
{ "telefono": "+34 91 999 9999", "formaPago": 30 }
```

#### Eliminar

```http
DELETE /api/proveedores/{id}
```

**Respuesta `204`** — sin contenido.

---

### Contratos `/api/contratos`

#### Listar todos

```http
GET /api/contratos
```

**Respuesta `200`**

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

#### Obtener uno

```http
GET /api/contratos/{id}
```

#### Crear

```http
POST /api/contratos
```

**Body**

```json
{
    "proveedorId": 1, // obligatorio
    "fecha": "2026-01-01",
    "numeroContrato": "CONT-2026-001",
    "producto": "Lecitina de soja",
    "precio": "3.80",
    "grado": "HALAL", // BIO | HALAL | KOSHER | FOOD
    "cantidad": "20000",
    "cantidadPedida": "0",
    "cantidadPendiente": "20000",
    "fechaCaducidad": "2027-01-01",
    "documentacion": false,
    "observaciones": null
}
```

#### Actualizar

```http
PATCH /api/contratos/{id}
```

```json
{ "cantidadPedida": "10000", "cantidadPendiente": "10000" }
```

#### Eliminar

```http
DELETE /api/contratos/{id}
```

---

### Importaciones `/api/importaciones`

#### Listar todas

```http
GET /api/importaciones
```

**Respuesta `200`**

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

#### Obtener una

```http
GET /api/importaciones/{id}
```

#### Crear

```http
POST /api/importaciones
```

**Body**

```json
{
    "proveedorId": 2, // obligatorio
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
    "incoterm": "EXW", // EXW | CIF | CIP | CFR
    "documentacion": true,
    "observaciones": null
}
```

#### Actualizar

```http
PATCH /api/importaciones/{id}
```

#### Eliminar

```http
DELETE /api/importaciones/{id}
```

---

### Ofertas `/api/ofertas`

#### Listar todas

```http
GET /api/ofertas
```

**Respuesta `200`**

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

#### Obtener una

```http
GET /api/ofertas/{id}
```

#### Crear

```http
POST /api/ofertas
```

**Body**

```json
{
    "proveedorId": 3, // obligatorio
    "fecha": "2026-04-01",
    "producto": "Lecitina de soja HALAL",
    "grado": "Food Grade", // Food Grade | Feed Grade | Reach
    "cantidad": "10000",
    "precio": "3.65",
    "moneda": "EUR", // EUR | USD
    "incoterm": "CFR",
    "muestra": false,
    "tipo": "Contrato", // Contrato | Pedido
    "documentacion": true,
    "observaciones": null
}
```

#### Actualizar

```http
PATCH /api/ofertas/{id}
```

#### Eliminar

```http
DELETE /api/ofertas/{id}
```

---

### Muestras `/api/muestras`

#### Listar todas

```http
GET /api/muestras
```

**Respuesta `200`**

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

#### Obtener una

```http
GET /api/muestras/{id}
```

#### Crear

```http
POST /api/muestras
```

**Body**

```json
{
    "proveedorId": 1, // obligatorio
    "usuarioId": 2, // opcional
    "fecha": "2026-04-15",
    "estado": "Pendiente", // Compra | Análisis | Pendiente
    "idLote": "LOT-2026-001",
    "producto": "Ácido cítrico anhidro",
    "grado": "FOOD", // BIO | HALAL | KOSHER | FOOD
    "documentacion": false,
    "observaciones": "Primera muestra del lote"
}
```

#### Actualizar

```http
PATCH /api/muestras/{id}
```

```json
{ "estado": "Análisis", "usuarioId": 3 }
```

#### Eliminar

```http
DELETE /api/muestras/{id}
```

---

### Usuarios `/api/usuarios`

#### Listar todos

```http
GET /api/usuarios
```

**Respuesta `200`**

```json
[
    { "id": 1, "nombre": "Admin Principal", "tipo": "superadmin" },
    { "id": 2, "nombre": "María García", "tipo": "admin" },
    { "id": 3, "nombre": "Carlos López", "tipo": "normal" }
]
```

#### Obtener uno

```http
GET /api/usuarios/{id}
```

#### Crear

```http
POST /api/usuarios
```

**Body**

```json
{
    "nombre": "Nuevo Usuario", // obligatorio
    "tipo": "normal" // obligatorio: superadmin | admin | normal
}
```

#### Actualizar

```http
PATCH /api/usuarios/{id}
```

```json
{ "tipo": "admin" }
```

#### Eliminar

```http
DELETE /api/usuarios/{id}
```

---

## Códigos de respuesta

| Código | Significado                              |
| ------ | ---------------------------------------- |
| `200`  | OK — operación completada                |
| `201`  | Created — recurso creado                 |
| `204`  | No Content — eliminado correctamente     |
| `400`  | Bad Request — faltan campos obligatorios |
| `404`  | Not Found — recurso no encontrado        |

---

## Ejemplos con fetch (React)

```js
const API = "http://localhost:8000/api";

// Listar proveedores
const proveedores = await fetch(`${API}/proveedores`).then((r) => r.json());

// Crear un contrato
await fetch(`${API}/contratos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
});

// Actualizar estado de una muestra
await fetch(`${API}/muestras/3`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: "Compra" }),
});

// Eliminar una oferta
await fetch(`${API}/ofertas/2`, { method: "DELETE" });
```
