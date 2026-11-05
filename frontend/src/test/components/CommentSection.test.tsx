import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthProvider } from "@/context/AuthProvider";
import { CommentSection } from "@/components/domain/CommentSection";

describe("CommentSection & useSocialEngagement — Subsistema Social", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("muestra los comentarios semilla del artículo y permite publicar un nuevo comentario", () => {
    render(
      <AuthProvider>
        <CommentSection targetKey="blog:secretos-del-bizcocho-esponjoso" />
      </AuthProvider>
    );

    expect(screen.getByText("Valentina Rojas")).toBeInTheDocument();

    const nombreInput = screen.getByLabelText("Tu nombre");
    const textarea = screen.getByPlaceholderText(/Escribe tu comentario/i);
    const botonPublicar = screen.getByRole("button", { name: /Publicar/i });

    fireEvent.change(nombreInput, { target: { value: "Matías Pastelero" } });
    fireEvent.change(textarea, { target: { value: "Excelente receta artesanal, quedó esponjoso." } });
    fireEvent.click(botonPublicar);

    expect(screen.getByText("Matías Pastelero")).toBeInTheDocument();
    expect(screen.getByText("Excelente receta artesanal, quedó esponjoso.")).toBeInTheDocument();
  });

  it("valida comentarios muy cortos y permite calificar con estrellas cuando allowRating está activo", () => {
    render(
      <AuthProvider>
        <CommentSection targetKey="product:1" allowRating titulo="Opiniones del Producto" />
      </AuthProvider>
    );

    expect(screen.getByText("Opiniones del Producto")).toBeInTheDocument();

    const botonPublicar = screen.getByRole("button", { name: /Publicar/i });
    fireEvent.click(botonPublicar);
    expect(screen.getByText(/Escribe al menos 3 caracteres/i)).toBeInTheDocument();

    const estrella4 = screen.getByRole("button", { name: "4 estrellas" });
    fireEvent.click(estrella4);

    const textarea = screen.getByPlaceholderText(/Qué te pareció el sabor/i);
    fireEvent.change(textarea, { target: { value: "Muy rica torta, entrega puntual." } });
    fireEvent.click(botonPublicar);

    expect(screen.getByText("Muy rica torta, entrega puntual.")).toBeInTheDocument();
  });
});
