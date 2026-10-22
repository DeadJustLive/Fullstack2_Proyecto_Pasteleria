<!-- @pca:start
@id(docs.estado_proyecto)
@kind(doc)
@limit(lines: 200)
@relates(docs.convenciones)
@relates(docs.reglas_ui)
@relates(docs.git)
@desc(Tablero de control: fase, stack, sprints, tickets y próximo paso)
@pca:end -->

# Estado del Proyecto (Anti-Amnesia)

> **Instrucción para la IA:** Lee este archivo al iniciar **cada** sesión, antes de proponer cualquier cambio. Al cerrar la sesión, actualízalo. Este documento es la memoria del proyecto: si no está actualizado, el alumno pierde el contexto y aparece la **amnesia de contexto**.

**Última actualización:** 2026-10-22

---

## 1. Fase actual del flujo

| Campo | Valor |
| :--- | :--- |
| **Fase actual** | F3 — Ejecución por tickets |
| **Siguiente fase** | F4 — Validación / Testing (cuando se complete la migración a design system) |
| **Estado** | En curso — Home migrada al design system |

> Fases: F0 Setup → F1 Levantamiento → F2 Sprints → F3 Ejecución → F4 Validación → F5 Cierre. Ver `AGENTS.md`.

---

## 2. Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| Frontend | React 18.3 + TypeScript 5.6 + Vite 5 + React Router 7 + CVA + clsx + tailwind-merge + lucide-react |
| Backend | Spring Boot (Java) + Spring Security + JPA + MySQL 8 — *pendiente* |
| Base de Datos | MySQL 8 (esquema en `docs/` del backend) — *pendiente* |
| Estilos | Tailwind CSS v4 (tokens en `@theme` de `frontend/src/index.css`) + CSS legacy del snapshot en `frontend/src/mockup/` |
| Imágenes | `sharp` (script `frontend/scripts/optimize-images.mjs`) |

### Tokens de color (design system)

`primary #FFC0CB` · `secondary #8B4513` · `tertiary #5D4037` · `neutral #FFF5E1` · `ink #3A2A21` · `inverted #241812`

Detalle completo en [`docs/reglas_ui.md`](./reglas_ui.md).

---

## 3. Resumen del proyecto

**Crème & Co** es una pastelería artesanal ficticia. La app es una tienda online con dos
roles: **cliente** (catálogo, carrito, checkout, seguimiento de envío, perfil, blog) y
**administrador** (POS, pedidos, inventario, usuarios, configuración).

El frontend ya está construido en React + TypeScript con Vite. La migración desde el
mockup HTML/CSS está **en curso**: el equipo viene migrando página por página al
design system de Tailwind v4. **`src/mockup/` sigue presente** y contiene el CSS
legacy que aún usan Navbar, Catálogo, Carrito y Checkout; se elimina cuando termine
la migración.

---

## 4. Sprints

| Sprint | Objetivo | Estado |
| :--- | :--- | :--- |
| Sprint 1 | Base y autenticación | En curso (modales login/registro) |
| Sprint 2 | Base de datos | Pendiente (Spring Boot + MySQL) |
| Sprint 3 | Lógica backend | Pendiente |
| Sprint 4 | Frontend / UI | En curso (migración a design system) |

---

## 5. Tablero de Tickets

| ID | Título | Fase/Sprint | Estado | Convenciones |
| :--- | :--- | :--- | :--- | :--- |
| T10 | Instalación del kit PCA en la raíz + documentación sincronizada | F3 / S4 | Hecho | `CONV-DOC-01` |
| T11 | Primitivas del design system (`Button`, `ButtonLink`, `LogoCremeCo`, radios) | F3 / S4 | Hecho | `CONV-UI-04` |
| T12 | Migración de Home a componentes (`HeroHome`, `CarouselDestacados`, `SobreNosotros`, `BlogRecientes`) | F3 / S4 | Hecho | `CONV-UI-01`, `CONV-UI-04` |
| T13 | `ProductCard` funcional (carrito real, enlaces reales, a11y) | F3 / S4 | Hecho | `CONV-UI-02`, `CONV-UI-03` |
| T14 | Responsive y a11y (hero, carrusel, menú móvil) | F3 / S4 | Hecho | `CONV-UI-03` |
| T15 | Performance, SEO y limpieza del snapshot | F3 / S4 | Hecho | `CONV-GEN-02` |
| T16 | Migrar Catálogo al design system (elimina `catalogo.css`) | F3 / S4 | Pendiente | `CONV-UI-04` |
| T17 | Migrar Navbar y Footer al design system | F3 / S4 | Pendiente | `CONV-UI-04` |
| T18 | Implementar `ProductoDetalle` (ruta `producto/:id`) | F3 / S4 | Pendiente | `CONV-UI-02` |
| T19 | Eliminar `frontend/src/mockup/` | F3 / S4 | Pendiente | `CONV-GEN-02` |

Estados: `Pendiente` · `En curso` · `En revisión` · `Hecho`.

---

## 6. Próximo paso

> Un solo ticket concreto a la vez.

- **T16 — Migrar Catálogo al design system.** Es la última página grande que depende de
  `src/mockup/cliente/catalogo.css` (`.catalogo-hero`, `.badge`, filtros). Requiere
  decidir si el drawer de filtros mobile se reescribe o se conserva.

---

## 7. Notas y decisiones

- **El mockup (`MockUpPasteleria/`) es solo referencial.** La estructura final es
  React-idiomática: no se copian clases del snapshot, se usan componentes del design system.
- **Escala de breakpoints:** solo Tailwind (`sm` 640, `md` 768, `lg` 1024, `xl` 1280).
  Se eliminaron los 900/960/1200 del snapshot.
- **Full-bleed:** se mantiene `100cqi` (nunca `100vw`, que incluye la scrollbar).
- **Botones:** `rounded-full` (píldora) en `Button` → afecta Carrito, Checkout y POS.
- **Colores de CTA:** el `primary` del design system (rosa) es el color de acción;
  el marrón `secondary` del snapshot era el color del botón en HTML.
- **Marquee de `BannerServicios`:** se conserva (mejora de UX; el mockup no lo tenía).
- **Imagenes:** PNG → WebP y JPG re-codificados. `public/imagen/` bajó de 3,3 MB a 767 KB.
- **Marcadores de posición:** las rutas sin página real (`/blog/:slug`, `/producto/:id`)
  usan `pages/Placeholder.tsx`, nunca `to="#"`.
- **Evidencia de T12–T15:** smoke test SSR temporal de la Home (27/27 comprobaciones OK:
  sin `href="#"`, sin clases del snapshot, todas las imágenes referenciadas existen). El
  andamiaje se eliminó al cerrar el ticket; el error de aserción queda registrado como
  `FRONT-012` en `docs/cicatrices_guerra.md`.
- **Pendiente de validación manual:** checklist responsive 360 / 390 / 430 / 768 / 1024 /
  1280 / 1440 (sección 7 de `docs/reglas_ui.md`).
