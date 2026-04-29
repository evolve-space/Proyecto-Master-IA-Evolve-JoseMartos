# ProcureFlow — Frontend

Dashboard de gestión de compras y proveedores construido con **React 19**, **Vite 8** y **Tailwind CSS v4**.

---

## Stack

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

## Instalación y arranque

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

Otros comandos:

```bash
npm run build    # Compilar para producción
npm run preview  # Previsualizar el build
npm run lint     # Ejecutar ESLint
```

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
