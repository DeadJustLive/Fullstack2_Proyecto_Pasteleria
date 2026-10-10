# 📋 Plan de Desarrollo: Asignación y Referencias de Archivos

Para que **Matias**, **Nicolas** y **Anais** sepan exactamente qué archivo abrir y transformar en cada paso, aquí está el mapeo oficial de los archivos de origen (`MockUpPasteleria/`) a los nuevos componentes en React (`frontend/src/`).

---

## 👥 Resumen de Roles

| Integrante | Rol Principal | Foco Técnico |
| :--- | :--- | :--- |
| **Matias** | Arquitectura y Flujo de Compra | Lógica de estado, componentes UI y POS |
| **Anais** | Experiencia de Cliente y Catálogo | Presentación visual, flujo de navegación y Dashboard |
| **Nicolas** | Autenticación y Gestión de Datos | Formularios, seguridad y tablas del Administrador |

---

## 🗺️ Mapeo Detallado de Tareas (Origen ➔ Destino)

### 🧱 SPRINT 1: Los Cimientos y el Sistema de Diseño

#### 🍰 Matias
| Componente a Crear | Archivo Origen (`MockUpPasteleria/`) | Notas de Implementación |
| :--- | :--- | :--- |
| `src/components/ui/Button.tsx` | `MockUpPasteleria/components/common/button/button.html` | Usar CVA con variantes (primary, secondary, outline) y tamaños. |
| `src/components/ui/Input.tsx` | `MockUpPasteleria/components/common/form-field/` | Extraer clases de input y soporte para estados de error. |
| Configuración de Rutas | *(Nuevo)* | Dejar listo `react-router-dom` con los esquemas base. |

#### 🎨 Anais
| Componente a Crear | Archivo Origen (`MockUpPasteleria/`) | Notas de Implementación |
| :--- | :--- | :--- |
| `src/components/layout/Navbar.tsx` | `MockUpPasteleria/components/features/navbar/navbar.html` | Adaptar los enlaces y botones a componentes de React. |
| `src/components/layout/Footer.tsx` | Extraer del pie de `MockUpPasteleria/pages/cliente/index.html` | Modularizar el footer para no repetirlo en cada página. |
| `src/components/domain/ProductCard.tsx`| `MockUpPasteleria/components/features/product-card/product-card.html`| Crear la tarjeta con CVA usando el `Button` de Matias. |

#### 🔐 Nicolas
| Componente a Crear | Archivo Origen (`MockUpPasteleria/`) | Notas de Implementación |
| :--- | :--- | :--- |
| `src/components/layout/AdminSidebar.tsx`| `MockUpPasteleria/pages/admin/components/sidebar.html` | Barra lateral fija con navegación hacia las rutas del admin. |
| `src/components/ui/Badge.tsx` | Clases de etiquetas en `MockUpPasteleria/pages/admin/pedidos.html` | Usar CVA para estados: éxito, alerta, peligro, neutro. |
| `src/components/ui/Card.tsx` | Estructuras en `MockUpPasteleria/components/plantilla_base_ia.html` | Contenedor reutilizable con bordes, padding y sombra. |

---

### 🛍️ SPRINT 2: El Escaparate y Accesos

#### 🍰 Matias
| Página a Crear | Archivo Origen (`MockUpPasteleria/`) | Notas de Implementación |
| :--- | :--- | :--- |
| `src/pages/cliente/Home.tsx` | `MockUpPasteleria/pages/cliente/index.html` | Reemplazar el botón y carrusel estático con componentes de React. |
| `src/pages/cliente/Catalogo.tsx` | `MockUpPasteleria/pages/cliente/catalogo.html` | Renderizar lista de pasteles usando el `ProductCard` de Anais. |

#### 🎨 Anais
| Página a Crear | Archivo Origen (`MockUpPasteleria/`) | Notas de Implementación |
| :--- | :--- | :--- |
| `src/pages/cliente/ProductoDetalle.tsx`| `MockUpPasteleria/pages/cliente/productos/producto_base.html` | Vista individual con foto grande, descripción e ingredientes. |
| `src/pages/cliente/Envio.tsx` | `MockUpPasteleria/pages/cliente/envio.html` | Información de despacho y zonas de cobertura. |

#### 🔐 Nicolas
| Página a Crear | Archivo Origen (`MockUpPasteleria/`) | Notas de Implementación |
| :--- | :--- | :--- |
| `src/pages/cliente/Login.tsx` | `MockUpPasteleria/pages/cliente/login.html` | Formulario de acceso usando el `Input` y `Button`. |
| `src/pages/cliente/Registro.tsx` | `MockUpPasteleria/pages/cliente/registro.html` | Formulario de creación de cuenta nueva. |

---

### 💳 SPRINT 3: El Flujo Transaccional

#### 🍰 Matias
| Página a Crear | Archivo Origen (`MockUpPasteleria/`) | Notas de Implementación |
| :--- | :--- | :--- |
| `src/pages/cliente/Carrito.tsx` | `MockUpPasteleria/pages/cliente/carrito.html` | Lista de compras con botones para sumar/restar cantidades. |
| `src/pages/cliente/Checkout.tsx` | `MockUpPasteleria/pages/cliente/checkout.html` | Formulario de facturación y pasarela simulada. |

#### 🎨 Anais
| Página a Crear | Archivo Origen (`MockUpPasteleria/`) | Notas de Implementación |
| :--- | :--- | :--- |
| `src/pages/cliente/Confirmacion.tsx` | `MockUpPasteleria/pages/cliente/confirmacion.html` | Pantalla de orden confirmada con resumen del pedido. |
| `src/pages/cliente/Perfil.tsx` | `MockUpPasteleria/pages/cliente/perfil.html` | Vista de datos personales e historial de compras. |

#### 🔐 Nicolas
| Página a Crear | Archivo Origen (`MockUpPasteleria/`) | Notas de Implementación |
| :--- | :--- | :--- |
| `src/pages/admin/Pedidos.tsx` | `MockUpPasteleria/pages/admin/pedidos.html` | Tabla de órdenes con botones para cambiar estados ("Preparando", "Listo"). |

---

### 📊 SPRINT 4: El Cerebro / Admin

#### 🍰 Matias
| Página a Crear | Archivo Origen (`MockUpPasteleria/`) | Notas de Implementación |
| :--- | :--- | :--- |
| `src/pages/admin/Pos.tsx` | `MockUpPasteleria/pages/admin/pos.html` | Punto de Venta (caja rápida para ventas presenciales). |

#### 🎨 Anais
| Página a Crear | Archivo Origen (`MockUpPasteleria/`) | Notas de Implementación |
| :--- | :--- | :--- |
| `src/pages/admin/Dashboard.tsx` | `MockUpPasteleria/pages/admin/dashboard.html` | Métricas generales, tarjetas de ingresos y estadísticas. |
| `src/pages/admin/Configuracion.tsx`| `MockUpPasteleria/pages/admin/configuracion.html` | Ajustes de la pastelería (datos de contacto, horarios). |

#### 🔐 Nicolas
| Página a Crear | Archivo Origen (`MockUpPasteleria/`) | Notas de Implementación |
| :--- | :--- | :--- |
| `src/pages/admin/Inventario.tsx` | `MockUpPasteleria/pages/admin/inventario.html` | Tabla de stock de pasteles con modal para agregar nuevos. |
| `src/pages/admin/Usuarios.tsx` | `MockUpPasteleria/pages/admin/usuarios.html` | Gestión de empleados, roles y permisos. |

---

## 🎯 Instrucciones para cada integrante al iniciar su tarea:
1. Abrir el archivo correspondiente en `MockUpPasteleria/` para ver las etiquetas HTML y clases originales.
2. Identificar qué textos o datos deben volverse dinámicos (`props` de React).
3. Seguir la guía **`02-metodologia-top-down.md`** y **`03-ejemplo-componente-cva.md`** para construir el nuevo archivo en `frontend/src/`.
