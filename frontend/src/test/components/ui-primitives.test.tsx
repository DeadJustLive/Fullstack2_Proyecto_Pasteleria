import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";

describe("UI Primitives — Componentes Reutilizables de Interfaz", () => {
  describe("Badge", () => {
    it("renderiza variantes premium, temporada y oferta", () => {
      const { rerender } = render(<Badge tipo="premium">★ Premium</Badge>);
      expect(screen.getByText("★ Premium")).toHaveClass("bg-primary");

      rerender(<Badge tipo="oferta">Oferta Especial</Badge>);
      expect(screen.getByText("Oferta Especial")).toHaveClass("bg-red-600");
    });
  });

  describe("Card", () => {
    it("renderiza contenido y respeta clases y variantes de padding", () => {
      render(
        <Card padding="lg" data-testid="test-card">
          <span>Contenido de Tarjeta</span>
        </Card>
      );
      const card = screen.getByTestId("test-card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("p-10");
      expect(screen.getByText("Contenido de Tarjeta")).toBeInTheDocument();
    });
  });

  describe("EmptyState", () => {
    it("renderiza titulo, descripcion y accion opcional", () => {
      render(
        <EmptyState
          titulo="Tu carrito está vacío"
          descripcion="Añade algunas delicias de nuestra pastelería"
          accion={<button>Ver Catálogo</button>}
        />
      );

      expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
      expect(screen.getByText("Añade algunas delicias de nuestra pastelería")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Ver Catálogo/i })).toBeInTheDocument();
    });
  });

  describe("Input", () => {
    it("renderiza label, hint y permite escribir texto", async () => {
      const user = userEvent.setup();
      render(<Input label="Nombre Completo" hint="Tal como aparece en tu carnet" placeholder="Ej: Juan Pérez" />);

      expect(screen.getByLabelText("Nombre Completo")).toBeInTheDocument();
      expect(screen.getByText("Tal como aparece en tu carnet")).toBeInTheDocument();

      const input = screen.getByPlaceholderText("Ej: Juan Pérez");
      await user.type(input, "María Silva");
      expect(input).toHaveValue("María Silva");
    });

    it("renderiza estado de error y mensaje accesible", () => {
      render(<Input label="Correo" error="El correo es requerido" />);
      const input = screen.getByLabelText("Correo");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByText("El correo es requerido")).toHaveClass("text-error");
    });
  });
});
