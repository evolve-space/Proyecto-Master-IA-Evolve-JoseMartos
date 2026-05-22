---
name: trazabilidad-producto
description: Sigue el ciclo completo de un producto en el SRM: desde las ofertas recibidas, pasando por el contrato firmado y las importaciones realizadas, hasta las muestras de control de calidad.
agente: noa
---

# Skill: Trazabilidad de Producto

## Qué hace

Noa activa esta skill cuando el usuario quiere ver el historial completo de un producto o proveedor.

1. Llama a `list_proveedores` para identificar el proveedor por nombre si el usuario no da el ID.
2. Llama a `list_ofertas` y filtra por proveedor o por nombre de producto.
3. Llama a `list_contratos` y filtra de igual forma.
4. Llama a `list_importaciones` y filtra.
5. Llama a `list_muestras` y filtra.
6. Construye una línea de tiempo: Oferta → Contrato → Importaciones → Muestras.
7. Detecta huecos: si hay contrato pero no hay importaciones, o si hay importaciones sin muestra de QC.

## Cuándo activar

- "traza el historial del ácido cítrico"
- "¿qué ha pasado con el proveedor Quimtec desde que empezamos?"
- "muéstrame todo lo que tenemos de lecitina de soja"
- "¿se ha importado algo del contrato X?"
- "¿hay muestras para las importaciones de este año?"

## Formato de respuesta

Sección por fase: **Ofertas** → **Contratos** → **Importaciones** → **Muestras**. Dentro de cada sección, lista compacta con fechas y datos clave. Al final: alertas de huecos detectados (ej. "2 importaciones sin muestra de QC").
