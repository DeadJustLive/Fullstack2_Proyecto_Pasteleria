# Documentación del Proyecto - Crème & Co

Este documento contiene un registro estructurado del estado actual del proyecto, incluyendo el diccionario de variables, el diccionario de funciones JavaScript y la estructura general, para facilitar su seguimiento y futuras actualizaciones.

---

## 1. Estado Actual del Proyecto

El proyecto consiste en el front-end de un sistema de pastelería artesanal (Crème & Co). Está construido de manera estática utilizando **HTML5, CSS3 y Vanilla JavaScript**, y está dividido en dos grandes ecosistemas:

- **Sección Administrador (`pages/admin`):** Utiliza Bootstrap para el layout de los paneles de control e inventario. Recientemente se solucionaron problemas de z-index (superposición) con los modales de edición.
- **Sección Cliente (`pages/cliente`):** Construido con CSS personalizado y variables nativas. 
  - Cuenta con una navegación unificada en todas las páginas.
  - Implementa un sistema de grillas responsivas (hasta 4 columnas) con *Media Queries* estándar (`sm`, `md`, `lg`, `xl`).
  - Utiliza SVG nativos en reemplazo de emojis para mayor consistencia visual en los footers y botones de compartición.
  - Se han deshabilitado selecciones de texto accidentales (`user-select: none`) para dar sensación de App nativa.

### Hitos Implementados Recientes:
1. **Filtros Avanzados (Catálogo):** Implementación de checkboxes encapsulados en `<details>` y control de rangos de precio con confirmación manual.
2. **Sistema de Modales y Compartir (Productos):** Creación de un modal único para opciones de compartir (Copiar Link, WhatsApp, IG) mediante botones de íconos SVG limpios en la vista de detalle de cada producto.
3. **Simulación de Autenticación:** Modales globales flotantes de Login y Registro (sin validaciones forzosas) que emulan sesiones persistentes modificando de forma dinámica el menú del Navbar según el estado de la sesión, facilitando las pruebas.

---

## 2. Diccionario de Variables

### Variables CSS (Definidas en `estilos.css`)
Ubicadas en el bloque `:root`, controlan la identidad visual (Design System) de la sección Cliente.

| Variable | Valor | Descripción |
| :--- | :--- | :--- |
| `--color-primary` | `#FFC0CB` | Rosa pastel, utilizado en botones y elementos destacados. |
| `--color-secondary` | `#8B4513` | Tono marrón intermedio, usado para iconos, precios e inputs. |
| `--color-tertiary` | `#5D4037` | Tono marrón oscuro, utilizado para títulos, textos de contraste y navbar. |
| `--color-neutral` | `#FFF5E1` | Color crema, actúa como fondo principal de las páginas del cliente. |
| `--color-ink` | `#3A2A21` | Tono oscuro profundo, color principal para el cuerpo de texto (`body`). |
| `--color-inverted` | `#241812` | Variación más oscura para fondos contrastantes. |
| `--font-display` | `'Be Vietnam Pro'` | Tipografía secundaria usada en encabezados, botones y menús. |
| `--font-body` | `'Source Sans 3'` | Tipografía principal usada en descripciones y párrafos largos. |
| `--radius` | `12px` | Radio de curvatura estándar para bordes (tarjetas, botones, modales). |
| `--container-width` | `1080px` | Ancho máximo centralizado de la página principal. |

### Variables de Almacenamiento (Local Storage)
Variables gestionadas por Vanilla JavaScript en el navegador del usuario final.

| Variable | Tipo | Descripción |
| :--- | :--- | :--- |
| `simulated_login` | `String` ("true" / null) | Controla el estado simulado de sesión. Si es `"true"`, el menú muestra "Mi Perfil" y "Cerrar sesión". De lo contrario, pide "Iniciar sesión". |

---

## 3. Diccionario de Funciones (JavaScript)

El proyecto utiliza scripts en línea (`catalogo.html`) y scripts unificados (`js/auth.js`) para manejar la lógica de la vista del cliente.

### Autenticación y Modales (`js/auth.js`)
Estas funciones se cargan de forma global en todas las vistas del Cliente y se encargan del control de UI.

| Función | Parámetros | Acción que realiza |
| :--- | :--- | :--- |
| `isLogged()` | N/A | Retorna `true` o `false` verificando la variable `simulated_login` del Local Storage. |
| `updateDropdown()` | N/A | Modifica dinámicamente el HTML del sub-menú del avatar en el Navbar basándose en `isLogged()`. |
| `openModal(id)` | `id` (String) | Cierra todos los modales abiertos, localiza el div mediante su `id` (ej: `modal-login`, `modal-compartir`) y le añade la clase `.active`. |
| `closeAuthModals()` | N/A | Selecciona todos los elementos `.modal-overlay` y remueve su clase `.active`, cerrándolos visualmente. |
| `handleLogin(e)` | `e` (Event) | Previene el envío HTTP, emula la conexión seteando `simulated_login`, y redirige al Perfil (si está en la página de login) o recarga la vista actual. No valida campos. |
| `handleRegistro(e)`| `e` (Event) | Mismo comportamiento que `handleLogin()`, orientado a la creación de cuenta simulada y redirección. |
| `handleLogout(e)`| `e` (Event) | Remueve `simulated_login`, recarga el dropdown y redirige a la página principal si el usuario estaba viendo información privada. |
| `togglePassword(btn)`| `btn` (Element) | Recibe un botón, busca el `input` contiguo e intercambia dinámicamente entre `type="password"` y `type="text"`. También cambia el SVG del ícono (ojo). |

### Interacción de Productos y Catálogo
Funciones enfocadas a la visualización y distribución de productos (algunas en `auth.js` y otras en línea).

| Función | Archivo | Acción que realiza |
| :--- | :--- | :--- |
| `copiarLink()` | `auth.js` | Usa la API `navigator.clipboard` para copiar la URL actual al portapapeles y notifica al usuario con un `alert()`. |
| `compartirWhatsapp()` | `auth.js` | Genera una URI codificada con un mensaje dinámico y la URL actual para redirigir a `api.whatsapp.com`. |
| `filtrarProductos()` | `catalogo.html` | Lee los arreglos de inputs `checkbox` seleccionados y el rango numérico (slider) para ocultar (`display: none`) o mostrar los `.product-card`. |
| `limpiarFiltros()` | `catalogo.html` | Resetea el `<form>` de filtros a los valores por defecto, limpia la barra de búsqueda y fuerza que todos los productos se muestren. |

---
*Última actualización generada de acuerdo al estado actual de los archivos.*
