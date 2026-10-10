# ⬇️ Metodología Top-Down con TypeScript

Cuando construimos componentes en React usando TypeScript, la forma más fácil y ordenada de pensar es "de arriba hacia abajo" (**Top-Down**). 

En lugar de empezar a escribir etiquetas HTML (`<div>` o `<button>`) o intentar crear los estilos inmediatamente, primero nos enfocamos en el **contrato** del componente: **¿Qué es lo que este componente necesita recibir para funcionar?**

## 🎯 Los 3 pasos del Top-Down

### Paso 1: Pensar en el Uso (El "Consumidor")
Antes de escribir una sola línea de código del componente, imagina cómo te gustaría usarlo en tu pantalla principal. 
Por ejemplo, si vamos a crear una Tarjeta de Producto (`ProductCard`), ¿cómo queremos llamarla?

```tsx
// Así es como IDEALMENTE quiero usar el componente
<ProductCard 
  title="Torta de Chocolate"
  price={25.99}
  imageUrl="/img/torta.jpg"
  onAddToCart={() => console.log('Añadido!')}
/>
```

### Paso 2: Definir el "Contrato" (La Interfaz de TypeScript)
Dado que ya sabemos cómo lo vamos a usar (Paso 1), ahora definimos estrictamente esos datos en TypeScript usando una `interface` o un `type`. Este es el corazón de la metodología Top-Down.

```tsx
// 1. Definimos el Contrato PRIMERO
export interface ProductCardProps {
  title: string;
  price: number;
  imageUrl?: string; // El signo de interrogación indica que es opcional
  onAddToCart: () => void; // Una función que no devuelve nada
}
```
**¿Por qué hacemos esto primero?** Porque al declarar las interfaces de inicio, el editor (VSCode) y TypeScript nos empezarán a dar autocompletado y a guiarnos. Es como escribir el "esqueleto" antes de ponerle la "carne".

### Paso 3: Implementar la Lógica y la Interfaz (JSX y CVA)
Ahora que tenemos las `ProductCardProps` definidas, creamos la función de React y empezamos a implementar los estilos y el HTML.

```tsx
// 2. Destructuramos las props basándonos en nuestra interfaz
export function ProductCard({ title, price, imageUrl, onAddToCart }: ProductCardProps) {
  // 3. Escribimos nuestro JSX (HTML) y clases (Tailwind)
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      {/* ... estructura del componente ... */}
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-green-600">${price}</p>
      <button onClick={onAddToCart}>Añadir</button>
    </div>
  );
}
```

## 🧠 ¿Por qué usamos esta metodología?

1. **Evita la "Parálisis por Análisis"**: No te bloqueas pensando en qué color de Tailwind usar o qué clase poner. Primero piensas en los datos, que es lo más fácil.
2. **Previene Errores (Tipado Estricto)**: Al definir qué datos entran, si otro miembro del equipo intenta usar `<ProductCard title={123} />` pasándole un número en vez de un texto, TypeScript lo detendrá antes de que guarde el archivo.
3. **Se lleva perfecto con CVA**: En el siguiente documento veremos cómo esta metodología encaja como anillo al dedo con CVA, ya que las "variantes" visuales también formarán parte de nuestro contrato Top-Down.
