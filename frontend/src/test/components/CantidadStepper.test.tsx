// @pca:start
// @id(frontend.test.components.cantidadStepper)
// @kind(test)
// @limit(lines: 110)
// @relates(frontend.components.ui.cantidadstepper)
// @desc(Pruebas de integracion e interaccion por click en el componente CantidadStepper)
// @pca:end
import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CantidadStepper } from "@/components/ui/CantidadStepper";

describe("CantidadStepper — Interacción y Clicks de UI", () => {
  it("renderiza el valor inicial correctamente", () => {
    render(<CantidadStepper valor={3} onCambiar={() => {}} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("al hacer click en '+' ('Agregar uno'), ejecuta onCambiar con valor incrementado", async () => {
    const handleCambiar = vi.fn();
    const user = userEvent.setup();

    render(<CantidadStepper valor={2} onCambiar={handleCambiar} />);

    const botonAgregar = screen.getByRole("button", { name: /agregar uno/i });
    await user.click(botonAgregar);

    expect(handleCambiar).toHaveBeenCalledTimes(1);
    expect(handleCambiar).toHaveBeenCalledWith(3);
  });

  it("al hacer click en '-' ('Quitar uno'), ejecuta onCambiar con valor decrementado", async () => {
    const handleCambiar = vi.fn();
    const user = userEvent.setup();

    render(<CantidadStepper valor={4} onCambiar={handleCambiar} min={1} />);

    const botonQuitar = screen.getByRole("button", { name: /quitar uno/i });
    await user.click(botonQuitar);

    expect(handleCambiar).toHaveBeenCalledTimes(1);
    expect(handleCambiar).toHaveBeenCalledWith(3);
  });

  it("deshabilita el botón de restar cuando el valor alcanza el límite mínimo (min)", async () => {
    const handleCambiar = vi.fn();
    const user = userEvent.setup();

    render(<CantidadStepper valor={1} onCambiar={handleCambiar} min={1} />);

    const botonQuitar = screen.getByRole("button", { name: /quitar uno/i });
    expect(botonQuitar).toBeDisabled();

    await user.click(botonQuitar);
    expect(handleCambiar).not.toHaveBeenCalled();
  });

  it("deshabilita el botón de sumar cuando el valor alcanza el límite máximo (max)", async () => {
    const handleCambiar = vi.fn();
    const user = userEvent.setup();

    render(<CantidadStepper valor={10} onCambiar={handleCambiar} max={10} />);

    const botonAgregar = screen.getByRole("button", { name: /agregar uno/i });
    expect(botonAgregar).toBeDisabled();

    await user.click(botonAgregar);
    expect(handleCambiar).not.toHaveBeenCalled();
  });

  it("en modo editable renderiza input con su valor y atributo data-no-spinner", () => {
    const handleCambiar = vi.fn();

    function StepperWrapper() {
      const [val, setVal] = useState(5);
      return (
        <CantidadStepper
          valor={val}
          onCambiar={(n) => {
            setVal(n);
            handleCambiar(n);
          }}
          editable
        />
      );
    }

    render(<StepperWrapper />);

    const input = screen.getByRole("spinbutton", { name: /cantidad/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(5);
    expect(input).toHaveAttribute("data-no-spinner", "true");

    fireEvent.change(input, { target: { value: "8" } });
    expect(handleCambiar).toHaveBeenCalledWith(8);
  });
});
