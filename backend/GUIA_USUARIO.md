# Guía de Uso — Asistente IA de SRM Compras

## ¿Qué es el asistente?

El asistente de SRM Compras es un sistema de inteligencia artificial integrado en el chat flotante del panel.
No es un chatbot genérico: **solo trabaja con los datos reales de tu empresa** y ejecuta operaciones directas sobre el sistema.

Cuando escribes una pregunta o instrucción, el sistema decide automáticamente qué agente especializado es el más adecuado para responder. No necesitas saber con quién hablas: el orquestador lo gestiona en segundo plano.

---

## ¿Cómo acceder?

El chat flotante está disponible en todas las pantallas del panel SRM Compras.
Haz clic en el icono de chat (esquina inferior derecha) para abrirlo.

> **Nota:** Debes tener sesión iniciada para que el asistente pueda acceder a los datos.

---

## Los agentes del sistema

El sistema tiene **5 agentes especializados**. Cada uno domina un área distinta del SRM.

---

### Carmen — Proveedores & Contratos

**¿Qué hace?**
Carmen gestiona toda la información de proveedores y los contratos vigentes con ellos.
Puedes consultarla para ver el estado de tus relaciones comerciales, revisar contratos próximos a vencer o registrar nuevos proveedores.

**Ejemplos de preguntas:**

- `¿Qué proveedores tenemos activos?`
- `Dame el detalle del proveedor con CIF B12345678`
- `¿Qué contratos vencen este mes?`
- `Crea un proveedor: Aceros del Norte, CIF A87654321, contacto comercial@acerosn.es`
- `Actualiza el teléfono del proveedor 4`
- `Elimina el contrato 7` _(pide confirmación)_

**Palabras clave que la activan:** proveedor, contrato, CIF, vigencia, renovar, vencimiento

---

### Rafa — Ofertas

**¿Qué hace?**
Rafa gestiona el ciclo de ofertas de compra: cotizaciones recibidas de proveedores, precios por producto, validez y estado de cada oferta.
Útil para comparar precios entre proveedores antes de tomar una decisión de compra.

**Ejemplos de preguntas:**

- `¿Qué ofertas tenemos en vigor para el producto "Almendra"?`
- `Muéstrame todas las ofertas del proveedor 3`
- `Crea una oferta: proveedor 2, Nuez de Macadamia, 500 kg, 8,50 €/kg, válida hasta 30/06/2026`
- `Actualiza el precio de la oferta 12 a 7,80 €/kg`
- `¿Cuál es la oferta más barata para Pistachos?`

**Palabras clave que lo activan:** oferta, cotización, precio, pedido, presupuesto

---

### Noa — Importaciones & Logística

**¿Qué hace?**
Noa es la especialista en operaciones de importación. Registra y consulta cada envío: costes reales, aranceles, tipo de cambio, documentación DUA y trazabilidad completa desde el origen hasta el almacén.

**Ejemplos de preguntas:**

- `¿Cuántas importaciones tenemos registradas?`
- `Dame el coste por kilo de la importación 5`
- `¿Cuál fue el tipo de cambio medio de las importaciones de este año?`
- `Muéstrame las importaciones con documentación pendiente`
- `Registra una importación: proveedor 2, Almendra, 2000 kg, 18.000 €, incoterm CIF, arancel 4%`
- `Actualiza el transitario de la importación 8 a "DHL Global Forwarding"`

**Palabras clave que la activan:** importación, DUA, arancel, flete, transitario, incoterm, coste/kg

---

### Iris — Muestras & Control de Calidad

**¿Qué hace?**
Iris registra y gestiona el análisis de muestras recibidas de proveedores.
Lleva el control de resultados de laboratorio, certificaciones BIO y HALAL, y el estado de cada lote analizado.

**Ejemplos de preguntas:**

- `¿Qué muestras del proveedor 1 están pendientes de análisis?`
- `Dame el resultado del lote LOT-2026-041`
- `¿Cuántas muestras con certificación BIO hemos recibido este año?`
- `Registra una muestra: proveedor 3, Dátil Medjool, 50 kg, lote LOT-2026-055, laboratorio INIA`
- `Marca como APTO la muestra 14`
- `¿Alguna muestra con resultado NO_APTO en los últimos 30 días?`

**Palabras clave que la activan:** muestra, lote, análisis, BIO, HALAL, laboratorio, resultado, calidad

---

### Alex — Usuarios & Accesos _(solo admin/superadmin)_

**¿Qué hace?**
Alex gestiona quién tiene acceso al SRM y con qué nivel de permisos.
Solo disponible para usuarios con rol `admin` o `superadmin`. Los usuarios con rol `normal` no pueden interactuar con Alex.

**Ejemplos de preguntas:**

- `¿Qué usuarios tiene el sistema?`
- `Crea un usuario: nombre "María López", username mlopez, rol normal`
- `Cambia el rol de jperez a admin`
- `Elimina el usuario 5` _(pide confirmación)_
- `¿Cuántos usuarios admin hay?`

> **Contraseñas:** Alex nunca muestra contraseñas en sus respuestas, por razones de seguridad.

**Palabras clave que lo activan:** usuario, rol, permiso, acceso, admin, contraseña

---

## ¿Cómo funciona por dentro?

```
Tu mensaje
    ↓
Orquestador (analiza la intención)
    ↓
Agente especializado (Carmen / Rafa / Noa / Iris / Alex)
    ↓
Llamada a la API del SRM con tus datos reales
    ↓
Respuesta en lenguaje natural
```

1. Escribes tu pregunta o instrucción en el chat.
2. El **Orquestador** analiza automáticamente la intención y la envía al agente correcto.
3. El agente consulta o modifica la base de datos del SRM a través de la API.
4. Recibes una respuesta en lenguaje natural con los datos reales.

> El orquestador es invisible: no necesitas mencionarlo ni dirigirte a un agente en concreto.

---

## Operaciones que requieren confirmación

Antes de ejecutar acciones **destructivas o de alto impacto**, el agente te pedirá confirmación:

| Acción                        | Agente | Requiere confirmación |
| ----------------------------- | ------ | --------------------- |
| Eliminar proveedor / contrato | Carmen | Sí                    |
| Eliminar oferta               | Rafa   | Sí                    |
| Eliminar importación          | Noa    | Sí                    |
| Eliminar muestra              | Iris   | Sí                    |
| Eliminar usuario              | Alex   | Sí                    |
| Cambiar rol a `superadmin`    | Alex   | Sí                    |

Responde `sí` o `confirmar` para continuar, o `no` / `cancelar` para abortar.

---

## Consejos de uso

- **Sé específico con los nombres o IDs.** Cuanta más información des, más precisa es la respuesta.
- **Puedes hacer varias preguntas seguidas.** El agente mantiene el contexto de la conversación durante la sesión.
- **Si algo falla**, indica qué querías hacer y el agente te guiará por los campos necesarios.
- **Para crear registros**, puedes proporcionar todos los datos en una sola frase o dejar que el agente te los vaya pidiendo uno a uno.
- **Los cálculos se hacen en tiempo real** sobre los datos registrados: el agente no inventa cifras.

---

## Limitaciones actuales

- El asistente opera **sobre los datos del SRM**. No tiene acceso a sistemas externos (email, ERP externo, etc.).
- No recuerda conversaciones anteriores entre sesiones distintas.
- Las respuestas dependen de los datos que estén registrados en el sistema. Si un dato no está, el agente lo indicará.
