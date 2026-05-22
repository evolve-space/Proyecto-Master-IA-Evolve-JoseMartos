# AGENTS.md

Roster de agentes del sistema multiagente SRM Compras. Cada agente es especialista en un dominio de la API REST y responde desde el chat flotante del frontend.

## Arquitectura de enrutamiento

El Orquestador analiza la intención del usuario y delega al agente correcto:

- Proveedor, contrato, vigencia, CIF → `carmen`
- Oferta, cotización, precio, pedido → `rafa`
- Importación, DUA, arancel, flete → `noa`
- Muestra, lote, análisis, BIO, HALAL → `iris`
- Usuario, rol, permiso (solo admin/superadmin) → `alex`
- Dashboard, KPIs, resumen general → multi-agente paralelo

## Agentes registrados

Todos los agentes tienen carpeta propia con `IDENTITY.md` y `SOUL.md`.

| Agente                       | Identificador | Dominio                                                         |
| ---------------------------- | ------------- | --------------------------------------------------------------- |
| [Carmen](Carmen/IDENTITY.md) | `carmen`      | Proveedores (`/api/proveedores`) & Contratos (`/api/contratos`) |
| [Rafa](Rafa/IDENTITY.md)     | `rafa`        | Ofertas (`/api/ofertas`)                                        |
| [Noa](Noa/IDENTITY.md)       | `noa`         | Importaciones (`/api/importaciones`) & Logística                |
| [Iris](Iris/IDENTITY.md)     | `iris`        | Muestras (`/api/muestras`) & Control de Calidad                 |
| [Alex](Alex/IDENTITY.md)     | `alex`        | Usuarios (`/api/usuarios`) — solo admin/superadmin              |

## Añadir nuevos agentes

Crear carpeta `agents/<Nombre>/` con `IDENTITY.md` y `SOUL.md`.
Registrar la clase PHP en `src/Agent/<Nombre>Agent.php` con el tag `app.agent`.
Añadir una fila al índice anterior.
