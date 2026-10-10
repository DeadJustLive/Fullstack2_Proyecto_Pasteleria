# ⚛️ Aprendiendo React: El Método "Tender la Cama"

Aprender React, TypeScript, Tailwind y CVA todo de golpe puede ser abrumador. Es como intentar limpiar una habitación desordenada sin saber por dónde empezar. 

**Regla de oro: Primero tendemos la cama.** 
Al tender la cama, el mayor desorden visual desaparece y lo que queda parece una tarea mucho más pequeña. En React, "tender la cama" significa **dibujar primero lo visual con HTML simple (JSX)** antes de preocuparnos por TypeScript, CVA o la lógica compleja.

Para esto, usaremos la carpeta **`sandbox-ui/`** que tenemos en el proyecto. Es un entorno de pruebas seguro donde no romperás nada.

---

## 🎯 Nuestro Objetivo Concreto
Vamos a crear una **Tarjeta de Notificación (Alert)** simple. 
En lugar de pensar en todo a la vez, lo haremos en 4 pasos muy pequeños.

### Paso 1: Tendemos la Cama (Solo visual, sin complicaciones)
Abre (o crea) un archivo en `sandbox-ui/src/Alert.tsx`. Olvídate de TypeScript o CVA por ahora. Vamos a crear una función simple que devuelve algo parecido a HTML (esto se llama JSX):

```tsx
// 1. Esto es React en su forma más pura. Una función que retorna una vista.
export function Alert() {
  return (
    <div className="bg-blue-100 text-blue-800 p-4 rounded-md">
      <strong>Notificación:</strong>
      <p>Este es un mensaje de prueba.</p>
    </div>
  );
}
```
*¡Listo! La cama está tendida. Ya tienes algo visual que funciona.* Si importas esto en tu `App.tsx` del sandbox (`<Alert />`), lo verás en pantalla.

### Paso 2: Le damos vida (React Props)
Un componente que siempre dice "mensaje de prueba" no es muy útil. React nos permite pasarle variables (llamadas `props`).

```tsx
// 2. Agregamos propiedades (props) entre las llaves.
export function Alert({ titulo, mensaje }) {
  return (
    <div className="bg-blue-100 text-blue-800 p-4 rounded-md">
      {/* Usamos las llaves {} para inyectar JavaScript dentro del HTML */}
      <strong>{titulo}:</strong>
      <p>{mensaje}</p>
    </div>
  );
}
```
Ahora podemos usarlo así: `<Alert titulo="Éxito" mensaje="Guardado correctamente" />`.

### Paso 3: Ponemos las reglas de la casa (TypeScript)
Aquí es donde entra TypeScript. Si alguien intenta usar nuestra `<Alert>` pero olvida pasarle el `titulo`, la app podría fallar. Vamos a escribir un "contrato" para evitar eso.

```tsx
// 3. Escribimos las reglas (El contrato Top-Down que aprendimos)
interface AlertProps {
  titulo: string;
  mensaje: string;
}

// Le decimos a nuestra función que debe cumplir con 'AlertProps'
export function Alert({ titulo, mensaje }: AlertProps) {
  return (
    <div className="bg-blue-100 text-blue-800 p-4 rounded-md">
      <strong>{titulo}:</strong>
      <p>{mensaje}</p>
    </div>
  );
}
```
*Ahora el editor te ayudará y te avisará si te falta algún dato. Ya hemos limpiado el 80% de la habitación.*

### Paso 4: Lo hacemos escalable (CVA + Tailwind)
¿Qué pasa si queremos una alerta Roja para errores y Verde para éxito? Ahora que lo básico funciona, añadimos la "magia" de CVA.

```tsx
import { cva, type VariantProps } from "class-variance-authority";

// A. Definimos los colores
const alertStyles = cva("p-4 rounded-md", {
  variants: {
    tipo: {
      info: "bg-blue-100 text-blue-800",
      error: "bg-red-100 text-red-800",
      success: "bg-green-100 text-green-800",
    }
  },
  defaultVariants: { tipo: "info" }
});

// B. Actualizamos nuestro contrato
interface AlertProps extends VariantProps<typeof alertStyles> {
  titulo: string;
  mensaje: string;
}

// C. Aplicamos los estilos
export function Alert({ titulo, mensaje, tipo }: AlertProps) {
  return (
    <div className={alertStyles({ tipo })}>
      <strong>{titulo}:</strong>
      <p>{mensaje}</p>
    </div>
  );
}
```

---

## 🛠️ Tu Turno (Ejercicios en el Sandbox)

Dirígete a la carpeta `sandbox-ui/` e intenta estos pequeños retos. Recuerda: **¡Tiende la cama primero!**

1. **Reto 1 (Solo JSX)**: Crea un archivo `Avatar.tsx`. Haz una función que devuelva un `<img>` con tu foto y un `<h2>` con tu nombre quemado en el código.
2. **Reto 2 (Props + TS)**: Modifica ese `Avatar` para que reciba `nombre` y `urlImagen` como Props. Escribe su `interface`.
3. **Reto 3 (CVA)**: Añade CVA a tu `Avatar` para que acepte un tamaño (`size`): `sm` (imagen pequeña) y `lg` (imagen grande).

¡Ve paso a paso y diviértete construyendo!
