# 🏠 Instancia — Refactor Home (Fase 2)

La base ya existe (`Home.tsx`), así que este prompt ejecuta **solo la Fase 2** de [`prompt-base.md`](./prompt-base.md): migrar de clases del snapshot a design system, sin cambiar el diseño.

- **`{ORIGEN}`**: `MockUpPasteleria/pages/cliente/index.html` (paridad visual) + `frontend/src/pages/cliente/Home.tsx` actual (usa clases de `src/mockup/`).
- **`{SALIDA}`**: `frontend/src/pages/cliente/Home.tsx` (migrado).

Notas específicas:
- Sustituye las clases del snapshot por tokens + `ui/`/`domain/` (`SectionTitle`, `BannerServicios`, `ProductCard`).
- Mantén el hero full-bleed y el marquee (`hero-wrapper`/`banner-deslizar` en `index.css`).
- Meta: poder borrar `src/mockup/` sin alterar el aspecto.
