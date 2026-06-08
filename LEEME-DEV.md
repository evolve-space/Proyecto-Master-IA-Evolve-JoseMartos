# Desarrollo local

## Un solo comando (recomendado)

Desde **esta carpeta** (`srm-compras-front`):

```bash
npm run dev:stack
```

Arranca la API Symfony en `backend/srm-compras-backend` y el frontend Vite.

## Comandos por separado

| Comando | Qué hace |
|---------|----------|
| `npm run api` | Solo API en http://127.0.0.1:8000 (siempre desde el backend) |
| `npm run api:stop` | Para Symfony / PHP del puerto 8000 |
| `npm run dev` | Solo frontend (necesitas API ya corriendo) |

## No hagas esto

- **No** ejecutes `symfony server:start` dentro de `srm-compras-front` (no hay `public/index.php` → 404).
- El backend está en: `../../backend/srm-compras-backend`

## Workspace multi-carpeta

Abre `srm-compras.code-workspace` (carpeta raíz del repo) para ver frontend y backend juntos.
