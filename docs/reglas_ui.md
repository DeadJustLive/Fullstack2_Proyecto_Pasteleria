<!-- @pca:start
@id(docs.reglas_ui)
@kind(doc)
@limit(lines: 400)
@relates(docs.convenciones)
@relates(frontend.ui.buttonVariants)
@desc(Reglas de UI: tokens, escalas, breakpoints, componentes y checklist responsive)
@pca:end -->

# Reglas de UI — Crème & Co

> **Instrucción para la IA:** léelo antes de tocar JSX, clases de Tailwind o cualquier
> CSS. Define el contrato visual del design system y los breakpoints oficiales.

---

## 1. Tokens (fuente única de verdad)

Los tokens viven en el bloque `@theme` de [`frontend/src/index.css`](../frontend/src/index.css).
**Nunca escribas un color o una fuente literal en un componente**: usa el token.

| Token | Valor | Uso típico |
| :--- | :--- | :--- |
| `primary` | `#FFC0CB` | Rosa. Acentos, badges, hover de botones, foco. |
| `secondary` | `#8B4513` | Marrón. Precios, enlaces, iconos de marca. |
| `tertiary` | `#5D4037` | Marrón oscuro. Títulos y texto deemphasis. |
| `neutral` | `#FFF5E1` | Crema. Fondo de página, texto sobre oscuro. |
| `ink` | `#3A2A21` | Marrón casi negro. Texto de párrafo. |
| `inverted` | `#241812` | Texto sobre `primary`. |
| `error` | `#F44336` | Errores de formulario. |
| `warning` | `#FF9800` | Avisos. |

Tipografía: `--font-display` (Be Vietnam Pro) para títulos, `--font-body` (Source Sans 3) para texto.

### Radios

| Radio | Valor | Regla |
| :--- | :--- | :--- |
| `rounded-full` | 999px | Botones, badges, píldoras. **Por defecto.** |
| `rounded-xl` | 12px | Tarjetas, paneles, modales, imágenes con borde. |
| `rounded-lg` | 8px | Inputs, selects. |
| `rounded` | 4px | Solo controles densos (steper de cantidad). |

> El snapshot original (`--radius: 12px`) se traduce a `rounded-xl`, **no** a `rounded`
> (que en Tailwind v4 es 4px y no 12px).

---

## 2. Breakpoints

Escala **Tailwind** únicamente. No inventes valores intermedios.

| Prefijo | Ancho | Uso en este proyecto |
| :--- | :--- | :--- |
| (base) | 0–639px | Móvil. Una columna, menús desplegables. |
| `sm:` | ≥ 640px | Tablet. Dos columnas, navegación horizontal. |
| `md:` | ≥ 768px | Tablet ancho. |
| `lg:` | ≥ 1024px | Desktop. Flechas del carrusel, sidebar de 3 columnas. |
| `xl:` | ≥ 1280px | Desktop grande. |

> **Prohibido** usar breakpoints ad-hoc (`min-[900px]`, `min-[960px]`, `max-width: 900px`).
> Si necesitas uno nuevo, elige el de la escala y anótalo en este documento.

---

## 3. Componentes del design system

Viven en `frontend/src/components/ui/` y `frontend/src/components/domain/`.

| Componente | Archivo | Regla |
| :--- | :--- | :--- |
| `Button` | `ui/Button.tsx` | Solo acciones. Variantes: `primary`, `secondary`, `outline`, `ghost`. Tamaños: `sm`, `default`, `lg`, `icon`. |
| `ButtonLink` | `ui/ButtonLink.tsx` | Navegación con apariencia de botón. **No** uses `<a href="#">`. |
| `buttonVariants` | `ui/buttonVariants.ts` | Tokens compartidos por `Button` y `ButtonLink`. No lo edites desde otro archivo. |
| `Card` | `ui/Card.tsx` | Panel con borde, fondo y sombra. |
| `Badge` | `ui/Badge.tsx` | Etiqueta sobre la foto del producto. |
| `Input` | `ui/Input.tsx` | Campo de formulario con `label`, `hint` y `error`. |
| `Modal` | `ui/Modal.tsx` | Diálogo. `Escape` lo cierra. |
| `LogoCremeCo` | `ui/LogoCremeCo.tsx` | Logotipo SVG inline, decorativo (`aria-hidden`). |
| `SectionTitle` | `ui/SectionTitle.tsx` | `eyebrow` + `titulo` centrados. |
| `PageHero` | `ui/PageHero.tsx` | Encabezado de página (Carrito, Checkout). |

### Reglas de uso

1. **No reimplementes una primitiva.** Si te falta un estilo, extiéndelo con `className`
   (los componentes usan `cn()` = `clsx` + `tailwind-merge`, así que lo externo gana).
2. **No crees `<button>` con clases a mano** para acciones: usa `Button`.
3. **Los enlaces siempre son `Link`/`ButtonLink`** y apuntan a una ruta real.
   `to="#"` cae en la ruta `*` (404) — nunca lo hagas.
4. **El color del nombre de un producto** es `tertiary` (no `secondary`), con `hover:underline`.

---

## 4. Componentes de dominio de la Home

| Componente | Archivo | Responsabilidad |
| :--- | :--- | :--- |
| `HeroHome` | `domain/HeroHome.tsx` | Banner full-bleed. Fondo en la utilidad `.hero-bg`. En móvil el logo va arriba y el CTA queda debajo (ver §5). |
| `BannerServicios` | `domain/BannerServicios.tsx` | Marquee de beneficios (marquee infinito, `prefers-reduced-motion` respetado). |
| `CarouselDestacados` | `domain/CarouselDestacados.tsx` | Carrusel con scroll-snap + flechas funcionales. |
| `ProductCard` | `domain/ProductCard.tsx` | Tarjeta de producto. Única en la Home. |
| `SobreNosotros` | `domain/SobreNosotros.tsx` | Bloque de texto + foto. |
| `BlogRecientes` | `domain/BlogRecientes.tsx` | Grid de artículos. |

### Reglas del carrusel

- El scroll nativo (`scroll-snap`) es el mecanismo real; las flechas lo desplazan.
- Las flechas viven **fuera** del track (layout flex) → nunca se escapan del contenedor.
- Se ocultan por debajo de `lg` (en móvil se desliza con el dedo).
- Cada flecha se deshabilita en los extremos del recorrido.

---

## 5. Layout y utilidades

| Utilidad | Archivo | Qué hace |
| :--- | :--- | :--- |
| `.full-bleed` | `index.css` | Escape del `main` de 1080px con `100cqi` (no `100vw`: `vw` incluye la scrollbar y desborda). Requiere `container-type: inline-size` en el shell. |
| `.hero-bg` | `index.css` | Degradado oscuro + foto del obrador del hero. |

- El `main` del cliente define el padding: móvil `1.75rem / 1rem / 3rem`, desktop `2.5rem / 1.5rem / 4rem`.
  El hero lo compensa con un margen negativo (`-mt-7 sm:-mt-10`) para tocar el header.
- El shell (`layouts/ClienteLayout.tsx`) es el contenedor `inline-size`; de ahí sale el `cqi`.
- **Orden del hero:** por debajo de `md` (768px) los dos bloques del hero se apilan con el
  **logo primero** y el texto con su CTA después, de modo que el botón "Ver Catálogo" queda
  por debajo del logo. A partir de `md` pasan a dos columnas (texto a la izquierda, logo a la
  derecha). Se resuelve con `order`, **sin reordenar el DOM**: el logo es decorativo y no
  focusable, así que el orden de lectura y de foco siguen siendo título → CTA.

---

## 6. Accesibilidad (mínimo exigido)

1. `lang="es"` en `<html>`.
2. Cada imagen decorativa: `alt=""`. Cada imagen con significado: `alt` descriptivo.
   Nunca `aria-hidden` sobre un `<img>` que tiene `alt` con texto.
3. Iconos dentro de botones: `aria-hidden="true"` + `aria-label` en el botón.
4. Enlaces duplicados al mismo destino: marca el redundante con `aria-hidden` + `tabIndex={-1}`.
5. Los carruseles son `role="region"` con `aria-label` y responden a `←` / `→`.
6. Foco visible: no elimines el `focus-visible` de `Button`.

---

## 7. Checklist responsive (validar en cada cambio)

- [ ] 360px — una columna, sin scroll horizontal.
- [ ] 390px — una columna.
- [ ] 430px — una columna.
- [ ] 768px — dos columnas donde aplique.
- [ ] 1024px — tres columnas, flechas del carrusel visibles.
- [ ] 1280px — el `main` sigue limitado a 1080px; el hero a sangre completa.
- [ ] 1440px — sin desbordes.

### Criterio objetivo (comprobable, no "a ojo")

El `overflow-x: hidden` del snapshot **oculta** los desbordes, no los arregla: por eso
hay que medir, no mirar. Para cada ruta y cada ancho de la lista anterior:

| Comprobación | Condición |
| :--- | :--- |
| Ancho del contenedor | `main.getBoundingClientRect().width === document.documentElement.clientWidth` (o `1080` a partir de 1280px, donde `xl:max-w-page` entra) |
| Sin scroll horizontal | `document.documentElement.scrollWidth === document.documentElement.clientWidth` |
| Sin elementos fuera | ningún descendiente de `main` con `right > clientWidth` o `left < 0` (ignorando los que tienen un ancestro con `overflow-x` distinto de `visible`) |
| Elemento a sangre completa | su `left === 0` y su `right === clientWidth` |

El `main` del shell **siempre** lleva `max-w-full`. Sin él, el `margin-inline: auto`
del snapshot lo convierte en un contenedor `fit-content` que se infla con el contenido
más ancho (el marquee) y empuja las secciones a sangre fuera de la pantalla. Ver
`FRONT-013` en `docs/cicatrices_guerra.md`.

---

## 8. Rendimiento

- Las fotos viven en `frontend/public/imagen/`. Si añades una nueva, ejecútalo con
  `npm run optimize:images` (script `frontend/scripts/optimize-images.mjs`).
- El script convierte PNG a WebP y re-codifica los JPG, **sin degradar** imágenes
  que ya son más pequeñas que su versión optimizada.
- Usa `loading="lazy"` + `decoding="async"` en imágenes que no están above-the-fold.
- Las fuentes de Google se cargan por `<link>` en `frontend/index.html` (no por `@import` en el CSS).

---

## 9. Mapa de tokens JS → CSS

| Clase Tailwind | CSS generado |
| :--- | :--- |
| `text-tertiary` | `color: var(--color-tertiary)` |
| `bg-neutral` | `background-color: var(--color-neutral)` |
| `rounded-xl` | `border-radius: var(--radius-xl)` (= 12px) |
| `max-w-page` | `max-width: var(--container-page)` (= 1080px) |
| `font-display` | `font-family: var(--font-display)` |
