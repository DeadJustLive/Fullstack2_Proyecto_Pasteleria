import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FloatingCartButton } from "@/components/ui/FloatingCartButton";
import * as cartContext from "@/context/cart";

describe("FloatingCartButton — Botón flotante contextual", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("no se renderiza si cantidadTotal es 0", () => {
    vi.spyOn(cartContext, "useCart").mockReturnValue({
      cantidadTotal: 0,
    } as ReturnType<typeof cartContext.useCart>);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <FloatingCartButton />
      </MemoryRouter>
    );

    expect(screen.queryByRole("complementary", { name: /acceso rápido al carrito/i })).not.toBeInTheDocument();
  });

  it("se renderiza en la home u otras páginas si cantidadTotal > 0", () => {
    vi.spyOn(cartContext, "useCart").mockReturnValue({
      cantidadTotal: 3,
    } as ReturnType<typeof cartContext.useCart>);

    render(
      <MemoryRouter initialEntries={["/catalogo"]}>
        <FloatingCartButton />
      </MemoryRouter>
    );

    const aside = screen.getByRole("complementary", { name: /acceso rápido al carrito/i });
    expect(aside).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("se oculta si el usuario está en la página de carrito (/carrito)", () => {
    vi.spyOn(cartContext, "useCart").mockReturnValue({
      cantidadTotal: 3,
    } as ReturnType<typeof cartContext.useCart>);

    render(
      <MemoryRouter initialEntries={["/carrito"]}>
        <FloatingCartButton />
      </MemoryRouter>
    );

    expect(screen.queryByRole("complementary", { name: /acceso rápido al carrito/i })).not.toBeInTheDocument();
  });

  it("se oculta si el usuario está en la página de pago/checkout (/checkout o /pago/*)", () => {
    vi.spyOn(cartContext, "useCart").mockReturnValue({
      cantidadTotal: 3,
    } as ReturnType<typeof cartContext.useCart>);

    const { unmount } = render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <FloatingCartButton />
      </MemoryRouter>
    );
    expect(screen.queryByRole("complementary", { name: /acceso rápido al carrito/i })).not.toBeInTheDocument();
    unmount();

    render(
      <MemoryRouter initialEntries={["/pago/flow-gateway"]}>
        <FloatingCartButton />
      </MemoryRouter>
    );
    expect(screen.queryByRole("complementary", { name: /acceso rápido al carrito/i })).not.toBeInTheDocument();
  });
});
