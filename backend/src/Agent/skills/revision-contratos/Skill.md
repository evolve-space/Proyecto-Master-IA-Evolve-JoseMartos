---
name: revision-contratos
description: Revisa el estado de todos los contratos activos. Detecta contratos próximos a vencer, con cantidades pendientes críticas o documentación incompleta, y prioriza las acciones a tomar.
agente: carmen
---

# Skill: Revisión de Contratos

## Qué hace

Carmen activa esta skill cuando el usuario pide una revisión o auditoría de contratos.

1. Llama a `list_contratos` para obtener todos los contratos.
2. Para cada contrato evalúa:
    - **Vigencia:** compara `fechaCaducidad` con la fecha actual. Marca como 🔴 si vence en menos de 30 días, 🟡 si vence en menos de 90 días, 🟢 si está vigente.
    - **Ejecución:** calcula `cantidadPendiente` como porcentaje de `cantidad` total. Alerta si queda más del 50% pendiente y la fecha de caducidad está próxima.
    - **Documentación:** señala los contratos con `documentacion: false`.
3. Agrupa por estado de urgencia y presenta primero los críticos.

## Cuándo activar

- "¿qué contratos están a punto de vencer?"
- "revísame el estado de los contratos"
- "¿qué contratos tienen documentación pendiente?"
- "¿cuánta cantidad queda por ejecutar en el contrato X?"
- "dame un resumen de contratos vigentes"

## Formato de respuesta

Lista ordenada por urgencia. Para cada contrato: número de contrato, proveedor, producto, fecha caducidad, cantidad pendiente, estado documentación. Primero los 🔴 críticos, luego 🟡 atentos, luego 🟢 OK.
