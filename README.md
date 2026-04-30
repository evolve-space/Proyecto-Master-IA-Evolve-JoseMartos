# ProcureFlow — Frontend

Dashboard de gestión de compras y proveedores construido con **React 19**, **Vite 8** y **Tailwind CSS v4**.

---

## Requisitos previos

Antes de clonar el proyecto, asegúrate de tener instalado lo siguiente en tu máquina:

| Herramienta | Versión mínima | Verificar con   | Descargar en               |
| ----------- | -------------- | --------------- | -------------------------- |
| Node.js     | 18+            | `node -v`       | https://nodejs.org         |
| npm         | 9+             | `npm -v`        | Viene incluido con Node.js |
| Git         | cualquiera     | `git --version` | https://git-scm.com        |

> Si usas **nvm** puedes ejecutar `nvm use 20` para asegurarte de utilizar una versión compatible.

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/<usuario>/<repositorio>.git
cd srm-compras-front
```

> Sustituye `<usuario>/<repositorio>` por la ruta real del repo en GitHub.

---

## 2. Instalar dependencias

```bash
npm install
```

Esto descargará todos los paquetes definidos en `package.json`. No necesitas instalar nada de forma global.

---

## 3. Configurar variables de entorno

El proyecto requiere un archivo `.env` en la raíz para conectarse al backend.

Crea el archivo copiando el ejemplo:

```bash
# Windows (CMD)
copy .env.example .env

# Windows (PowerShell) / macOS / Linux
cp .env.example .env
```

> Si no existe `.env.example`, crea el archivo `.env` manualmente con el siguiente contenido:

```env
# URL base del backend
VITE_API_URL=http://localhost:8000/api
```

Ajusta el valor de `VITE_API_URL` a la dirección donde esté corriendo el servidor backend.

---

## 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en **http://localhost:5173**.

El servidor tiene recarga en caliente (HMR), por lo que cualquier cambio en el código se refleja automáticamente en el navegador sin necesidad de reiniciar.

---

## Otros comandos disponibles

```bash
npm run build    # Genera el bundle optimizado para producción en /dist
npm run preview  # Levanta un servidor local para previsualizar el build de producción
npm run lint     # Ejecuta ESLint para detectar problemas en el código
```

---

## Stack tecnológico

| Tecnología        | Versión | Rol                                  |
| ----------------- | ------- | ------------------------------------ |
| React             | 19      | UI                                   |
| Vite              | 8       | Bundler / Dev server                 |
| Tailwind CSS      | 4       | Estilos (utility-first)              |
| @tailwindcss/vite | 4       | Plugin oficial de Tailwind para Vite |
| React Router DOM  | 7       | Enrutamiento                         |
| Material Symbols  | CDN     | Iconografía (Google Fonts)           |
| Manrope           | CDN     | Tipografía principal                 |

---

## Solución de problemas comunes

**`npm install` falla con errores de permisos (Windows)**
Abre la terminal como Administrador o usa `npm install --legacy-peer-deps`.

**La app carga pero no trae datos del backend**
Verifica que el valor de `VITE_API_URL` en tu `.env` apunte al backend correcto y que ese servidor esté activo.

**Puerto 5173 ocupado**
Vite asignará automáticamente el siguiente puerto libre. También puedes forzar uno distinto ejecutando `npm run dev -- --port 3000`.

**Cambios en `.env` no se reflejan**
Las variables de entorno se leen al arrancar. Reinicia el servidor de desarrollo con `Ctrl + C` y vuelve a ejecutar `npm run dev`.

---

## Estructura de carpetas

```
src/
├── main.jsx                        # Punto de entrada; importa tailwind.css
├── App.jsx                         # Renderiza <Providers />
├── app/
│   ├── providers.jsx               # Wrapper de providers globales (Redux, React Query…)
│   ├── router.jsx                  # createBrowserRouter con todas las rutas
│   └── store.js                    # Configuración de Redux (si aplica)
├── styles/
│   ├── tailwind.css                # @import "tailwindcss" + @theme con todos los tokens
│   └── base/                       # Variables, reset y tipografía legacy (no usados activamente)
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx             # Drawer fijo con navegación y widget de soporte
│   │   ├── Header.jsx              # Barra superior: título, buscador y perfil de usuario
│   │   └── MainLayout.jsx          # Combina Sidebar + Header + <main>{children}</main>
│   └── ui/
│       └── FloatingActionButton.jsx # Botón flotante (+) reutilizable
├── features/
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── SummaryCards.jsx    # Bento grid con 4 KPIs (Orders, Approvals, Spend, Quotes)
│   │   │   ├── RecentActivity.jsx  # Tabla de pedidos recientes con badge de estado
│   │   │   ├── ActionCard.jsx      # CTA "New Order" con fondo primario
│   │   │   ├── SupplierHealth.jsx  # Lista de salud de proveedores principales
│   │   │   └── SystemMessage.jsx   # Aviso informativo (audit report, etc.)
│   │   ├── hooks/                  # Hooks específicos del dashboard
│   │   ├── pages/
│   │   │   └── DashboardPage.jsx   # Página principal: ensambla todos los componentes
│   │   └── services/               # Llamadas API del dashboard
│   ├── pedidos/                    # Feature de pedidos (estructura espejo)
│   ├── productos/                  # Feature de productos (estructura espejo)
│   ├── proveedores/                # Feature de proveedores (estructura espejo)
│   └── usuarios/                  # Feature de usuarios (estructura espejo)
├── hooks/                          # Hooks globales compartidos
├── services/
│   ├── apiClient.js                # Cliente HTTP base (axios / fetch configurado)
│   └── endpoints/                  # Endpoints por recurso
└── utils/                          # Utilidades genéricas
```

---

## Sistema de diseño (Tailwind @theme)

Los tokens del diseño están definidos en `src/styles/tailwind.css` dentro del bloque `@theme` y se consumen directamente como clases de Tailwind.

### Paleta de colores principal

| Token                 | Valor     | Uso                               |
| --------------------- | --------- | --------------------------------- |
| `primary`             | `#276c00` | Acciones principales, botones CTA |
| `primary-container`   | `#62c234` | Fondos de iconos, badges          |
| `secondary`           | `#655880` | Elementos secundarios             |
| `secondary-container` | `#e0d0ff` | Fondos secundarios                |
| `tertiary`            | `#656100` | Alertas y estados de atención     |
| `error`               | `#ba1a1a` | Estados de error                  |
| `background`          | `#fafaf3` | Fondo global                      |
| `surface`             | `#fafaf3` | Superficies de tarjetas           |
| `on-surface`          | `#1a1c18` | Texto sobre superficies           |

### Tipografía

Escala tipográfica basada en **Manrope**:

| Clase           | Tamaño | Peso | Uso                      |
| --------------- | ------ | ---- | ------------------------ |
| `text-h1`       | 40px   | 700  | Títulos de página        |
| `text-h2`       | 32px   | 700  | KPIs y valores numéricos |
| `text-h3`       | 24px   | 600  | Títulos de sección       |
| `text-body-lg`  | 18px   | 400  | Párrafos grandes         |
| `text-body-md`  | 16px   | 400  | Cuerpo de texto          |
| `text-body-sm`  | 14px   | 400  | Texto de apoyo           |
| `text-label-md` | 14px   | 600  | Etiquetas y navegación   |
| `text-label-sm` | 12px   | 700  | Badges y micro-labels    |

### Espaciado personalizado

| Token                      | Valor |
| -------------------------- | ----- |
| `spacing-xs`               | 4px   |
| `spacing-sm`               | 8px   |
| `spacing-md`               | 16px  |
| `spacing-lg`               | 24px  |
| `spacing-xl`               | 32px  |
| `spacing-gutter`           | 24px  |
| `spacing-container-margin` | 40px  |

---

## Convenciones

- **Feature-based architecture**: cada módulo (`dashboard`, `pedidos`, etc.) tiene su propia carpeta con `components/`, `hooks/`, `pages/` y `services/`.
- **Componentes de layout** en `src/components/layout/`, **componentes UI genéricos** en `src/components/ui/`.
- Los estilos se escriben como **clases de Tailwind** directamente en JSX. No se crean archivos `.css` por componente salvo que sea estrictamente necesario.
- Los **tokens de diseño** se definen una sola vez en `tailwind.css` y se reutilizan en toda la app.
- **Rutas** declaradas en `src/app/router.jsx`. Cada feature expone su `Page` y `MainLayout` actúa de wrapper.
