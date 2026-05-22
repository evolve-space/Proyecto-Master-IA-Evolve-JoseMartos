# ProcureFlow — SRM de Compras

> **Supplier Relationship Management** — aplicación web full-stack para la gestión integral de compras, proveedores y operaciones de importación en el sector de materias primas (industria química/alimentaria).

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Symfony](https://img.shields.io/badge/Symfony-7.4-000000?logo=symfony&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white)
![License](https://img.shields.io/badge/licencia-MIT-green)

---

## Descripción

ProcureFlow es un **panel de control para departamentos de compras** que centraliza el seguimiento de ofertas, contratos, muestras de producto, importaciones y proveedores en una sola interfaz. Incluye un sistema de autenticación basado en JWT con tres niveles de rol y un dashboard analítico en tiempo real.

El proyecto nació de la necesidad real de digitalizar flujos de trabajo manuales (hojas de cálculo, emails) en una empresa importadora de ingredientes químicos y alimentarios.

---

## Características principales

### Dashboard analítico

- KPIs en tiempo real: total de kg importados en el año, importe acumulado en €, contratos activos, muestras en análisis.
- Gráfico de importaciones mensuales (barras) y distribución de muestras por estado (donut).
- Panel de alertas inteligente: contratos próximos a vencer (< 30 días), muestras pendientes de revisión y proveedores con documentación incompleta.
- Actividad reciente con las últimas ofertas registradas.

### Módulos de gestión (CRUD completo)

| Módulo            | Descripción                                                                         |
| ----------------- | ----------------------------------------------------------------------------------- |
| **Ofertas**       | Registro de cotizaciones de proveedores con precio, cantidad, grado y estado        |
| **Contratos**     | Seguimiento de contratos de compra, cantidades pedidas/pendientes y caducidad       |
| **Muestras**      | Control del ciclo de vida de muestras: Pendiente → Análisis → Aprobada/Rechazada    |
| **Importaciones** | Registro de importaciones con número DUA/albarán, kg, importe y documentación       |
| **Proveedores**   | Ficha completa: CIF, certificaciones (BIO, HALAL, KOSHER), incoterm, forma de pago  |
| **Usuarios**      | Gestión de cuentas con roles: `superadmin`, `admin`, `normal`                       |

### Autenticación y seguridad

- Login con JWT almacenado en `localStorage`.
- Rutas protegidas con `ProtectedRoute` / `PublicRoute`.
- Validación del token en cada carga con `GET /api/me` — logout automático si el token expira.

---

## Arquitectura del sistema

```
srm-compras/
├── frontend/srm-compras-front/   # React 19 + Vite 8 + Tailwind v4
└── backend/srm-compras-backend/  # Symfony 7.4 + PHP 8.2 + Doctrine ORM
```

El frontend consume la API REST del backend mediante `fetch` con cabeceras JWT. La comunicación es 100% JSON bajo el prefijo `/api/`.

---

## Stack tecnológico

### Frontend

| Tecnología          | Versión | Rol                                  |
| ------------------- | ------- | ------------------------------------ |
| React               | 19      | UI                                   |
| Vite                | 8       | Bundler / Dev server                 |
| Tailwind CSS        | v4      | Estilos (utility-first)              |
| @tailwindcss/vite   | v4      | Plugin oficial de Tailwind para Vite |
| React Router DOM    | v7      | Enrutamiento SPA                     |
| Material Symbols    | CDN     | Iconografía                          |
| Manrope             | CDN     | Tipografía principal                 |

### Backend

| Tecnología                         | Versión | Rol                              |
| ---------------------------------- | ------- | -------------------------------- |
| PHP                                | 8.2     | Lenguaje del servidor            |
| Symfony                            | 7.4     | Framework                        |
| Doctrine ORM                       | 3.x     | Mapeo objeto-relacional          |
| MySQL                              | —       | Base de datos relacional         |
| lexik/jwt-authentication-bundle    | 3.x     | Autenticación JWT                |
| nelmio/cors-bundle                 | 2.x     | Gestión de CORS                  |
| Doctrine Migrations                | 3.x     | Versionado del esquema de BD     |
| Docker                             | —       | Contenedorización                |

---

## Instalación

### Requisitos previos

| Herramienta | Versión mínima |
| ----------- | -------------- |
| Node.js     | 18+            |
| npm         | 9+             |
| PHP         | 8.2+           |
| Composer    | 2+             |
| MySQL       | 8+             |
| Git         | cualquiera     |

---

### Frontend

```bash
# 1. Clonar e instalar
git clone https://github.com/<usuario>/srm-compras-front.git
cd srm-compras-front
npm install

# 2. Crear el archivo de entorno
echo "VITE_API_URL=http://127.0.0.1:8000/api" > .env

# 3. Arrancar en desarrollo
npm run dev
# → http://localhost:5173
```

**Scripts disponibles**

| Comando           | Descripción                               |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con HMR            |
| `npm run build`   | Bundle de producción en `/dist`           |
| `npm run preview` | Previsualiza el build de producción       |
| `npm run lint`    | Analiza el código con ESLint              |

---

### Backend

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/<usuario>/srm-compras-backend.git
cd srm-compras-backend
composer install

# 2. Configurar entorno
cp .env .env.local
# Edita .env.local y ajusta DATABASE_URL y JWT_SECRET_KEY
```

**Variables de entorno clave (`.env.local`)**

```env
DATABASE_URL="mysql://usuario:contraseña@127.0.0.1:3306/srm_compras"
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=tu_passphrase
```

```bash
# 3. Generar claves JWT
php bin/console lexik:jwt:generate-keypair

# 4. Crear la base de datos y ejecutar migraciones
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate

# 5. Arrancar el servidor de desarrollo
symfony server:start
# → http://127.0.0.1:8000

# O con el servidor integrado de PHP:
php -S 127.0.0.1:8000 -t public
```

#### Docker

El backend incluye un `Dockerfile` listo para producción:

```bash
docker build -t srm-backend .
docker run -p 8000:8000 -e DATABASE_URL="..." -e PORT=8000 srm-backend
```

El contenedor ejecuta automáticamente `cache:warmup` y las migraciones al arrancar.

---

## Estructura del proyecto

### Frontend (`src/`)

```
src/
├── app/
│   ├── AuthContext.jsx     # Contexto global de auth (token, user, login, logout)
│   ├── providers.jsx       # Wrapper de providers globales
│   └── router.jsx          # createBrowserRouter con rutas protegidas y públicas
├── components/
│   ├── layout/             # MainLayout, Header, Sidebar
│   └── ui/                 # Modal, FloatingActionButton
├── features/               # Arquitectura feature-based
│   ├── auth/               # LoginPage
│   ├── dashboard/          # KPIs, gráficos, alertas
│   ├── ofertas/
│   ├── contratos/
│   ├── muestras/
│   ├── importaciones/
│   ├── proveedores/
│   └── usuarios/
├── services/
│   └── apiClient.js        # Cliente HTTP base con JWT
└── styles/
    └── tailwind.css        # @theme con tokens de diseño
```

Cada feature sigue la estructura `pages/` + `components/` + `hooks/` + `services/`.

### Backend (`src/`)

```
src/
├── Controller/
│   ├── AuthController.php          # POST /api/login, GET /api/me
│   ├── UsuarioController.php       # CRUD /api/usuarios
│   ├── ProveedorController.php     # CRUD /api/proveedores
│   ├── ContratoController.php      # CRUD /api/contratos
│   ├── MuestraController.php       # CRUD /api/muestras
│   ├── OfertaController.php        # CRUD /api/ofertas
│   └── ImportacionController.php   # CRUD /api/importaciones
├── Entity/
│   ├── Usuario.php
│   ├── Proveedor.php
│   ├── Contrato.php
│   ├── Muestra.php
│   ├── Oferta.php
│   └── Importacion.php
└── Repository/                     # Repositorios Doctrine por entidad
```

---

## API REST — Referencia rápida

**URL base:** `http://127.0.0.1:8000/api`  
**Autenticación:** todas las rutas (excepto `/api/login`) requieren `Authorization: Bearer <token>`

### Autenticación

```
POST /api/login   →  { token: "..." }
GET  /api/me      →  { id, nombre, email, tipo, roles }
```

### Recursos

| Recurso          | Endpoints                                    |
| ---------------- | -------------------------------------------- |
| Usuarios         | `GET /api/usuarios` · `GET /{id}` · `POST` · `PATCH /{id}` · `DELETE /{id}` |
| Proveedores      | `GET /api/proveedores` · `GET /{id}` · `POST` · `PATCH /{id}` · `DELETE /{id}` |
| Contratos        | `GET /api/contratos` · `GET /{id}` · `POST` · `PATCH /{id}` · `DELETE /{id}` |
| Muestras         | `GET /api/muestras` · `GET /{id}` · `POST` · `PATCH /{id}` · `DELETE /{id}` |
| Ofertas          | `GET /api/ofertas` · `GET /{id}` · `POST` · `PATCH /{id}` · `DELETE /{id}` |
| Importaciones    | `GET /api/importaciones` · `GET /{id}` · `POST` · `PATCH /{id}` · `DELETE /{id}` |

### Roles de usuario

| Tipo         | Permisos                                  |
| ------------ | ----------------------------------------- |
| `superadmin` | Acceso total, gestión de usuarios         |
| `admin`      | CRUD en todos los módulos excepto usuarios |
| `normal`     | Solo lectura                              |

---

## Credenciales de demo

```
Email:    admin@srm.local
Password: admin123
```

> Asegúrate de tener el servidor backend activo antes de iniciar sesión.

---

## Decisiones de diseño

- **Feature-based architecture**: cada módulo de negocio es autocontenido, evitando el acoplamiento entre features.
- **Contexto de autenticación global**: `AuthContext` expone `token`, `user`, `login` y `logout` sin librerías de estado externas.
- **Tailwind v4 con Vite plugin**: integración sin archivo de configuración separado, usando `@tailwindcss/vite` directamente.
- **Alertas reactivas en el dashboard**: calculadas en el cliente a partir de los datos de todos los módulos, sin endpoint dedicado.
- **PATCH en lugar de PUT**: el backend acepta actualizaciones parciales, el frontend solo envía los campos modificados.
- **Migraciones versionadas**: el esquema de base de datos evoluciona mediante Doctrine Migrations, facilitando el despliegue en CI/CD.

---

## Licencia

MIT © 2025
