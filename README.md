# ProcureFlow — SRM de Compras

> **Supplier Relationship Management** para departamentos de compras en materias primas (industria química y alimentaria). Centraliza ofertas, contratos, muestras, importaciones, proveedores, correo y calendario, con asistente IA integrado.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Symfony](https://img.shields.io/badge/Symfony-7.4-000000?logo=symfony&logoColor=white)

---

## Índice

1. [Descripción general](#descripción-general)
2. [Arranque rápido](#arranque-rápido)
3. [Módulos y funcionalidades](#módulos-y-funcionalidades)
4. [Fichas de detalle](#fichas-de-detalle)
5. [Correos y Outlook](#correos-y-outlook)
6. [Calendario](#calendario)
7. [Dashboard](#dashboard)
8. [Uso de la inteligencia artificial](#uso-de-la-inteligencia-artificial)
9. [Roles y permisos](#roles-y-permisos)
10. [Arquitectura](#arquitectura)
11. [Variables de entorno](#variables-de-entorno)
12. [Documentación adicional](#documentación-adicional)

---

## Descripción general

ProcureFlow digitaliza el flujo de trabajo de un departamento de compras que antes dependía de hojas de cálculo y correo disperso. La aplicación ofrece:

- **CRUD completo** de entidades de negocio (ofertas, contratos, muestras, importaciones, proveedores).
- **Integración con Microsoft Outlook** (correo y calendario vía Microsoft Graph).
- **Clasificación automática de correos** (reglas + OpenAI) con vinculación a entidades.
- **Fichas de detalle a pantalla completa** con timeline de actividad (correos y eventos).
- **Asistente conversacional multiagente** que consulta y opera sobre datos reales del sistema.
- **Dashboard analítico** con KPIs, gráficos y alertas.

```
Usuario (navegador)
       │
       ▼
┌──────────────────┐     JWT      ┌─────────────────────────────┐
│  React + Vite    │ ◄──────────► │  Symfony API (puerto 8000)  │
│  puerto 5173     │   /api/*     │  MySQL + Doctrine           │
└──────────────────┘              │  OpenAI + Microsoft Graph   │
                                  └─────────────────────────────┘
```

---

## Arranque rápido

### Requisitos

| Herramienta | Versión |
|-------------|---------|
| Node.js     | 18+     |
| PHP         | 8.2+    |
| Composer    | 2+      |
| MySQL       | 8+      |

El backend debe estar en `../../backend/srm-compras-backend` respecto a esta carpeta.

### Un solo comando (recomendado)

```bash
cd srm-compras-front
npm install
npm run dev:stack
```

- **API:** http://127.0.0.1:8000  
- **Frontend:** http://localhost:5173  

### Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev:stack` | API Symfony + frontend Vite |
| `npm run dev` | Solo frontend (API ya debe estar corriendo) |
| `npm run api` | Solo API |
| `npm run api:stop` | Detiene Symfony/PHP en el puerto 8000 |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |

### Credenciales de demo

```
Usuario:  superadmin
Password: superadmin
```

> El backend debe estar activo antes de iniciar sesión.

Más detalles de desarrollo local en [LEEME-DEV.md](./LEEME-DEV.md).

---

## Módulos y funcionalidades

### Inicio (Dashboard)

Vista principal con resumen operativo:

- Tarjetas KPI: ofertas, contratos activos, muestras en análisis, importaciones del año, gasto total.
- Gráficos: importaciones mensuales (barras) y distribución de muestras por estado (donut).
- **Salud de proveedores:** documentación incompleta, contratos próximos a vencer.
- **Alertas de calendario:** eventos relevantes vinculados a entidades.
- **Actividad reciente:** últimas ofertas (clic → ficha de detalle).

---

### Ofertas (`/ofertas`)

Gestión de cotizaciones de proveedores.

| Campo clave | Descripción |
|-------------|-------------|
| Producto, grado, cantidad, precio | Datos comerciales |
| Moneda (EUR/USD), incoterm | Condiciones |
| Tipo (Contrato / Pedido) | Naturaleza de la oferta |
| Muestra solicitada | Flag de seguimiento |
| Documentación | Completa / pendiente |

**Acciones:** crear, editar, eliminar, **Ver detalle** (ficha), filtros y búsqueda.

---

### Contratos (`/contratos`)

Seguimiento de acuerdos marco y contratos de compra.

| Campo clave | Descripción |
|-------------|-------------|
| Número de contrato, producto | Identificación |
| Precio, cantidad total / pedida / pendiente | Volumen y economía |
| Fecha y caducidad | Vigencia (alertas si caduca en &lt; 30 días) |
| Documentación | Estado documental |

**Acciones:** CRUD, **Ver detalle**, alertas de caducidad en dashboard.

---

### Muestras (`/muestras`)

Ciclo de vida de muestras de producto.

| Estado | Significado |
|--------|-------------|
| Pendiente | Recibida, sin análisis |
| Análisis | En laboratorio / evaluación |
| Compra | Aprobada para compra |

Incluye lote, responsable, grado (Food Grade, Feed Grade, Reach…) y vinculación a proveedor.

**Acciones:** CRUD, **Ver detalle**, cambio de estado.

---

### Importaciones (`/importaciones`)

Registro de operaciones de importación y costes.

| Campo clave | Descripción |
|-------------|-------------|
| Producto, cantidad (kg), importe EUR/USD | Datos de la operación |
| DUA / albarán, forwarder, incoterm | Logística y aduanas |
| Aranceles, despacho, tipo de cambio | Costes |
| Coste/kg, gasto imp./kg | Métricas calculadas |

**Acciones:** CRUD, **Ver detalle**, generación de PDF de importación.

---

### Proveedores (`/proveedores`)

Ficha maestra de proveedores.

| Campo clave | Descripción |
|-------------|-------------|
| CIF/NIF, tipo (Fabricante/Distribuidor) | Identificación |
| Certificaciones (BIO, HALAL, KOSHER…) | Calidad |
| Incoterm, forma de pago, contacto | Condiciones comerciales |
| Documentación | Completa / pendiente |

**Acciones:** CRUD, **Ver detalle** con timeline completo (correos, eventos, ofertas, muestras, contratos, importaciones) y filtros por tipo de actividad.

---

### Correos (`/correos`)

Bandeja integrada con Microsoft Outlook.

- Conexión OAuth a cuenta Outlook (Microsoft Graph).
- Sincronización de bandeja, lectura de cuerpo HTML/texto y adjuntos.
- Categorías personalizables y filtros por estado, categoría y urgencia.
- **Clasificación automática** al importar o bajo demanda (ver [IA en correos](#2-clasificación-automática-de-correos)).
- Enlaces a entidades vinculadas (proveedor, oferta, contrato, muestra, importación).
- Acciones desde el correo: **crear oferta** o **crear muestra** pre-rellenados desde el email.
- Redactar, responder, responder a todos, adjuntar archivos.

---

### Calendario (`/calendario`)

Vista mensual de eventos locales y de Outlook.

- Crear, editar y eliminar eventos.
- Categorías con colores (sincronizadas conceptualmente con categorías de correo).
- Vinculación a proveedor y entidades de negocio.
- Publicación opcional en Outlook al crear/editar.
- Importación desde Outlook; hereda clasificación del correo vinculado si existe.
- Urgencia y categoría visibles en el evento.

---

### Usuarios (`/usuarios`) — solo superadmin

Gestión de cuentas del sistema con roles `superadmin`, `admin` y `normal`.

---

### Chat flotante (todas las páginas)

Burbuja de asistente IA accesible desde cualquier pantalla. Ver [Asistente multiagente](#1-asistente-conversacional-multiagente).

---

## Fichas de detalle

Cada entidad principal tiene una vista **a pantalla completa** accesible desde **Ver detalle** en las listas o haciendo clic en el nombre/producto/número.

| Ruta | Entidad |
|------|---------|
| `/ofertas/:id` | Oferta |
| `/contratos/:id` | Contrato |
| `/muestras/:id` | Muestra |
| `/importaciones/:id` | Importación |
| `/proveedores/:id` | Proveedor |

### Estructura de la ficha

```
┌─────────────────────────────────────────────────────────────┐
│  ← Volver                              [ Editar ]           │
├─────────────────────────────────────────────────────────────┤
│  Cabecera: título, badges, métricas destacadas, stats       │
├──────────────────────────┬──────────────────────────────────┤
│  Información             │  Actividad relacionada           │
│  (campos, proveedor)     │  (timeline correos + eventos)    │
│                          │  [filtros en proveedor]          │
└──────────────────────────┴──────────────────────────────────┘
```

- **Editar:** abre un modal con el mismo formulario que en la lista; al guardar, la ficha se recarga.
- **Timeline:** correos y eventos de calendario vinculados, ordenados por fecha.
- **Proveedor:** timeline ampliado con ofertas, muestras, contratos e importaciones; filtros por tipo.

### API de fichas

```
GET /api/ofertas/{id}/ficha
GET /api/contratos/{id}/ficha
GET /api/muestras/{id}/ficha
GET /api/importaciones/{id}/ficha
GET /api/proveedores/{id}/timeline?type=email|event|oferta|...
```

Respuesta típica:

```json
{
  "entity": { "...": "..." },
  "stats": { "emails": 3, "eventos": 1 },
  "items": [ { "type": "email", "date": "...", "title": "..." } ]
}
```

---

## Correos y Outlook

### Flujo de conexión

1. En **Correos → Conectar Outlook**, se inicia OAuth con Microsoft.
2. Tras autorizar, el backend guarda tokens y sincroniza la bandeja.
3. Los correos se almacenan en la BD local y se pueden clasificar y vincular.

### Sincronización

- **Manual:** botón de sincronizar en la bandeja (`POST /api/emails/sync`).
- **Al importar:** se ejecuta clasificación automática (reglas + IA si hace falta).

### Acciones desde correo

| Acción | Endpoint |
|--------|----------|
| Clasificar uno | `POST /api/emails/{id}/classify` |
| Clasificar pendientes | `POST /api/emails/classify-pending` |
| Crear oferta | `POST /api/emails/{id}/ofertas` |
| Crear muestra | `POST /api/emails/{id}/muestras` |
| Responder | `POST /api/emails/{id}/reply` |
| Enviar nuevo | `POST /api/outlook/send` |

---

## Calendario

- Eventos **locales** (siempre disponibles) y eventos **Outlook** (si hay conexión).
- Al crear un evento desde un correo, hereda categoría, urgencia y vínculos de la clasificación del email.
- Colores por categoría; vista mensual con detalle en modal.
- Sincronización bidireccional opcional con Outlook al crear/editar/eliminar.

---

## Dashboard

Datos agregados en cliente a partir de los listados de cada módulo, más:

```
GET /api/dashboard/alerts
```

Devuelve alertas estructuradas (contratos por vencer, muestras pendientes, proveedores con documentación incompleta, eventos de calendario relevantes).

---

## Uso de la inteligencia artificial

La IA se usa en **dos capas independientes**, ambas en el backend con **OpenAI**.

### Variables necesarias (backend `.env`)

```env
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
```

Sin `OPENAI_API_KEY`, el chat muestra un aviso y la clasificación de correos funciona **solo con reglas**.

---

### 1. Asistente conversacional multiagente

**Endpoint:** `POST /api/chat`  
**UI:** burbuja de chat flotante (esquina inferior).

#### Cómo funciona

```
Mensaje del usuario
       │
       ▼
┌──────────────────┐
│  Orquestador     │  ← OpenAI clasifica intención (carmen, rafa, noa, iris, alex)
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Agente          │  ← Bucle function calling (máx. 6 iteraciones)
│  especialista    │     Consulta API interna con el JWT del usuario
└────────┬─────────┘
         ▼
   Respuesta en lenguaje natural
```

#### Agentes disponibles

| Agente | ID | Dominio | Quién puede usarlo |
|--------|-----|---------|-------------------|
| **SRM** | `default` | Orquestador / bienvenida | Todos |
| **Carmen** | `carmen` | Proveedores y contratos | Todos |
| **Rafa** | `rafa` | Ofertas y pedidos | Todos |
| **Noa** | `noa` | Importaciones y logística | Todos |
| **Iris** | `iris` | Muestras y calidad | Todos |
| **Alex** | `alex` | Usuarios y administración | Solo admin / superadmin |

#### Qué puede hacer el chat

- **Consultar** datos reales: listar, filtrar, comparar ofertas, ver contratos que caducan, etc.
- **Operar** (según rol): crear o editar registros; las acciones destructivas piden confirmación.
- **Acciones especiales en frontend:** por ejemplo, generar PDF de importación desde Noa.
- **Contexto de sesión:** envía `currentPage`, rol e historial reciente para respuestas más precisas.

#### Ejemplos de uso

```
«¿Qué contratos caducan este mes?»
«Compara ofertas de ácido cítrico»
«Muestras en análisis del proveedor Quimtec»
«Genera el PDF de la importación #3»
«Lista los usuarios admin»          ← solo admin/superadmin
```

#### Seguridad

- Todas las peticiones llevan el **JWT del usuario**; los agentes solo ven lo que permite su rol.
- Alex rechaza peticiones de usuarios `normal`.
- El historial se guarda en `localStorage` por usuario mientras el navegador está abierto.

Documentación de diseño del sistema multiagente: [agents/AGENTS.md](./agents/AGENTS.md) y `backend/srm-compras-backend/PROYECTO.md`.

---

### 2. Clasificación automática de correos

**Servicio:** `EmailClassificationService` (backend)

Se ejecuta automáticamente al sincronizar/importar correos y manualmente desde la UI de Correos.

#### Pipeline híbrido (reglas + IA)

```
Correo entrante
      │
      ▼
┌─────────────┐     confianza ≥ 0.72
│  Reglas     │ ──────────────────────► Aplicar resultado
│  (keywords) │
└──────┬──────┘
       │ confianza < 0.72
       ▼
┌─────────────┐     confianza ≥ 0.65
│  OpenAI     │ ──────────────────────► Aplicar resultado
│  (JSON)     │
└──────┬──────┘
       │ fallback
       ▼
   Mejor resultado entre reglas e IA
```

#### Qué detecta

| Salida | Valores |
|--------|---------|
| **Tipo de entidad** | `proveedor`, `importacion`, `muestra`, `oferta`, `contrato`, `general` |
| **ID de entidad** | Match por número (#3), producto, lote, nº contrato o contexto BD |
| **Urgencia** | `baja`, `normal`, `alta` |
| **Categoría** | Urgente, Importación, Muestras, Ofertas, Contratos, Proveedores… |

#### Reglas (sin IA)

- Palabras clave por dominio (DUA, muestra, cotización, contrato…).
- Detección de urgencia (urgente, ASAP, sin prisa…).
- Resolución de ID por patrones `oferta #12`, producto en texto, lote, número de contrato.

#### IA (OpenAI)

- Prompt estructurado que pide **solo JSON**.
- Contexto con IDs reales recientes de la BD (importaciones, muestras, ofertas, contratos).
- Temperatura 0, máx. 200 tokens por clasificación.
- Si falla la API → degradación elegante a reglas.

#### Efectos en la UI

- Badge de **urgencia** en la lista de correos.
- **Categoría** asignada automáticamente.
- **Enlaces** a la ficha de la entidad vinculada.
- La clasificación se **propaga al calendario** cuando un evento se crea desde un correo.

#### Botones en Correos

| Botón | Acción |
|-------|--------|
| Clasificar (correo abierto) | `POST /api/emails/{id}/classify` (fuerza re-clasificación) |
| Clasificar pendientes | `POST /api/emails/classify-pending` (todos sin clasificar) |

---

## Roles y permisos

| Rol | Acceso |
|-----|--------|
| `superadmin` | Todo, incluida gestión de usuarios y agente Alex |
| `admin` | CRUD en módulos de negocio; sin usuarios |
| `normal` | Lectura en la mayoría de módulos; el chat no puede usar Alex ni operaciones de escritura restringidas |

Rutas protegidas con JWT (`ProtectedRoute`). `/usuarios` exige `SuperAdminRoute`.

---

## Arquitectura

### Repositorio

```
srm-compras/
├── frontend/srm-compras-front/   ← este proyecto (React 19 + Vite 8 + Tailwind v4)
└── backend/srm-compras-backend/    ← Symfony 7.4 + PHP 8.2 + Doctrine
```

### Frontend (`src/`)

```
src/
├── app/                    # AuthContext, router, providers
├── components/
│   ├── ficha/              # EntityFichaView, timeline, modales de edición
│   ├── layout/             # MainLayout, Sidebar, Header
│   └── ui/                 # Modal, ChatBubble, FAB
├── features/               # Un módulo por carpeta
│   ├── auth/
│   ├── dashboard/
│   ├── ofertas/
│   ├── contratos/
│   ├── muestras/
│   ├── importaciones/
│   ├── proveedores/
│   ├── emails/
│   ├── calendario/
│   ├── usuarios/
│   └── chat/               # Servicio del asistente IA
└── services/
    └── apiClient.js        # Cliente HTTP con JWT
```

Cada feature sigue: `pages/` + `components/` + `services/`.

### Stack

| Capa | Tecnología |
|------|------------|
| UI | React 19, React Router 7, Tailwind CSS v4 |
| Bundler | Vite 8 |
| API | Symfony 7.4, Doctrine ORM, MySQL |
| Auth | JWT (`lexik/jwt-authentication-bundle`) |
| Correo/Calendario | Microsoft Graph OAuth |
| IA | OpenAI API (`gpt-4o-mini` por defecto) |

---

## Variables de entorno

### Frontend (`.env` / `.env.development`)

```env
VITE_API_URL=http://127.0.0.1:8000/api
# En desarrollo con proxy Vite: VITE_API_URL=/api
```

### Backend (`.env.local`)

```env
# Base de datos
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/srm_compras"

# JWT
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=...

# OpenAI (chat + clasificación de correos)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# Microsoft Graph / Outlook (opcional)
MS_GRAPH_CLIENT_ID=...
MS_GRAPH_CLIENT_SECRET=...
MS_GRAPH_REDIRECT_URI=http://localhost:8000/api/outlook/oauth/callback
MS_GRAPH_FRONTEND_URL=http://localhost:5173
MS_GRAPH_OAUTH_TENANT=common
MS_GRAPH_MAILBOX_USER=correo@empresa.com
```

---

## Documentación adicional

| Archivo | Contenido |
|---------|-----------|
| [LEEME-DEV.md](./LEEME-DEV.md) | Desarrollo local, `dev:stack`, rutas del backend |
| [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) | Referencia de API REST para integración |
| [agents/AGENTS.md](./agents/AGENTS.md) | Diseño del sistema multiagente |
| `backend/.../PROYECTO.md` | Arquitectura del chat y agentes en Symfony |

---

## Licencia

MIT © 2025–2026
