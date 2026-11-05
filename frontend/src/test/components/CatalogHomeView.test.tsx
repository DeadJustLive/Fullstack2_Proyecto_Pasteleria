import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { CatalogHomeView } from "@/components/domain/CatalogHomeView";

describe("CatalogHomeView — Fase 1: Selección de Categorías", () => {
  const defaultCounts = {
    torta: 4,
    tartaleta: 2,
    cheesecake: 1,
    pastel: 3,
    pancakes: 1,
  };

  it("renderiza todas las categorías con sus nombres y contadores de delicias", () => {
    render(
      <MemoryRouter>
        <CatalogHomeView
          onSelectCategory={vi.fn()}
          onViewAll={vi.fn()}
          onSearch={vi.fn()}
          countsByCategory={defaultCounts}
          totalProducts={11}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Tortas Artesanales/i)).toBeInTheDocument();
    expect(screen.getByText(/Tartaletas & Pies/i)).toBeInTheDocument();
    expect(screen.getByText(/Cheesecakes/i)).toBeInTheDocument();
    expect(screen.getByText("4 delicias")).toBeInTheDocument();
  });

  it("al hacer click en una categoría ejecuta onSelectCategory con el slug correspondiente", async () => {
    const handleSelectCategory = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CatalogHomeView
          onSelectCategory={handleSelectCategory}
          onViewAll={vi.fn()}
          onSearch={vi.fn()}
          countsByCategory={defaultCounts}
          totalProducts={11}
        />
      </MemoryRouter>
    );

    const botonTortas = screen.getByRole("button", { name: /tortas artesanales/i });
    await user.click(botonTortas);

    expect(handleSelectCategory).toHaveBeenCalledTimes(1);
    expect(handleSelectCategory).toHaveBeenCalledWith("torta");
  });

  it("al hacer click en 'Ver todo el catálogo' ejecuta onViewAll", async () => {
    const handleViewAll = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CatalogHomeView
          onSelectCategory={vi.fn()}
          onViewAll={handleViewAll}
          onSearch={vi.fn()}
          countsByCategory={defaultCounts}
          totalProducts={11}
        />
      </MemoryRouter>
    );

    const botonVerTodo = screen.getByRole("button", { name: /ver todo el catálogo/i });
    await user.click(botonVerTodo);

    expect(handleViewAll).toHaveBeenCalledTimes(1);
  });

  it("permite buscar directamente desde el formulario superior y dispara onSearch", async () => {
    const handleSearch = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CatalogHomeView
          onSelectCategory={vi.fn()}
          onViewAll={vi.fn()}
          onSearch={handleSearch}
          countsByCategory={defaultCounts}
          totalProducts={11}
        />
      </MemoryRouter>
    );

    const inputBusqueda = screen.getByRole("textbox", { name: /buscar en el catálogo/i });
    await user.type(inputBusqueda, "chocolate");

    const botonBuscar = screen.getByRole("button", { name: /buscar/i });
    await user.click(botonBuscar);

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith("chocolate");
  });
});
