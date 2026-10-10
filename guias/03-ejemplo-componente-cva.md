# 🎨 Ejemplo Práctico: De HTML a React con CVA

En este documento, vamos a tomar un archivo base de nuestra maqueta HTML (`MockUpPasteleria/components/common/button/*.html`) y lo vamos a transformar en un componente de React siguiendo nuestras reglas: **Tailwind**, **CVA**, y **TypeScript (Top-Down)**.

## El HTML Original

Si revisamos nuestra maqueta, un botón se ve así:

```html
<!-- MockUpPasteleria/components/common/button/button.html -->
<button class="btn btn-primary" type="button">
    Click aquí
</button>
```

Queremos transformar esto en un componente súper dinámico que pueda ser "primario", "secundario", "grande" o "pequeño".

## La Transformación Paso a Paso

Crea un archivo llamado `Button.tsx` (en `src/components/ui/Button.tsx`). A continuación, te presento el código completo del componente comentado línea por línea explicando el "Cómo" y el "Por qué".

```tsx
// 1. IMPORTACIONES
// Importamos 'cva' para manejar nuestras variantes de clases
// y 'VariantProps' para que TypeScript entienda las variantes de CVA
import { cva, type VariantProps } from 'class-variance-authority';
// (Opcional) Un utilitario como clsx/tailwind-merge para unir clases limpiamente
// import { cn } from '@/lib/utils'; 

// 2. DEFINICIÓN DE VARIANTES (CVA)
// POR QUÉ: CVA nos permite mantener el código limpio. En lugar de hacer "if(variant === 'primary')" 
// dentro del JSX, declaramos todo aquí arriba.
const buttonVariants = cva(
  // Clases base que TODOS los botones siempre tendrán
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      // Definimos nuestras variantes visuales
      variant: {
        primary: "bg-pink-600 text-white hover:bg-pink-700", // Tailwind reemplaza a "btn-primary"
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
        ghost: "bg-transparent hover:bg-gray-100",
      },
      // Definimos tamaños
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8 text-lg",
      },
    },
    // POR QUÉ: Los 'defaultVariants' evitan que la app se rompa si alguien usa <Button /> sin pasar props.
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

// 3. EL "CONTRATO" TOP-DOWN (TypeScript)
// POR QUÉ: Hacemos que nuestro botón herede todos los atributos de un botón normal de HTML
// (como onClick, disabled, type="submit") usando 'React.ButtonHTMLAttributes'
// Y además, le sumamos las variantes que creamos arriba con 'VariantProps<typeof buttonVariants>'
export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  VariantProps<typeof buttonVariants> {
    // Si quisieras una prop extra específica de tu botón, iría aquí.
    // Ejemplo: isLoading?: boolean;
}

// 4. EL COMPONENTE
// Extraemos nuestras propiedades (variant, size, className, etc.)
export function Button({ 
  className, 
  variant, 
  size, 
  children, // El texto que va dentro del botón
  ...props   // Todas las demás props de HTML (como onClick)
}: ButtonProps) {
  
  return (
    <button
      // Llamamos a buttonVariants pasando las variantes seleccionadas.
      // CVA se encarga de inyectar las clases de Tailwind correctas.
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}
```

## 🛠️ ¿Cómo utilizaría el equipo este componente?

¡Ahora usar este botón es como jugar con piezas de lego! Al escribir `<Button `, el editor (gracias a TypeScript) te sugerirá las variantes permitidas automáticamente.

```tsx
// Ejemplo de botón primario (usa la configuración por defecto)
<Button onClick={() => alert('¡Hola!')}>
  Comprar Pastel
</Button>

// Ejemplo de botón secundario y pequeño
<Button variant="secondary" size="sm">
  Cancelar
</Button>

// Ejemplo de botón con borde que está deshabilitado
<Button variant="outline" disabled>
  Agotado
</Button>
```

### 💡 Resumen de este enfoque:
1. **HTML Limpio**: Fíjate que en el `return` del botón no hay una monstruosidad de clases pegadas, solo `{buttonVariants({ variant, size, className })}`. Todo está organizado arriba.
2. **TypeScript + CVA**: `VariantProps` lee la configuración de CVA. Si alguien intenta usar `<Button variant="rojo" />`, TypeScript marcará error porque "rojo" no es un valor permitido en CVA. ¡Esto evita muchísimos fallos en el equipo!
