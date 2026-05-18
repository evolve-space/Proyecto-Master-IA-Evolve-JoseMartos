# SRM Compras — Asistente IA Multiagente

## Qué es esto

SRM Compras es una aplicación web de gestión de compras con un **asistente de inteligencia artificial integrado**.
El asistente permite consultar y operar sobre todos los datos del sistema usando lenguaje natural, desde el chat del panel.

---

## Qué se ha construido

### Backend — API REST (Symfony 7 / PHP 8.2)

API REST completa con autenticación JWT que expone los siguientes recursos:

| Endpoint             | Dominio                          |
| -------------------- | -------------------------------- |
| `POST /api/login`    | Autenticación                    |
| `/api/proveedores`   | CRUD proveedores                 |
| `/api/contratos`     | CRUD contratos                   |
| `/api/ofertas`       | CRUD ofertas                     |
| `/api/importaciones` | CRUD importaciones               |
| `/api/muestras`      | CRUD muestras                    |
| `/api/usuarios`      | CRUD usuarios (admin/superadmin) |
| `POST /api/chat`     | Punto de entrada al asistente IA |

### Sistema multiagente

El endpoint `/api/chat` está respaldado por un sistema de 6 componentes:

```
OrchestratorService  ← analiza la intención del mensaje y delega
        ↓
    AgentInterface    ← contrato común de todos los agentes
        ↓
  AbstractAgent       ← bucle agentico: OpenAI function calling (máx. 6 iteraciones)
        ↓
  SrmApiClient        ← ejecuta sub-requests internos al kernel (sin HTTP externo)
        ↓
  API REST del SRM    ← datos reales de la base de datos
```

### Los 5 agentes especializados

| Agente | Dominio                       | Acceso                  |
| ------ | ----------------------------- | ----------------------- |
| Carmen | Proveedores & Contratos       | Todos los usuarios      |
| Rafa   | Ofertas                       | Todos los usuarios      |
| Noa    | Importaciones & Logística     | Todos los usuarios      |
| Iris   | Muestras & Control de Calidad | Todos los usuarios      |
| Alex   | Usuarios & Accesos            | Solo admin / superadmin |

Cada agente tiene personalidad propia definida en archivos de texto (`IDENTITY.md` + `SOUL.md`) que se cargan en tiempo de ejecución como prompt de sistema.

---

## Cómo funciona el chat

1. El usuario escribe un mensaje en el chat del panel.
2. El **Orquestador** clasifica la intención con OpenAI y delega al agente correcto.
3. El agente entra en un bucle de función calling (máximo 6 iteraciones):
    - OpenAI decide qué herramienta llamar (list, get, create, update, delete).
    - El agente ejecuta la llamada a la API interna.
    - OpenAI procesa el resultado y decide si necesita más datos o puede responder.
4. La respuesta final llega al usuario en lenguaje natural.

---

## Estructura del proyecto (backend)

```
src/
├── Agent/
│   ├── AbstractAgent.php        ← bucle agentico base
│   ├── AgentInterface.php       ← contrato
│   ├── AlexAgent.php
│   ├── CarmenAgent.php
│   ├── IrisAgent.php
│   ├── NoaAgent.php
│   ├── RafaAgent.php
│   ├── agents/                  ← documentación de cada agente
│   │   ├── Alex/  (IDENTITY.md + SOUL.md)
│   │   ├── Carmen/ (IDENTITY.md + SOUL.md + directives/)
│   │   ├── Iris/  (IDENTITY.md + SOUL.md)
│   │   ├── Noa/   (IDENTITY.md + SOUL.md + directives/)
│   │   └── Rafa/  (IDENTITY.md + SOUL.md + directives/)
│   └── skills/                  ← capacidades analíticas documentadas
│       ├── analisis-importaciones/
│       ├── comparativa-ofertas/
│       ├── gestion-calidad/
│       ├── revision-contratos/
│       └── trazabilidad-producto/
├── Controller/
│   ├── AuthController.php       ← login / logout
│   ├── ChatController.php       ← POST /api/chat
│   └── [5 controllers CRUD]
├── Entity/                      ← entidades Doctrine
└── Service/
    ├── OrchestratorService.php  ← enrutamiento de intención
    └── SrmApiClient.php         ← cliente interno (kernel sub-requests)
```

---

## Tecnologías utilizadas

| Capa          | Tecnología                                 |
| ------------- | ------------------------------------------ |
| Backend       | Symfony 7.4 + PHP 8.2                      |
| Base de datos | MySQL / Doctrine ORM                       |
| IA            | OpenAI API (gpt-4o-mini, function calling) |
| Auth          | JWT (`lexik/jwt-authentication-bundle`)    |
| Frontend      | React + Vite                               |

---

## Decisiones técnicas clave

**Sub-requests internos en lugar de HTTP externo**
Los agentes no hacen llamadas HTTP a `localhost` para consultar la API — eso causaría un deadlock con el servidor PHP de un solo worker. En su lugar, usan `HttpKernelInterface::SUB_REQUEST` para ejecutar las peticiones directamente dentro del mismo proceso PHP.

**Personalidad cargada en tiempo de ejecución**
Los archivos `IDENTITY.md` y `SOUL.md` de cada agente se leen desde disco al arrancar cada conversación, lo que permite modificar el comportamiento del agente sin tocar código PHP.

**Roles de acceso en el propio agente**
Alex rechaza peticiones de usuarios con rol `normal` directamente en su `supports()` — sin middleware adicional.
