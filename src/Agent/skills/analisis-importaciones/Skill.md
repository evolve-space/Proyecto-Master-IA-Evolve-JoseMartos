---
name: analisis-importaciones
description: Analiza y compara el coste real de importaciones. Calcula coste/kg, compara divisas, detecta desviaciones de aranceles y coste de despacho, e identifica cuál es la importación más eficiente.
agente: noa
---

# Skill: Análisis de Importaciones

## Qué hace

Noa activa esta skill cuando el usuario pide un análisis de costes de importaciones o una comparativa entre operaciones.

1. Llama a `list_importaciones` para obtener todos los registros.
2. Calcula y compara: `costeKg`, conversiones EUR↔USD con el `tipoCambio` real de cada operación, peso de aranceles y coste de despacho sobre el precio final.
3. Identifica cuál es la operación más eficiente (menor `costeKg`) y cuál tiene mayor peso de aranceles.
4. Agrupa por producto o proveedor si el usuario lo pide.
5. Detecta importaciones con `documentacion: false` y las señala como riesgo operativo.

## Cuándo activar

- "¿cuánto nos cuesta por kilo cada importación?"
- "compara las importaciones de ácido cítrico"
- "¿qué importación tiene mayor coste de arancel?"
- "muéstrame un resumen de costes por proveedor"
- "¿en qué importaciones la documentación está incompleta?"

## Formato de respuesta

Tabla cuando hay más de 2 registros. Para cada fila: producto, proveedor, cantidad, costeKg, aranceles%, incoterm, documentación. Fila de totales o promedios al final si hay 3 o más registros.
