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

```markdown
// @learn-error id='FRONT-013'
// input='Dejar el main del shell como flex item con el max-width y el margin: 0 auto del snapshot'
// expected='Que el contenido se centrara y quedara contenido en un contenedor de 1080px en cualquier pantalla'
// actual='El main es flex item de una columna: el margin-inline: auto anula el estirado y lo dimensiona por su contenido (fit-content). El marquee (width: max-content) lo inflaba a 1080px en TODAS las pantallas, y el hero full-bleed quedaba fuera del viewport (en 360px ocupaba x=360..720). El html,body{overflow-x:hidden} del snapshot ocultaba el sintoma en vez de arreglarlo'
// fix='Anadir max-w-full al main (fija el ancho al viewport) y recuperar el tope de 1080px con xl:max-w-page (desde 1280px, donde ya cabe). Verificar con medicion real en el navegador: main == clientWidth, hero 0..viewport, scrollWidth == clientWidth.'
```

```markdown
// @learn-error id='FRONT-014'
// input='Anadir un nodo con varias relaciones al manifiesto y ejecutar impact para saber que le afecta'
// expected='Que el grafo tuviera todas las relaciones del nodo (por ejemplo, 44 relaciones en 23 nodos)'
// actual='El grafo reportaba 23 relaciones (exactamente una por nodo): parse_annotations asignaba meta["relates"] = [...] en vez de acumularla, asi que de cada bloque @pca solo sobrevivia la ULTIMA linea @relates. El check pasaba igual (0 relaciones rotas) porque la que sobrevivia era valida: el bug se escondia'
// fix='En _assign, las relaciones se acumulan con una lista de deduplicados en vez de sobrescribirse. Senal de alarma: el numero de relaciones debe coincidir con la suma de relates del manifiesto, no con el numero de nodos.'
```

// @learn-error id=FIDA-015 input="python fida-kit/tools/fida_opl.py selftest / guard en Windows PowerShell (cp1252)" expected="10 PASS y salida de emojis WAL sin excepción" actual="FAIL en test_multilang_init_and_install_project por ausencia de .fidaignore oculto y UnicodeEncodeError en cp1252 al imprimir iconos de guard" fix="Síntesis automática de .fidaignore por defecto en fida_opl_templates.py y reconfiguración UTF-8 de sys.stdout/sys.stderr en fida_opl.py"

// @learn-error id=BACK-016 input="Arranque de service-payment-flow y microservicios con backend/.env" expected="Inyección automática de FLOW_API_KEY, FLOW_SECRET_KEY y credenciales MySQL desde .env" actual="Spring Boot ignoraba archivos .env por falta de spring.config.import y usaba el placeholder FLOW_SANDBOX_API_KEY cayendo al simulador local" fix="Agregado spring.config.import optional:file:.env[.properties] y optional:file:backend/.env[.properties] en los 7 application.yml, carga silenciosa en iniciar_backend.bat/sh y sanitización de comillas/espacios en FlowSignatureService y FlowClientService"

// @learn-error id=BACK-017 input="Retorno del comprador tras pagar o cancelar en Flow.cl (POST a urlReturn)" expected="Redirección limpia del navegador a /pago/exito si status=2 o /pago/error si status=3/4" actual="Flow enviaba HTTP POST con token a la ruta estática /pago/exito del SPA sin verificar estado real del cobro" fix="Creado endpoint puente POST/GET /api/payments/flow/return en FlowWebhookController que verifica getStatus en Flow y responde con HTTP 303 See Other (GET) a /pago/exito o /pago/error según el resultado real"

// @learn-error id=BACK-018 input="mvn package -DskipTests en service-identity durante T105" expected="Compilación exitosa de los 9 módulos Maven" actual="IdentityController.java tenía truncamiento en línea 121 tras edición previa" fix="Restauración íntegra de métodos register, getProfile, updateProfile, listUsers, createUserFromAdmin, updateUserFromAdmin, changeRole, listRoles y toUserDto en IdentityController.java y empaquetado exitoso de los 9 JARs"

// @learn-error id=DOCKER-019 input="Cargar variables de backend/.env (con localhost:3306) en iniciar_backend.bat antes de docker compose up" expected="Que los contenedores se comuniquen entre sí mediante los hostnames de red Docker (mysql-db)" actual="Las variables con localhost sobrescriben los defaults del compose; dentro de un contenedor, localhost es el propio contenedor y no MySQL" fix="Separar las variables de Docker en .env.docker con hostnames de red (mysql-db, kafka:29092, redis). En docker-compose.prod.yml fijar la topología de red sin interpolaciones que apunten a localhost y usar env_file: .env.docker."

// @learn-error id=DOCKER-020 input="Dockerfiles basados únicamente en copiar target/*.jar sin forzar compilación Maven previa" expected="Que los contenedores corran siempre con el último código fuente compilado" actual="Si se modifica código Java pero el JAR ya existe, docker compose build reutiliza el JAR desactualizado sin advertencias" fix="iniciar_backend.bat debe ejecutar siempre mvn package -DskipTests antes de docker compose up --build para garantizar que los artefactos reflejen el código más reciente."

// @learn-error id=DOCKER-021 input="Depender exclusivamente de Hibernate ddl-auto: update para migrar tipos de columnas en MySQL" expected="Que al cambiar ProductEntity.imagen a columnDefinition='MEDIUMTEXT', MySQL altere la columna automáticamente" actual="Hibernate ddl-auto: update nunca altera tipos de columnas preexistentes; en BDs ya creadas la columna permanece en VARCHAR(255) y trunca Data URLs WebP" fix="Implementar DatabaseSchemaMigrator con @PostConstruct para verificar en information_schema y ejecutar ALTER TABLE products MODIFY imagen MEDIUMTEXT NOT NULL si no es tipo texto largo."

// @learn-error id=FLOW-022 input="Creación de orden en Flow.cl Sandbox (/payment/create) con correos de prueba arbitrarios o entorno local" expected="Apertura directa de la pasarela Flow para cualquier comprador" actual="Flow Sandbox restringe el cobro (código 1620 'The userEmail is not valid') si el email no está enrolado como cliente de prueba en la cuenta sandbox de Flow (ej. juanperez123@gmail.com). Además, urlConfirmation en localhost no es accesible desde internet sin túnel público (ngrok), por lo que la confirmación asíncrona por webhook de Flow queda limitada." fix="El servicio conmuta transparentemente al Simulador Local de Contingencia (LOCAL_SIMULATOR) preservando la orden y exponiendo el motivo en diagnosticReason. La pasarela Flow real queda en espera/standby para homologación con credenciales productivas oficiales o túnel de webhooks público."

// @learn-error id=ADMIN-023 input="Contenedor flex de AdminLayout con clase inexistente min-vw-0 y tablas de hasta 8 columnas" expected="Que en móviles la pantalla no tenga desplazamiento horizontal lateral y las tablas scrolleen dentro de su tarjeta" actual="Flex item usaba min-width: auto por defecto, expandiéndose al ancho de la tabla (900px) y estirando todo el viewport con scroll lateral no deseado" fix="Asignar min-width: 0 y overflow-x: hidden en el contenedor flex principal, max-width: 100vw en html/body, header con text-truncate y botones adaptativos, scrollbar visual en table-responsive y switcher mobile en POS."

*(El alumno y la IA añadirán más errores debajo de esta línea durante el desarrollo del Taller 4)*
