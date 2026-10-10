# 🏗️ Arquitectura y Herramientas del Proyecto

¡Bienvenidos al equipo! El objetivo de este proyecto es transformar nuestras maquetas en HTML a una aplicación frontend moderna, escalable y mantenible.

Para asegurar que todos trabajemos de forma sincronizada y evitar conflictos, hemos definido un conjunto de herramientas y una arquitectura que seguiremos durante todo el desarrollo.

## 🛠️ Nuestro Stack Tecnológico

1. **[React]**: Librería principal para construir nuestras interfaces de usuario mediante componentes.
2. **[TypeScript]**: Lo usaremos para tipar nuestro código. Nos ayudará a evitar errores antes de ejecutar la aplicación, definiendo qué datos (`props`) necesita cada componente y dándonos un excelente autocompletado en el editor de código.
3. **[Tailwind CSS]**: Nuestro sistema de estilos. Usaremos clases utilitarias directamente en nuestro código para diseñar sin necesidad de escribir archivos `.css` separados.
4. **[CVA (Class Variance Authority)]**: Una herramienta fundamental en este proyecto. Nos permite crear componentes con múltiples "variantes" (ej. un botón primario, secundario, de contorno) combinándolo de forma limpia con Tailwind.
5. **[ESLint]**: Nuestro "revisor automático" de código. Nos marcará errores si no seguimos las convenciones o si olvidamos buenas prácticas.

## 📂 Estructura de Carpetas

Para mantener el proyecto organizado, todos nuestros componentes vivirán dentro de `src/components/`, pero divididos en subcategorías claras:

```text
src/
├── components/
│   ├── ui/         # Componentes base, genéricos y reutilizables en cualquier parte (Botones, Inputs, Badges). Aquí brillará CVA.
│   ├── layout/     # Componentes que estructuran la página (Navbar, Footer, Sidebar).
│   └── domain/     # Componentes específicos de nuestra pastelería (ProductCard, CakeDetails, CartList).
├── pages/          # Vistas completas que agrupan los componentes (Home, Menu, Contacto).
├── lib/            # Utilidades generales (como el agrupador de clases de Tailwind).
└── types/          # Definiciones globales de TypeScript (ej. interface Producto).
```

## 🎯 Filosofía de Diseño

- **Principio de Responsabilidad Única**: Un componente debe hacer una sola cosa y hacerla bien. Si un componente es muy grande, divídelo.
- **Piensa en "Piezas de Lego"**: Antes de crear un botón específico para el carrito, piensa: *"¿Puedo usar un botón genérico de la carpeta `ui/` y pasarle las propiedades que necesito?"*
- **Estilos Centralizados en Tailwind**: Evitaremos escribir CSS personalizado (`style={{...}}` o archivos `.css`) a menos que sea estrictamente necesario.

---
*En el siguiente documento de esta guía aprenderemos las convenciones de código y cómo ESLint nos ayudará en el día a día.*
