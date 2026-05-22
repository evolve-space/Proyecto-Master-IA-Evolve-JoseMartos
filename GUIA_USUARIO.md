# Guía de Uso — Asistente IA de SRM Compras

## ¿Qué es el asistente?

El asistente de SRM Compras es un **sistema multiagente** integrado en el chat flotante del panel.
No es un chatbot genérico: **solo trabaja con los datos reales de tu empresa** y ejecuta operaciones directas sobre el sistema (consultar, crear, actualizar y, con confirmación, eliminar registros).

Cuando escribes una pregunta o instrucción, el **Orquestador** analiza la intención y delega automáticamente al agente especializado más adecuado. No necesitas elegir agente ni usar comandos especiales.

---

## ¿Cómo acceder?

El chat flotante está disponible en todas las pantallas del panel SRM Compras.
Haz clic en el icono de chat (esquina inferior derecha) para abrirlo.

> **Nota:** Debes tener sesión iniciada. El asistente usa tu JWT para acceder a la API con tus mismos permisos.

---

## Arquitectura del sistema

El asistente se compone de **tres capas** que trabajan en cadena:

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND — Chat flotante (React)                           │
│  Envía: message + history + context (página, rol)           │
└────────────────────────────┬────────────────────────────────┘
                             │ POST /api/chat
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  ORQUESTADOR — OrchestratorService                          │
│  Clasifica la intención → elige agente (carmen/rafa/…)      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  AGENTE — Carmen / Rafa / Noa / Iris / Alex                 │
│  Personalidad (IDENTITY + SOUL) + herramientas CRUD         │
│  Bucle OpenAI Function Calling (máx. 6 iteraciones)       │
└────────────────────────────┬────────────────────────────────┘
                             │ sub-requests internos
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  API REST — /api/proveedores, /api/ofertas, etc.            │
│  Datos reales en base de datos (MySQL / Doctrine)           │
└─────────────────────────────────────────────────────────────┘
```

### Componentes clave

| Componente | Ubicación | Función |
| ---------- | --------- | ------- |
| **Orquestador** | `src/Service/OrchestratorService.php` | Clasifica el mensaje con OpenAI y delega al agente correcto |
| **Agentes** | `src/Agent/*Agent.php` | Ejecutan herramientas contra la API y generan la respuesta |
| **Personalidad** | `src/Agent/agents/<Nombre>/` | `IDENTITY.md` (qué hace) + `SOUL.md` (cómo responde) |
| **Skills** | `src/Agent/skills/<nombre>/` | Procedimientos analíticos documentados (comparativas, auditorías, trazabilidad) |
| **Cliente API** | `src/Service/SrmApiClient.php` | Llama a la API **dentro del mismo proceso PHP** (sin HTTP a localhost) |

### Estructura de carpetas

```
src/Agent/
├── AbstractAgent.php          ← bucle agéntico compartido (OpenAI + tools)
├── AgentInterface.php         ← contrato común
├── CarmenAgent.php            ← proveedores y contratos
├── RafaAgent.php              ← ofertas
├── NoaAgent.php               ← importaciones
├── IrisAgent.php              ← muestras
├── AlexAgent.php              ← usuarios (solo admin)
├── agents/                    ← documentación y personalidad
│   ├── AGENTS.md              ← índice de agentes
│   ├── Carmen/
│   │   ├── IDENTITY.md        ← rol, API, campos, permisos
│   │   ├── SOUL.md            ← tono y estilo de respuesta
│   │   └── directives/        ← flujos por operación (referencia)
│   ├── Rafa/   (IDENTITY + SOUL + directives/)
│   ├── Noa/    (IDENTITY + SOUL + directives/)
│   ├── Iris/   (IDENTITY + SOUL)
│   └── Alex/   (IDENTITY + SOUL)
└── skills/                    ← capacidades analíticas avanzadas
    ├── SKILLS.md
    ├── analisis-importaciones/
    ├── revision-contratos/
    ├── comparativa-ofertas/
    ├── trazabilidad-producto/
    └── gestion-calidad/
```

Cada agente PHP se registra con el tag Symfony `app.agent` y el orquestador los recibe todos por inyección de dependencias.

---

## El Orquestador

El Orquestador es invisible para el usuario: **no hace falta mencionarlo ni dirigirte a un agente concreto**.

### Cómo elige el agente

1. Recibe tu mensaje, el historial reciente (últimos 3 turnos), tu **rol** y la **página** en la que estás.
2. Llama a OpenAI con un prompt de clasificación que devuelve solo: `{"agent":"carmen"}` (u otro id).
3. Comprueba que el agente existe y que tienes permiso (`Alex` solo si eres admin o superadmin).
4. Si la clasificación falla, usa la **página actual** como pista (p. ej. estás en «importaciones» → Noa).
5. Si sigue sin resolver, el agente por defecto es **Carmen**.

### Reglas de enrutamiento

| Intención / palabras clave | Agente | Id |
| -------------------------- | ------ | -- |
| Proveedor, fabricante, distribuidor, CIF/NIF, contrato, vigencia, vencimiento | Carmen | `carmen` |
| Oferta, cotización, precio, pedido, compra, producto ofertado | Rafa | `rafa` |
| Importación, DUA, arancel, flete, despacho, transitario, tipo de cambio, logística | Noa | `noa` |
| Muestra, lote, análisis, calidad, BIO, HALAL, KOSHER, FOOD | Iris | `iris` |
| Usuario, rol, permiso, cuenta, acceso, contraseña | Alex | `alex` *(solo admin/superadmin)* |

La respuesta del chat incluye qué agente ha respondido:

```json
{
  "reply": "…",
  "agent": { "name": "Carmen", "id": "carmen" }
}
```

---

## Los 5 agentes especializados

Cada agente domina un dominio de la API REST, tiene **personalidad propia** y un conjunto de **herramientas** (list, get, create, update, delete) que OpenAI invoca según necesite.

---

### Carmen — Proveedores y contratos

| | |
| --- | --- |
| **Id** | `carmen` |
| **Dominio** | Relaciones comerciales: quién suministra y bajo qué condiciones contractuales |
| **API** | `/api/proveedores`, `/api/contratos` |
| **Acceso** | Todos los usuarios autenticados |
| **Agente por defecto** | Sí (mensajes ambiguos) |

**¿Qué hace?**

- Mantener el catálogo de proveedores (datos de contacto, CIF, incoterms, certificaciones, documentación).
- Gestionar contratos de suministro: producto, precio, cantidades pactadas/pedidas/pendientes, fechas de caducidad.
- Detectar contratos próximos a vencer y cantidades pendientes críticas.
- CRUD completo; las eliminaciones requieren confirmación.

**Herramientas:** `list/get/create/update/delete` de proveedores y contratos.

**Skill asociada:** [Revisión de contratos](#skill-revisión-de-contratos) — auditoría de vigencia, ejecución y documentación.

**Ejemplos de preguntas:**

- `¿Qué proveedores tenemos activos?`
- `Dame el detalle del proveedor con CIF B12345678`
- `¿Qué contratos vencen este mes?`
- `Crea un proveedor: Aceros del Norte, CIF A87654321, contacto comercial@acerosn.es`
- `Actualiza el teléfono del proveedor 4`
- `Elimina el contrato 7` _(pide confirmación)_

**Palabras clave:** proveedor, contrato, CIF, vigencia, renovar, vencimiento

---

### Rafa — Ofertas

| | |
| --- | --- |
| **Id** | `rafa` |
| **Dominio** | Cotizaciones y condiciones de compra antes de formalizar contrato o pedido |
| **API** | `/api/ofertas` (+ lectura de `/api/proveedores` para referencias) |
| **Acceso** | Todos los usuarios autenticados |

**¿Qué hace?**

- Registrar y consultar ofertas por proveedor y producto (precio, cantidad, moneda, incoterm, grado).
- Comparar precios entre proveedores para el mismo producto.
- Seguir validez y documentación de cada cotización.
- CRUD de ofertas; eliminar requiere confirmación.

**Herramientas:** `list/get/create/update/delete` de ofertas; `list_proveedores` (solo lectura).

**Skill asociada:** [Comparativa de ofertas](#skill-comparativa-de-ofertas) — tabla comparativa y recomendación de mejor opción.

**Ejemplos de preguntas:**

- `¿Qué ofertas tenemos en vigor para el producto "Almendra"?`
- `Muéstrame todas las ofertas del proveedor 3`
- `Crea una oferta: proveedor 2, Nuez de Macadamia, 500 kg, 8,50 €/kg`
- `Actualiza el precio de la oferta 12 a 7,80 €/kg`
- `¿Cuál es la oferta más barata para Pistachos?`

**Palabras clave:** oferta, cotización, precio, pedido, presupuesto

---

### Noa — Importaciones y logística

| | |
| --- | --- |
| **Id** | `noa` |
| **Dominio** | Operaciones de importación: costes reales, aranceles, DUA, transitarios, trazabilidad |
| **API** | `/api/importaciones` (+ lectura de proveedores) |
| **Acceso** | Todos los usuarios autenticados |

**¿Qué hace?**

- Registrar y consultar envíos importados con todos los costes (EUR/USD, tipo de cambio, aranceles, despacho, coste/kg).
- Calcular y comparar eficiencia entre importaciones.
- Verificar documentación (DUA, albaranes) y señalar operaciones incompletas.
- Trazar el ciclo completo de un producto cruzando ofertas, contratos, importaciones y muestras.
- CRUD de importaciones; eliminar requiere confirmación.

**Herramientas:** `list/get/create/update/delete` de importaciones; `list_proveedores` (solo lectura). Para trazabilidad también usa herramientas de ofertas, contratos y muestras vía la skill.

**Skills asociadas:**

- [Análisis de importaciones](#skill-análisis-de-importaciones) — coste/kg, aranceles, comparativas.
- [Trazabilidad de producto](#skill-trazabilidad-de-producto) — línea de tiempo Oferta → Contrato → Importación → Muestra.

**Ejemplos de preguntas:**

- `¿Cuántas importaciones tenemos registradas?`
- `Dame el coste por kilo de la importación 5`
- `¿Cuál fue el tipo de cambio medio de las importaciones de este año?`
- `Muéstrame las importaciones con documentación pendiente`
- `Registra una importación: proveedor 2, Almendra, 2000 kg, 18.000 €, incoterm CIF, arancel 4%`
- `Traza el historial completo del ácido cítrico`

**Palabras clave:** importación, DUA, arancel, flete, transitario, incoterm, coste/kg

---

### Iris — Muestras y control de calidad

| | |
| --- | --- |
| **Id** | `iris` |
| **Dominio** | Muestras de proveedor, estados del pipeline y certificaciones (BIO, HALAL, etc.) |
| **API** | `/api/muestras` (+ lectura de proveedores) |
| **Acceso** | Todos los usuarios autenticados |

**¿Qué hace?**

- Registrar muestras con lote, grado, estado (Compra / Análisis / Pendiente) y responsable.
- Filtrar por proveedor, producto o estado.
- Auditar el pipeline de calidad: pendientes, retrasos, bloqueos por documentación.
- CRUD de muestras; eliminar requiere confirmación.

**Herramientas:** `list/get/create/update/delete` de muestras; `list_proveedores` (solo lectura).

**Skill asociada:** [Gestión de calidad](#skill-gestión-de-calidad) — resumen del pipeline y alertas.

**Ejemplos de preguntas:**

- `¿Qué muestras del proveedor 1 están pendientes de análisis?`
- `Dame el resultado del lote LOT-2026-041`
- `¿Cuántas muestras con certificación BIO hemos recibido este año?`
- `Registra una muestra: proveedor 3, Dátil Medjool, 50 kg, lote LOT-2026-055`
- `Marca como APTO la muestra 14`
- `¿Alguna muestra con resultado NO_APTO en los últimos 30 días?`

**Palabras clave:** muestra, lote, análisis, BIO, HALAL, laboratorio, resultado, calidad

---

### Alex — Usuarios y accesos

| | |
| --- | --- |
| **Id** | `alex` |
| **Dominio** | Altas, bajas y roles de usuarios del SRM |
| **API** | `/api/usuarios` |
| **Acceso** | **Solo** `admin` y `superadmin` |

**¿Qué hace?**

- Listar y consultar usuarios del sistema.
- Crear usuarios (nombre, username, contraseña, rol).
- Cambiar roles (`normal`, `admin`, `superadmin`).
- Eliminar usuarios o ascender a `superadmin` solo con confirmación.
- **Nunca** devuelve contraseñas en las respuestas.

Si un usuario `normal` pregunta por usuarios, el orquestador puede clasificar como `alex`, pero el sistema **redirige a Carmen** porque Alex no pasa `supports()`.

**Herramientas:** `list/get/create/update/delete` de usuarios.

**Ejemplos de preguntas:**

- `¿Qué usuarios tiene el sistema?`
- `Crea un usuario: nombre "María López", username mlopez, rol normal`
- `Cambia el rol de jperez a admin`
- `Elimina el usuario 5` _(pide confirmación)_
- `¿Cuántos usuarios admin hay?`

**Palabras clave:** usuario, rol, permiso, acceso, admin, contraseña

---

## Skills — capacidades analíticas

Las **skills** son procedimientos documentados en `src/Agent/skills/` que guían al agente cuando la tarea va más allá de un CRUD simple: varias consultas, cálculos, tablas comparativas y alertas.

**No hace falta activarlas manualmente.** Basta con describir lo que necesitas; el agente reconoce la intención y sigue el flujo de la skill.

### Resumen de skills

| Skill | Agente | Qué resuelve |
| ----- | ------ | ------------ |
| Análisis de importaciones | Noa | Coste/kg, aranceles, tipo de cambio, importación más eficiente, documentación incompleta |
| Revisión de contratos | Carmen | Contratos por vencer (🔴/🟡/🟢), cantidad pendiente crítica, documentación |
| Comparativa de ofertas | Rafa | Mejor precio/condiciones entre proveedores para un producto |
| Trazabilidad de producto | Noa | Historial completo: ofertas → contratos → importaciones → muestras + huecos |
| Gestión de calidad | Iris | Pipeline de muestras: pendientes, análisis, aprobadas, bloqueos |

### Skill: Análisis de importaciones

**Agente:** Noa

**Cuándo se activa:** comparativas de coste, aranceles, eficiencia por kg, resumen por proveedor.

**Ejemplos:**

- `¿cuánto nos cuesta por kilo cada importación?`
- `compara las importaciones de ácido cítrico`
- `¿qué importación tiene mayor coste de arancel?`

**Respuesta típica:** tabla con producto, proveedor, coste/kg, aranceles, incoterm, documentación; totales si hay varios registros.

---

### Skill: Revisión de contratos

**Agente:** Carmen

**Cuándo se activa:** auditoría de contratos, vencimientos, cantidades sin ejecutar.

**Ejemplos:**

- `¿qué contratos están a punto de vencer?`
- `revísame el estado de los contratos`
- `¿qué contratos tienen documentación pendiente?`

**Respuesta típica:** lista por urgencia (🔴 &lt; 30 días, 🟡 &lt; 90 días, 🟢 vigente).

---

### Skill: Comparativa de ofertas

**Agente:** Rafa

**Cuándo se activa:** elegir proveedor, comparar precios, filtrar por grado o incoterm.

**Ejemplos:**

- `compara las ofertas de lecitina de soja`
- `¿qué proveedor tiene mejor precio para ácido cítrico?`
- `dame las mejores ofertas en incoterm CIF`

**Respuesta típica:** tabla comparativa + recomendación en negrita.

---

### Skill: Trazabilidad de producto

**Agente:** Noa

**Cuándo se activa:** historial completo de un producto o proveedor a lo largo del SRM.

**Ejemplos:**

- `traza el historial del ácido cítrico`
- `¿qué ha pasado con el proveedor Quimtec desde que empezamos?`
- `¿se ha importado algo del contrato X?`

**Respuesta típica:** secciones **Ofertas → Contratos → Importaciones → Muestras** + alertas de huecos (p. ej. importaciones sin muestra de QC).

---

### Skill: Gestión de calidad

**Agente:** Iris

**Cuándo se activa:** estado del pipeline de muestras, bloqueos, proveedores sin producto validado.

**Ejemplos:**

- `¿qué muestras están pendientes de análisis?`
- `¿hay muestras bloqueadas por documentación?`
- `revísame el estado de calidad`

**Respuesta típica:** resumen `X pendientes / Y en análisis / Z aprobadas` + listas por estado + alertas.

---

## Flujo de una conversación

```
1. Escribes en el chat
        ↓
2. POST /api/chat  (JWT + message + history + context)
        ↓
3. Orquestador clasifica → agente (carmen | rafa | noa | iris | alex)
        ↓
4. Agente carga IDENTITY.md + SOUL.md como prompt de sistema
        ↓
5. Bucle agéntico (hasta 6 vueltas):
      OpenAI decide herramienta → SrmApiClient llama API → resultado a OpenAI
        ↓
6. Respuesta en lenguaje natural + { agent: { name, id } }
```

El agente **mantiene el contexto** de la conversación actual (historial enviado en cada petición), pero **no recuerda sesiones anteriores** una vez cierras el chat o la sesión.

---

## Operaciones que requieren confirmación

Antes de ejecutar acciones **destructivas o de alto impacto**, el agente te pedirá confirmación:

| Acción | Agente | Confirmación |
| ------ | ------ | ------------ |
| Eliminar proveedor o contrato | Carmen | Sí |
| Eliminar oferta | Rafa | Sí |
| Eliminar importación | Noa | Sí |
| Eliminar muestra | Iris | Sí |
| Eliminar usuario | Alex | Sí |
| Cambiar rol a `superadmin` | Alex | Sí |
| Modificar documentación crítica en importación | Noa | Sí |

Responde `sí` o `confirmar` para continuar, o `no` / `cancelar` para abortar.

---

## Consejos de uso

- **Sé específico** con nombres, IDs, CIF o referencias de contrato/lote. Cuanta más información des, más precisa es la respuesta.
- **No elijas agente:** el orquestador lo hace por ti. Si quieres forzar un dominio, usa las palabras clave de esa área.
- **Preguntas analíticas:** pide comparativas, auditorías o trazabilidad con lenguaje natural; las skills se activan solas.
- **Varias preguntas seguidas:** el historial de la sesión se envía al clasificador y al agente.
- **Crear registros:** puedes dar todos los campos en una frase o dejar que el agente te los pida uno a uno.
- **Los cálculos son en tiempo real** sobre datos registrados; el agente no inventa cifras.
- **Página actual:** si el mensaje es ambiguo («muéstrame los pendientes»), ayuda estar en la pantalla correcta del panel.

---

## Limitaciones actuales

- El asistente opera **solo sobre los datos del SRM**. No accede a email, ERP externo ni otros sistemas.
- **Sin memoria entre sesiones:** cada nueva conversación empieza sin historial previo guardado en servidor.
- **Un agente por mensaje:** preguntas que mezclan dominios muy distintos se resuelven con el agente principal de la intención detectada; para vistas globales, formula preguntas por área o usa trazabilidad (Noa).
- **Alex restringido:** usuarios `normal` no pueden gestionar usuarios aunque lo pidan; el sistema usa otro agente como fallback.
- **Skills documentadas:** el comportamiento analítico está definido en Markdown; si un dato no está en la base de datos, el agente lo indicará.
- Las respuestas dependen de **OpenAI** (`gpt-4o-mini` por configuración) y del tiempo de respuesta de la API (timeout ampliado a 120 s en el endpoint de chat).

---

## Referencia rápida

| Agente | Id | API principal | Skill(s) |
| ------ | -- | ------------- | -------- |
| Carmen | `carmen` | proveedores, contratos | Revisión de contratos |
| Rafa | `rafa` | ofertas | Comparativa de ofertas |
| Noa | `noa` | importaciones | Análisis de importaciones, Trazabilidad |
| Iris | `iris` | muestras | Gestión de calidad |
| Alex | `alex` | usuarios *(admin)* | — |

Documentación técnica ampliada: `PROYECTO.md`, `src/Agent/agents/AGENTS.md`, `src/Agent/skills/SKILLS.md`.
