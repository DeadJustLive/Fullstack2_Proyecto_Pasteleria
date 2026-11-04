<!-- @pca:start
@id(docs.mejoras_flujo_ui)
@kind(doc)
@limit(lines: 340)
@relates(docs.reglas_ui)
@relates(docs.estado_proyecto)
@relates(docs.convenciones)
@desc(Registro y seguimiento de oportunidades de mejora visual y ergonomia de flujo en Tienda y Admin PWA)
@pca:end -->
# Registro de Oportunidades de Mejora Gráfica y Ergonomía de Flujo

> **Propósito:** Bitácora viva de hallazgos de diseño visual, feedback gráfico y ergonomía de usuario detectados durante la integración real del software (Tienda Cliente + Admin PWA + POS).
> **Referencia de Diseño:** Tokens y paleta oficial en [`docs/reglas_ui.md`](./reglas_ui.md).

---

## 1. Hallazgos en Admin PWA (Inventario, Productos y POS)

### 🎨 Oportunidad 1: Destello Visual en Fila al Recibir Actualización de Stock (Pulsing Row)
- **Ubicación:** `admin-pwa/src/pages/Productos.tsx` y `Inventario.tsx`.
- **Diagnóstico:** Cuando una compra web descuenta stock en tiempo real vía `BroadcastChannel`, el número cambia instantáneamente en pantalla, pero un operador en cocina o caja puede no notar qué fila cambió si la tabla es extensa.
- **Propuesta de Mejora:** Aplicar una clase CSS temporal con animación suave (ej: `bg-warning-subtle` que se disuelve en 1.5s mediante `transition: background-color 1.5s ease-out`) en la fila o celda del producto afectado.
- **Impacto UX:** Alto en entornos de ritmo rápido (mostrador/taller de pastelería).

---

### 🎨 Oportunidad 2: Empty States Ilustrados y Positivos en Filtros de Stock
- **Ubicación:** `admin-pwa/src/pages/Productos.tsx` (Pestaña "Críticos") y `Inventario.tsx`.
- **Diagnóstico:** Cuando el usuario filtra por "Críticos" y no hay ningún producto en alerta, se muestra una tabla en blanco con encabezados huérfanos o un texto simple sin vida.
- **Propuesta de Mejora:** Reemplazar por una tarjeta centrada con ícono `CheckCircle2` o `Sparkles` en verde menta (`#2E7D32`), con mensaje motivador:
  > *"¡Excelente! Todo tu catálogo se encuentra abastecido sobre el umbral mínimo."*
- **Impacto UX:** Refuerza la tranquilidad operativa y evita la falsa impresión de fallo de carga.

---

### 🎨 Oportunidad 3: Tarjetas de Semáforo como Filtros Interactivos en Inventario
- **Ubicación:** `admin-pwa/src/pages/Inventario.tsx` (Tarjetas "Nivel Óptimo", "Por Reabastecer", "Stock Crítico").
- **Diagnóstico:** Las 3 tarjetas superiores solo muestran números estadísticos pasivos; el usuario debe usar el buscador de texto si quiere ver únicamente los ítems críticos.
- **Propuesta de Mejora:** Convertir las 3 tarjetas en botones de filtro interactivo con hover y borde activo (`border-2 border-primary shadow-sm`). Al hacer click en "Stock Crítico", la tabla se filtra automáticamente a los ítems en estado `critico`.
- **Impacto UX:** Reduce los clics necesarios a 1 solo toque en tabletas y móviles POS.

---

### 🎨 Oportunidad 4: Stepper Inline de Ajuste Rápido de Vitrina
- **Ubicación:** `admin-pwa/src/pages/Productos.tsx` (Columna de Acciones).
- **Diagnóstico:** Para cambiar el stock actual, el pastelero debe hacer clic en "Editar", esperar el modal, cambiar el input y hacer clic en "Guardar", o usar el botón rígido "+10 uds".
- **Propuesta de Mejora:** Incorporar botones micro inline `+` y `-` con confirmación tooltip o stepper táctil que permita sumar/restar 1 unidad con un toque para ventas físicas imprevistas de vitrina.
- **Impacto UX:** Agilidad máxima sin fricción de modales.

---

### 🎨 Oportunidad 5: Badge Contador Global en Navegación Lateral (Sidebar Admin)
- **Ubicación:** `admin-pwa/src/layouts/AdminLayout.tsx`.
- **Diagnóstico:** Si el administrador está en `/ordenes` o `/usuarios`, no tiene visibilidad de si un producto bajó a stock crítico tras una compra en la web.
- **Propuesta de Mejora:** Colocar una píldora roja numérica al lado del enlace "Productos" e "Inventario" en la barra de navegación lateral cuando existan alertas (`stock <= 5`).
- **Impacto UX:** Alerta transversal preventiva en todo el sistema.

---

## 2. Hallazgos en Tienda Cliente (Catálogo y Checkout)

### 🎨 Oportunidad 6: Transición Suave en Contador de Carrito Móvil
- **Ubicación:** `frontend/src/components/ui/FloatingCartButton.tsx` y `Navbar.tsx`.
- **Diagnóstico:** Al añadir un pastel al carrito, el número se incrementa sin micro-animación.
- **Propuesta de Mejora:** Aplicar escala rápida (`animate-scale` o `transform scale-125 transition-transform duration-200`) en el círculo badge del carrito para dar confirmación háptica/visual inmediata de producto agregado.

---

## 3. Matriz de Priorización de Mejoras

| ID | Mejora Gráfica | Módulo | Esfuerzo | Impacto | Estado |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **UI-01** | Empty state positivo en stock crítico | Admin / Productos | Bajo | Medio | Registrado |
| **UI-02** | Tarjetas de semáforo interactivas como filtro | Admin / Inventario | Bajo | Alto | Registrado |
| **UI-03** | Destello temporal en fila actualizada | Admin / Productos | Medio | Alto | Registrado |
| **UI-04** | Badge global de críticos en Sidebar | Admin / Shell | Bajo | Alto | Registrado |
| **UI-05** | Micro-animación bounce en botón flotante | Tienda / Carrito | Bajo | Medio | Registrado |
| **UI-06** | Stepper inline rápido de vitrina | Admin / Productos | Medio | Medio | Registrado |

---

## 4. Correcciones Críticas y Reestructuraciones Registradas

### 🚨 CORR-01 — Corrección de Boleta Tributaria Corrupta
- **Ubicación:** `admin-pwa/src/components/BoletaModal.tsx` y feature `AdminBoletaSii`.
- **Diagnóstico:** Reporte de visualización rota o corrupta en el detalle de boleta fiscal (valores de IVA 19%, subtotales o renderizado de datos de orden no formateados correctamente).
- **Acción Requerida:** Auditoría y saneamiento integral del modal de boleta, cálculo matemático de IVA SII y formato térmico limpio.

### 🚨 CORR-02 — Carga Híbrida de Fotografías en Categorías (Archivo Local WebP + URL)
- **Ubicación:** `admin-pwa/src/pages/Categorias.tsx`.
- **Diagnóstico:** Actualmente el formulario de nueva categoría solo permite ingresar una URL de texto manual, obligando al usuario a alojar la imagen externamente.
- **Acción Requerida:** Integrar soporte dual: selector de archivo local con compresión a WebP ligero (integrando `AdminImageOptimizer`) y campo alternativo de URL externa.

### 🚨 CORR-03 — Reestructuración Estética Integral de Punto de Venta (POS)
- **Ubicación:** `admin-pwa/src/pages/Pos.tsx` y prototipo HTML preliminar.
- **Diagnóstico:** La estética y disposición actual del POS resultan inadecuadas para una experiencia de caja fluida.
- **Acción Requerida:** Prototipar y validar primero la estructura completa en un archivo HTML limpio e independiente (`setup/pos_vitrina_mock.html`) para revisión visual directa antes de volver a montar la lógica en React.

### 🚨 CORR-04 — Retiro de Pestaña de Menú "UI Kit & Modales" (`/componentes`)
- **Ubicación:** `admin-pwa/src/layouts/AdminLayout.tsx` (Ruta `/componentes`).
- **Diagnóstico:** La vista de showcase de componentes era exclusivamente una referencia técnica de desarrollo para visualizar botones, modales y variantes, no una sección que deba existir en el menú de producción del administrador.
- **Acción Requerida:** Eliminar el enlace del Sidebar y Header de navegación para limpiar el menú ejecutivo.
