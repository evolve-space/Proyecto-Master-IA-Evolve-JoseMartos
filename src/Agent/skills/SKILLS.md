# SKILLS.md — SRM Compras

Índice de skills del sistema multiagente. Cada skill define un comportamiento complejo que va más allá de un CRUD simple: implica varias llamadas a herramientas, análisis y un formato de respuesta específico.

El agente carga la skill automáticamente cuando detecta la intención en el mensaje. También se puede activar explícitamente mencionando el nombre.

## Skills disponibles

| Skill                     | Archivo                                                            | Agente | Dominio                                                             |
| ------------------------- | ------------------------------------------------------------------ | ------ | ------------------------------------------------------------------- |
| Análisis de Importaciones | [analisis-importaciones/Skill.md](analisis-importaciones/Skill.md) | Noa    | Comparativa de costes reales, coste/kg, aranceles, tipo de cambio   |
| Revisión de Contratos     | [revision-contratos/Skill.md](revision-contratos/Skill.md)         | Carmen | Estado de vigencia, cantidades pendientes, alertas de vencimiento   |
| Comparativa de Ofertas    | [comparativa-ofertas/Skill.md](comparativa-ofertas/Skill.md)       | Rafa   | Comparar precios y condiciones entre proveedores para un producto   |
| Trazabilidad de Producto  | [trazabilidad-producto/Skill.md](trazabilidad-producto/Skill.md)   | Noa    | Ciclo completo: oferta → contrato → importación → muestra           |
| Gestión de Calidad        | [gestion-calidad/Skill.md](gestion-calidad/Skill.md)               | Iris   | Pipeline de muestras: pendientes, bloqueadas, aprobadas para compra |

## Cómo se usan

Las skills **no requieren activación manual**: el agente las ejecuta automáticamente cuando detecta la intención.

Para forzar una skill concretamente, basta con describir lo que hace:

- `"analiza los costes de todas las importaciones"` → Noa ejecuta **analisis-importaciones**
- `"revisa los contratos que están a punto de vencer"` → Carmen ejecuta **revision-contratos**
- `"compara las ofertas de ácido cítrico entre proveedores"` → Rafa ejecuta **comparativa-ofertas**
- `"traza el historial completo del ácido cítrico"` → Noa ejecuta **trazabilidad-producto**
- `"¿qué muestras están bloqueadas o pendientes de análisis?"` → Iris ejecuta **gestion-calidad**

Cada skill define una capacidad concreta: qué puede hacer Jeffrey en ese dominio, qué herramientas necesita y cómo activarla.

## Habilidades disponibles

Cada skill reside en su propio directorio con un archivo `Skill.md` que contiene el frontmatter YAML de activación y el cuerpo de instrucciones.

| Skill           | Ruta                                             | Dominio                                                                                                 |
| --------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Email           | [email/Skill.md](email/Skill.md)                 | Redacción, revisión y gestión de correos con Gmail                                                      |
| Calendario      | [calendar/Skill.md](calendar/Skill.md)           | Lectura, creación y gestión de eventos en Google Calendar                                               |
| Clase           | [clase/Skill.md](clase/Skill.md)                 | Preparación de sesiones, materiales y seguimiento del módulo de agentes                                 |
| Research        | [research/Skill.md](research/Skill.md)           | Búsqueda, síntesis y estructuración de información                                                      |
| Wiki            | [wiki/Skill.md](wiki/Skill.md)                   | Gestión del wiki de conocimiento en Obsidian                                                            |
| Consejo         | [consejo/Skill.md](consejo/Skill.md)             | Debate multi-agente secuencial con consenso y síntesis Opus                                             |
| Trim            | [trim/Skill.md](trim/Skill.md)                   | Salud de archivos base: detección de contenido extraíble y validación referencial                       |
| Bibliotecaria   | [bibliotecaria/Skill.md](bibliotecaria/Skill.md) | Interfaz completa con el vault de Obsidian — delega en `[DELEGATE:bibliotecaria]`                       |
| Crear Agente    | [crear-agente/Skill.md](crear-agente/Skill.md)   | Crea un agente nuevo completo a partir de nombre, funciones y jerarquía                                 |
| Project Manager | [pm/Skill.md](pm/Skill.md)                       | Gestión de proyectos y tareas en ClickUp — delega en Ricky con [DELEGATE:ricky]                         |
| Video           | [video/Skill.md](video/Skill.md)                 | Producción de vídeos MP4 para redes sociales con Hyperframes (horizontal y vertical)                    |
| Investigacion   | [investigacion/Skill.md](investigacion/Skill.md) | N investigadores paralelos e independientes exploran un tema con perspectivas distintas y síntesis Opus |

## Activación

Jeffrey activa una skill automáticamente cuando detecta el dominio de la tarea.
También se puede activar explícitamente: "usa la skill de email para esto".

## Añadir nuevas skills

Estructura requerida por skill:

```
skills/
  <nombre>/
    Skill.md       ← obligatorio, con frontmatter YAML
    REFERENCE.md   ← opcional, para información extensa
```

El frontmatter YAML de `Skill.md` debe incluir:

```yaml
---
name: Nombre legible (max 64 caracteres)
description: Cuándo activar esta skill — lo usa Claude para decidir (max 200 caracteres)
---
```

Añadir una fila a la tabla de arriba tras crear la skill.
