# Biblioteca de Componentes Agnósticos (@WebComponents)

Esta carpeta funciona como la **columna vertebral (Framework Interno)** de tus proyectos. Aquí reside toda la lógica avanzada, optimizaciones, componentes visuales y conexiones que has ido puliendo en otros proyectos y que ahora están desacopladas ("agnosticadas") para ser reutilizadas.

## 🏗 Estructura de Carpetas

### 1. `UI/` (Frontend Universal)
Componentes visuales responsivos con diseño "Mobile-First".
*   `Layouts/`: Componentes estructurales.
    *   `MainLayout.tsx`: Maneja el contenedor general y áreas seguras.
    *   `Header.tsx`: La Navbar responsiva con seguimiento de scroll.
    *   `ScrollToTop.tsx`: Botón flotante para subir rápidamente (ideal UX).
*   `Sections/`: Secciones de página completas listas para ensamblar.
    *   `HeroSection.tsx`: Adaptable en altura para evitar bugs en móviles.
    *   `ServicesSection.tsx`: Grilla de servicios.
    *   `TrustSection.tsx`: Sección de testimonios/confianza.
    *   `RelatedProperties.tsx`: Sección de sugeridos/recomendados.
*   `Organisms/`: Componentes complejos funcionales.
    *   `ActionModalBase.tsx`: Modal base con animaciones y trampas de foco.
    *   `ImageLightbox.tsx`: Galería/Visor de imágenes a pantalla completa.
*   `Carousels/`:
    *   `FeaturedPropertiesCarousel.tsx`: Carrusel de elementos destacados con scroll horizontal suave y *snap*.
*   `Grids/`:
    *   `PropertyGrid.tsx`: Plantilla de CSS Grid responsiva (1 columna en móvil, 2 en tablet, 3-4 en desktop) para mostrar catálogos manteniendo la consistencia de altura.
*   `Cards/`:
    *   `PropertyCard.tsx` / `PropertyCardBase.tsx`: Tarjetas de contenido con diseño elevado y optimizado.
*   `Atoms/` & `Molecules/`: Componentes base (`button`, `card`, `dialog`, etc.).

### 2. `SupabaseOptimization/`
Módulos diseñados para maximizar el uso de la Capa Gratuita (Free Tier) de Supabase.
*   `free-plan-tracker.ts`: Monitorea el consumo de la DB, Storage y conexiones Realtime.
*   `hooks/useSupabaseTable.ts`: Hook universal para React que consolida y limita las conexiones `Realtime`.
*   `error-logger.ts`: Encola errores de JS en `localStorage` y hace un único INSERT diario.

### 3. `ImageManagement/`
*   `image-utils.ts`: Compresión de imágenes, conversión a WebP, y generación de miniaturas.
*   `ig-aspect-ratio.ts`: Recortes automáticos y forzado de aspecto.

### 4. `Security/`
*   `pii.ts`: Sanitizador de PII. Enmascara correos, RUTs, teléfonos de los logs.

### 5. `DatabaseManagement/`
Plantillas SQL para mantenimiento, auditoría y escalabilidad.
*   `table_error_logs.sql`: El esquema para el `error-logger.ts`.
*   `cron_cleanup_template.sql`: Plantilla para automatizar tareas (pg_cron).
*   `trigger_audit_template.sql`: Trigger universal para auditar operaciones CRUD en JSONB.

### 6. `CrossPlatform/`
Lógica de detección y adaptación para aplicaciones híbridas.
*   `platform-detect.ts`: Sistema de detección de entorno universal (`isWeb`, `isCapacitor`, `isTauri`).

## 🎯 Regla de Oro
**Ningún componente aquí puede tener nombres propios de un proyecto.**
Todo debe recibir sus dependencias mediante inyección o recibir datos genéricos (ej. genéricos en TypeScript `<T>`).
### 7. `DatabaseManagement/DataLayer/`
Patrones de acceso a datos para robustez y comodidad en frontend.
*   `api-mock-fallback.ts`: Capa de abstracción brutal. Envuelve las llamadas a Supabase de tal manera que, si la base de datos no está configurada o hay un error de red, el sistema cae de forma elegante a usar datos locales (`mockData`). Esto te permite seguir diseñando el Frontend aunque el Backend esté caído o sin internet.

### 8. `Infrastructure/`
Archivos de configuración y despliegue para servidores o servicios Cloud.
*   `netlify.template.toml`: Plantilla optimizada para Netlify que incluye redirecciones obligatorias para aplicaciones de página única (SPA/React), forzado de versión de Node, y cabeceras de seguridad básicas.
*   `Scripts/`: Herramientas de terminal para operar la base de datos.
    *   `public_rls_template.sql`: Plantilla de seguridad SQL. Permite accesos de "Solo Lectura" para el catálogo público y "Solo Inserción" para formularios de contacto, tapando agujeros de seguridad en el Storage de Supabase.
    *   `wipe-database-template.ts`: Script en TypeScript para vaciar la base de datos de pruebas rápidamente desde la terminal durante el desarrollo local.

### 7. `UI/Templates/` (Páginas Completas)
Vistas completas que orquestan el diseño general de una URL específica.
*   `CatalogViewTemplate.tsx`: Plantilla de Catálogo. Incluye la lógica de *Infinite Scroll* (paginación infinita al bajar) y el estado vacío ("0 resultados") con su diseño amigable.
*   `ProductViewTemplate.tsx`: Plantilla para el detalle de un producto individual. Organiza las imágenes, el precio, la descripción y botones de contacto.

*(Nota sobre Filtros y Botones)*
*   En `UI/Organisms/FiltersTemplate.tsx` tienes la compleja barra lateral/modal responsiva para filtrar catálogos por precio, categorías, etc.
*   Los botones (`UI/Atoms/button.tsx`) ya traen preconfiguradas las "Variantes" (`variant="outline"`, `variant="ghost"`) usando CVA (Class Variance Authority) para consistencia visual.

### 9. `Forms/` (Formularios y Validaciones)
Componentes de captura de datos seguros y conectados a la base de datos.
*   `useContactForm.ts`: Un Hook de React magistral (`useReducer` en lugar de `useState` infinitos) que maneja el ciclo de vida completo de un formulario: estados de carga (`isSubmitting`), errores por campo, y validaciones Regex (ej. validación estricta de RUT/Teléfonos Chilenos y formato de correos).
*   `ContactForm.tsx`: El componente visual que se conecta al Hook, y renderiza mensajes de error, spinners de carga, y se auto-resetea al finalizar con éxito.
*   `PropertyContactForm.tsx`: Variante inyectada que automáticamente asocia la consulta del usuario al ID del producto que está mirando (Double Insert: guarda en CRM `leads` y en `messages`).

### 10. `DashboardForms/`
Vistas y formularios de backoffice para la gestión de datos internos.
*   `PublicacionesTemplate.tsx`: Plantilla avanzada de formulario CRUD (Crear, Leer, Actualizar, Borrar). Contiene la lógica para manejar subida de archivos pesados (imágenes), actualización en tiempo real de la base de datos y validaciones estrictas antes de guardar un producto/propiedad.

### 11. `Integrations/Instagram/`
Microservicios (Edge Functions) para la integración completa con la API Graph de Instagram.
*   `instagram-authorize/` & `instagram-callback/`: Flujo OAuth 2.0 seguro para conectar cuentas.
*   `instagram-validate/` & `refresh-instagram-token/`: Mantenimiento automático de tokens de acceso para que la sesión no expire.
*   `publish-to-instagram/`: Lógica compleja que toma una imagen del Storage, la procesa, envía el comando de publicación a los servidores de Meta y maneja los Webhooks de respuesta.

### 11. `Integrations/AI/`
Lógica altamente pulida para orquestar llamadas a modelos de Inteligencia Artificial (LLMs).
*   `aiService.ts`: Un mega-servicio que gestiona prompts estructurados, control de costos, límites de tokens y parseo estricto de respuestas JSON desde la IA.
*   `useAILogger.ts`: Hook para observar y depurar en tiempo real las respuestas de la IA sin saturar la consola o la base de datos.

### 12. `UI/Layouts/` (Actualizado)
*   `FloatingNavbar.tsx`: Un componente de navegación estilo "dock" de Apple, moderno, responsivo y visualmente muy limpio. Ideal para interfaces de aplicaciones móviles o WebApps.

### 13. `Ecommerce/` (E-Commerce y Carrito de Compras)
Componentes listos para transformar cualquier catálogo en una tienda online funcional.
*   `Cart/`: Contiene `CartDrawer.tsx` (el menú lateral que se desliza mostrando los productos) y `FloatingCartButton.tsx`.
*   `Checkout/`: El proceso de pago. Contiene `CheckoutForm.tsx`, selección de direcciones y método de entrega. ¡Ideal para conectarlo con el módulo de `ModulosFlow` (Pasarela de pagos)!
*   `Context/CartContext.tsx`: El "Cerebro" global del carrito. Mantiene el estado de los productos elegidos, calcula el total y guarda la sesión en el navegador.

### 14. `Auth/` (Autenticación)
*   `AuthModal.tsx` y `AuthContext.tsx`: Lógica para gestionar inicio de sesión de usuarios, recuperar contraseñas y mantener el estado de la sesión activa en toda la aplicación.

### 15. Extras (Actualizaciones)
*   **UI/Grids**: Agregado `ProductGrid_Variant.tsx` desde la Plantilla SaaS, ofrece una distribución alternativa y filtros empaquetados.
*   **Auth/Profile**: Módulo completo extraído de la Plantilla SaaS para la gestión del usuario (Pestañas de Direcciones, Favoritos, Historial de Órdenes y Cambio de Contraseña).
*   **DashboardForms**: Agregado `UserManagementTemplate.tsx` (desde la App Móvil SaaS). Es un panel completo de administración para gestionar, bloquear y promover roles de usuarios dentro de la plataforma.
*   **CrossPlatform**: Agregado `BottomNav.tsx` (la clásica barra de navegación inferior para Apps Móviles tipo Instagram/Tiktok) y el Hook de oro puro `useCapacitorLifecycle.ts` que se encarga de reaccionar cuando la App se minimiza o regresa al primer plano (para refrescar datos automáticamente).

### 16. Módulos Avanzados (App Móvil)
*   **DataLayer/useRealtimeSync.ts**: Hook maestro para sincronización en tiempo real. Utiliza WebSockets de Supabase para escuchar cambios instantáneos en la base de datos. Si un administrador aplica un descuento, cambia el stock a 0 o "oculta" un producto, los catálogos de todos los clientes conectados se actualizan en milisegundos sin recargar la página.
*   **DashboardForms/ReportsTemplate.tsx**: Panel de métricas y reportes. Lógica lista para graficar y resumir ventas, desempeño de productos e interacciones de los clientes.
*   **DashboardForms/SettingsTemplate.tsx**: Panel maestro de configuraciones de la aplicación.
*   **Auth/PinPadModal.tsx**: Seguridad de Nivel Bancario/Físico. Un modal con un teclado numérico (Numpad) requerido para realizar acciones destructivas o entrar al panel de administración, evitando que alguien tome el dispositivo desbloqueado del administrador y cambie los precios o borre información.
