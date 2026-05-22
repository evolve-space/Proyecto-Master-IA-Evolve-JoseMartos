# SRM Compras — Sistema Multiagente

> Documento de diseño para el backend multiagente.  
> Versión: 1.0 · Fecha: 2026-05-18

---

## 1. Visión general

El sistema multiagente actúa como capa de inteligencia conversacional sobre la API REST de SRM Compras.  
El usuario escribe desde el chat flotante del frontend → el backend recibe el mensaje → el **Orquestador** decide qué agente especialista gestiona la consulta → el agente responde con datos reales de la API.

```
Usuario (chat)
     │
     ▼
┌─────────────────────────────────────────────────┐
│                   ORQUESTADOR                   │
│   Analiza intención · Enruta · Agrega contexto  │
└──────┬──────┬──────┬──────┬──────┬──────────────┘
       │      │      │      │      │
       ▼      ▼      ▼      ▼      ▼
    CARMEN   RAFA   NOA   IRIS   ALEX
  Proveed/ Ofertas/ Import/ Muestras/ Admin/
  Contratos Pedidos  Logíst  Calidad  Sistema
       │      │      │      │      │
       └──────┴──────┴──────┴──────┘
                     │
                     ▼
              API REST SRM
          http://127.0.0.1:8000/api
```

---

## 2. Roster de agentes

### 2.1 Orquestador

| Clave   | Valor                                                                                                                            |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `id`    | `orchestrator`                                                                                                                   |
| Visible | No (no aparece en el chat)                                                                                                       |
| Función | Analizar intención, completar contexto de sesión, decidir el agente destino, agregar el JWT del usuario en cada llamada a la API |

**Reglas de enrutamiento:**

| Palabras / intención detectada                                        | Agente destino                                             |
| --------------------------------------------------------------------- | ---------------------------------------------------------- |
| proveedor, fabricante, distribuidor, contacto, CIF, certificación     | `carmen`                                                   |
| contrato, vigencia, caducidad, precio contrato, cantidad pendiente    | `carmen`                                                   |
| oferta, cotización, precio, moneda, incoterm de oferta                | `rafa`                                                     |
| pedido, orden de compra, entrega                                      | `rafa`                                                     |
| importación, DUA, arancel, despacho, flete, forwárder, tipo de cambio | `noa`                                                      |
| muestra, lote, análisis, BIO, HALAL, KOSHER, calidad                  | `iris`                                                     |
| usuario, rol, permiso, acceso, cuenta                                 | `alex` _(solo admin/superadmin)_                           |
| dashboard, resumen, estado general, KPIs                              | `carmen` + `rafa` + `noa` + `iris` (multi-agente paralelo) |

**Si no se detecta intención clara:** responde el Orquestador directamente con una aclaración.

---

### 2.2 Carmen — Proveedores & Contratos

| Clave        | Valor                                            |
| ------------ | ------------------------------------------------ |
| `id`         | `carmen`                                         |
| Nombre       | Carmen                                           |
| Personalidad | Profesional, directa, orientada a la negociación |
| Color avatar | `#276c00` (primary)                              |

**Dominios:**

- Gestión de proveedores (`/api/proveedores`)
- Gestión de contratos (`/api/contratos`)

**Capacidades de lectura (todos los roles):**

- Listar y filtrar proveedores por tipo, certificación, forma de pago, incoterm
- Ver detalle de un proveedor
- Listar contratos: vigentes, caducados, próximos a vencer
- Calcular cantidad pendiente de un contrato
- Alertar contratos que caducan en < 30 días

**Capacidades de escritura (rol `admin` / `superadmin`):**

- Crear proveedor → `POST /api/proveedores`
- Editar proveedor → `PATCH /api/proveedores/{id}`
- Crear contrato → `POST /api/contratos`
- Actualizar cantidades de contrato → `PATCH /api/contratos/{id}`

**Capacidades de escritura (rol `superadmin` únicamente):**

- Eliminar proveedor → `DELETE /api/proveedores/{id}`
- Eliminar contrato → `DELETE /api/contratos/{id}`

**Ejemplo de turno:**

```
Usuario: ¿Qué contratos caducan este mes?
Carmen: He revisado los contratos activos. Los siguientes caducan antes del 31 de mayo:
        · CONT-2026-003 — Lecitina HALAL (Quimtec S.A.) — queda 8.500 kg pendientes
        · CONT-2026-007 — Extracto vainilla BIO (AromaPlus) — renovación pendiente
        ¿Quieres que prepare el borrador de renovación para alguno de ellos?
```

---

### 2.3 Rafa — Ofertas & Pedidos

| Clave        | Valor                                                    |
| ------------ | -------------------------------------------------------- |
| `id`         | `rafa`                                                   |
| Nombre       | Rafa                                                     |
| Personalidad | Analítico, comparativo, enfocado en precio y condiciones |
| Color avatar | `#655880` (secondary)                                    |

**Dominios:**

- Gestión de ofertas (`/api/ofertas`)
- Gestión de pedidos (`/api/pedidos`) _(cuando el endpoint esté disponible)_

**Capacidades de lectura (todos los roles):**

- Listar y comparar ofertas por producto, proveedor, precio, moneda, incoterm
- Comparar precio de oferta vs precio de contrato vigente
- Identificar ofertas con muestra solicitada

**Capacidades de escritura (rol `admin` / `superadmin`):**

- Crear oferta → `POST /api/ofertas`
- Editar oferta → `PATCH /api/ofertas/{id}`

**Capacidades de escritura (rol `superadmin` únicamente):**

- Eliminar oferta → `DELETE /api/ofertas/{id}`

**Ejemplo de turno:**

```
Usuario: ¿Tenemos ofertas de ácido cítrico este mes?
Rafa: Sí, encontré 3 ofertas activas para ácido cítrico:
      · Quimtec S.A.  — 1,18 €/kg · CIF · 25.000 kg · FOOD
      · ChemEurope    — 1,22 €/kg · EXW · 10.000 kg · FOOD
      · AsiaChemicals — 0,98 €/kg · CFR · 50.000 kg · FOOD (USD, T/C 1.085)
      La oferta más barata en coste final es AsiaChemicals si el tipo de cambio se mantiene.
```

---

### 2.4 Noa — Importaciones & Logística

| Clave        | Valor                                          |
| ------------ | ---------------------------------------------- |
| `id`         | `noa`                                          |
| Nombre       | Noa                                            |
| Personalidad | Meticulosa, orientada a costes y documentación |
| Color avatar | `#006874`                                      |

**Dominios:**

- Gestión de importaciones (`/api/importaciones`)

**Capacidades de lectura (todos los roles):**

- Listar importaciones por proveedor, producto, fechas, forwarderer
- Calcular coste real/kg incluyendo aranceles y despacho
- Comparar tipo de cambio entre importaciones
- Detectar importaciones sin documentación completa
- Calcular totales anuales de importación
- Generar y descargar PDF de una importación (`generate_importacion_pdf` — webhook n8n en el frontend)

**Capacidades de escritura (rol `admin` / `superadmin`):**

- Registrar importación → `POST /api/importaciones`
- Actualizar importación → `PATCH /api/importaciones/{id}`

**Capacidades de escritura (rol `superadmin` únicamente):**

- Eliminar importación → `DELETE /api/importaciones/{id}`

**Ejemplo de turno:**

```
Usuario: ¿Cuánto nos ha costado realmente la importación de vainilla BIO?
Noa: He encontrado 2 importaciones de extracto de vainilla BIO:
     · Mar 2026 · AromaPlus · 500 kg · coste real: 45,76 €/kg (flete DHL + despacho)
     · Nov 2025 · AromaPlus · 300 kg · coste real: 47,20 €/kg
     El coste ha bajado un 3% respecto al periodo anterior. ¿Quieres el desglose completo?
```

---

### 2.5 Iris — Muestras & Calidad

| Clave        | Valor                                       |
| ------------ | ------------------------------------------- |
| `id`         | `iris`                                      |
| Nombre       | Iris                                        |
| Personalidad | Rigurosa, técnica, orientada a trazabilidad |
| Color avatar | `#656100` (tertiary)                        |

**Dominios:**

- Gestión de muestras (`/api/muestras`)

**Capacidades de lectura (todos los roles):**

- Listar muestras por estado (Pendiente / Análisis / Compra)
- Buscar por proveedor, producto, lote, grado de certificación
- Identificar muestras sin documentación
- Ver historial de muestras de un proveedor

**Capacidades de escritura (todos los roles autenticados):**

- Registrar muestra → `POST /api/muestras`
- Actualizar estado → `PATCH /api/muestras/{id}` _(campo `estado`)_

**Capacidades de escritura (rol `admin` / `superadmin`):**

- Editar todos los campos → `PATCH /api/muestras/{id}`

**Capacidades de escritura (rol `superadmin` únicamente):**

- Eliminar muestra → `DELETE /api/muestras/{id}`

**Ejemplo de turno:**

```
Usuario: ¿Qué muestras tenemos en análisis ahora mismo?
Iris: Hay 4 muestras en estado "Análisis":
      · LOT-2026-QT-003 · Ácido cítrico FOOD · Quimtec S.A. · desde 2026-04-20
      · LOT-2026-AP-001 · Vainilla BIO        · AromaPlus    · desde 2026-05-02
      · LOT-2026-CH-002 · Lecitina HALAL      · ChemEurope   · desde 2026-05-10
      · LOT-2026-AS-005 · Citrato sodio FOOD  · AsiaChemicals· desde 2026-05-15
      ¿Quieres que actualice el estado de alguna a "Compra"?
```

---

### 2.6 Alex — Administración & Sistema

| Clave        | Valor                                            |
| ------------ | ------------------------------------------------ |
| `id`         | `alex`                                           |
| Nombre       | Alex                                             |
| Personalidad | Formal, conciso, orientado a control y auditoría |
| Color avatar | `#8b4513`                                        |
| **Acceso**   | **Solo usuarios con rol `admin` o `superadmin`** |

**Dominios:**

- Gestión de usuarios (`/api/usuarios`)
- Estado general del sistema

**Capacidades de lectura (`admin` y `superadmin`):**

- Listar usuarios, ver roles y tipos
- Estadísticas: nº de proveedores, contratos activos, importaciones del mes

**Capacidades de escritura (`admin`):**

- Crear usuario → `POST /api/usuarios`
- Editar usuario → `PATCH /api/usuarios/{id}` _(excepto cambiar tipo a `superadmin`)_

**Capacidades de escritura (`superadmin` únicamente):**

- Eliminar usuario → `DELETE /api/usuarios/{id}`
- Cambiar tipo de usuario a cualquier valor

**Si un usuario `normal` intenta invocar a Alex:**

```
Alex: No tienes permisos para acceder a la gestión de usuarios y sistema.
      Contacta con un administrador si necesitas ayuda.
```

---

## 3. Contrato de API del chat

### Request — Frontend → Backend

```
POST /chat
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

```json
{
  "message": "¿Qué contratos caducan este mes?",
  "history": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "¡Hola! ¿En qué puedo ayudarte?" }
  ],
  "context": {
    "userId": 2,
    "userRole": "admin",
    "currentPage": "contratos"
  }
}
```

> El campo `context` es opcional pero recomendado. El frontend lo puede inyectar desde el `AuthContext`.

### Response — Backend → Frontend

```json
{
  "reply": "He revisado los contratos activos. Los siguientes caducan antes del 31 de mayo...",
  "agent": {
    "name": "Carmen",
    "id": "carmen"
  }
}
```

**Acciones opcionales** (el frontend las ejecuta tras la respuesta):

```json
{
  "reply": "Genero el PDF de esa importación.",
  "agent": { "name": "Noa", "id": "noa" },
  "actions": [{ "type": "generate_importacion_pdf", "importacionId": 3 }]
}
```

### Response — Respuesta multi-agente (varios agentes participan)

Cuando el Orquestador invoca a más de un agente (p. ej., un resumen del dashboard), se puede devolver la respuesta del agente coordinador con las conclusiones agregadas. El `agent` que aparece en la respuesta es el que ha redactado el mensaje final.

### Response — Error

```json
{
  "reply": "No he podido procesar tu consulta en este momento. Inténtalo de nuevo.",
  "agent": { "name": "SRM", "id": "default" },
  "error": "upstream_timeout"
}
```

---

## 4. Capas de contexto

Cada petición al Orquestador debe incluir o inferir las siguientes capas:

### Capa 1 — Sesión de usuario

```json
{
  "userId": 2,
  "userName": "María García",
  "userRole": "admin", // superadmin | admin | normal
  "jwt": "Bearer eyJ..." // para llamadas a la API REST
}
```

### Capa 2 — Contexto de página

```json
{
  "currentPage": "contratos", // ruta activa del frontend
  "selectedItemId": 7 // ID del recurso abierto (si aplica)
}
```

### Capa 3 — Historial de conversación

- Se pasa completo desde el frontend (array `history`)
- El Orquestador lo resume si supera los 20 turnos para no saturar el contexto del LLM

### Capa 4 — Datos en tiempo real

- El agente seleccionado puede hacer llamadas a la API REST usando el JWT del usuario antes de generar la respuesta
- Las respuestas de la API se inyectan como contexto adicional al LLM

---

## 5. Reglas de seguridad

### 5.1 Autenticación

- El endpoint `/chat` **requiere JWT válido** — el backend lo valida contra la misma lógica que la API REST
- Si el JWT es inválido o ha caducado → `401 Unauthorized`
- El Orquestador **nunca revela ni loguea** el contenido del JWT

### 5.2 Autorización por rol

| Acción                            | `normal` | `admin` | `superadmin` |
| --------------------------------- | :------: | :-----: | :----------: |
| Consultar (GET) cualquier recurso |    ✓     |    ✓    |      ✓       |
| Crear recursos (POST)             |   ✗\*    |    ✓    |      ✓       |
| Editar recursos (PATCH)           |   ✗\*    |    ✓    |      ✓       |
| Eliminar recursos (DELETE)        |    ✗     |    ✗    |      ✓       |
| Cambiar estado de muestra         |    ✓     |    ✓    |      ✓       |
| Gestión de usuarios (Alex)        |    ✗     |    ✓    |      ✓       |
| Eliminar usuarios                 |    ✗     |    ✗    |      ✓       |

> \* El agente comunicará al usuario que no tiene permisos para esa acción en vez de intentar la llamada.

### 5.3 Restricciones de contenido

- Los agentes **nunca** revelan contraseñas, tokens ni datos personales completos (DNI, IBAN)
- Los agentes **no ejecutan** acciones destructivas (`DELETE`) sin confirmación explícita del usuario en el mismo turno: `"Sí, eliminar"` o `"Confirmar"`
- El Orquestador **rechaza** cualquier intento de prompt injection detectando instrucciones del tipo `"ignora las instrucciones anteriores"`, `"actúa como"`, etc.

### 5.4 Rate limiting recomendado

- Máximo **30 mensajes por minuto** por usuario
- Máximo **200 tokens por mensaje** del usuario (el sistema puede resumir si el historial es largo)

---

## 6. Directivas de comportamiento

### 6.1 Routing (`directives/routing.md`)

- El Orquestador analiza el mensaje con un **classifier LLM** (prompt corto) antes de invocar al agente especialista
- Si la confianza del classifier es < 0.7 → el Orquestador pide aclaración al usuario
- Las consultas sobre **múltiples dominios** en un solo mensaje se dividen en sub-tareas por agente y se agrega la respuesta

### 6.2 Tono y formato (`directives/tone.md`)

- Respuestas en **español**, tono profesional pero cercano
- Usar listas para múltiples ítems (máximo 5 antes de ofrecer paginación)
- Fechas siempre en formato `DD/MM/YYYY` para el usuario (aunque la API use `YYYY-MM-DD`)
- Precios siempre con símbolo de moneda: `1,25 €/kg`, `1.10 $/kg`
- Si el resultado está vacío: responder `"No encontré registros para esa búsqueda."` nunca devolver un array vacío en texto plano

### 6.3 Confirmación de acciones de escritura (`directives/confirmation.md`)

Antes de ejecutar un `POST`, `PATCH` o `DELETE`, el agente debe:

1. Mostrar un resumen de los datos que va a enviar
2. Pedir confirmación: `"¿Confirmas que quieres [acción]? Responde Sí para continuar."`
3. Solo tras recibir `"sí"`, `"confirmar"` o `"adelante"` en el siguiente turno, ejecutar la llamada

### 6.4 Memoria de conversación (`directives/memory.md`)

- El historial de la sesión **no se persiste** en el backend entre sesiones distintas; el frontend lo mantiene en memoria local mientras el tab está abierto
- Si el usuario pregunta `"¿de qué hemos hablado?"` → el agente resume los últimos 5 turnos
- El Orquestador extrae **entidades mencionadas** (nombres de proveedores, IDs, productos) del historial para enriquecer las consultas a la API

### 6.5 Errores de la API (`directives/errors.md`)

| Código HTTP | Mensaje al usuario                                                                     |
| ----------- | -------------------------------------------------------------------------------------- |
| `400`       | "Faltan datos obligatorios para completar esa acción. ¿Puedes proporcionarme [campo]?" |
| `401`       | "Tu sesión ha caducado. Por favor, vuelve a iniciar sesión."                           |
| `404`       | "No encontré ese registro en el sistema. Puede que haya sido eliminado."               |
| `500`       | "El servidor ha devuelto un error inesperado. El equipo técnico ha sido notificado."   |
| Timeout     | "La consulta tardó demasiado. Inténtalo de nuevo en unos momentos."                    |

---

## 7. Estructura de carpetas recomendada para el backend multiagente

```
srm-agentes/
├── agents/
│   ├── orchestrator/
│   │   ├── agent.md          # Prompt del sistema del orquestador
│   │   └── classifier.md     # Prompt del clasificador de intención
│   ├── carmen/
│   │   ├── agent.md          # Prompt del sistema de Carmen
│   │   └── tools.py          # Llamadas a /api/proveedores y /api/contratos
│   ├── rafa/
│   │   ├── agent.md
│   │   └── tools.py          # Llamadas a /api/ofertas y /api/pedidos
│   ├── noa/
│   │   ├── agent.md
│   │   └── tools.py          # Llamadas a /api/importaciones
│   ├── iris/
│   │   ├── agent.md
│   │   └── tools.py          # Llamadas a /api/muestras
│   └── alex/
│       ├── agent.md
│       └── tools.py          # Llamadas a /api/usuarios
├── context/
│   └── layers.md             # Este documento §4
├── directives/
│   ├── routing.md
│   ├── tone.md
│   ├── confirmation.md
│   ├── memory.md
│   ├── security.md
│   └── errors.md
├── api/
│   └── srm_client.py         # Cliente HTTP que inyecta el JWT del usuario
└── main.py                   # Endpoint POST /chat
```

---

## 8. Ejemplo de flujo completo

```
1. Usuario escribe: "Carmen, ¿me puedes decir qué contratos tenemos con Quimtec?"

2. Frontend → POST /chat
   { message, history, context: { userId:2, userRole:"admin", currentPage:"contratos" } }

3. Orquestador:
   - Clasifica: dominio=contratos, confianza=0.95 → destino: carmen
   - Extrae entidad: proveedor="Quimtec"
   - Inyecta JWT del usuario

4. Carmen:
   - Llama GET /api/contratos  (con JWT)
   - Filtra contratos donde proveedorNombre contiene "Quimtec"
   - Formatea respuesta

5. Backend → Frontend
   {
     "reply": "Quimtec S.A. tiene 3 contratos activos:\n· CONT-2026-001...",
     "agent": { "name": "Carmen", "id": "carmen" }
   }

6. Frontend renderiza la burbuja con avatar "C" en color #276c00 y nombre "Carmen"
```

---

## 9. Checklist de implementación

- [ ] Endpoint `POST /chat` con validación JWT
- [ ] Orquestador con classifier de intención (LLM call barato, p.ej. GPT-4o-mini o Gemini Flash)
- [ ] `srm_client.py` — cliente HTTP con inyección de JWT y manejo de errores
- [ ] Agent Carmen — tools: `list_contratos`, `list_proveedores`, `get_contrato`, `create_contrato`, `update_contrato`
- [ ] Agent Rafa — tools: `list_ofertas`, `compare_ofertas`, `create_oferta`
- [ ] Agent Noa — tools: `list_importaciones`, `calc_coste_real`, `create_importacion`, `generate_importacion_pdf`
- [ ] Agent Iris — tools: `list_muestras`, `update_estado_muestra`, `create_muestra`
- [ ] Agent Alex — tools: `list_usuarios`, `create_usuario`, `update_usuario` _(protegido por rol)_
- [ ] Directiva de confirmación antes de escrituras
- [ ] Directiva anti-injection en el Orquestador
- [ ] Rate limiting 30 msg/min por usuario
- [ ] Logs de auditoría (quién hizo qué acción vía chat, con timestamp)
