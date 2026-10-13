# 🔁 Cuándo refactorizar y usar CVA

Este documento responde una sola pregunta: **¿en qué momento un bloque de clases Tailwind debe convertirse en un componente limpio con CVA?**

La respuesta no es una fecha del calendario, sino un **disparador**. Refactorizar por tiempo lleva a hacerlo demasiado tarde (se acumula deuda) o demasiado pronto (abstracción prematura).

> **Regla base: "Se limpia al publicar, no al escribir."**
> Mientras un bloque vive en una sola página, Tailwind crudo es correcto. En cuanto se repite o lo importa otro integrante, se refactoriza a CVA **antes** de mergear.

Referencias: [`01-arquitectura-y-herramientas.md`](./01-arquitectura-y-herramientas.md) y [`03-ejemplo-componente-cva.md`](./03-ejemplo-componente-cva.md).

---

## 📦 Dos familias, dos timings

| Familia | Ubicación | ¿Cuándo se limpia con CVA? |
| :--- | :--- | :--- |
| **Primitivos UI** (Button, Input, Badge, Card) | `components/ui/` | **Desde que nacen.** Otros los importan, su contrato debe ser estable el día 1. |
| **Páginas y secciones** (Home, Catálogo, Carrito, POS) | `pages/`, `components/domain/` | **Cama primero** (Tailwind crudo para validar). CVA solo cuando un bloque se repite o se reutiliza. |

⚠️ Un componente que se ve una sola vez y **no tiene variantes** no necesita CVA. Meterlo sería sobre-ingeniería.

---

## 🚦 Disparadores (Definition of Ready to refactor)

Refactoriza un bloque a CVA en cuanto ocurra **cualquiera** de estos:

1. **Se usa en 2+ lugares** → pasa a ser componente "publicado": debe tener contrato TypeScript y CVA.
2. **Aparece lógica condicional de clases en el JSX** (`variant === "x" ? ... : ...`, ternarios anidados o strings gigantes). Es la señal #1 de CVA.
3. **Tiene 2 o más variantes/estados** que otros deben poder elegir (tamaño, color, estado).
4. **Otro integrante va a importarlo.** Se limpia antes de que lo consuman.
5. **El mismo patrón de clases aparece por 3.ª vez** → no se crea otra variante suelta, se promueve a **token** (`index.css`) o a **fragmento compartido** (`components/ui/variants.ts`).

---

## 3️⃣ La Regla del 3

No extraigas variantes ni fragmentos compartidos hasta ver el patrón repetido **3 veces**.

Duplicar dos veces es más barato que una abstracción equivocada. Antes de la tercera repetición, la copia es la decisión correcta.

---

## 🗓️ Checkpoint por sprint

Al **cierre de cada sprint**, reservar ~30 minutos de **consolidación**:

1. Buscar qué clases/estructuras se repitieron.
2. Promover repeticiones a **token** o **fragmento** (nunca al revés).
3. Confirmar que todo componente importado por 2+ lugares ya tiene CVA.

---

## ✅ Ejemplos en nuestro proyecto

| Bloque | Cuándo se limpia |
| :--- | :--- |
| `Button`, `Input` (Sprint 1) | **Inmediato**: son primitivos reutilizables. |
| `ProductCard` | Al crearla: se usa en Home + Catálogo + Detalle. |
| Fila de carrito | Extraer `CartItem` en cuanto se repita en Carrito y Checkout. |
| `StatCard` (Dashboard) | Se repite 4 veces → extraer al crearla. |
| Sección "hero" de Home | Tailwind crudo: se usa una sola vez. |

---

## 🚫 Anti-patrones (lo que NO hacer)

- **Refactorizar en medio de la validación visual.** Primero que el bloque quede "verde" y aprobado, luego se limpia.
- **Cambiar la firma de props** de un componente ya consumido sin avisar. Si hay que cambiarla, se hace **antes del merge** o en un paso dedicado.
- **Aplicar CVA en todo.** Solo donde haya variantes/estados o reutilización real.
- **Extraer antes de la 3.ª repetición.** Espera el patrón, no lo adivines.

---

## 🔤 Convenciones de la receta CVA (para leer cualquier componente igual)

- Nombres de variantes en **inglés y consistentes**: `variant`, `size`, `state`, `intent`.
- `defaultVariants` **siempre** definidos (evita que el componente se rompa sin props).
- **Una receta por elemento.** Si el componente tiene varias partes (header/body/footer), se usan **recetas separadas**, no una sola receta gigante.
- Combinar con `cn()` para que el `className` externo gane sobre las variantes.
- Si un componente no tiene variantes, **no lleva CVA**: basta Tailwind.
