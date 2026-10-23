# 🧩 Prompt base — de elemento del mockup a componente React

Plantilla reutilizable. Para crear un componente React solo rellenas **`{ORIGEN}`** y **`{SALIDA}`**; el resto (reglas y fases) ya viene fijo aquí. Las instancias listas para usar viven en los otros archivos de `guias/prompts/`.

> Uso: copia el bloque **"Prompt"** completo y pega la ruta del mockup en `{ORIGEN}` y la ruta destino en `{SALIDA}`.

---

## Campos

| Campo | Qué es | Ejemplo |
| :--- | :--- | :--- |
| `{ORIGEN}` | Elemento del mockup (HTML + su CSS/JS asociado) o componente TSX existente a migrar. | `MockUpPasteleria/pages/cliente/envio.html` + `css/seguimiento.css` |
| `{SALIDA}` | Ruta del componente/página React en `frontend/src/`. | `frontend/src/pages/cliente/Envio.tsx` |

---

## Prompt

```text
Crea el componente React del elemento del mockup indicado, en dos fases.

ORIGEN: {ORIGEN}
SALIDA: {SALIDA}

CONTEXTO DEL PROYECTO (Crème & Co)
- Stack: React 18 + TypeScript + Vite + Tailwind CSS v4 (@tailwindcss/vite) + react-router-dom + lucide-react.
- Alias "@" -> "frontend/src".
- Diseño de origen: MockUpPasteleria/ (HTML/CSS estático). Es la fuente de verdad visual.
- Objetivo: reproducir el diseño original SIN cambios visuales y dejar el código limpio.

REGLAS FIJAS
1. Tokens: usa los tokens de @theme de frontend/src/index.css (colores primary, secondary,
   tertiary, neutral, ink, inverted, error, warning; fuentes display/body; radius; container-page).
   No hardcodees colores ni repitas hex.
2. Design system: reutiliza los primitivos existentes en frontend/src/components/ui/ en lugar de
   reimplementar elementos:
   - Button (variant: primary|secondary|outline|ghost; size: sm|default|lg)
   - Input (state: default|error|success; props label/hint/error), PasswordInput
   - Card (padding: none|sm|md|lg), Badge (tipo: premium|temporada|vendido|personalizable)
   - PageHero (align: left|center), SectionTitle, EmptyState, CantidadStepper (variant: pill|compact), Modal
   - Dominio: ProductCard, OrderSummary, FiltroCheckbox, MiniCarrito, MenuPerfil, BannerServicios.
3. CVA (ver guias/07-cuando-refactorizar-cva.md):
   - CVA SOLO si el elemento tiene variantes/estados reales. Sin variantes -> constante de clases o cn().
   - Si no hay variantes, no uses cva.
   - Combina siempre con cn() (frontend/src/lib/utils.ts) para que el className externo gane.
   - Variantes en inglés y consistentes (variant, size, state, intent); defaultVariants siempre definidos.
   - "Se limpia al publicar": promover a componente reutilizable solo si se repite 2+ veces (Regla del 3).
4. Convenciones: props tipadas; tipos de dominio en frontend/src/types; datos desde
   frontend/src/data (mock, aún sin API); formatPrecio (CLP) desde @/lib/utils; iconos con lucide-react;
   responsive mobile-first (drawer o hooks/useMediaQuery donde el mockup lo exija).
5. NO agregues comentarios en el código. No uses style={{...}} ni archivos .css nuevos salvo
   excepción justificada; los estilos van en clases de Tailwind.

FASE 1 — BASE (paridad visual)
- Porta la estructura y el contenido del ORIGEN a TSX con clases Tailwind sobre los tokens.
- Reproduce todos los estados visibles del mockup: carga (skeleton), vacío, hover/focus, error.
- Traduce el comportamiento del JS del mockup a estado/props de React (sin lógica de negocio real;
  usa los mocks existentes).
- Resultado: mismo aspecto que el mockup, props tipadas, aún sin CVA.

FASE 2 — REFACTOR (pulido sin cambiar el diseño)
- Sustituye bloques por los componentes de frontend/src/components/ui/ y de dominio que ya existan.
- Extrae subcomponentes solo cuando un bloque se repita 2+ veces (Regla del 3).
- Aplica CVA únicamente si hay variantes/estados (regla 3).
- Unifica espaciados/colores con tokens; elimina valores sueltos.
- Mantén el aspecto idéntico. Si aparece un cambio visual, avísalo en vez de aplicarlo en silencio.

CRITERIOS DE ACEPTACIÓN
- Paridad visual con el mockup (comparar en npm run dev).
- Sin clases del snapshot src/mockup/ en el resultado final (cuando aplique).
- Reutiliza el design system; no duplica botones/inputs/cards.
- npm run lint y npm run build pasan sin errores.
```

---

## Instancias de este proyecto

| Prompt | Origen | Salida |
| :--- | :--- | :--- |
| [`producto-detalle.md`](./producto-detalle.md) | `MockUpPasteleria/pages/cliente/productos/` + `css/producto.css` | `frontend/src/pages/cliente/ProductoDetalle.tsx` |
| [`envio.md`](./envio.md) | `MockUpPasteleria/pages/cliente/envio.html` + `css/seguimiento.css` | `frontend/src/pages/cliente/Envio.tsx` |
| [`confirmacion.md`](./confirmacion.md) | `MockUpPasteleria/pages/cliente/confirmacion.html` + `js/confirmacion.js` | `frontend/src/pages/cliente/Confirmacion.tsx` |
| [`perfil.md`](./perfil.md) | `MockUpPasteleria/pages/cliente/perfil.html` + `css/perfil.css` | `frontend/src/pages/cliente/Perfil.tsx` |
| [`home-refactor.md`](./home-refactor.md) | `home` mockup + `Home.tsx` actual (clases `src/mockup/`) | `frontend/src/pages/cliente/Home.tsx` (migrado) |
| [`catalogo-refactor.md`](./catalogo-refactor.md) | `catalogo` mockup + `Catalogo.tsx` actual | `frontend/src/pages/cliente/Catalogo.tsx` (migrado) |

> Referencias: [`../01-arquitectura-y-herramientas.md`](../01-arquitectura-y-herramientas.md), [`../07-cuando-refactorizar-cva.md`](../07-cuando-refactorizar-cva.md), [`../09-estado-avance.md`](../09-estado-avance.md).
