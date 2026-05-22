---
name: comparativa-ofertas
description: Compara múltiples ofertas del mismo producto entre distintos proveedores. Analiza precio, incoterm, cantidad, moneda y condiciones para recomendar la mejor opción de compra.
agente: rafa
---

# Skill: Comparativa de Ofertas

## Qué hace

Rafa activa esta skill cuando el usuario pide comparar ofertas de un producto o elegir entre proveedores.

1. Llama a `list_ofertas` para obtener todas las ofertas activas.
2. Filtra por producto si el usuario lo especifica.
3. Para cada oferta evalúa:
    - **Precio normalizado:** si hay mezcla de EUR y USD, convierte a EUR usando el tipo de cambio del día (o el que indique el usuario).
    - **Incoterm:** pondera el riesgo de flete. EXW = flete por nuestra cuenta, CIF = flete incluido.
    - **Grado del producto:** filtra solo los que cumplen el grado requerido (BIO, HALAL, KOSHER, FOOD).
    - **Documentación:** descarta o marca en rojo las que tienen `documentacion: false`.
4. Recomienda la mejor opción con justificación en 2–3 líneas.

## Cuándo activar

- "compara las ofertas de lecitina de soja"
- "¿qué proveedor tiene mejor precio para ácido cítrico?"
- "¿qué oferta me conviene más: la de AgroStar o la de BioDistrib?"
- "dame las mejores ofertas en incoterm CIF"
- "¿hay ofertas de productos HALAL disponibles?"

## Formato de respuesta

Tabla comparativa: proveedor, producto, precio/kg, moneda, grado, incoterm, documentación. Recomendación al final en negrita.
