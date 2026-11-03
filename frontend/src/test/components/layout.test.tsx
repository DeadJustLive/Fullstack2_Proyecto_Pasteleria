import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartProvider";
import { AuthProvider } from "@/context/AuthProvider";

describe("Layout Components — Navegación y Footer", () => {
  describe("Footer", () => {
    it("renderiza información de contacto, horarios y redes sociales", () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );

      expect(screen.getByText(/Calle del Sabor 123/i)).toBeInTheDocument();
      expect(screen.getByText(/\+56 9 1234 5678/i)).toBeInTheDocument();
      expect(screen.getByText(/hola@cremeco\.cl/i)).toBeInTheDocument();
      expect(screen.getByText(/Lunes a Viernes: 08:00 - 20:00/i)).toBeInTheDocument();
    });
  });

  describe("Navbar", () => {
    it("renderiza enlaces clave de navegación y contador de carrito", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <AuthProvider>
            <CartProvider>
              <Navbar />
            </CartProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByRole("link", { name: /^Home$/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /^Catálogo$/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /^Ofertas$/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /^Blog$/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /^Nosotros$/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /^Contacto$/i })).toBeInTheDocument();
    });

    it("permite abrir y cerrar el menú móvil en pantallas pequeñas", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/"]}>
          <AuthProvider>
            <CartProvider>
              <Navbar />
            </CartProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      const botonMenu = screen.getByRole("button", { name: /^Abrir menú$/i });
      expect(botonMenu).toBeInTheDocument();

      await user.click(botonMenu);
      expect(screen.getByRole("button", { name: /^Cerrar menú$/i })).toBeInTheDocument();
    });
  });
});
