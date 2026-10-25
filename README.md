# 🍰 Sistema Web & E-Commerce para Pastelería

Bienvenido al repositorio oficial del proyecto **Pastelería**. Esta aplicación web combina una tienda online moderna para clientes y un panel de administración integral (POS, inventario, pedidos y métricas) para la gestión del negocio.

El proyecto se encuentra en proceso de migración desde maquetas estáticas en HTML hacia una arquitectura moderna basada en componentes con **React**, **TypeScript**, **Tailwind CSS** y **CVA**.

---

## 🛠️ Stack Tecnológico

* **Core:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
* **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Variantes de Componentes:** [Class Variance Authority (CVA)](https://cva.style/docs)
* **Linter & Calidad de Código:** [ESLint](https://eslint.org/)

---

## 📂 Estructura del Repositorio

```text
ProyectoPasteleria/
├── frontend/               # Aplicación oficial en React + Vite
│   ├── public/             # Archivos estáticos (sitemap.xml, robots.txt, favicon)
│   └── src/
│       ├── components/     # Componentes organizados (ui, layout, domain)
│       ├── pages/          # Vistas de la aplicación (cliente y admin)
│       ├── lib/            # Utilidades generales
│       └── types/          # Definiciones e interfaces de TypeScript
├── guias/                  # Documentación y guías paso a paso para el equipo
│   ├── 01-arquitectura-y-herramientas.md
│   ├── 02-metodologia-top-down.md
│   ├── 03-ejemplo-componente-cva.md
│   ├── 04-aprendiendo-react-paso-a-paso.md
│   ├── 05-mapa-del-sitio.md
│   └── 06-planificacion-scrum.md
└── MockUpPasteleria/               # Maquetas originales en HTML/CSS de referencia
```

---

## 🚀 Inicio Rápido (Desarrollo Local)

Para ejecutar la aplicación en tu máquina local:

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd ProyectoPasteleria/frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. Abre tu navegador en la URL local indicada en la terminal (usualmente `http://localhost:5173`).

---

## 🔐 Acceso demo al panel administrativo

La zona `/admin` está protegida por rol. Para revisarla en desarrollo:

```text
Email:      admin@cremeco.cl
Contraseña: admin123
```

También se puede entrar con `matias@ejemplo.com` o `nicolas@ejemplo.com` usando la misma clave demo. Las cuentas de cliente pueden navegar por la tienda, pero verán “Acceso restringido” si intentan abrir `/admin`.

---

## 📚 Guías de Desarrollo para el Equipo

Si eres parte del equipo de desarrollo, consulta los documentos dentro de la carpeta [`guias/`](./guias/):

* **[01. Arquitectura y Herramientas](./guias/01-arquitectura-y-herramientas.md):** Convenciones de carpetas y stack.
* **[02. Metodología Top-Down](./guias/02-metodologia-top-down.md):** Cómo pensar y escribir componentes en TypeScript de arriba hacia abajo.
* **[03. Creación de Componentes con CVA](./guias/03-ejemplo-componente-cva.md):** Ejemplo práctico y comentado pasando de HTML a React.
* **[04. Aprendiendo React Paso a Paso](./guias/04-aprendiendo-react-paso-a-paso.md):** Guía práctica para principiantes (método "Tender la cama").
* **[05. Mapa del Sitio](./guias/05-mapa-del-sitio.md):** Estructura de URLs y layouts del cliente y administrador.
* **[06. Planificación Scrum & Asignación de Tareas](./guias/06-planificacion-scrum.md):** Mapeo exacto de qué archivo HTML le corresponde a cada miembro en cada Sprint.

---

## 👥 Equipo de Desarrollo

* **Matias:** Arquitectura Técnica, Lógica de Estado (Carrito, Checkout) y POS.
* **Anais:** Experiencia de Usuario (UI/UX), Vistas de Catálogo, Detalle y Dashboard.
* **Nicolas:** Formularios de Acceso (Login/Registro), Seguridad y Gestión de Tablas Admin (Inventario, Usuarios, Pedidos).

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos y de aprendizaje colaborativo.
