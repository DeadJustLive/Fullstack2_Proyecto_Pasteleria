# 🗺️ Mapa del Sitio (Sitemap) y Rutas

Para organizar la navegación de nuestra aplicación en React, dividiremos las rutas en dos grandes bloques: **Público (Cliente)** y **Privado (Administrador)**. 

Esta será la estructura oficial que usaremos al configurar nuestro enrutador (React Router). Cada URL estará vinculada a un archivo dentro de la carpeta `src/pages/`.

## 👤 Zona Cliente (Público)
Estas son las páginas principales de la pastelería.

| Ruta (URL) | Archivo Sugerido (`pages/cliente/`) | Descripción |
| :--- | :--- | :--- |
| `/` | `Home.tsx` | Página principal de bienvenida (antiguo `index.html`) |
| `/catalogo` | `Catalogo.tsx` | Lista de todos los pasteles y productos |
| `/producto/:id` | `ProductoDetalle.tsx` | Vista detallada de un producto específico |
| `/carrito` | `Carrito.tsx` | Resumen de compras antes de pagar |
| `/checkout` | `Checkout.tsx` | Formulario de pago y facturación |
| `/envio` | `Envio.tsx` | Opciones y datos de envío |
| `/confirmacion` | `Confirmacion.tsx` | Pantalla de éxito tras realizar un pedido |
| `/login` | `Login.tsx` | Inicio de sesión de usuarios |
| `/registro` | `Registro.tsx` | Creación de cuenta nueva |
| `/perfil` | `Perfil.tsx` | Perfil del usuario e historial de órdenes |

## 🛡️ Zona Administrador (Privado)
Estas rutas tendrán el prefijo `/admin` y deben estar protegidas. Solo el personal de la pastelería podrá acceder.

| Ruta (URL) | Archivo Sugerido (`pages/admin/`) | Descripción |
| :--- | :--- | :--- |
| `/admin` o `/admin/dashboard`| `Dashboard.tsx` | Panel principal con métricas e ingresos |
| `/admin/pos` | `Pos.tsx` | Punto de Venta (Point of Sale) para tienda física |
| `/admin/pedidos` | `Pedidos.tsx` | Gestión y estados de órdenes de clientes |
| `/admin/inventario` | `Inventario.tsx` | Gestión de stock de productos e insumos |
| `/admin/usuarios` | `Usuarios.tsx` | Gestión de roles, empleados y clientes |
| `/admin/configuracion`| `Configuracion.tsx` | Ajustes generales de la plataforma |

---

### 💡 Nota para el equipo sobre el Enrutamiento:
Al construir estas páginas en la carpeta `src/pages/`, utilizaremos **Componentes de Layout**. 

Por ejemplo, no es necesario que importen el `<Navbar />` y el `<Footer />` en cada una de las páginas del cliente. Existirá un componente `<ClienteLayout />` que envolverá a todas las rutas públicas, y un `<AdminLayout />` que contendrá la barra lateral (Sidebar) para las rutas privadas.
