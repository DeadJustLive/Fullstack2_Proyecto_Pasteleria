<!-- @pca:start
@id(docs.cicatrices_guerra)
@kind(doc)
@limit(lines: 300)
@relates(docs.convenciones)
@relates(docs.reglas_ui)
@desc(Learning loop: errores commits, su causa y su solución)
@pca:end -->

# Registro de Cicatrices de Guerra (Learning Loop)

> **Instrucción para la IA:** Si el proyecto falla, debes consultar este archivo para ver si cometiste este error en el pasado. Si resolvemos un bug complejo, debes agregar el error aquí siguiendo el formato estricto.

## Errores Registrados

```markdown
// @learn-error id='EJEMPLO-001'
// input='Intentar hacer un fetch a Supabase sin el token JWT en las Edge Functions'
// expected='Que la base de datos rechace la solicitud'
// actual='Error silencioso 500 sin mensaje descriptivo'
// fix='Siempre inyectar el Authorization Header con el Bearer Token extraído del contexto de Deno.'
```

---

## Errores reales del proyecto

### Frontend — Home y design system (2026-10-22)

```markdown
// @learn-error id='FRONT-001'
// input='Botones del carrusel con className="carousel-btn prev" / "next" pero sin onClick'
// expected='Que las flechas desplazen la lista de destacados'
// actual='El carrusel era un scroll horizontal sin ningún control: en escritorio no habia forma de avanzar'
// fix='El scroll nativo (scroll-snap) es el mecanismo real; las flechas hacen scrollBy sobre el mismo track, se deshabilitan en los extremos y se ocultan por debajo de lg. Ver components/domain/CarouselDestacados.tsx.'
```

```markdown
// @learn-error id='FRONT-002'
// input='El boton "Anadir al carrito" de ProductCard era un <Link to="/carrito">'
// expected='Que el producto se agregue al carrito y se vea el feedback en la tarjeta'
// actual='Navegaba a /carrito y el producto nunca se agregaba'
// fix='Usar el CartContext (useCart().agregar) y un estado local que muestra "Anadido!" durante 1,6 s.'
```

```markdown
// @learn-error id='FRONT-003'
// input='Clases del snapshot que nunca existen: "btn-secondary", "btn-sm" y "blog-section"'
// expected='Que el boton "Leer articulo" tuviera fondo y borde, y que la seccion del blog tuviera su estilo'
// actual='El boton quedaba transparente y sin borde; la seccion del blog se renderizaba sin estilos propios'
// fix='Antes de copiar una clase del mockup, verificarla con grep en frontend/src/mockup/cliente/. Si no existe, usar el componente del design system (ButtonLink variant="outline") y las utilidades de Tailwind.'
```

```markdown
// @learn-error id='FRONT-004'
// input='El hero usaba margin-top: -2.5rem fijo mientras el main tenia padding-top de 1.75rem en movil'
// expected='Que el hero llegue justo hasta debajo del header'
// actual='En <=640px el hero se subia 12px por encima del header y lo pisaba'
// fix='El margen negativo del hero acompana al breakpoint del padding del main: -mt-7 sm:-mt-10. Si cambias uno, cambia el otro.'
```

```markdown
// @learn-error id='FRONT-005'
// input='Flechas del carrusel posicionadas con left: -24px / right: -24px'
// expected='Que las flechas quedaran dentro del contenedor'
// actual='Entre 900 y 1130px se escapaban del section y se superponian entre si'
// fix='Las flechas viven fuera del track (layout flex) y se ocultan por debajo de lg. Nunca usar offsets negativos para sacar un control de su contenedor.'
```

```markdown
// @learn-error id='FRONT-006'
// input='El nombre del producto llevaba className="text-tertiary" dentro de un <h3>, pero el enlace dentro hereda "a { color: var(--color-secondary) }" del snapshot'
// expected='Nombre del producto en tertiary (como el mockup)'
// actual='Salia en secondary (marron) y el hover:text-secondary era un no-op: no se notaba ningun cambio al pasar el mouse'
// fix='El color va en el propio <Link> (no en el <h3> padre): className="text-tertiary transition-colors hover:underline". Regla: el color de un enlace se define en el enlace.'
```

```markdown
// @learn-error id='FRONT-007'
// input='Extraer el logo SVG de Home.tsx a un componente reutilizable, dejando el id del degradado fijo ("gold")'
// expected='Cada instancia con su propio id'
// actual='Con dos logos en la misma pagina el segundo apuntaba al degradado del primero'
// fix='Generar el id con useId() y filtrar los caracteres no validos para url(#id): useId().replace(/[^a-zA-Z0-9]/g, "")'
```

```markdown
// @learn-error id='FRONT-008'
// input='Exportar buttonVariants desde components/ui/Button.tsx para reutilizarlo en ButtonLink'
// expected='Lint limpio'
// actual='eslint: react-refresh/only-export-components (un archivo que exporta componentes y constantes a la vez rompe el Fast Refresh)'
// fix='Mover las variantes a components/ui/buttonVariants.ts. Un archivo = una responsabilidad (CONV-GEN-03).'
```

```markdown
// @learn-error id='FRONT-009'
// input='Re-codificar un JPEG en el mismo path con sharp (writeFile sobre el archivo que sharp todavia tiene abierto)'
// expected='Sobrescribir la imagen optimizada'
// actual='Error UNKNOWN: open ... en node:fs/promises writeFile'
// fix='Leer el archivo a memoria con readFile antes de procesar, y escribir primero a un .tmp y renombrar. El script ya lo hace asi.'
```

```markdown
// @learn-error id='FRONT-010'
// input='Usar 100vw para el hero full-bleed'
// expected='Que el hero ocupe todo el ancho de la pantalla'
// actual='100vw incluye el ancho de la scrollbar: el hero se desborda 15px y aparece scroll horizontal'
// fix='Usar 100cqi contra el contenedor con container-type: inline-size (utilidad .full-bleed en index.css).'
```

```markdown
// @learn-error id='FRONT-011'
// input='Asumir que el mockup es la fuente de verdad al replicar sus clases'
// expected='Migrar al design system de Tailwind'
// actual='Se arrastraron clases del snapshot (.hero-wrapper, .carousel, .card-grid, .product-card) que ademas tenian bugs heredados (D-03, D-06, B7)'
// fix='El mockup es solo referencial para la estructura base. Las decisiones de UI salen de docs/reglas_ui.md y de los tokens de index.css.'
```

```markdown
// @learn-error id='FRONT-012'
// input='Smoke test SSR que buscaba la URL del fondo del hero ("fondo_obrador.webp") dentro del HTML renderizado'
// expected='Encontrar la URL en el HTML y dar la comprobacion por buena'
// actual='El HTML no contenia la URL (esta en el CSS compilado, dentro de .hero-bg): 1 de 26 comprobaciones fallaba por una asercion mal planteada, no por un bug de la app'
// fix='Cuando el recurso lo define el CSS (background-image, @font-face), buscarlo en la hoja compilada y no en el markup. Y comprobar las imagenes referenciadas contra /public para detectar rutas rotas.'
```

*(El alumno y la IA añadirán más errores debajo de esta línea durante el desarrollo del Taller 4)*
