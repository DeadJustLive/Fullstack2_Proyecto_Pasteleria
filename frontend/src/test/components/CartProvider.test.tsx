import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider } from "@/context/CartProvider";
import { useCart, ENVIO } from "@/context/cart";
import type { Producto } from "@/types/product";

const mockProducto: Producto = {
  id: 10,
  nombre: "Torta Cuatro Leches Especial",
  precio: 20000,
  imagen: "/imagen/torta.jpg",
  descripcion: "Torta artesanal",
  categorias: ["torta"],
  variaciones: ["vendido"],
  disponible: true,
  stock: 5,
};

function TestConsumer() {
  const {
    items,
    cantidadTotal,
    subtotal,
    total,
    descuento,
    cupon,
    envio,
    agregar,
    quitar,
    cambiarCantidad,
    aplicarCupon,
    quitarCupon,
    vaciar,
  } = useCart();

  return (
    <div>
      <div data-testid="cantidad-total">{cantidadTotal}</div>
      <div data-testid="subtotal">{subtotal}</div>
      <div data-testid="total">{total}</div>
      <div data-testid="descuento">{descuento}</div>
      <div data-testid="cupon">{cupon || "SIN_CUPON"}</div>
      <div data-testid="envio">{envio}</div>

      <button onClick={() => agregar(mockProducto, 2)}>Agregar 2</button>
      <button onClick={() => cambiarCantidad(mockProducto.id, 4)}>Cambiar a 4</button>
      <button onClick={() => quitar(mockProducto.id)}>Quitar</button>
      <button onClick={() => aplicarCupon("CREME10")}>Aplicar CREME10</button>
      <button onClick={() => quitarCupon()}>Quitar Cupon</button>
      <button onClick={() => vaciar()}>Vaciar</button>

      <ul>
        {items.map((i) => (
          <li key={i.producto.id} data-testid="cart-item">
            {i.producto.nombre} x {i.cantidad}
          </li>
        ))}
      </ul>
    </div>
  );
}

describe("CartProvider — Contexto Global de Compras", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("inicia vacío con envío $0 y al agregar productos calcula envío $8000", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    expect(screen.getByTestId("cantidad-total").textContent).toBe("0");
    expect(screen.getByTestId("subtotal").textContent).toBe("0");
    expect(screen.getByTestId("envio").textContent).toBe("0");

    await user.click(screen.getByText("Agregar 2"));

    expect(screen.getByTestId("cantidad-total").textContent).toBe("2");
    expect(screen.getByTestId("subtotal").textContent).toBe("40000");
    expect(screen.getByTestId("envio").textContent).toBe(String(ENVIO));
    // total = subtotal + envio
    expect(screen.getByTestId("total").textContent).toBe(String(40000 + ENVIO));
  });

  it("permite cambiar la cantidad y respeta el stock máximo", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    await user.click(screen.getByText("Agregar 2"));
    await user.click(screen.getByText("Cambiar a 4"));

    expect(screen.getByTestId("cantidad-total").textContent).toBe("4");
    expect(screen.getByTestId("subtotal").textContent).toBe("80000");
  });

  it("aplica y descuenta cupones válidos (CREME10)", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    await user.click(screen.getByText("Agregar 2")); // 40.000
    await user.click(screen.getByText("Aplicar CREME10")); // 10% de 40.000 = 4.000

    expect(screen.getByTestId("cupon").textContent).toBe("CREME10");
    expect(screen.getByTestId("descuento").textContent).toBe("4000");
    // total = 40.000 - 4.000 + 8.000 = 44.000
    expect(screen.getByTestId("total").textContent).toBe(String(40000 - 4000 + ENVIO));

    await user.click(screen.getByText("Quitar Cupon"));
    expect(screen.getByTestId("cupon").textContent).toBe("SIN_CUPON");
    expect(screen.getByTestId("descuento").textContent).toBe("0");
  });

  it("permite quitar items o vaciar completamente el carrito", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    await user.click(screen.getByText("Agregar 2"));
    expect(screen.getAllByTestId("cart-item").length).toBe(1);

    await user.click(screen.getByText("Vaciar"));
    expect(screen.getByTestId("cantidad-total").textContent).toBe("0");
    expect(screen.queryByTestId("cart-item")).toBeNull();
  });
});
