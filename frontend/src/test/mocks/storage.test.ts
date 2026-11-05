import { describe, it, expect, beforeEach, vi } from "vitest";
import { guardarStorage, leerStorage, borrarStorage } from "@/lib/storage";

describe("storage — Persistencia con Mock de localStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("guardarStorage serializa el valor a JSON y lo guarda en localStorage", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    const payload = { usuarioId: 42, tema: "oscuro" };

    guardarStorage("configuracion", payload);

    expect(setItemSpy).toHaveBeenCalledWith("configuracion", JSON.stringify(payload));
    expect(localStorage.getItem("configuracion")).toBe(JSON.stringify(payload));
  });

  it("leerStorage recupera y deserializa el objeto guardado", () => {
    const datosOriginales = { nombre: "Torta Cuatro Leches", precio: 18500 };
    localStorage.setItem("item-demo", JSON.stringify(datosOriginales));

    const resultado = leerStorage("item-demo", null);

    expect(resultado).toEqual(datosOriginales);
  });

  it("leerStorage retorna el valor de respaldo si la clave no existe", () => {
    const respaldo = { carrito: [] };
    const resultado = leerStorage("clave-inexistente", respaldo);

    expect(resultado).toBe(respaldo);
  });

  it("leerStorage es resiliente y retorna el respaldo si el JSON en storage está corrupto", () => {
    localStorage.setItem("clave-rota", "{ json-corrupto-sin-cerrar ");

    const resultado = leerStorage("clave-rota", "valor-seguro");

    expect(resultado).toBe("valor-seguro");
  });

  it("borrarStorage invoca removeItem de localStorage", () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");
    localStorage.setItem("sesion", "token-123");

    borrarStorage("sesion");

    expect(removeItemSpy).toHaveBeenCalledWith("sesion");
    expect(localStorage.getItem("sesion")).toBeNull();
  });
});
