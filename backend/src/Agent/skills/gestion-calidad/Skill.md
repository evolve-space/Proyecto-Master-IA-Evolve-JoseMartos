---
name: gestion-calidad
description: Audita el estado del pipeline de muestras. Detecta muestras pendientes de análisis, lotes sin documentación, proveedores sin muestra reciente y bloqueos que impiden avanzar a orden de compra.
agente: iris
---

# Skill: Gestión de Calidad (Pipeline de Muestras)

## Qué hace

Iris activa esta skill cuando el usuario pide una revisión del estado de calidad o del pipeline de muestras.

1. Llama a `list_muestras` para obtener todas las muestras.
2. Clasifica por estado:
    - **Pendiente:** solicitud enviada, sin resultado aún.
    - **Análisis:** en laboratorio, pendiente de validar.
    - **Compra:** aprobada y lista para orden de compra.
3. Detecta y señala:
    - Muestras en **Análisis** con más de 15 días sin actualizar → posible retraso.
    - Muestras con `documentacion: false` → bloqueo para avanzar a compra.
    - Proveedores sin ninguna muestra en estado **Compra** → sin producto validado.
4. Cruza con `list_proveedores` para completar nombres si solo hay IDs.

## Cuándo activar

- "¿qué muestras están pendientes de análisis?"
- "¿hay muestras bloqueadas por documentación?"
- "¿qué proveedores tienen productos validados para compra?"
- "¿cuántas muestras tenemos en cada estado?"
- "revísame el estado de calidad"

## Formato de respuesta

Resumen inicial: `X pendientes / Y en análisis / Z aprobadas`. Luego lista detallada agrupada por estado. Alertas al final en negrita: bloqueos, retrasos o proveedores sin producto validado.
