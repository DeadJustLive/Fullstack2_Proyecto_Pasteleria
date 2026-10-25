import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CATEGORIAS_INVENTARIO } from "@/data/inventario";
import type {
  CategoriaInventario,
  DatosProducto,
  ItemInventario,
} from "@/types/inventario";

const SELECT_CLASES =
  "h-11 w-full rounded border border-tertiary/30 bg-white px-4 font-body text-base text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";

interface ErroresProducto {
  nombre?: string;
  precio?: string;
  stock?: string;
}

interface FormularioProductoProps {
  item: ItemInventario | null;
  onGuardar: (datos: DatosProducto) => void;
  onCancelar: () => void;
}

function validar(
  nombre: string,
  precio: string,
  stock: string
): ErroresProducto {
  const errores: ErroresProducto = {};
  const precioNum = Number(precio);
  const stockNum = Number(stock);

  if (!nombre.trim()) {
    errores.nombre = "Ingresa el nombre del producto.";
  } else if (nombre.trim().length < 2) {
    errores.nombre = "El nombre debe tener al menos 2 caracteres.";
  }

  if (!precio.trim()) {
    errores.precio = "Ingresa un precio.";
  } else if (!Number.isInteger(precioNum) || precioNum <= 0) {
    errores.precio = "Ingresa un precio válido en CLP, sin decimales.";
  }

  if (!stock.trim()) {
    errores.stock = "Ingresa el stock.";
  } else if (!Number.isInteger(stockNum) || stockNum < 0) {
    errores.stock = "El stock debe ser un entero mayor o igual a 0.";
  }

  return errores;
}

export function FormularioProducto({
  item,
  onGuardar,
  onCancelar,
}: FormularioProductoProps) {
  const categoriaId = useId();
  const [nombre, setNombre] = useState(item?.nombre ?? "");
  const [categoria, setCategoria] = useState<CategoriaInventario>(
    item?.categoria ?? "torta"
  );
  const [precio, setPrecio] = useState(item ? String(item.precio) : "");
  const [stock, setStock] = useState(item ? String(item.stock) : "");
  const [errores, setErrores] = useState<ErroresProducto>({});

  const limpiarError = (campo: keyof ErroresProducto) => {
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const cambiarNombre = (e: ChangeEvent<HTMLInputElement>) => {
    setNombre(e.target.value);
    limpiarError("nombre");
  };

  const cambiarPrecio = (e: ChangeEvent<HTMLInputElement>) => {
    setPrecio(e.target.value);
    limpiarError("precio");
  };

  const cambiarStock = (e: ChangeEvent<HTMLInputElement>) => {
    setStock(e.target.value);
    limpiarError("stock");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const nuevosErrores = validar(nombre, precio, stock);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    onGuardar({
      nombre: nombre.trim(),
      categoria,
      precio: Number(precio),
      stock: Number(stock),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Nombre del producto"
        name="nombre"
        placeholder="Ej: Torta de Chocolate"
        autoComplete="off"
        autoFocus
        required
        value={nombre}
        onChange={cambiarNombre}
        error={errores.nombre}
      />

      <div className="flex flex-col gap-1">
        <label
          htmlFor={categoriaId}
          className="font-body text-sm font-semibold text-tertiary"
        >
          Categoría
        </label>
        <select
          id={categoriaId}
          name="categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as CategoriaInventario)}
          className={SELECT_CLASES}
        >
          {CATEGORIAS_INVENTARIO.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Precio (CLP)"
          name="precio"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          placeholder="Ej: 35000"
          hint="Precio de venta sin decimales."
          required
          value={precio}
          onChange={cambiarPrecio}
          error={errores.precio}
        />

        <Input
          label="Stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          placeholder="Ej: 12"
          hint="Unidades disponibles."
          required
          value={stock}
          onChange={cambiarStock}
          error={errores.stock}
        />
      </div>

      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">
          {item ? "Guardar cambios" : "Agregar producto"}
        </Button>
      </div>
    </form>
  );
}
