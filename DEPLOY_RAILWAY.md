# Despliegue en Railway — SRM Compras Backend

## Resumen

| Componente | Qué hace |
|------------|----------|
| `Dockerfile` | Imagen PHP 8.2 + Composer + extensiones MySQL |
| `bin/railway-start.sh` | Caché, migraciones y servidor HTTP |
| `public/router.php` | Enruta `/api/*` a Symfony (imprescindible para CORS) |
| `.env` | Valores por defecto (en git). Railway los sobreescribe |

## 1. Crear el servicio en Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Selecciona el repo `srm-compras-backend`
3. Railway detectará el `Dockerfile` automáticamente

## 2. Añadir MySQL

1. En el proyecto → **+ New** → **Database** → **MySQL**
2. Railway crea la BD y expone variables (`MYSQLHOST`, `MYSQLPORT`, etc.)

## 3. Variables de entorno del backend

En el servicio **backend** → **Variables**, añade:

### Obligatorias

| Variable | Valor |
|----------|-------|
| `APP_ENV` | `prod` |
| `APP_DEBUG` | `0` |
| `APP_SECRET` | cadena aleatoria larga (ej. `openssl rand -hex 32`) |
| `DATABASE_URL` | `${{MySQL.MYSQL_URL}}` |
| `DEFAULT_URI` | `https://TU-DOMINIO.up.railway.app` |

> En el servicio backend → Variables → **Add Reference** → elige tu MySQL → `MYSQL_URL`.
> En producción Symfony usa `DATABASE_URL`; en local sigue usando `DATABASE_HOST`, `DATABASE_PORT`, etc.

### JWT (ya incluidas en el repo)

| Variable | Valor |
|----------|-------|
| `JWT_SECRET_KEY` | `%kernel.project_dir%/config/jwt/private.pem` |
| `JWT_PUBLIC_KEY` | `%kernel.project_dir%/config/jwt/public.pem` |
| `JWT_PASSPHRASE` | *(dejar vacío)* |

### Outlook / Microsoft Graph (Conectar Outlook)

Necesarias para el botón **Conectar Outlook** en Correos. En local están en `.env.dev` / `.env.local`; **en Railway hay que añadirlas a mano** (no van en git).

| Variable | Valor en producción |
|----------|---------------------|
| `MS_GRAPH_CLIENT_ID` | Application (client) ID de Azure |
| `MS_GRAPH_CLIENT_SECRET` | Client secret de Azure |
| `MS_GRAPH_TENANT_ID` | Directory (tenant) ID de Azure |
| `MS_GRAPH_OAUTH_TENANT` | `common` (o tu tenant ID) |
| `MS_GRAPH_REDIRECT_URI` | Ver URI exacta abajo *(opcional si `DEFAULT_URI` ya apunta al backend)* |
| `MS_GRAPH_FRONTEND_URL` | `https://srm-compras-front.vercel.app` |

**URI exacta** (debe coincidir carácter a carácter en Azure y Railway):

```
https://srm-compras-backend-production.up.railway.app/api/outlook/oauth/callback
```

> Si en Railway sigue `http://localhost:8000/...` copiado del `.env.dev`, Microsoft devuelve `invalid_request: redirect_uri`.

Opcional (solo modo aplicación sin OAuth por usuario):

| Variable | Valor |
|----------|-------|
| `MS_GRAPH_MAILBOX_USER` | email del buzón M365 |

#### Azure Portal (obligatorio)

1. [Azure Portal](https://portal.azure.com) → **App registrations** → tu app (SRM-Outlook)
2. **Authentication** → **Add a platform** → **Web**
3. Añade esta Redirect URI (además de la de localhost si la usas en dev):
   ```
   https://srm-compras-backend-production.up.railway.app/api/outlook/oauth/callback
   ```
4. **Certificates & secrets** → copia el **Client secret** (o crea uno nuevo)
5. **Overview** → copia **Application ID** y **Directory ID**

Tras guardar variables en Railway → **Redeploy** del backend.

### Opcionales

| Variable | Para qué |
|----------|-----------|
| `OPENAI_API_KEY` | Agentes IA del chat |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `CORS_ALLOW_ORIGIN` | Solo si quieres restringir orígenes (por defecto acepta `*.vercel.app`) |

## 4. Dominio público

1. Servicio backend → **Settings** → **Networking** → **Generate Domain**
2. Copia la URL (ej. `https://srm-compras-backend-production.up.railway.app`)
3. Actualiza `DEFAULT_URI` con esa URL exacta

## 5. Vercel (frontend)

En Vercel → **Environment Variables**:

```
VITE_API_URL=https://srm-compras-backend-production.up.railway.app
```

*(Ajusta el nombre si tu front usa otro, ej. `VITE_BACKEND_URL`)*

Redeploy del front después de guardar.

### Fix 404 al recargar /login /correos (Vercel)

Vercel devuelve `404: NOT_FOUND` en rutas SPA (`/login`, `/correos`) si no hay rewrite a `index.html`.

En el repo **frontend**, crea `vercel.json` (plantilla en `vercel.json.example` de este repo):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Commit → push → redeploy Vercel.

El callback OAuth ya no redirige a `/correos` (404); usa una página HTML del backend y luego `/?outlook=connected`.

## 6. Comprobar que funciona

```bash
# Health check
curl https://TU-DOMINIO.up.railway.app/

# CORS preflight (debe devolver Access-Control-Allow-Origin)
curl -i -X OPTIONS https://TU-DOMINIO.up.railway.app/api/login \
  -H "Origin: https://srm-compras-front.vercel.app" \
  -H "Access-Control-Request-Method: POST"

# Login
curl -X POST https://TU-DOMINIO.up.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin","password":"superadmin"}'
```

Respuestas esperadas:
- `/` → `{"status":"ok","message":"SRM Compras API"}`
- OPTIONS → `200` con header `Access-Control-Allow-Origin`
- Login → `200` con `token` o `401` si no hay datos en BD

## 7. Cargar datos de prueba (primera vez)

En Railway → servicio backend → **Shell** (o Deploy Logs si hay consola):

```bash
php bin/console app:load-sample-data --env=prod
```

## Errores frecuentes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `502 Application failed to respond` | Migraciones/arranque falló | Revisa logs; confirma `DATABASE_URL` |
| CORS blocked en OPTIONS | Sin `public/router.php` | Asegúrate de tener el último deploy |
| `Invalid credentials` | BD vacía | `app:load-sample-data` |
| Fatal error `.env` | Deploy antiguo | Redeploy con el `.env` en el repo |
| `Falta MS_GRAPH_CLIENT_ID` | Variables Outlook no en Railway | Añade las `MS_GRAPH_*` (ver sección Outlook) |
| OAuth `invalid_request: redirect_uri` | Railway tiene `localhost` o URI distinta a Azure | Usa la URI exacta de arriba en **ambos** sitios |
| Vercel `404 NOT_FOUND` en `/login` o `/correos` | SPA sin `vercel.json` rewrites | Añade `vercel.json` en el frontend |
