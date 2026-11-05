<!-- @pca:start
@id(docs.tickets.s13)
@kind(doc)
@limit(lines: 340)
@relates(docs.plantilla_ticket, docs.estado_proyecto, docs.reglas_ui)
@desc(Tickets T128 a T132 del Sprint 13 para responsividad movil, aislamiento de CSS legacy y ergonomia de vistas cliente)
@pca:end -->

# Sprint 13 — Responsividad Móvil, Aislamiento CSS Legacy y Ergonomía de Vistas Cliente (`frontend/`)

> **Fase:** F4 — Validación / Testing & Refinamiento UX Frontend
> **Rango de tickets:** `T128` – `T132`
> **Objetivo:** Corregir colisiones globales del CSS heredado (`section`), optimizar la disposición móvil (`360px–639px`) en `Carrito` y `CarouselBanner`, resolver la navegación redundante y ergonomía móvil en `Perfil` / `PerfilSeguimiento`, mejorar el flujo del formulario en `Personalizacion` y dotar de interactividad real y persistencia a `Blog`.

---

## T128 — Aislamiento de regla global `<section>` en CSS legacy (`estilos.css`)

- **ID:** `T128`
- **Fase / Sprint:** `F4` / `S13`
- **Estado:** `Completado`
- **Rama sugerida:** `feature/T117-catalogo-fase-categorias`

### 1. Contexto (Por qué)
El archivo [`frontend/src/mockup/cliente/estilos.css`](../../frontend/src/mockup/cliente/estilos.css) aplica estilos globales directamente al selector de etiqueta `section` (`background-color: #FFFFFF; border: 1px solid ...; padding: 2rem; margin-bottom: 2rem; border-radius: 12px;`). Esto provoca que todas las etiquetas semánticas `<section>` de las páginas React (`Nosotros`, `Ofertas`, `ProductoDetalle`, `Carrito`, `Catalogo`) reciban 32px de padding forzado por lado en móvil (`64px` menos de ancho útil en pantallas de `360px`), además de cajas blancas y márgenes no deseados.

### 2. Alcance y archivos a tocar (A qué)
| Acción | Archivo | `@id` PCA | Límite (`@limit`) |
| :--- | :--- | :--- | :--- |
| Modificar | `frontend/src/mockup/cliente/estilos.css` | — | — |
| Modificar | `frontend/src/pages/Carrito.tsx` | `frontend.page.carrito` | 260 |

### 3. Especificación técnica (Cómo)
1. En `frontend/src/mockup/cliente/estilos.css`:
   - Restringir el selector global `section` a `.mockup-scope section` (o eliminar las propiedades intrusivas de caja/padding sobre la etiqueta desnuda `section`) para que las vistas React controlen su propio espaciado y fondo mediante Tailwind v4 (`docs/reglas_ui.md`).
2. Verificar que `Carrito.tsx` (y cualquier vista que dependiera implícitamente del fondo blanco en `<section>`) declare explícitamente sus clases de tarjeta en Tailwind (`rounded-2xl border border-tertiary/10 bg-white p-4 sm:p-6 shadow-xs`).

### 4. Casos límite (Edge Cases)
- **Secciones que no tenían clases de fondo propias en `Carrito.tsx`:** Al retirar el estilo global `section`, el listado de productos y el `<aside>` de resumen en `Carrito.tsx` deben mantener su contenedor blanco, borde suave y padding responsive (`p-4 sm:p-6`).
- **Secciones semánticas en `Nosotros.tsx`, `Ofertas.tsx` y `ProductoDetalle.tsx`:** Al liberarse del `padding: 2rem` y `background: #fff` global, se alinearán exactamente con el ancho del `<header>` y del contenedor principal.

### 5. Convenciones aplicables
- `docs/reglas_ui.md`: Prohibición de selectores globales heredados del snapshot que alteren componentes React.

### 6. Definition of Done (DoD)
- [ ] La etiqueta `<section>` ya no inyecta `padding: 2rem`, `background-color: #FFFFFF` ni `margin-bottom: 2rem` de forma global.
- [ ] `Carrito.tsx`, `Nosotros.tsx`, `Ofertas.tsx` y `ProductoDetalle.tsx` lucen alineados y aprovechan todo el ancho útil en pantallas móviles (`360px`).
- [ ] `npm --prefix frontend test -- --run` y `npm --prefix frontend run build` pasan sin errores.

---

## T129 — Responsividad móvil en `Carrito.tsx` y `CarouselBanner.tsx`

- **ID:** `T129`
- **Fase / Sprint:** `F4` / `S13`
- **Estado:** `Completado`
- **Rama sugerida:** `feature/T117-catalogo-fase-categorias`
- **Depende de:** `T128`

### 1. Contexto (Por qué)
1. En [`frontend/src/pages/Carrito.tsx`](../../frontend/src/pages/Carrito.tsx), cada fila `<li>` usa un `flex flex-wrap` plano con 5 hijos que en móviles (`360px–410px`) salta en 2 o 3 líneas desalineadas. Además, utiliza el breakpoint arbitrario `min-[900px]:grid-cols-[1fr_minmax(260px,330px)]`, prohibido por `docs/reglas_ui.md`.
2. En [`frontend/src/components/domain/CarouselBanner.tsx`](../../frontend/src/components/domain/CarouselBanner.tsx), cada tarjeta tiene `min-w-[300px]` y flechas flotantes laterales (`left-2`/`right-2`) que en pantallas móviles de `360px` dentro del hero (`p-6`) se superponen sobre el nombre del producto y el botón de ver detalle (`Eye`).

### 2. Alcance y archivos a tocar (A qué)
| Acción | Archivo | `@id` PCA | Límite (`@limit`) |
| :--- | :--- | :--- | :--- |
| Modificar | `frontend/src/pages/Carrito.tsx` | `frontend.page.carrito` | 260 |
| Modificar | `frontend/src/components/domain/CarouselBanner.tsx` | `frontend.domain.carouselBanner` | 210 |

### 3. Especificación técnica (Cómo)
1. En `Carrito.tsx`:
   - Reemplazar `min-[900px]:grid-cols-[1fr_minmax(260px,330px)]` por `lg:grid-cols-[1fr_minmax(280px,340px)]`.
   - Estructurar cada `<li>` del carrito con un diseño limpio de 2 bloques que en móvil se apilan ordenadamente (`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`):
     - **Bloque superior (móvil) / izquierdo (desktop):** Miniatura (`h-16 w-16 shrink-0`), nombre del producto, precio unitario/porciones y en móvil botón compacto de eliminar en la esquina superior derecha.
     - **Bloque inferior (móvil) / derecho (desktop):** `CantidadStepper`, subtotal del ítem en negrita y botón `"Eliminar"` en pantallas `sm:`.
2. En `CarouselBanner.tsx`:
   - Reducir el ancho base del slide en móvil a `min-w-[240px] max-w-[280px] flex-[1_0_240px] sm:min-w-[360px] sm:max-w-[400px] sm:flex-[1_0_360px] lg:min-w-[420px] lg:max-w-[460px] lg:flex-[1_0_420px]` y ajustar el `px-[calc(50%-120px)]` en móvil para centrar limpiamente en pantallas de `360px`.
   - En móvil (`< 640px`), colocar los botones de flecha anterior/siguiente integrados en la barra inferior junto a los indicadores de posición (o en los bordes superiores de la imagen) para no tapar el título ni el botón `Eye` de la parte inferior del slide.

### 4. Casos límite (Edge Cases)
- **Nombres largos de producto en el carrito móvil:** `min-w-0 flex-1` para que el título haga wrap limpio sin empujar el stepper fuera de la pantalla.
- **Títulos largos en `CarouselBanner` móvil:** `line-clamp-1` o `truncate` con `min-w-0` junto al botón `Eye` (`shrink-0`).

### 5. Convenciones aplicables
- `docs/reglas_ui.md`: Uso exclusivo de breakpoints estándar (`sm:`, `md:`, `lg:`, `xl:`) y touch targets mínimos.

### 6. Definition of Done (DoD)
- [ ] `Carrito.tsx` usa `lg:` en lugar de `min-[900px]:` y cada ítem del carrito se visualiza ordenado en móviles de `360px` y en escritorio.
- [ ] `CarouselBanner.tsx` se adapta a `360px` sin desbordar ni tapar el texto/botón de detalle con las flechas.
- [ ] `npm --prefix frontend test -- --run` y `npm --prefix frontend run build` en verde.

---

## T130 — Navegación coherente y ergonomía móvil en `PerfilSidebar`, `Perfil` y `PerfilSeguimiento`

- **ID:** `T130`
- **Fase / Sprint:** `F4` / `S13`
- **Estado:** `Completado`
- **Rama sugerida:** `feature/T117-catalogo-fase-categorias`
- **Depende de:** `T129`

### 1. Contexto (Por qué)
1. En [`frontend/src/components/domain/PerfilSidebar.tsx`](../../frontend/src/components/domain/PerfilSidebar.tsx), los enlaces `"Mis Pedidos"` y `"Seguimiento de Pedido"` apuntan ambos a `/perfil/seguimiento`, haciendo imposible distinguir la lista de pedidos del rastreo individual y dejando el tab `"Mis Pedidos"` permanentemente inactivo.
2. En móvil (`< 1024px`), el `PerfilSidebar` ocupa toda la mitad superior de la pantalla con una tarjeta vertical grande antes del contenido tanto en `/perfil` como en `/perfil/seguimiento`.
3. En el modal `"Editar Dirección de Entrega"` de [`Perfil.tsx`](../../frontend/src/pages/Perfil.tsx), los campos `Comuna` y `Región` están en `grid-cols-2` fijo, quedando muy estrechos en móviles de `360px`.

### 2. Alcance y archivos a tocar (A qué)
| Acción | Archivo | `@id` PCA | Límite (`@limit`) |
| :--- | :--- | :--- | :--- |
| Modificar | `frontend/src/components/domain/PerfilSidebar.tsx` | `frontend.domain.perfilSidebar` | 150 |
| Modificar | `frontend/src/pages/Perfil.tsx` | `frontend.page.perfil` | 600 |
| Modificar | `frontend/src/pages/PerfilSeguimiento.tsx` | `frontend.page.perfilSeguimiento` | 600 |

### 3. Especificación técnica (Cómo)
1. En `PerfilSidebar.tsx`:
   - Hacer que `"Mis Pedidos"` apunte a `/perfil#pedidos` (o `/perfil?seccion=pedidos`) y que al hacer clic desplace suavemente a la sección `#ultimos-pedidos` de `Perfil.tsx` (activando el tab `"pedidos"` cuando `location.hash === "#pedidos"`), mientras `"Seguimiento de Pedido"` apunta a `/perfil/seguimiento`.
   - Optimizar la disposición móvil (`< 1024px`) de `PerfilSidebar`: cabecera de usuario compacta horizontal y pestañas de navegación en fila desplazable/compacta (`flex-row overflow-x-auto lg:flex-col`) para no empujar el contenido principal hacia abajo en teléfonos.
2. En `Perfil.tsx`:
   - Añadir `id="ultimos-pedidos"` a la tarjeta de `"Últimos Pedidos"` y hacer scroll suave automático si `location.hash === "#pedidos"`, pasando `tabActiva={location.hash === "#pedidos" ? "pedidos" : "datos"}` a `PerfilSidebar`.
   - Cambiar `grid-cols-2` por `grid-cols-1 sm:grid-cols-2` en el modal de Editar Dirección (`Comuna` y `Región`).

### 4. Casos límite (Edge Cases)
- **Navegación desde `/perfil/seguimiento` hacia `"Mis Pedidos"` (`/perfil#pedidos`):** Al montar `Perfil.tsx` con `#pedidos`, debe hacer `scrollIntoView({ behavior: "smooth" })` hacia `#ultimos-pedidos`.
- **Respetar `@limit(lines: 600)` en `Perfil.tsx` (actualmente 586 líneas):** Mantener el código conciso sin superar las 600 líneas.

### 5. Convenciones aplicables
- `docs/reglas_ui.md`: Navegación clara, sin enlaces duplicados a la misma vista y diseño responsive mobile-first.

### 6. Definition of Done (DoD)
- [ ] `"Mis Pedidos"` y `"Seguimiento de Pedido"` tienen propósitos y estados activos diferenciados.
- [ ] En móvil (`< 1024px`), `PerfilSidebar` muestra un diseño compacto que permite ver el contenido de inmediato.
- [ ] El modal de dirección en `Perfil.tsx` usa `grid-cols-1 sm:grid-cols-2`.

---

## T131 — Ergonomía, pre-llenado de sesión y validación preventiva en `Personalizacion.tsx`

- **ID:** `T131`
- **Fase / Sprint:** `F4` / `S13`
- **Estado:** `Completado`
- **Rama sugerida:** `feature/T117-catalogo-fase-categorias`
- **Depende de:** `T130`

### 1. Contexto (Por qué)
En [`frontend/src/pages/Personalizacion.tsx`](../../frontend/src/pages/Personalizacion.tsx):
1. Si el cliente ya inició sesión, el Paso 4 (`Nombre Completo`, `Correo Electrónico`, `Teléfono`) aparece en blanco en vez de pre-rellenarse con los datos de su cuenta/perfil como ya hace `Checkout.tsx`.
2. El selector de `Fecha estimada del evento` (`type="date"`) no tiene restricción `min`, permitiendo elegir fechas en el pasado.
3. Cuando el botón `"Solicitar Cotización #COT"` está deshabilitado (`disabled`), el usuario en móvil o desktop no recibe una indicación explícita de qué requisito falta completar (ej. elegir al menos 1 sabor o completar fecha/contacto).

### 2. Alcance y archivos a tocar (A qué)
| Acción | Archivo | `@id` PCA | Límite (`@limit`) |
| :--- | :--- | :--- | :--- |
| Modificar | `frontend/src/pages/Personalizacion.tsx` | `frontend.page.personalizacion` | 520 |

### 3. Especificación técnica (Cómo)
1. Consumir `useAuth()` y `localStorage.getItem("pasteleria_perfil_datos")` en `Personalizacion.tsx` para inicializar/pre-rellenar `nombre`, `email` y `telefono` si están vacíos.
2. Calcular la fecha mínima permitida (`minDate = new Date().toISOString().split("T")[0]`) y asignarla al atributo `min={minDate}` del input `type="date"`.
3. Mostrar un aviso claro y amigable encima o debajo del botón `"Solicitar Cotización #COT"` cuando falten campos obligatorios (ej. *"Para continuar: selecciona al menos 1 sabor y completa tus datos de contacto y fecha del evento"*).

### 4. Casos límite (Edge Cases)
- **Usuario edita manualmente su nombre o correo tras el pre-llenado:** Solo pre-rellenar cuando el campo esté vacío (`prev || valorSesion`), respetando cualquier edición manual del usuario.
- **Límite PCA:** `Personalizacion.tsx` tiene límite `@limit(lines: 520)` (actualmente 498 líneas); mantener la implementación limpia dentro del límite.

### 5. Convenciones aplicables
- `docs/convenciones.md` y `docs/reglas_ui.md`: Formularios accesibles y estados deshabilitados auto-explicativos.

### 6. Definition of Done (DoD)
- [ ] Usuario autenticado ve sus datos de contacto pre-rellenados en `Personalizacion.tsx`.
- [ ] El selector de fecha del evento impide elegir fechas anteriores a hoy (`min`).
- [ ] Si faltan campos requeridos, el resumen indica claramente qué falta para habilitar el envío.

---

## T132 — Interactividad real y persistencia local en `Blog.tsx`

- **ID:** `T132`
- **Fase / Sprint:** `F4` / `S13`
- **Estado:** `Completado`
- **Rama sugerida:** `feature/T117-catalogo-fase-categorias`
- **Depende de:** `T131`

### 1. Contexto (Por qué)
En [`frontend/src/pages/Blog.tsx`](../../frontend/src/pages/Blog.tsx):
1. Los botones inferiores de cada publicación (`MessageCircle`, `Repeat2`, `Heart`, `Share2`) no tienen manejadores `onClick`, comportándose como botones muertos.
2. Las publicaciones creadas por el usuario se pierden en cuanto navega a otra vista porque solo viven en `useState` volátil.

### 2. Alcance y archivos a tocar (A qué)
| Acción | Archivo | `@id` PCA | Límite (`@limit`) |
| :--- | :--- | :--- | :--- |
| Modificar | `frontend/src/pages/Blog.tsx` | `frontend.page.blog` | 260 |

### 3. Especificación técnica (Cómo)
1. Persistir la lista de publicaciones y el conjunto de `likedIds` / `repostedIds` en `localStorage` (`pasteleria_blog_posts_v1` y `pasteleria_blog_likes_v1`), combinando los `POSTS_INICIALES` con las reseñas publicadas por el usuario.
2. Conectar los botones de cada post:
   - **Me gusta (`Heart`):** Alterna el like del usuario, incrementa/decrementa el contador de `likes` y resalta el corazón en color `red-600` (`fill-current`).
   - **Republicar (`Repeat2`):** Alterna el contador de `reposts` y resalta en `green-700`.
   - **Responder (`MessageCircle`):** Enfoca el área de texto superior pre-llenando `@handle ` para responder cómodamente.
   - **Compartir (`Share2`):** Copia el enlace/texto de la reseña al portapapeles y muestra confirmación visual breve (`Check`).

### 4. Casos límite (Edge Cases)
- **`localStorage` corrupto o vacío:** Usar `try / catch` y caer de forma segura en `POSTS_INICIALES`.
- **Respetar `@limit(lines: 260)` en `Blog.tsx`:** Actualmente tiene 220 líneas; mantener el código compacto y por debajo de 260 líneas.

### 5. Convenciones aplicables
- `docs/reglas_ui.md`: Ningún botón interactivo visible puede carecer de respuesta funcional.

### 6. Definition of Done (DoD)
- [ ] Los botones de Me gusta, Republicar, Responder y Compartir en `Blog.tsx` funcionan con retroalimentación visual inmediata.
- [ ] Las publicaciones nuevas y los likes persisten en `localStorage` al navegar entre páginas.
- [ ] `npm --prefix frontend test -- --run` y `npm --prefix frontend run build` pasan sin errores.
